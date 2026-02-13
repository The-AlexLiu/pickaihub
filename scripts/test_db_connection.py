import os
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

def test_connection():
    print("🔌 Testing database connection via 'exec_sql' RPC...")
    
    # Try a simple query: Get database version
    test_sql = "SELECT version();"
    
    try:
        # Note: exec_sql returns void, so we can't get the result back directly easily
        # But if it doesn't throw an error, it means it works.
        # To verify it truly works for DDL, let's try a harmless temp table op
        
        ddl_sql = """
        CREATE TEMP TABLE IF NOT EXISTS test_connection_check (
            id serial PRIMARY KEY,
            check_time timestamp DEFAULT now()
        );
        """
        
        response = supabase.rpc("exec_sql", {"sql_query": ddl_sql}).execute()
        print("✅ RPC call successful! Connection established.")
        print("🎉 You can now execute any SQL script via the migration runner.")
        
    except Exception as e:
        print(f"❌ Error connecting or executing SQL: {e}")
        print("\nPossible reasons:")
        print("1. 'exec_sql' function was not created in Supabase Dashboard.")
        print("2. Service Role Key is incorrect.")

if __name__ == "__main__":
    test_connection()
