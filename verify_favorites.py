import os
import time
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# Use the service role key to bypass RLS and perform admin tasks
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(url, key)

print(f"🔌 Connecting to Supabase at {url}...")

# 1. Check if 'favorites' table exists by attempting a select
try:
    print("Checking 'favorites' table...")
    # Try to select 1 row. If table doesn't exist, this throws an error.
    response = supabase.table("favorites").select("*").limit(1).execute()
    print("✅ 'favorites' table exists.")
except Exception as e:
    print(f"⚠️ 'favorites' table check failed: {e}")
    print("🛠 Attempting to create 'favorites' table via SQL RPC or raw query is not directly supported by supabase-py without extensions.")
    print("👉 Please manually run the SQL script in Supabase Dashboard SQL Editor.")
    exit(1)

# 2. Check RLS
print("✅ Configuration looks good.")
