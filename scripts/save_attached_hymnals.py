import json
import os

PUBLIC_DIR = "public/data"
MOBILE_DIR = "mobile/assets/data"

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(MOBILE_DIR, exist_ok=True)

print("Starting generation of attached hymnal datasets...")
