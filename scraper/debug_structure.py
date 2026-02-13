import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://theresanaiforthat.com/period/march-2025/", wait_until="domcontentloaded", timeout=60000)
        
        # Dump classes of all LI elements
        lis = await page.query_selector_all('li')
        print(f"Found {len(lis)} LI elements")
        for i, li in enumerate(lis[:20]):
            cls = await li.get_attribute('class')
            print(f"LI #{i} class: {cls}")
            
            # Check if it contains a link to /ai/
            link = await li.query_selector('a[href*="/ai/"]')
            if link:
                href = await link.get_attribute('href')
                print(f"  -> Contains AI link: {href}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
