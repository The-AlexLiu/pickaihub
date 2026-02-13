import json
import os
import random
from supabase import create_client, Client
from dotenv import load_dotenv

# 加载环境变量
# dotenv_path 需要指向 .env.local 的绝对路径或正确相对路径
# 假设脚本在 pickaihub/scraper/ 下，.env.local 在 pickaihub/ 下
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local"))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# 如果有 Service Role Key，优先使用它以绕过 RLS
client_key = SERVICE_KEY if SERVICE_KEY else SUPABASE_KEY

if not SUPABASE_URL or not client_key:
    print("❌ Error: Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, client_key)

# 映射 ProductHunt Topics 到我们自己的 Categories
CATEGORY_MAPPING = {
    "Design Tools": "image",
    "Productivity": "productivity",
    "Artificial Intelligence": "chatbot",
    "Developer Tools": "code",
    "Marketing": "marketing",
    "Writing": "text",
    "Video Editing": "video",
    "Audio": "audio",
    "Business": "business",
    "Finance": "finance",
    "Education": "education",
    "3D": "3d"
}

def map_category(ph_category):
    for key, value in CATEGORY_MAPPING.items():
        if key.lower() in ph_category.lower():
            return value
    return "other"

def import_tools():
    try:
        with open("ai_tools_data.json", "r") as f:
            tools = json.load(f)
    except FileNotFoundError:
        print("❌ Error: ai_tools_data.json not found. Run the scraper first.")
        return

    print(f"📦 Importing {len(tools)} tools into Supabase...")

    success_count = 0
    skip_count = 0

    for tool in tools:
        # 1. 数据清洗与映射
        db_tool = {
            "name": tool["name"],
            "description": tool["description"],
            "url": tool["url"],
            "logo": tool["logo"],
            "category": map_category(tool["category"]),
            "tags": tool["tags"],
            "pricing": tool["pricing"],
            "visits": tool["visits"],
            "rating": tool["rating"],
            "is_new": tool["is_new"],
            "is_trending": tool["is_trending"],
            "launch_date": "now()",
            # New fields
            "features": tool.get("features", []),
            "screenshots": tool.get("screenshots", []),
            "price_detail": tool.get("price_detail", "")
        }

        # 2. 插入数据库 (Upsert based on name or url to avoid duplicates)
        # 注意：这里我们简单地用 name 作为唯一键检查，实际生产环境可能需要更复杂的去重逻辑
        try:
            # 检查是否已存在
            existing = supabase.table("tools").select("id").eq("name", db_tool["name"]).execute()
            
            if existing.data:
                print(f"⚠️ Skipping duplicate: {db_tool['name']}")
                skip_count += 1
                continue
            
            # 插入新数据
            result = supabase.table("tools").insert(db_tool).execute()
            if result.data:
                print(f"✅ Imported: {db_tool['name']}")
                success_count += 1
                
        except Exception as e:
            print(f"❌ Error importing {db_tool['name']}: {e}")

    print(f"\n🎉 Import Complete!")
    print(f"✅ Success: {success_count}")
    print(f"⚠️ Skipped: {skip_count}")

if __name__ == "__main__":
    import_tools()
