import json
import concurrent.futures
import time
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY in environment.")
    sys.exit(1)

def main():
    with open("scraper/crawled_tools.json") as f:
        tools = json.load(f)
        
    BAD_NAMES = [
        "AI Image Editor",
        "Everlyn",
        "Google Imagen v4"
    ]
    
    # Fuzzy match
    bad_tools = []
    for t in tools:
        name = t["name"].lower()
        for bn in BAD_NAMES:
            if bn.lower() in name:
                bad_tools.append(t)
                break
                
    if not bad_tools:
        print("❌ No matching tools found to delete.")
        return
        
    print(f"🗑 Removing {len(bad_tools)} tools:")
    for t in bad_tools:
        print(f"  - {t['name']} ({t['id']})")
        
    # 1. Update JSON
    bad_ids = {t['id'] for t in bad_tools}
    new_tools = [t for t in tools if t['id'] not in bad_ids]
    
    with open("scraper/crawled_tools.json", "w") as f:
        json.dump(new_tools, f, indent=2)
    print(f"\n✅ Removed {len(tools) - len(new_tools)} from JSON.")
    
    # 2. Delete from Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    for t in bad_tools:
        tid = t['id']
        url = t['url']
        try:
            # Delete by URL match
            res = supabase.table("tools").delete().eq("url", url).execute()
            print(f"✅ Deleted {t['name']} from Supabase.")
        except Exception as e:
            print(f"❌ Error deleting {t['name']}: {e}")

if __name__ == "__main__":
    main()
