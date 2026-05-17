const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');

program
  .option('-o, --output <file>', 'output filename', 'HackerNewsResults.json')
  .parse();

const opts = program.opts();

async function main(){
  const browser=await chromium.launch({headless: false});
  const page=await browser.newPage();
  await page.goto('https://remoteok.com'); // may be in a different place
  await page.locator('#premium-popup-close').click({button:'left'}); // closes the annoying popup
  const jobs = await page.locator('#job-').all();
} main();