# WebScraping Odyssey

A progression of web scrapers built with Playwright and Node.js — from basic data extraction to a multi-platform price monitor with Telegram alerts.

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

### 4. Multi-Platform Price Monitor (`scraper4.js`)

CLI tool that tracks product prices across Turkish e-commerce platforms with automatic price drop alerts via Telegram.

**Supported platforms:**
- Trendyol
- Amazon TR
- Hepsiburada
- n11

The tool auto-detects the platform from the URL — no configuration needed.

**Single URL:**
```bash
node scraper4.js -u "https://www.trendyol.com/..." -f json
node scraper4.js -u "https://www.amazon.com.tr/..." -f csv
```

**Multiple URLs (mix platforms):**
```bash
node scraper4.js -m "https://www.trendyol.com/product1" -m "https://www.hepsiburada.com/product2" -f csv -o tracking
```

**Watch mode with price alerts:**
```bash
node scraper4.js -u "https://www.amazon.com.tr/..." -w 5 -t 500
```
Re-scrapes every 5 minutes and sends a Telegram notification when the price drops below 500 TL.

| Flag | Description | Default |
|------|-------------|---------|
| `-u, --url` | Single product URL | — |
| `-m, --multiUrl` | Multiple URLs (repeat flag) | [] |
| `-f, --format` | Output format (`json` or `csv`) | json |
| `-o, --output` | Output filename (without extension) | prices |
| `-w, --watch` | Re-scrape interval in minutes | — |
| `-t, --threshold` | Price alert threshold in TL | — |

**Features:**
- Auto-detects platform from URL hostname
- Tracks price history with Istanbul-timezone timestamps
- Shows price difference compared to last scrape
- Telegram bot integration for price drop alerts
- Handles cookie banners and modal popups per platform
- Supports both discounted and regular price elements
- Stores product URL in output for easy purchase links

**Telegram setup:**
1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Get your chat ID from `https://api.telegram.org/botYOUR_TOKEN/getUpdates`
3. Create a `.env` file in the project root:
```
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

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
- **csv-writer** — CSV output
- **node-telegram-bot-api** — Telegram notifications
- **dotenv** — environment variable management

## Project Structure

```
scraper.js       — Hacker News scraper
scraper2.js      — Books to Scrape (multi-page)
scraper3.js      — Remote job board scraper
scraper4.js      — Multi-platform price monitor with Telegram alerts
.env             — Telegram credentials (not tracked by git)
```