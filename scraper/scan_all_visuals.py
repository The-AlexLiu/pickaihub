import concurrent.futures
import hashlib
import io
import json
import requests
import xml.etree.ElementTree as ET
from PIL import Image
import imagehash

# Vector Signature (Google Imagen)
BAD_PATH_START = "M 12.43 12.08 C 11.03 13.45 10.19 16.20 11.22"

# Raster Signature (Everlyn)
BAD_PHASH = imagehash.hex_to_hash("c0193fe6c0193fe6")

def check_logo(tool):
    tid = tool["id"]
    url = tool["logo"]
    if not url: return None
    
    try:
        # User-Agent is important for some CDNs
        resp = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
        content = resp.content
        
        # Check SVG
        if b"<svg" in content[:100].lower() or url.lower().endswith(".svg"):
            try:
                content_str = content.decode("utf-8", errors="ignore")
                if BAD_PATH_START in content_str:
                    return (tid, tool["name"], "SVG_PATH_MATCH")
                    
                # Also check MD5 for exact dupes
                md5 = hashlib.md5(content).hexdigest()
                # Known bad MD5s from previous scan (Clever AI)
                if md5 == "6d3fcd35ceeeb1e0c043f00a09bd9ced":
                    return (tid, tool["name"], "SVG_MD5_MATCH")
            except:
                pass
                
        # Check Raster (PNG/JPG/WEBP)
        try:
            img = Image.open(io.BytesIO(content))
            phash = imagehash.phash(img)
            # Threshold for similarity (0 = identical, < 5 quite similar)
            diff = phash - BAD_PHASH
            if diff < 10: # Allow slight variations
                return (tid, tool["name"], f"RASTER_PHASH_MATCH (diff={diff})")
        except:
            pass

    except Exception as e:
        # print(f"Error checking {tid}: {e}")
        pass
        
    return None

def main():
    with open("scraper/crawled_tools.json") as f:
        tools = json.load(f)
        
    print(f"Scanning {len(tools)} tools visually...")
    bad_tools = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(check_logo, t): t for t in tools}
        
        count = 0
        total = len(tools)
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                bad_tools.append(res)
                print(f"🚨 MATCH found: {res[1]} ({res[2]})")
            
            count += 1
            if count % 100 == 0:
                print(f"  Scanned {count}/{total}...")
                
    print(f"\n✅ Scan complete. Found {len(bad_tools)} matches.")
    
    with open("scraper/bad_ids_visual.json", "w") as f:
        json.dump([t[0] for t in bad_tools], f)
    print("Saved to scraper/bad_ids_visual.json")

if __name__ == "__main__":
    main()
