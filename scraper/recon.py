"""
TAAFT Recon — Discovers internal API endpoints on theresanaiforthat.com
by monitoring network traffic while scrolling the page.

Usage: python recon.py
Output: recon_results.json (captured API responses)
"""

import asyncio
import json
from playwright.async_api import async_playwright

API_RESPONSES = []


async def handle_response(response):
    """Capture JSON API responses."""
    url = response.url
    ct = response.headers.get("content-type", "")
    if response.status == 200 and ("json" in ct or "application/javascript" in ct):
        try:
            body = await response.text()
            if len(body) > 200:  # skip tiny responses
                API_RESPONSES.append({
                    "url": url[:300],
                    "content_type": ct,
                    "body_length": len(body),
                    "body_preview": body[:1000],
                })
        except Exception:
            pass


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1440, "height": 900},
        )
        page = await context.new_page()
        page.on("response", handle_response)

        print("🔍 Navigating to theresanaiforthat.com ...")
        try:
            await page.goto(
                "https://theresanaiforthat.com/",
                wait_until="domcontentloaded",
                timeout=30000,
            )
        except Exception as e:
            print(f"  ⚠️  Initial load warning: {e}")

        # Wait for Cloudflare challenge to clear
        print("⏳ Waiting for Cloudflare challenge ...")
        await asyncio.sleep(8)

        print(f"📡 Page loaded. Captured {len(API_RESPONSES)} API responses so far.\n")

        # Scroll several times to trigger lazy-loading / API calls
        for i in range(8):
            print(f"📜 Scroll {i + 1}/8 ...")
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(3)
            print(f"   API responses so far: {len(API_RESPONSES)}")

        # ── Inspect DOM structure ─────────────────────────
        print("\n🔎 Inspecting DOM structure for tool cards ...")

        dom_info = await page.evaluate("""() => {
            // Look for anchor links that point to tool pages (e.g. /ai/...)
            const links = Array.from(document.querySelectorAll('a[href*="/ai/"]'));
            const sample = links.slice(0, 10).map(a => ({
                href: a.href,
                text: a.textContent?.trim().slice(0, 120),
                parent_class: a.parentElement?.className?.slice(0, 80),
            }));

            // Count total tool-like links
            const allToolLinks = new Set(links.map(a => a.href));

            return {
                total_tool_links: allToolLinks.size,
                sample_links: sample,
                page_title: document.title,
                body_classes: document.body.className,
            };
        }""")

        print(f"  Page title: {dom_info['page_title']}")
        print(f"  Tool-like links found: {dom_info['total_tool_links']}")
        for s in dom_info.get("sample_links", []):
            print(f"    {s['href'][:80]}  →  {s['text'][:60]}")

        # ── Check for __NEXT_DATA__ or embedded JSON ──────
        html = await page.content()
        if "__NEXT_DATA__" in html:
            print("\n✅ Found __NEXT_DATA__ — site uses Next.js SSR")
        if "window.__INITIAL" in html:
            print("\n✅ Found window.__INITIAL — embedded state")

        await browser.close()

    # ── Save results ──────────────────────────────────────
    with open("recon_results.json", "w", encoding="utf-8") as f:
        json.dump(API_RESPONSES, f, indent=2, ensure_ascii=False)

    print(f"\n📊 Total API responses captured: {len(API_RESPONSES)}")
    for i, r in enumerate(API_RESPONSES):
        print(f"\n{'='*60}")
        print(f"Response {i + 1}")
        print(f"  URL:  {r['url'][:120]}")
        print(f"  Type: {r['content_type']}")
        print(f"  Size: {r['body_length']} chars")
        print(f"  Preview: {r['body_preview'][:300]}")

    print(f"\n💾 Full results saved to recon_results.json")


if __name__ == "__main__":
    asyncio.run(main())
