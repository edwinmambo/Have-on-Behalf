import urllib.request
import json
import re
import os

print("=== Building Pan-African Hymnal Catalog & Cross-Reference Index ===")

# 1. Load existing base files
with open("public/data/nca_master_index.json", "r", encoding="utf-8") as f:
    master_index = json.load(f)

with open("public/data/nca.json", "r", encoding="utf-8") as f:
    nca_hymns = json.load(f)

with open("public/data/nca_old.json", "r", encoding="utf-8") as f:
    nca_old_hymns = json.load(f)

with open("public/data/nzk.json", "r", encoding="utf-8") as f:
    nzk_hymns = json.load(f)

with open("public/data/sdah.json", "r", encoding="utf-8") as f:
    sdah_hymns = json.load(f)

print(f"Loaded: master_index={len(master_index)}, NCA={len(nca_hymns)}, NZK={len(nzk_hymns)}, SDAH={len(sdah_hymns)}")

def clean_title(raw_title, number):
    t = re.sub(r'^\s*#*\d+[\s\.-]*', '', raw_title).strip()
    t = re.sub(r'<[^>]+>', '', t).strip().rstrip('.,-')
    if not t or t.lower().startswith('hymn'):
        t = f"Hymn {number}"
    return t

def parse_html_to_stanzas(content):
    if not content:
        return []
    # Replace breaks
    text = re.sub(r'<br\s*/?>|</br>', '\n', content, flags=re.IGNORECASE)
    # Remove h1/h2 title
    text = re.sub(r'<h[1-6][^>]*>.*?</h[1-6]>', '', text, flags=re.DOTALL|re.IGNORECASE)
    # Chorus / Refrain labels
    text = re.sub(r'(?:<[^>]+>)*\s*(?:chorus|refrain|korasi|korus|gusubiramo|cibwekesho|pušulošo|pu\u0161ulo\u0161o)\s*:?\s*(?:</[^>]+>)*', '\n\n[[CHORUS]]\n', text, flags=re.IGNORECASE)
    text = re.sub(r'\*\*(?:chorus|refrain|korasi|korus|gusubiramo)\s*:?\*\*', '\n\n[[CHORUS]]\n', text, flags=re.IGNORECASE)
    # Stanza number markers
    text = re.sub(r'<font[^>]*><b>(\d+)[\.\s]*</b></font>', r'\n\n[[STANZA_\1]]\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<font[^>]*>(\d+)[\.\s]*</font>', r'\n\n[[STANZA_\1]]\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<b>(\d+)[\.\s]*</b>', r'\n\n[[STANZA_\1]]\n', text, flags=re.IGNORECASE)
    text = re.sub(r'\*\*(\d+)[\.\s]*\*\*', r'\n\n[[STANZA_\1]]\n', text, flags=re.IGNORECASE)
    
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '\"').replace('&#39;', "'")
    
    blocks = re.split(r'\n{2,}|(?=\[\[(?:STANZA_\d+|CHORUS)\]\])', text)
    stanzas = []
    verse_counter = 1
    chorus_counter = 1
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        
        stanza_type = 'verse'
        stanza_num = verse_counter
        
        m_c = re.match(r'\[\[CHORUS\]\]\s*', block)
        m_s = re.match(r'\[\[STANZA_(\d+)\]\]\s*', block)
        
        if m_c:
            stanza_type = 'refrain'
            stanza_num = chorus_counter
            chorus_counter += 1
            block = block[m_c.end():].strip()
        elif m_s:
            stanza_type = 'verse'
            stanza_num = int(m_s.group(1))
            verse_counter = stanza_num + 1
            block = block[m_s.end():].strip()
        else:
            m_digit = re.match(r'^(\d+)[\.\s]+', block)
            if m_digit:
                stanza_type = 'verse'
                stanza_num = int(m_digit.group(1))
                verse_counter = stanza_num + 1
                block = block[m_digit.end():].strip()
            else:
                stanza_type = 'verse'
                stanza_num = verse_counter
                verse_counter += 1
                
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        # Remove leftover "CHORUS:" lines
        cleaned_lines = []
        for l in lines:
            if re.match(r'^(?:chorus|refrain|korasi|korus)\s*:?\s*$', l, re.IGNORECASE):
                continue
            cleaned_lines.append(l)
            
        if cleaned_lines:
            stanzas.append({
                'number': stanza_num,
                'type': stanza_type,
                'lines': cleaned_lines
            })
            
    return stanzas

# 2. Download and process external hymnals
COLLECTIONS_TO_FETCH = [
    {
        "id": "WNY",
        "file": "dholuo",
        "name": "Wende Nyasaye",
        "language": "Dholuo",
        "category": "Praise & Worship"
    },
    {
        "id": "OKN",
        "file": "abagusii",
        "name": "Ogotera kw'Omonene",
        "language": "Ekegusii",
        "category": "Praise & Worship"
    },
    {
        "id": "KIN",
        "file": "kinyarwanda",
        "name": "Indirimbo Zo Guhimbaza Imana",
        "language": "Kinyarwanda",
        "category": "Praise & Worship"
    },
    {
        "id": "CIS",
        "file": "english",
        "name": "Christ in Song",
        "language": "English",
        "category": "Classic Hymns"
    },
    {
        "id": "KMN",
        "file": "chichewa",
        "name": "Khristu Mu Nyimbo",
        "language": "Chichewa",
        "category": "Praise & Worship"
    },
    {
        "id": "ICB",
        "file": "Icibemba",
        "name": "Kristu Mu Nyimbo",
        "language": "Icibemba",
        "category": "Praise & Worship"
    },
    {
        "id": "SHO",
        "file": "shona",
        "name": "Kristu MuNzwiyo",
        "language": "Shona",
        "category": "Praise & Worship"
    },
    {
        "id": "UKE",
        "file": "ndebele",
        "name": "UKrestu Esihlabelelweni",
        "language": "Ndebele",
        "category": "Praise & Worship"
    }
]

parsed_catalogs = {}

for item in COLLECTIONS_TO_FETCH:
    c_id = item["id"]
    file_name = item["file"]
    print(f"Downloading {c_id} ({item['name']} - {item['language']})...")
    url = f"https://raw.githubusercontent.com/TinasheMzondiwa/cis-hymnals/main/{file_name}.json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        raw_data = json.loads(resp.read().decode('utf-8'))
        
    hymns_list = []
    for raw in raw_data:
        num = raw["number"]
        title = clean_title(raw.get("title", f"Hymn {num}"), num)
        # Special title fixes for popular songs
        if c_id == "CIS" and num == 268:
            title = "Master, The Tempest Is Raging!"
        elif c_id == "WNY" and num == 159:
            title = "Chungo E Adiera Kaka Daniel"
        
        stanzas = parse_html_to_stanzas(raw.get("content", ""))
        
        hymn_obj = {
            "id": f"{c_id.lower()}-{num}",
            "collection": c_id,
            "number": num,
            "title": title,
            "category": item["category"],
            "stanzas": stanzas,
            "crossReferences": []
        }
        hymns_list.append(hymn_obj)
        
    parsed_catalogs[c_id] = hymns_list
    print(f"  -> Processed {len(hymns_list)} hymns for {c_id}")

# 3. Build comprehensive cross-references

# Lookup tables
nca_by_num = {h["number"]: h for h in nca_hymns}
nca_old_by_num = {h["number"]: h for h in nca_old_hymns}
nzk_by_num = {h["number"]: h for h in nzk_hymns}
sdah_by_num = {h["number"]: h for h in sdah_hymns}
wny_by_num = {h["number"]: h for h in parsed_catalogs["WNY"]}
okn_by_num = {h["number"]: h for h in parsed_catalogs["OKN"]}
kin_by_num = {h["number"]: h for h in parsed_catalogs["KIN"]}
cis_by_num = {h["number"]: h for h in parsed_catalogs["CIS"]}
kmn_by_num = {h["number"]: h for h in parsed_catalogs["KMN"]}
icb_by_num = {h["number"]: h for h in parsed_catalogs["ICB"]}
sho_by_num = {h["number"]: h for h in parsed_catalogs["SHO"]}
uke_by_num = {h["number"]: h for h in parsed_catalogs["UKE"]}

# Master index maps
master_by_nca = {r["nca"]: r for r in master_index}
master_by_nzk = {r["nzk"]: r for r in master_index if r.get("nzk")}
master_by_sdah = {r["sdah"]: r for r in master_index if r.get("sdah")}

# 3A. Update NCA cross-references
for h in nca_hymns:
    num = h["number"]
    rec = master_by_nca.get(num)
    refs = []
    if rec:
        if rec.get("old") and rec["old"] in nca_old_by_num:
            refs.append({"collection": "NCA-OLD", "number": rec["old"], "title": nca_old_by_num[rec["old"]]["title"]})
        if rec.get("nzk") and rec["nzk"] in nzk_by_num:
            nzk_num = rec["nzk"]
            refs.append({"collection": "NZK", "number": nzk_num, "title": nzk_by_num[nzk_num]["title"]})
            # Also link WNY & OKN which correspond to NZK
            if nzk_num in wny_by_num:
                refs.append({"collection": "WNY", "number": nzk_num, "title": wny_by_num[nzk_num]["title"]})
            if nzk_num in okn_by_num:
                refs.append({"collection": "OKN", "number": nzk_num, "title": okn_by_num[nzk_num]["title"]})
        if rec.get("sdah") and rec["sdah"] in sdah_by_num:
            refs.append({"collection": "SDAH", "number": rec["sdah"], "title": sdah_by_num[rec["sdah"]]["title"]})
    h["crossReferences"] = refs

# 3B. Update NZK cross-references
for h in nzk_hymns:
    num = h["number"]
    refs = []
    # Link East African sisters (WNY & OKN)
    if num in wny_by_num:
        refs.append({"collection": "WNY", "number": num, "title": wny_by_num[num]["title"]})
    if num in okn_by_num:
        refs.append({"collection": "OKN", "number": num, "title": okn_by_num[num]["title"]})
    # Link NCA & SDAH from master index
    rec = master_by_nzk.get(num)
    if rec:
        if rec.get("nca") and rec["nca"] in nca_by_num:
            refs.append({"collection": "NCA", "number": rec["nca"], "title": nca_by_num[rec["nca"]]["title"]})
        if rec.get("old") and rec["old"] in nca_old_by_num:
            refs.append({"collection": "NCA-OLD", "number": rec["old"], "title": nca_old_by_num[rec["old"]]["title"]})
        if rec.get("sdah") and rec["sdah"] in sdah_by_num:
            refs.append({"collection": "SDAH", "number": rec["sdah"], "title": sdah_by_num[rec["sdah"]]["title"]})
    h["crossReferences"] = refs

# 3C. Update WNY (Dholuo) cross-references
for h in parsed_catalogs["WNY"]:
    num = h["number"]
    refs = []
    if num in nzk_by_num:
        refs.append({"collection": "NZK", "number": num, "title": nzk_by_num[num]["title"]})
    if num in okn_by_num:
        refs.append({"collection": "OKN", "number": num, "title": okn_by_num[num]["title"]})
    rec = master_by_nzk.get(num)
    if rec:
        if rec.get("nca") and rec["nca"] in nca_by_num:
            refs.append({"collection": "NCA", "number": rec["nca"], "title": nca_by_num[rec["nca"]]["title"]})
        if rec.get("sdah") and rec["sdah"] in sdah_by_num:
            refs.append({"collection": "SDAH", "number": rec["sdah"], "title": sdah_by_num[rec["sdah"]]["title"]})
    h["crossReferences"] = refs

# 3D. Update OKN (Ekegusii) cross-references
for h in parsed_catalogs["OKN"]:
    num = h["number"]
    refs = []
    if num in nzk_by_num:
        refs.append({"collection": "NZK", "number": num, "title": nzk_by_num[num]["title"]})
    if num in wny_by_num:
        refs.append({"collection": "WNY", "number": num, "title": wny_by_num[num]["title"]})
    rec = master_by_nzk.get(num)
    if rec:
        if rec.get("nca") and rec["nca"] in nca_by_num:
            refs.append({"collection": "NCA", "number": rec["nca"], "title": nca_by_num[rec["nca"]]["title"]})
        if rec.get("sdah") and rec["sdah"] in sdah_by_num:
            refs.append({"collection": "SDAH", "number": rec["sdah"], "title": sdah_by_num[rec["sdah"]]["title"]})
    h["crossReferences"] = refs

# 3E. Update CIS and its Pan-African vernacular translations (KIN, KMN, ICB, SHO, UKE)
cis_group = ["CIS", "KIN", "KMN", "ICB", "SHO", "UKE"]
for primary_code in cis_group:
    for h in parsed_catalogs[primary_code]:
        num = h["number"]
        refs = []
        for other_code in cis_group:
            if other_code == primary_code:
                continue
            cat_list = parsed_catalogs[other_code]
            match_h = next((x for x in cat_list if x["number"] == num), None)
            if match_h:
                refs.append({
                    "collection": other_code,
                    "number": num,
                    "title": match_h["title"]
                })
        h["crossReferences"] = refs

# 4. Save all files to public/data and mobile/assets/data
os.makedirs("public/data", exist_ok=True)
os.makedirs("mobile/assets/data", exist_ok=True)

# Save updated NCA & NZK
with open("public/data/nca.json", "w", encoding="utf-8") as f:
    json.dump(nca_hymns, f, indent=2, ensure_ascii=False)

with open("public/data/nzk.json", "w", encoding="utf-8") as f:
    json.dump(nzk_hymns, f, indent=2, ensure_ascii=False)

# Save new hymnals
for c_id, h_list in parsed_catalogs.items():
    p_path = f"public/data/{c_id.lower()}.json"
    m_path = f"mobile/assets/data/{c_id.lower()}.json"
    with open(p_path, "w", encoding="utf-8") as f:
        json.dump(h_list, f, indent=2, ensure_ascii=False)
    with open(m_path, "w", encoding="utf-8") as f:
        json.dump(h_list, f, indent=2, ensure_ascii=False)
    print(f"Saved {c_id}: {len(h_list)} hymns to {p_path} & {m_path}")

print("=== Pan-African Catalog Build Complete! ===")
