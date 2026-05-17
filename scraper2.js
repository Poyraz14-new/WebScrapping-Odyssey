// bookScraper.js
const { chromium } = require('playwright');
const fs = require('fs');
const { program } = require('commander');

program
  .option('-p, --pages <number>', 'number of pages to scrape', '5')
  .option('-o, --output <file>', 'output filename', 'BookScrape.json')
  .parse();

const opts = program.opts();

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let res = [];

  for (let currentPage = 1; currentPage <= parseInt(opts.pages); currentPage++) {
    try {
      await page.goto(`https://books.toscrape.com/catalogue/page-${currentPage}.html`);
      const books = await page.locator('.product_pod').all();

      for (const book of books) {
        try {
          let title = await book.locator('h3 a').getAttribute('title');
          let price = await book.locator('.price_color').textContent();
          let availability = await book.locator('.availability').textContent();
          res.push({
            title,
            price: parseFloat(price.replace('£', '')),  // clean the price
            inStock: availability.trim().includes('In stock')
          });
        } catch (err) {
          console.error(`Failed to scrape a book on page ${currentPage}: ${err.message}`);
        }
      }
      console.log(`Page ${currentPage} done — ${books.length} books`);
    } catch (err) {
      console.error(`Failed to load page ${currentPage}: ${err.message}`);
    }
  }

  fs.writeFileSync(opts.output, JSON.stringify(res, null, 2));
  console.log(`Saved ${res.length} books to ${opts.output}`);
  await browser.close();
}

main();