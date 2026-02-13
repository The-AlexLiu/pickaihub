import os
from urllib.parse import urlparse, urlunparse
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local"))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SERVICE_KEY)

def clean_url(url):
    """Remove query parameters from URL"""
    if not url: return url
    parsed = urlparse(url)
    # Reconstruct URL without query string and fragment
    cleaned = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
    return cleaned.rstrip('/') # Remove trailing slash for consistency

def main():
    print("🔍 Fetching tools with potential UTM parameters...")
    
    # Fetch all tools
    # Note: In a large DB, we should paginate. For <1000 tools, this is fine.
    response = supabase.table("tools").select("id, name, url").execute()
    tools = response.data
    
    count = 0
    updated_count = 0
    
    print(f"📦 Scanning {len(tools)} tools...")
    
    for tool in tools:
        original_url = tool['url']
        if not original_url: continue
        
        cleaned_url = clean_url(original_url)
        
        if original_url != cleaned_url:
            print(f"🧹 Cleaning [{tool['name']}]:")
            print(f"   FROM: {original_url}")
            print(f"   TO:   {cleaned_url}")
            
            # Update database
            supabase.table("tools").update({"url": cleaned_url}).eq("id", tool['id']).execute()
            updated_count += 1
        
        count += 1
        
    print(f"\n✅ Done! Scanned {count} tools, cleaned {updated_count} URLs.")

if __name__ == "__main__":
    main()
