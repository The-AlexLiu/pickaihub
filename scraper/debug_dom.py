"""Debug DOM structure of a period page."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
        )
        page = await browser.new_page()
        await page.goto("https://theresanaiforthat.com/period/september-2024/", timeout=30000)
        await asyncio.sleep(5)

        # Print structure of first few tool links
        info = await page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('a[href*="/ai/"]'));
            return links.slice(0, 15).map(a => {
                let p = a.parentElement;
                let parents = [];
                while (p && parents.length < 4) {
                    parents.push(p.tagName + (p.className ? '.' + p.className : ''));
                    p = p.parentElement;
                }
                return {
                    text: a.innerText.slice(0, 30),
                    href: a.getAttribute('href'),
                    parents: parents.join(' > ')
                };
            });
        }""")

        print("Links found:")
        for i in info:
            print(f"{i['text']} ({i['href']})")
            print(f"  Path: {i['parents']}")
            print("-" * 40)

        await browser.close()

asyncio.run(main())
