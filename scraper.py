import asyncio
import json
from playwright.async_api import async_playwright
import random

async def scrape_tools():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        print("Navigating to https://theresanaiforthat.com/ ...")
        await page.goto("https://theresanaiforthat.com/", timeout=60000)
        
        # Wait for content to load
        try:
            await page.wait_for_selector("li .ai_link", timeout=15000)
        except:
            print("Timeout waiting for selectors. Page might be blocked or structure changed.")

        # Scroll down to load more items
        for _ in range(3):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(2000)
            print("Scrolled down...")

        print("Extracting tool data...")
        
        # Select all tool cards (using li as container)
        tool_elements = await page.query_selector_all("li")
        
        tools_data = []
        
        for el in tool_elements:
            try:
                # Check if it is a tool card
                title_el = await el.query_selector(".ai_link")
                if not title_el: continue
                
                # Name
                full_text = await title_el.inner_text()
                name = full_text.split("\n")[0].strip() # detailed text might be inside
                
                # Description
                # Try finding description in sibling or child text
                # often it's in a <p> or just text
                description = ""
                desc_el = await el.query_selector("p")
                if desc_el:
                   description = await desc_el.inner_text()
                
                # If description is empty, try to get text from the container explicitly
                if not description:
                    text_content = await el.inner_text()
                    lines = text_content.split('\n')
                    if len(lines) > 2:
                        description = lines[1] # heuristic

                # URL
                url = ""
                # Try finding the direct visit link
                visit_link = await el.query_selector("a.visit_ai_website_link")
                if visit_link:
                    url = await visit_link.get_attribute("href")
                else:
                    # Fallback to internal link
                    path = await title_el.get_attribute("href")
                    if path:
                        url = "https://theresanaiforthat.com" + path
                
                # Pricing
                pricing = "Unknown"
                if "Free" in (await el.inner_text()):
                    pricing = "Free"
                elif "Paid" in (await el.inner_text()):
                    pricing = "Paid"
                elif "Freemium" in (await el.inner_text()):
                    pricing = "Freemium"
                
                # Logo
                logo_url = ""
                img_el = await el.query_selector("img")
                if img_el:
                    logo_url = await img_el.get_attribute("src")
                
                # Tags
                tags = []
                # Looking for task labels
                tag_els = await el.query_selector_all(".task_label") # inferred class
                if not tag_els:
                     tag_els = await el.query_selector_all("a[href^='/task/']")
                
                for tag_el in tag_els:
                    tag_text = await tag_el.inner_text()
                    tags.append(tag_text)
                
                # Construct tool object
                tool = {
                    "name": name,
                    "description": description.strip(),
                    "url": url,
                    "pricing": pricing,
                    "logo_url": logo_url,
                    "tags": tags[:3] # Limit to 3 tags
                }
                
                # Simple validation
                if tool["name"] and len(tool["name"]) < 50:
                    tools_data.append(tool)
                
            except Exception as e:
                # print(f"Error scraping a tool: {e}") 
                continue

        print(f"Scraped {len(tools_data)} tools.")
        
        # Save to JSON
        with open("crawled_tools.json", "w", encoding="utf-8") as f:
            json.dump(tools_data, f, ensure_ascii=False, indent=2)
            
        print("Saved to crawled_tools.json")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_tools())
