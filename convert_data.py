import json
import os
import sys
import uuid
import datetime
from supabase import create_client, Client

# ── Config ──────────────────────────────────────────────
# Read credentials from environment to avoid committing secrets
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY in environment.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Category mapping ───────────────────────────────────
CATEGORIES_MAP = {
    "text": ["copywriting", "email", "seo", "storyteller", "summarizer", "chatbot", "prompt"],
    "image": ["image", "design", "logo", "art", "avatar", "background", "photo"],
    "video": ["video", "animation", "film", "editor"],
    "code": ["code", "developer", "sql", "git", "database", "python", "vibe coding"],
    "audio": ["audio", "voice", "music", "speech", "podcast"],
    "business": ["business", "startup", "management", "legal", "resume"],
    "marketing": ["marketing", "social media", "ad", "sales"],
    "productivity": ["productivity", "calendar", "task", "automation", "notion"],
    "education": ["education", "learning", "tutor", "language", "math"],
    "finance": ["finance", "investing", "stock", "crypto", "tax"],
    "fun": ["fun", "game", "meme", "gift"],
    "3d": ["3d", "model", "render"],
}

def map_category(tags: list[str]) -> str:
    tags_str = " ".join([t.lower() for t in tags])
    for cat, keywords in CATEGORIES_MAP.items():
        for kw in keywords:
            if kw in tags_str:
                return cat
    return "other"

def transform_tool(raw: dict) -> dict:
    """Transform a crawled tool dict into a Supabase row."""
    # Tag mapping if available (scraper leaves empty currently)
    tags = raw.get("tags", [])
    category = map_category(tags) if tags else "other"
    
    # Scraper provides: name, description, url, pricing, visits, logo...
    # DB does not have 'slug' column based on error.
    
    name = raw.get("name")
    if not name: return None

    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": raw.get("description", ""),
        "url": raw.get("url", ""),
        "category": category,
        "category_label": category.capitalize() if category != "3d" else "3D",
        "tags": tags,
        "pricing": raw.get("pricing", "free"),
        "pricing_label": raw.get("pricing_label", "Free"),
        "visits": raw.get("visits", "0"),
        "rating": raw.get("rating", 0),
        "logo": raw.get("logo", ""),
        "is_new": raw.get("is_new", False),
        "is_trending": raw.get("is_trending", False),
        "launch_date": datetime.datetime.now().isoformat(),
    }

# ── Main ───────────────────────────────────────────────
def main():
    data_file = "scraper/crawled_tools.json"
    INPUT_FILE = "scraper/crawled_tools.json"
    if not os.path.exists(data_file):
        print(f"❌ {data_file} not found.")
        sys.exit(1)

    with open(data_file, "r", encoding="utf-8") as f:
        raw_tools = json.load(f)

    print(f"📦 Loaded {len(raw_tools)} tools from {data_file}")
    
    # 1. Fetch existing URLs+IDs for correct UPSERT
    print("🔍 Fetching existing URLs map from database...")
    # We need ID to update existing rows because 'slug' column is missing
    # and we can't upsert on 'url' (no unique constraint possibly).
    # So we map URL -> ID manually.
    existing = supabase.table("tools").select("id,url").execute()
    url_to_id = {row["url"]: row["id"] for row in (existing.data or [])}
    print(f"   Found {len(url_to_id)} existing tools.")

    # 2. Prepare batch
    processed_rows = []
    
    for t in raw_tools:
        url = t.get("url")
        if not url: continue
        
        row = transform_tool(t)
        if not row: continue

        # If exists, use existing ID to force update
        if url in url_to_id:
            row["id"] = url_to_id[url]
        
        processed_rows.append(row)

    print(f"📦 Processing {len(processed_rows)} tools (Updates + Inserts)...")

    # 3. Upsert in batches
    BATCH_SIZE = 100
    total_upserted = 0

    print(f"🚀 Starting upsert...")

    for i in range(0, len(processed_rows), BATCH_SIZE):
        batch = processed_rows[i : i + BATCH_SIZE]
        try:
            # upsert works on PK 'id'
            supabase.table("tools").upsert(batch).execute()
            total_upserted += len(batch)
            print(f"  ✅ Upserted batch {i // BATCH_SIZE + 1}: {len(batch)} rows")
        except Exception as e:
            print(f"  ❌ Error in batch {i // BATCH_SIZE + 1}: {e}")

    print(f"\n🎉 Done! {total_upserted} tools processed.")

if __name__ == "__main__":
    main()
