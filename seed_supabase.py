"""
PickAIHub — Supabase Data Seeder
Seeds the Supabase 'tools' table from crawled_tools.json.

Usage:
  export SUPABASE_URL="https://your-project.supabase.co"
  export SUPABASE_SERVICE_KEY="your-service-role-key"
  python seed_supabase.py
"""

import json
import os
import sys
import uuid
import datetime

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase-py not installed. Run: pip install supabase")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing environment variables.")
    print("   export SUPABASE_URL='https://xxx.supabase.co'")
    print("   export SUPABASE_SERVICE_KEY='your-service-role-key'")
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
    category = map_category(raw.get("tags", []))

    pricing = raw.get("pricing", "free").lower()
    if "free" in pricing and "paid" not in pricing:
        pricing_val, pricing_label = "free", "Free"
    elif "freemium" in pricing:
        pricing_val, pricing_label = "freemium", "Freemium"
    else:
        pricing_val, pricing_label = "paid", "Paid"

    name = raw["name"]
    visits = f"{len(name) * 3 + 20}k"
    rating = round(4.0 + (len(name) % 10) / 10.0, 1)

    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": raw.get("description", ""),
        "url": raw.get("url", ""),
        "category": category,
        "category_label": category.capitalize() if category != "3d" else "3D",
        "tags": raw.get("tags", []),
        "pricing": pricing_val,
        "pricing_label": pricing_label,
        "visits": visits,
        "rating": rating,
        "logo": raw.get("logo_url", ""),
        "is_new": len(raw.get("tags", [])) > 0,
        "is_trending": len(raw.get("description", "")) > 50,
        "launch_date": str(datetime.date.today()),
    }

# ── Main ───────────────────────────────────────────────
def main():
    data_file = "crawled_tools.json"
    if not os.path.exists(data_file):
        print(f"❌ {data_file} not found in current directory.")
        sys.exit(1)

    with open(data_file, "r", encoding="utf-8") as f:
        raw_tools = json.load(f)

    print(f"📦 Loaded {len(raw_tools)} tools from {data_file}")

    rows = [transform_tool(t) for t in raw_tools]

    # Upsert in batches of 50
    BATCH_SIZE = 50
    total_inserted = 0

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        result = supabase.table("tools").upsert(batch).execute()
        total_inserted += len(batch)
        print(f"  ✅ Upserted batch {i // BATCH_SIZE + 1}: {len(batch)} rows")

    print(f"\n🎉 Done! {total_inserted} tools seeded into Supabase.")

if __name__ == "__main__":
    main()
