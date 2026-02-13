import asyncio
import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local"))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
# Use service role key to have write access
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SERVICE_KEY)

def check_link(url):
    """Check if a URL is accessible"""
    if not url: return False
    try:
        response = requests.head(url, timeout=5, allow_redirects=True)
        return response.status_code < 400
    except:
        return False

def check_image(url):
    """Check if an image URL is valid"""
    if not url: return False
    try:
        response = requests.head(url, timeout=3, allow_redirects=True)
        return response.status_code < 400 and response.headers.get('content-type', '').startswith('image/')
    except:
        return False

def main():
    print("🔍 Starting data quality check...")
    
    # 1. Fetch all tools
    response = supabase.table("tools").select("id, name, url, logo, description").execute()
    tools = response.data
    
    print(f"📦 Checking {len(tools)} tools...")
    
    issues_found = 0
    
    for tool in tools:
        updates = {}
        
        # Check 1: Description length
        if not tool['description'] or len(tool['description']) < 20:
            print(f"⚠️ [{tool['name']}] Description too short")
            issues_found += 1
            
        # Check 2: Main URL
        print(f"   Checking URL: {tool['url']} ...", end="\r")
        if not check_link(tool['url']):
            print(f"❌ [{tool['name']}] Dead link: {tool['url']}          ")
            issues_found += 1
        else:
            print(f"✅ [{tool['name']}] Link OK                        ", end="\r")
            
        # Check 3: Logo
        # TAAFT logos are often valid, but let's check basic format
        if not tool['logo'] or not tool['logo'].startswith('http'):
            print(f"⚠️ [{tool['name']}] Invalid logo URL")
            issues_found += 1
            # Fallback: We could set a flag here or use a default logo
            
    print(f"\n✅ Check complete. Found {issues_found} potential issues.")

if __name__ == "__main__":
    main()
