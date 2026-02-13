"""Quick test to discover correct period URL format."""
import asyncio
from playwright.async_api import async_playwright

TEST_URLS = [
    "https://theresanaiforthat.com/period/february-2025/",
    "https://theresanaiforthat.com/period/december-2024/",
    "https://theresanaiforthat.com/period/june-2023/",
    "https://theresanaiforthat.com/period/2024/",
    "https://theresanaiforthat.com/period/2023/",
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
        )
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        )
        await ctx.add_init_script(
            'Object.defineProperty(navigator, "webdriver", { get: () => false })'
        )
        page = await ctx.new_page()

        # Establish CF session
        print("Establishing session...")
        await page.goto("https://theresanaiforthat.com/", wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(8)

        # Find "View all" links on homepage
        for _ in range(8):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1.5)

        view_all = await page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('a'));
            return links
                .filter(a => (a.textContent || '').includes('View all'))
                .map(a => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 80) }));
        }""")
        print("\\n=== View All links on homepage ===")
        for v in view_all:
            print(f"  {v['text']}  ->  {v['href']}")

        # Test specific URLs
        print("\\n=== Testing period URLs ===")
        for url in TEST_URLS:
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            except Exception:
                pass
            await asyncio.sleep(3)
            final_url = page.url
            title = await page.title()
            count = await page.evaluate(
                "document.querySelectorAll('a[href*=\"/ai/\"]').length"
            )
            print(f"  {url}")
            print(f"    -> final: {final_url}")
            print(f"    -> title: {title[:60]}")
            print(f"    -> tool links: {count}")
            print()

        await browser.close()

asyncio.run(main())
