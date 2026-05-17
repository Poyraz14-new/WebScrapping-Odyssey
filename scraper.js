const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');

program
  .option('-o, --output <file>', 'output filename', 'HackerNewsResults.json')
  .parse();

const opts = program.opts();

async function main(){
  try{
    const browser = await chromium.launch();
    const page=await browser.newPage();
    await page.goto('https://news.ycombinator.com/');

    let results=[];

    const threads=await page.locator('.athing').all();

    for(const threadss of threads){
      try{
        let ranking=await threadss.locator('.rank').textContent();
        let title=await threadss.locator('.titleline').textContent();
        let links=await threadss.locator('.titleline a').first().getAttribute('href');
        const id1 = await threadss.getAttribute('id');
        let scoreEl=await page.locator(`#score_${id1}`);
        let points = (await scoreEl.count()) > 0  ? await scoreEl.textContent() : '0 points';

        results.push({
          ranking: parseInt(ranking),
          title,
          points: parseInt(points.replace('points','')),
          links});
        
        console.log(`Done thread number: ${ranking.replace('.','')}`);
      }catch(err){
        console.log('Failed to fetch content\n',`=${err.message}`);
      }
    }
    fs.writeFileSync(`${opts.output}`, JSON.stringify(results, null, 2));
    await browser.close();
  }catch(err){
    console.log('Failed to load page\n', `=${err.message}`);
  }
  }
main();