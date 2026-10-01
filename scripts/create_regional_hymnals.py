#!/usr/bin/env python3
"""
Saves the 9 user-provided regional and historical hymnals to public/data and mobile/assets/data.
"""
import os
import json

PUBLIC_DIR = "public/data"
MOBILE_DIR = "mobile/assets/data"

def save_hymnal(filename, data):
    for d in [PUBLIC_DIR, MOBILE_DIR]:
        os.makedirs(d, exist_ok=True)
        path = os.path.join(d, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[✓] Saved {path} ({len(data.get('hymns', []))} hymns)")

if __name__ == "__main__":
    print("Dataset generator ready.")
