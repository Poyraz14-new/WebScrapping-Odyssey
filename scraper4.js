const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');
const { createObjectCsvWriter } = require('csv-writer');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

program
  .option('-u, --url <url>', 'product URL to monitor')
  .option('-o, --output <file>', 'output filename', 'products')
  .option('-f --format <format>', 'output format', 'json')
  .option('-m, --multiUrl <url>', 'URLs to scrape', (val, arr) => { arr.push(val); return arr; }, [])
  .option('-w, --watch <minutes>', 're-scrape every N minutes')
  .option('-t, --threshold <price>', 'alert when price drops below this')
  .parse();

const opts = program.opts();

async function main(url = opts.url) {
  const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  let output=`${opts.output}.${opts.format}`;
  if (opts.multiUrl?.length && arguments.length === 0) {
    return multiURL(opts.multiUrl);
  }
  if (!url) {
    throw new Error('No URL provided. Use --url <url> or --multiUrl <url>.');
  }
  const browser = await chromium.launch({headless:false});
  const page = await browser.newPage();
  let res=[];
  try {
    const hostname=new URL(url).hostname;

    if(hostname.includes('hepsiburada')){
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      try{
        await page.waitForSelector('[data-test-id="default-price"]');
        let price=await page.locator('[data-test-id="default-price"]').locator('div').first().locator('span').textContent();
        let title=await page.locator('[data-test-id="title"]').textContent();
        let fullPrice=parseFloat(price.replace('.','').replace(',','.').replace(' TL',''));
        res.push({
          title,
          url,
          price:fullPrice,
          timestamp
        });
      }catch(err){
        console.log('Failed to scrape components \nreason:'+err.message);
      }
    }else if(hostname.includes('n11')){
      await page.goto(url, { waitUntil: 'networkidle' });
      try{
        let price=await page.locator('.newPrice').locator('ins').textContent();
        let fullPrice=parseFloat(price.replace('.','').replace(',','.').replace(' TL',''));
        await page.waitForSelector('.title.max-three-lines');
        let title=await page.locator('.title.max-three-lines').textContent();
        res.push({
          title,
          url,
          price:fullPrice,
          timestamp
        });
      }catch(err){
        console.log('Failed to scrape components \nreason:'+err.message);
      }
    }else if(hostname.includes('amazon.com.tr')){
      await page.goto(url, { waitUntil: 'networkidle' });
      try{
        let price=await page.locator('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay.apex-pricetopay-value').locator('.a-price-whole').textContent();
        let fraction=await page.locator('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay.apex-pricetopay-value').locator('.a-price-fraction').textContent();
        let fullPrice=parseFloat(`${price}.${fraction}`);

        let title=await page.locator('#productTitle').first().textContent();
        res.push({
          title:title.trim(),
          url,
          price:fullPrice,
          timestamp
        });
      }catch(err){
        console.log('Failed to scrape components \nreason:'+err.message);
      }
    }else if(hostname.includes('trendyol')){
      await page.goto(url, { waitUntil: 'networkidle' });
      let cookies=await page.locator('#onetrust-reject-all-handler');
      await page.waitForTimeout(3000);
      await cookies.click({button:'left'});

      await page.evaluate(() => {
        document.querySelector('#modals')?.remove();
      });

      try{
        let price=(await page.locator('.discounted').count()>0) ? await page.locator('.discounted').textContent() : await page.locator('.new-price').textContent();
        let title=await page.locator('.product-title.variant-pdp').textContent();

        res.push({
          title,
          price:parseFloat(price.replace(' TL','').replace('.','').replace(',','.')),
          url,
          timestamp
        });

      }catch(err){
        console.log(`Failed to scrape components of site: ${err.message}`);
      }
    }else{
      throw new Error('Unsupported site: '+hostname);
    }
  } catch (err) {
    console.log('Failed to load site:', err.message);
  } finally {
    await browser.close();

    if (res.length === 0) return;

    // threshold check — once, before file writing
    if (opts.threshold && res[res.length - 1].price < parseFloat(opts.threshold)) {
      sendAlert(res[res.length - 1]);
    }

    if(fs.existsSync(output)){
      if(opts.format==='json'){
        let old=fs.readFileSync(output,'utf-8');
        let oldData=JSON.parse(old);
        let priceDiff=res[res.length-1].price-oldData[oldData.length - 1].price;
        console.log(`The price difference compared to the last product is:${priceDiff}TL`);
        const newRes = [...oldData, ...res];
        fs.writeFileSync(output,JSON.stringify(newRes,null,2));
      }else if (opts.format === 'csv') {
        const old = fs.readFileSync(output, 'utf-8');
        const lines = old.trim().split('\n');
        const lastRow = lines[lines.length - 1].split('","');
        const oldPrice = parseFloat(lastRow[0].replace('"', ''));
        const difference = res[res.length-1].price - oldPrice;
        console.log(`The price difference compared to the last product is: ${difference}TL`);
        const row = `"${res[0].price}","${res[0].title}","${res[0].url}","${timestamp}","${difference}"`;
        fs.writeFileSync(output, old.trim() + '\n' + row);
      }else{
        throw new Error("Output format is invalid. It either has to be csv or json");
      }
    }
    else if(opts.format==='json'){
      fs.writeFileSync(output,JSON.stringify(res,null,2));
    }else{
      const headers = '"price","title","url","timestamp"';
      const row = `"${res[0].price}","${res[0].title}","${res[0].url}","${timestamp}"`;
      fs.writeFileSync(output, headers + '\n' + row);
    }
  }
}

async function multiURL(urlArr) {
  let i = 0;
  for (const url of urlArr) {
    console.log(`Scraping website number ${++i}`);
    await main(url);
  }
}

async function run() {
  try {
    await main();
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

function sendAlert(product) {
  try{
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID,
      `Price drop! ${product.title}\n${product.price} TL\n${product.url}`
    );
  }catch(err){
    console.log(`Failed to message your bot \n${err.message}`);
  }
}

if (opts.watch) {
  console.log(`Watching every ${opts.watch} minutes...`);
  run();
  setInterval(run, opts.watch * 60 * 1000);
} else {
  run();
}