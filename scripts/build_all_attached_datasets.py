import json
import os

PUBLIC_DIR = "public/data"
MOBILE_DIR = "mobile/assets/data"

def save_both(filename, obj):
    for d in [PUBLIC_DIR, MOBILE_DIR]:
        path = os.path.join(d, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
        print(f"Wrote {path} ({os.path.getsize(path)} bytes)")

print("Script framework ready.")
