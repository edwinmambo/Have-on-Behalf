import json
import os

with open("public/data/nca_master_index.json", "r", encoding="utf-8") as f:
    master_records = json.load(f)

with open("public/data/nca.json", "r", encoding="utf-8") as f:
    nca_hymns = json.load(f)

with open("public/data/nzk.json", "r", encoding="utf-8") as f:
    nzk_hymns = json.load(f)

with open("public/data/sdah.json", "r", encoding="utf-8") as f:
    sdah_hymns = json.load(f)

# Create lookup maps
master_by_nca = {r["nca"]: r for r in master_records}
master_by_old = {r["old"]: r for r in master_records if r.get("old")}
master_by_nzk = {}
for r in master_records:
    if r.get("nzk") and r["nzk"] not in master_by_nzk:
        master_by_nzk[r["nzk"]] = r

master_by_sdah = {}
for r in master_records:
    if r.get("sdah") and r["sdah"] not in master_by_sdah:
        master_by_sdah[r["sdah"]] = r

nzk_by_num = {h["number"]: h for h in nzk_hymns}
sdah_by_num = {h["number"]: h for h in sdah_hymns}
nca_by_num = {h["number"]: h for h in nca_hymns}

# 1. Update NCA hymns
nca_old_hymns = []

for h in nca_hymns:
    num = h["number"]
    rec = master_by_nca.get(num)
    if not rec:
        continue
    
    h["title"] = rec["title"]
    if rec.get("cat"):
        h["category"] = rec["cat"]
    if rec.get("tune"):
        h["tune"] = rec["tune"]
    if rec.get("old"):
        h["oldBookNumber"] = rec["old"]
    
    # Rebuild crossReferences cleanly
    crs = []
    if rec.get("old"):
        crs.append({
            "collection": "NCA-OLD",
            "number": rec["old"],
            "title": rec["title"]
        })
    if rec.get("nzk"):
        nzk_h = nzk_by_num.get(rec["nzk"])
        crs.append({
            "collection": "NZK",
            "number": rec["nzk"],
            "title": nzk_h["title"] if nzk_h else rec["nzk_t"]
        })
    if rec.get("sdah"):
        sdah_h = sdah_by_num.get(rec["sdah"])
        crs.append({
            "collection": "SDAH",
            "number": rec["sdah"],
            "title": sdah_h["title"] if sdah_h else rec["sdah_t"]
        })
    h["crossReferences"] = crs

# 2. Build NCA-OLD hymns (1 to 149)
for old_num in range(1, 150):
    rec = master_by_old.get(old_num)
    if rec:
        new_h = nca_by_num.get(rec["nca"])
        stanzas = new_h["stanzas"] if new_h else [
            {"number": 1, "type": "verse", "lines": [f"1. {rec['title']}"]}
        ]
        crs = [
            {"collection": "NCA", "number": rec["nca"], "title": rec["title"]}
        ]
        if rec.get("nzk"):
            nzk_h = nzk_by_num.get(rec["nzk"])
            crs.append({
                "collection": "NZK",
                "number": rec["nzk"],
                "title": nzk_h["title"] if nzk_h else rec["nzk_t"]
            })
        if rec.get("sdah"):
            sdah_h = sdah_by_num.get(rec["sdah"])
            crs.append({
                "collection": "SDAH",
                "number": rec["sdah"],
                "title": sdah_h["title"] if sdah_h else rec["sdah_t"]
            })
        
        old_h = {
            "id": f"nca-old-{old_num}",
            "collection": "NCA-OLD",
            "number": old_num,
            "title": rec["title"],
            "category": rec.get("cat", "General"),
            "tune": rec.get("tune"),
            "newBookNumber": rec["nca"],
            "stanzas": stanzas,
            "hasChords": False,
            "crossReferences": crs
        }
        nca_old_hymns.append(old_h)
    else:
        # Fallback if old hymn number wasn't mapped
        nca_old_hymns.append({
            "id": f"nca-old-{old_num}",
            "collection": "NCA-OLD",
            "number": old_num,
            "title": f"Rwĩmbo rwa {old_num}",
            "category": "General",
            "stanzas": [{"number": 1, "type": "verse", "lines": [f"Rwĩmbo rwa {old_num} (Ibuku Rĩkũrũ)"]}],
            "hasChords": False,
            "crossReferences": []
        })

# 3. Update NZK hymns with reciprocal cross-references
for h in nzk_hymns:
    num = h["number"]
    # Find all master records that reference this NZK hymn
    matching = [r for r in master_records if r.get("nzk") == num]
    if matching:
        rec = matching[0]
        crs = []
        crs.append({
            "collection": "NCA",
            "number": rec["nca"],
            "title": rec["title"]
        })
        if rec.get("old"):
            crs.append({
                "collection": "NCA-OLD",
                "number": rec["old"],
                "title": rec["title"]
            })
        if rec.get("sdah"):
            sdah_h = sdah_by_num.get(rec["sdah"])
            crs.append({
                "collection": "SDAH",
                "number": rec["sdah"],
                "title": sdah_h["title"] if sdah_h else rec["sdah_t"]
            })
        h["crossReferences"] = crs

# 4. Update SDAH hymns with reciprocal cross-references
for h in sdah_hymns:
    num = h["number"]
    matching = [r for r in master_records if r.get("sdah") == num]
    if matching:
        rec = matching[0]
        crs = []
        crs.append({
            "collection": "NCA",
            "number": rec["nca"],
            "title": rec["title"]
        })
        if rec.get("old"):
            crs.append({
                "collection": "NCA-OLD",
                "number": rec["old"],
                "title": rec["title"]
            })
        if rec.get("nzk"):
            nzk_h = nzk_by_num.get(rec["nzk"])
            crs.append({
                "collection": "NZK",
                "number": rec["nzk"],
                "title": nzk_h["title"] if nzk_h else rec["nzk_t"]
            })
        h["crossReferences"] = crs

# Save all updated files
with open("public/data/nca.json", "w", encoding="utf-8") as f:
    json.dump(nca_hymns, f, indent=2, ensure_ascii=False)

with open("public/data/nca_old.json", "w", encoding="utf-8") as f:
    json.dump(nca_old_hymns, f, indent=2, ensure_ascii=False)

with open("public/data/nzk.json", "w", encoding="utf-8") as f:
    json.dump(nzk_hymns, f, indent=2, ensure_ascii=False)

with open("public/data/sdah.json", "w", encoding="utf-8") as f:
    json.dump(sdah_hymns, f, indent=2, ensure_ascii=False)

print(f"Updated nca.json ({len(nca_hymns)}), created nca_old.json ({len(nca_old_hymns)}), updated nzk.json ({len(nzk_hymns)}), updated sdah.json ({len(sdah_hymns)}).")
