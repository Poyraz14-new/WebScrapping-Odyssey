# WebScraping-Odyssey

Two web scrapers built with Playwright and Node.js as part of learning browser automation from scratch.

## Scrapers

### scraper.js — Hacker News Scraper
Scrapes the Hacker News front page and extracts ranking, title, points, and links for each post.

### scraper2.js — Books to Scrape
Scrapes [books.toscrape.com](https://books.toscrape.com) across multiple pages. Extracts title, price (cleaned to number), and stock availability.

## Setup

```bash
git clone https://github.com/Poyraz14-new/WebScrapping-Odyssey.git
cd WebScrapping-Odyssey
npm install
npx playwright install
```

## Usage

```bash
# Hacker News — default output: HackerNewsResults.json
node scraper.js
node scraper.js --output custom.json

# Books to Scrape — default: 5 pages, output: BookScrape.json
node scraper2.js
node scraper2.js --pages 10 --output mybooks.json
```

## Example Output

**Hacker News:**
```json
{
  "ranking": 1,
  "title": "Show HN: Some cool project",
  "points": 154,
  "links": "https://example.com"
}
```

**Books:**
```json
{
  "title": "A Light in the Attic",
  "price": 51.77,
  "inStock": true
}
```

## Built With
- Node.js
- Playwright
- Commander.js
