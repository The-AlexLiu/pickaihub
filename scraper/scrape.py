"""
TAAFT Scraper v4 — Robust Navigation.

Fix: v3 silently ignored navigation failures, causing the scraper to 
stuck on the previous page and report 0 new tools (100% duplicates).
v4 enforces navigation success by checking URL/Title and retrying.

Usage:
  python3 scrape.py
"""

import asyncio
import argparse
import json
import os
import re
import sys
import time
from urllib.parse import urljoin
from playwright.async_api import async_playwright

BASE_URL = "https://theresanaiforthat.com"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "crawled_tools.json")
SCROLL_PAUSE = 2.0
CF_WAIT = 6
MAX_STALE_SCROLLS = 10
MAX_RETRIES = 3

MONTHS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
]


def generate_period_urls():
    from datetime import datetime
    now = datetime.now()
    urls = []
    # Current year
    for m in range(now.month, 0, -1):
        urls.append({
            "url": f"{BASE_URL}/period/{MONTHS[m-1]}/",
            "label": f"{MONTHS[m-1].capitalize()} {now.year}",
            "slug_hint": MONTHS[m-1]  # used for verification
        })
    # Past years
    for year in range(now.year - 1, 2014, -1):
        for m in range(12, 0, -1):
            urls.append({
                "url": f"{BASE_URL}/period/{MONTHS[m-1]}-{year}/",
                "label": f"{MONTHS[m-1].capitalize()} {year}",
                "slug_hint": str(year)
            })
    return urls


# ── JS Extractor ───────────────────────────────────────────
EXTRACT_JS = """() => {
    const results = [];
    // SCOPED: only select links inside main tool list items (class="li")
    const links = document.querySelectorAll('li.li a[href*="/ai/"]');
    const seen = new Set();
    
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;
        // Filter sidebar/sponsored links
        if (href.includes('ref=featured') || href.includes('ref=sponsor') || href.includes('ref=top3')) continue;
        
        const match = href.match(/\/ai\/([^\/\?]+)/);
        if (!match) continue;
        const slug = match[1];

        if (seen.has(slug)) continue;
        seen.add(slug);
        
        // Use closest() to reliably find the card container
        const card = link.closest('li.li');
        if (!card) continue;
        
        const text = card.innerText || '';
        const img = card.querySelector('img');
        const logo = img ? (img.src || img.getAttribute('data-src') || '') : '';
        
        results.push({ slug, raw_text: text, logo, url: href });
        if (results.length >= 2000) break; 
    }
    return results;
}"""



# ── Progress Tracking ──────────────────────────────────────
class Progress:
    def __init__(self, total_periods, start_offset=0):
        self.total = total_periods
        self.current = start_offset
        self.offset = start_offset
        self.tools = 0
        self.start = time.time()
        self.period_start_time = 0

    def begin(self, label):
        self.current += 1
        self.period_start_time = time.time()
        # Calculate pct based on total original periods
        pct = self.current / self.total * 100
        bar = "█" * int(pct / 100 * 30) + "░" * (30 - int(pct / 100 * 30))
        print(f"\n  [{bar}] {pct:5.1f}%  Period {self.current}/{self.total}: {label}")

    def scroll(self, n, count, stale):
        spin = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        sys.stdout.write(
            f"\r    {spin[n % 10]} scroll #{n:<4d} │ "
            f"page: {count:>5,d} │ total: {self.tools + count:>7,d} │ "
            f"stale: {stale}/{MAX_STALE_SCROLLS}  "
        )
        sys.stdout.flush()

    def done(self, new):
        self.tools += new
        e = time.time() - self.start
        rate = self.tools / e if e > 0 else 0
        # Estimate based on remaining periods
        rem = self.total - self.current
        # Avg time per period so far (for THIS session)
        # We should base ETA on the current session's rate
        sessions_completed = self.current - self.offset
        if sessions_completed > 0:
            avg_per_period = e / sessions_completed
            eta = avg_per_period * rem
        else:
            eta = 0
        print(f"\n    ✅ +{new:,d} new │ Total (Session): {self.tools:,d} │ {rate:.1f}/s │ ETA: {eta/60:.0f}min")

    def msg(self, text):
        print(f"\n    ⚠️  {text}")

    def finish(self):
        e = time.time() - self.start
        print(f"\n{'='*60}")
        print(f"  🎉 SCRAPING COMPLETE!")
        print(f"  📊 Total tools captured (this session): {self.tools:,d}")
        print(f"  ⏱  Time: {e/60:.1f} min")
        print(f"{'='*60}\n")


# ── Navigation & Scraping ──────────────────────────────────
async def safe_goto(page, url, slug_hint, progress):
    """Navigate with retry and validation."""
    for attempt in range(MAX_RETRIES):
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=25000)
            await asyncio.sleep(2)
            
            # Validation
            curr_url = page.url
            title = await page.title()
            
            # Simple check: does title or URL contain our month/year?
            # e.g. "september" or "2024"
            if slug_hint.lower() in curr_url.lower() or slug_hint.lower() in title.lower():
                return True
                
            progress.msg(f"Nav verification failed (Attempt {attempt+1}): {curr_url}")
            
        except Exception as e:
            progress.msg(f"Nav failed (Attempt {attempt+1}): {e}")
        
        await asyncio.sleep(3 + attempt * 2)
    
    return False


async def scrape_period(page, period_data, progress):
    url = period_data["url"]
    
    if not await safe_goto(page, url, period_data["slug_hint"], progress):
        progress.msg(f"Skipping {period_data['label']} due to nav failure.")
        return []

    # Infinite scroll loop
    prev_total = 0
    stale = 0
    
    # Try to close any random popups first
    try:
        await page.keyboard.press("Escape")
    except: pass
    
    for scroll in range(1, 601):
        # 1. Scroll using keyboard (better for triggering JS events)
        try:
            await page.keyboard.press("End")
        except:
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            
        await asyncio.sleep(SCROLL_PAUSE)
        
        # 2. Check for "Load More" button and click if found
        try:
            # Common selectors for load more buttons
            button = await page.query_selector("button:has-text('Load more'), .load-more, #load-more")
            if button and await button.is_visible():
                await button.click()
                await asyncio.sleep(2)
                stale = 0 # Reset stale if we clicked a button
        except: pass

        # 3. Extract
        tools = await page.evaluate(EXTRACT_JS)
        current = len(tools)
        
        if current > prev_total:
            stale = 0
            prev_total = current
        else:
            stale += 1
            
        progress.scroll(scroll, current, stale)
        
        # INCREASED STALE THRESHOLD
        if stale >= 20: 
            break
            
    return tools


# ── Parse ──────────────────────────────────────────────────
def parse_tools(raw_tools):
    parsed = []
    for t in raw_tools:
        raw = t.get("raw_text", "")
        # Strip Unicode line/paragraph separators (U+2028, U+2029)
        raw = raw.replace('\u2028', ' ').replace('\u2029', ' ')
        # Split and clean lines from raw_text
        lines = [l.strip() for l in raw.split('\n') if l.strip()]
        
        # Default name from slug
        name = t.get("slug").replace("-", " ").title()
        desc = ""
        stats_visits = "0"
        
        candidate_name = None
        
        for i, line in enumerate(lines):
            # Skip noise
            if re.match(r'^(Featured|Sponsored|Verified|New|Trending|Free|Paid|Freemium)$', line, re.I): continue
            if re.match(r'^#\d+', line): continue # Ranking
            
            if not candidate_name:
                candidate_name = line
                continue
                
            # If we have a name, next long line is likely description
            if not desc and len(line) > 20 and "AI tools" not in line and not re.match(r'^[\d,.+]+$', line):
                desc = line
                break
        
        if candidate_name:
            name = candidate_name

        # Pricing logic
        pricing, pricing_label = "free", "Free"
        rl = raw.lower()
        if "freemium" in rl: pricing, pricing_label = "freemium", "Freemium"
        elif "paid" in rl or "$" in raw: pricing = "paid"; pricing_label = "Paid" 
        elif "free trial" in rl: pricing, pricing_label = "freemium", "Free Trial"

        # Visits extraction
        vm = re.search(r'([\d,.]+)\s*[KkMmBb]', raw)
        if vm: stats_visits = vm.group(0).strip()
        
        logo = t.get("logo", "")
        if logo and not logo.startswith("http"): logo = ""

        # Validate name
        if len(name) > 50: name = t["slug"].replace("-", " ").title()

        parsed.append({
            "id": t["slug"],
            "name": name, 
            "description": desc,
            "url": urljoin(BASE_URL, t["url"]),
            "category": "other", "category_label": "Other", "tags": [],
            "pricing": pricing, "pricing_label": pricing_label,
            "visits": stats_visits, "rating": 0, "logo": logo,
            "is_new": False, "is_trending": False, "launch_date": "",
        })
    return parsed


# ── Main ───────────────────────────────────────────────────
async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-periods", type=int, default=None)
    parser.add_argument("--start-period", type=int, default=1, help="Start from this period number (1-indexed)")
    parser.add_argument("--headless", action="store_true")
    args = parser.parse_args()

    all_periods = generate_period_urls()
    total_periods = len(all_periods)
    
    # Slice periods based on start arg
    start_idx = max(0, args.start_period - 1)
    periods = all_periods[start_idx:]
    if args.max_periods: periods = periods[:args.max_periods]

    # Load existing data to preserve it
    existing_data = []
    seen_slugs = set()
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                existing_data = json.load(f)
                seen_slugs = {t['id'] for t in existing_data}
            print(f"  📂 Loaded {len(existing_data)} existing tools from {OUTPUT_FILE}")
        except Exception as e:
            print(f"  ⚠️ Could not load existing file: {e}")

    progress = Progress(total_periods, start_offset=start_idx)
    global_tools = {} # Stores NEW tools only

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=args.headless,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            viewport={"width": 1440, "height": 900},
        )
        # Block visible tracking pixels to save resources
        await context.route("**/*", lambda route: route.abort() 
            if route.request.resource_type in ["image", "media", "font"] 
            and "logo" not in route.request.url and "icon" not in route.request.url 
            else route.continue_())

        page = await context.new_page()

        print(f"\n  🌐 Session setup ...")
        try:
            await page.goto(BASE_URL, wait_until="domcontentloaded", timeout=30000)
        except: pass
        await asyncio.sleep(CF_WAIT)

        for period in periods:
            progress.begin(period["label"])
            raw = await scrape_period(page, period, progress)
            
            # Dedup
            new_count = 0
            for t in raw:
                # Check against both global NEW tools and EXISTING file tools
                if t["slug"] not in global_tools and t["slug"] not in seen_slugs:
                    global_tools[t["slug"]] = t
                    new_count += 1
            progress.done(new_count)

            # Auto-save (Merge existing + new)
            new_parsed = parse_tools(list(global_tools.values()))
            combined_data = existing_data + new_parsed
            
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(combined_data, f, indent=2, ensure_ascii=False)

        await browser.close()
    progress.finish()

if __name__ == "__main__":
    asyncio.run(main())
