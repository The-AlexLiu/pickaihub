import asyncio
from playwright.async_api import async_playwright

EXTRACT_JS = """() => {
    const results = [];
    const links = document.querySelectorAll('a[href*="/ai/"]');
    const seen = new Set();
    
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href || seen.has(href)) continue;
        if (href.includes('ref=featured') || href.includes('ref=sponsor')) continue;
        
        seen.add(href);
        const match = href.match(/\/ai\/([^\/\?]+)/);
        if (!match) continue;
        const slug = match[1];
        
        // Find card container
        let card = link;
        for (let i = 0; i < 8; i++) {
            if (!card.parentElement) break;
            card = card.parentElement;
            if (card.getAttribute('data-id') || 
                card.tagName === 'LI') break;
        }
        
        const text = card.innerText || '';
        const html = card.outerHTML || '';
        const img = card.querySelector('img');
        const logo = img ? (img.src || img.getAttribute('data-src') || '') : 'NO_IMG';
        
        results.push({ slug, text, logo, html });
        if (results.length >= 5) break; 
    }
    return results;
}"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True) # Headless=True for server env
        page = await browser.new_page()
        await page.goto("https://theresanaiforthat.com/period/february-2026/", timeout=60000)
        await asyncio.sleep(5) # Wait for load
        
        data = await page.evaluate(EXTRACT_JS)
        for i, item in enumerate(data):
            print(f"--- Item {i} ---")
            print(f"Slug: {item['slug']}")
            print(f"Logo: {item['logo']}")
            print(f"Text: {repr(item['text'])}")
            # Save HTML to file for inspection
            with open(f"card_dump_{i}.html", "w", encoding="utf-8") as f:
                f.write(item.get('html', ''))
            print(f"Saved card_dump_{i}.html")
            print("-" * 20)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
