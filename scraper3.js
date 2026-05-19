const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');
const { createObjectCsvWriter } = require('csv-writer');

program
  .option('-o, --output <file>', 'output filename', 'GettingRejectedMore.json')
  .option('-n, --number <integer>', 'number of jobs to scrape [default=51]', '51')
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

    let rawLocation = location.trim();
    let cleanLocation = rawLocation.includes('Upgrade to Premium') ? null : rawLocation;

    const salaryEl = job.locator('.salary');
    let salary=((await salaryEl.count())>0) ? (await salaryEl.textContent()).replace('💰','') : NaN;
    
    res.push({
        title:title.trim(),
        companyName:companyName.trim(),
        location:cleanLocation,
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
const csvWriter=createObjectCsvWriter({
  path: opts.output.replace('.json','.csv'),
  header: [
    { id: 'title', title: 'Job Title' },
    { id: 'companyName', title: 'Company Name' },
    { id: 'location', title: 'Location' },
    { id: 'salary', title: 'Salary' },
  ]
});
  await csvWriter.writeRecords(res);
  fs.writeFileSync(opts.output, JSON.stringify(res,null,2));
} main();