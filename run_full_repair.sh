#!/bin/bash
echo "🚀 Starting Full Repair Scrape..."
cd scraper
python3 scrape.py --headless
if [ $? -eq 0 ]; then
    echo "✅ Scrape complete. Starting migration..."
    cd ..
    python3 convert_data.py
else
    echo "❌ Scrape failed."
    exit 1
fi
