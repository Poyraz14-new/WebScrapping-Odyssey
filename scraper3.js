const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');

program
  .option('-o, --output <file>', 'output filename', 'GettingRejectedMore.json')
  .option('-n, --number <integer>', 'number of jobs to scrape', '51')
  .parse();

const opts = program.opts();

async function main(){
  let res=[];
  try{ //a try catch for paranoia
  const browser=await chromium.launch();
  const page=await browser.newPage();
  await page.goto('https://remoteok.com');
  let popup=await page.locator('#premium-popup-close');
  if(await popup.count() >0){
    await popup.click({button:'left'});
  }
  let jobs=await page.locator('.company.position.company_and_position').all();
  let i=0;
  for(const job of jobs){
    if(i>parseInt(opts.number)-1){
        console.log('Limit reached');
        break;
    }
    try{
    let title=await job.locator('.preventLink').locator('h2').textContent();
    let companyName=await job.locator('.companyLink').locator('h3').textContent();
    let location=await job.locator('.location').first().textContent();
    const salaryEl = job.locator('.salary');
    let salary=((await salaryEl.count())>0) ? (await salaryEl.textContent().replace('💰','')) : NaN;
    
    res.push({
        title:title.trim(),
        companyName:companyName.trim(),
        location:location.trim().replace('💰 Upgrade to Premium to see salary',null),
        salary
    });
    }catch(err){
        console.log('Failed to fetch content\n',`=${err.message}`);
    }
    console.log(`Done job number: ${++i}`);
  }
  console.log(`Saved the results in ${opts.output}`);
  browser.close();
}catch(err){
    console.log('Failed to load page/close page\n',`=${err.message}`);
}
  fs.writeFileSync(opts.output, JSON.stringify(res,null,2));
} main();