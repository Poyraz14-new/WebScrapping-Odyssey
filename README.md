# WebScraping Odyssey

A collection of web scrapers built with Playwright and Node.js — from simple data extraction to a full-featured price monitoring CLI tool.

## Scrapers

### 1. Hacker News Scraper (`scraper.js`)

Scrapes the Hacker News front page. Extracts ranking, title, points, and link for each post.

```bash
node scraper.js
node scraper.js --output custom.json
```

**Output:** JSON array of posts with `ranking`, `title`, `points`, and `links` fields.

### 2. Books to Scrape (`scraper2.js`)

Multi-page scraper for [books.toscrape.com](https://books.toscrape.com). Extracts title, price, and stock availability across paginated results.

```bash
node scraper2.js
node scraper2.js --pages 10 --output mybooks.json
```

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --pages` | Number of pages to scrape | 5 |
| `-o, --output` | Output filename | BookScrape.json |

### 3. Remote Job Scraper (`scraper3.js`)

Scrapes [remoteok.com](https://remoteok.com) for remote job listings. Extracts job title, company, location, and salary. Outputs both JSON and CSV.

```bash
node scraper3.js
node scraper3.js --number 20 --output jobs.json
```

| Flag | Description | Default |
|------|-------------|---------|
| `-n, --number` | Max jobs to scrape | 51 |
| `-o, --output` | Output filename (CSV auto-generated alongside) | GettingRejectedMore.json |

### 4. Price Monitor (`scraper4.js`)

CLI tool that tracks product prices on Trendyol. Supports single and multi-URL scraping, JSON and CSV output, timestamped price history, and price difference tracking.

**Single URL:**
```bash
node scraper4.js -u "https://www.trendyol.com/..." -f json
node scraper4.js -u "https://www.trendyol.com/..." -f csv
```

**Multiple URLs:**
```bash
node scraper4.js -m "https://www.trendyol.com/product1" -m "https://www.trendyol.com/product2" -f csv -o tracking
```

| Flag | Description | Default |
|------|-------------|---------|
| `-u, --url` | Single product URL | — |
| `-m, --multiUrl` | Multiple URLs (repeat flag) | [] |
| `-f, --format` | Output format (`json` or `csv`) | json |
| `-o, --output` | Output filename (without extension) | prices |

**Features:**
- Tracks price changes over time with Istanbul-timezone timestamps
- Shows price difference compared to last scrape
- Handles cookie banners and modal popups automatically
- Supports both discounted and regular price elements

## Setup

```bash
git clone https://github.com/Poyraz14-new/WebScrapping-Odyssey.git
cd WebScrapping-Odyssey
npm install
npx playwright install
```

## Tech Stack

- **Node.js** — runtime
- **Playwright** — browser automation
- **Commander.js** — CLI argument parsing
- **csv-writer** — CSV output (scraper3)

## Project Structure

```
scraper.js       — Hacker News scraper
scraper2.js      — Books to Scrape (multi-page)
scraper3.js      — Remote job board scraper
scraper4.js      — Price monitor (multi-URL, JSON/CSV, history)
```