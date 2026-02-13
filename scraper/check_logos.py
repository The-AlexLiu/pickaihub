import concurrent.futures
import json
import urllib.request
import urllib.error
from collections import defaultdict

def fetch_head(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        # User-Agent is important
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.headers.get("ETag"), response.headers.get("Content-Length")
    except Exception as e:
        return str(e), None

def main():
    print("Loading tools...")
    with open("scraper/crawled_tools.json", "r") as f:
        tools = json.load(f)
    
    # Check Clever AI Humanizer first
    clever = next((t for t in tools if t["name"] == "Clever AI Humanizer"), None)
    if not clever:
        print("❌ Clever AI Humanizer not found?")
        return
        
    print(f"Checking reference logo: {clever['logo']}")
    bad_etag, bad_len = fetch_head(clever["logo"])
    print(f"🎯 Reference BAD Logo (Clever AI): ETag={bad_etag}, Len={bad_len}")
    
    if not bad_etag:
        print("❌ Failed to get bad ETag from reference.")
        return

    etags = defaultdict(int)
    bad_tools = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(fetch_head, t["logo"]): t for t in tools}
        
        count = 0
        total = len(tools)
        print(f"Checking {total} tools...")
        
        for future in concurrent.futures.as_completed(futures):
            t = futures[future]
            try:
                etag, clen = future.result()
                if etag == bad_etag:
                    bad_tools.append((t["id"], t["name"]))
                etags[etag] += 1
            except Exception as e:
                pass
            
            count += 1
            if count % 100 == 0:
                print(f"  Processed {count}/{total}...")

    print("\n📊 ETag Stats:")
    sorted_etags = sorted(etags.items(), key=lambda x: x[1], reverse=True)
    for k, v in sorted_etags[:10]:
        print(f"  - {k}: {v}")
        
    print(f"\n🚨 FOUND {len(bad_tools)} tools with identical BAD LOGO signature:")
    for tid, name in bad_tools[:10]:
        print(f"  - {name} ({tid})")
    
    # Save bad IDs
    with open("scraper/bad_ids.json", "w") as f:
        json.dump([t[0] for t in bad_tools], f)
    print("Saved bad IDs to scraper/bad_ids.json")

if __name__ == "__main__":
    main()
