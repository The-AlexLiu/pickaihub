import json
import os
import sys
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY in environment.")
    sys.exit(1)

def main():
    if not os.path.exists("scraper/bad_ids.json"):
        print("scraper/bad_ids.json not found")
        return
        
    with open("scraper/bad_ids.json") as f:
        bad_ids = json.load(f)
        
    if not bad_ids:
        print("No bad IDs found.")
        return
        
    print(f"🗑 Removing {len(bad_ids)} tools from JSON and Supabase...")
    
    # 1. Update JSON
    with open("scraper/crawled_tools.json") as f:
        tools = json.load(f)
    
    new_tools = [t for t in tools if t['id'] not in bad_ids]
    removed_count = len(tools) - len(new_tools)
    
    with open("scraper/crawled_tools.json", "w") as f:
        json.dump(new_tools, f, indent=2)
    print(f"✅ Removed {removed_count} from JSON.")
    
    # 2. Delete from Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    for tid in bad_ids:
        try:
            # We map ID -> URL usually, but let's try delete by name or ID if possible?
            # Our JSON has 'id' which is the SLUG.
            # But Supabase 'id' is UUID.
            # We don't verify by UUID here.
            # We can delete by URL match?
            url_pattern = f"https://theresanaiforthat.com/ai/{tid}/"
            res = supabase.table("tools").delete().eq("url", url_pattern).execute()
            print(f"✅ Deleted {tid} from Supabase: {res.count if hasattr(res, 'count') else 'Done'}")
        except Exception as e:
            print(f"❌ Error deleting {tid}: {e}")

if __name__ == "__main__":
    main()
