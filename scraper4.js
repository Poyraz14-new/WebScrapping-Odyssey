const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');
const { createObjectCsvWriter } = require('csv-writer');
const { title } = require('process');

program
  .option('-u, --url <url>', 'product URL to monitor')
  .option('-o, --output <file>', 'output filename', 'prices')
  .option('-f --format <format>', 'output format', 'json')
  .option('-m, --multiUrl <url>', 'URLs to scrape', (val, arr) => { arr.push(val); return arr; }, [])
  .parse();

const opts = program.opts();

async function main(url = opts.url) {
  const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
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
    await page.goto(url, { waitUntil: 'networkidle' });
    let cookies=await page.locator('#onetrust-reject-all-handler');
    await page.waitForTimeout(3000);
    await cookies.click({button:'left'});

    await page.evaluate(() => {
        document.querySelector('#modals')?.remove();
      }); // removes the gender choice

      // await page.screenshot({ path: 'debug.png', fullPage: true });
      // console.log('Screenshot saved');
  try{
    let price=(await page.locator('.discounted').count()>0) ? await page.locator('.discounted').textContent() : await page.locator('.new-price').textContent();
    let title=await page.locator('.product-title.variant-pdp').textContent();

    res.push({
        price:parseFloat(price.replace(' TL','').replace('.','').replace(',','.')),
        title
    });

  }catch(err){
    console.log(`Failed to scrape components of site: ${err.message}`);
  }
} catch (err) {
    console.log('Failed to load site:', err.message);
  } finally {
    await browser.close();
    if(fs.existsSync(output)){
      if(opts.format==='json'){
        let newRes=[];
        let old=fs.readFileSync(output,'utf-8');
        let oldData=JSON.parse(old);
        priceDiff=res[0].price-oldData[0].price;        
        console.log(`The price difference compared to the last product is:${priceDiff}TL`);
        newRes.push(res,
        `the old price at time ${timestamp}(Istanbul) is: ${oldData[0].price} `
        );
        fs.writeFileSync(output,JSON.stringify(newRes,null,2));
      // When file exists (append + show difference)
}   else if (opts.format === 'csv') {
    const old = fs.readFileSync(output, 'utf-8');
    const lines = old.trim().split('\n');
    const lastRow = lines[lines.length - 1].split('","');
    const oldPrice = parseFloat(lastRow[0].replace('"', ''));
    const difference = res[0].price - oldPrice;
    console.log(`The price difference compared to the last product is: ${difference}TL`);
    const row = `"${res[0].price}","${res[0].title}","${timestamp}","${difference}"`;
    fs.writeFileSync(output, old.trim() + '\n' + row);
} else{
        throw new Error("Output format is invalid. It either has to be csv or json");
      }
    }
    else if(opts.format==='json'){
    fs.writeFileSync(output,JSON.stringify(res,null,2));
  }else{
    const headers = '"price","title","timestamp"';
    const row = `"${res[0].price}","${res[0].title}","${timestamp}"`;
    fs.writeFileSync(output, headers + '\n' + row);
  
  }
    process.exit(0);
  }
}

async function multiURL(urlArr) {
  let output=`${opts.output}.${opts.format}`;
  let i = 0;
  for (const url of urlArr) {
    console.log(`Scraping website number ${++i}`);
    try{
      const browser = await chromium.launch({headless:false});
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      let cookies=await page.locator('#onetrust-reject-all-handler');
      await page.waitForTimeout(3000);
      await cookies.click({button:'left'});

      await page.evaluate(() => {
          document.querySelector('#modals')?.remove();
        }); // removes the gender choice

    try{
      let res=[];
      let price=(await page.locator('.discounted').count()>0) ? await page.locator('.discounted').textContent() : await page.locator('.new-price').textContent();
      let title=await page.locator('.product-title.variant-pdp').textContent();

      res.push({
          price:parseFloat(price.replace(' TL','').replace('.','').replace(',','.')),
          title
      });
      
      if (fs.existsSync(output)) {
        if(opts.format==="json"){
          const old = fs.readFileSync(output, 'utf-8');
          const oldData = JSON.parse(old);
          const newRes = [...res, ...oldData];
          fs.writeFileSync(output, JSON.stringify(newRes, null, 2));
        // file exists — append
        } else if (opts.format === 'csv') {
          const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
          const old = fs.readFileSync(output, 'utf-8');
          const row = `"${res[0].price}","${res[0].title}","${timestamp}"`;
          fs.writeFileSync(output, old.trim() + '\n' + row);
        }else{
          throw new Error("Output format is invalid. It either has to be csv or json");
        }
      } else {
        if(opts.format==="json"){
          fs.writeFileSync(output, JSON.stringify(res, null, 2));
        // file doesn't exist — create with headers
        } else if (opts.format === 'csv') {
          const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
          const headers = '"price","title","timestamp"';
          const row = `"${res[0].price}","${res[0].title}","${timestamp}"`;
          fs.writeFileSync(output, headers + '\n' + row);
        }else{
          throw new Error("Output format is invalid. It either has to be csv or json");
        }
      }
    } catch(err){
    console.log(err);
    }
    await browser.close();
  } catch(err){
    console.log(`Failed to scrape site number ${i}\n reason: ${err.message}`);
    }
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

run();