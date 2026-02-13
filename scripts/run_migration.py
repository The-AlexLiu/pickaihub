import os
import sys
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

def run_migration(sql_file_path):
    print(f"🚀 Running migration: {os.path.basename(sql_file_path)}...")
    
    try:
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
            
        # Clean up comments and empty lines slightly if needed, but exec_sql should handle it
        # Just ensure we send the raw SQL
        
        response = supabase.rpc("exec_sql", {"sql_query": sql_content}).execute()
        print("✅ Migration executed successfully!")
        
    except FileNotFoundError:
        print(f"❌ Error: File not found at {sql_file_path}")
    except Exception as e:
        print(f"❌ Error executing migration: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/run_migration.py <path_to_sql_file>")
        print("Example: python3 scripts/run_migration.py supabase/migrations/20240315_add_details.sql")
        exit(1)
        
    sql_file = sys.argv[1]
    # Handle relative paths from project root
    if not os.path.isabs(sql_file):
        sql_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), sql_file)
        
    run_migration(sql_file)
