#!/usr/bin/env python3
"""
Have on Behalf — Sanctuary Hymnal SQLite Ingestion & Seeding Engine
Ingests canonical SDAH 1–695, SDAH Extended 696–954, English Old Edition,
and regional African hymnals into a normalized SQLite database.

All tables, columns, and foreign keys use snake_case per architectural rules.
"""

import os
import sys
import json
import sqlite3
from typing import Dict, Any, List, Optional

DEFAULT_DB_PATH = "mobile/assets/data/sanctuary_hymnal.db"
DEFAULT_DATA_DIR = "public/data"

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS hymnals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    total_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hymns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hymnal_id INTEGER NOT NULL,
    hymn_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    lyrics TEXT,
    author TEXT,
    tune_name TEXT,
    meter TEXT,
    musical_key TEXT,
    scripture TEXT,
    FOREIGN KEY (hymnal_id) REFERENCES hymnals (id) ON DELETE CASCADE,
    UNIQUE (hymnal_id, hymn_number)
);

CREATE TABLE IF NOT EXISTS cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_hymn_id INTEGER NOT NULL,
    target_hymnal_code TEXT NOT NULL,
    target_hymn_number INTEGER NOT NULL,
    FOREIGN KEY (source_hymn_id) REFERENCES hymns (id) ON DELETE CASCADE,
    UNIQUE (source_hymn_id, target_hymnal_code, target_hymn_number)
);

CREATE INDEX IF NOT EXISTS idx_hymns_number ON hymns(hymnal_id, hymn_number);
CREATE INDEX IF NOT EXISTS idx_cross_ref_source ON cross_references(source_hymn_id);
CREATE INDEX IF NOT EXISTS idx_cross_ref_target ON cross_references(target_hymnal_code, target_hymn_number);
"""

# Exact file name mappings for attached hymnal files
FILE_PATTERN_MAP = {
    "english_sdah_extended_954.json": ("SDAH_EXT", "Seventh-day Adventist Hymnal — Extended Collection (696–954)", "English"),
    "english_old_edition_church_hymnal_and_christ_in_song.json": ("ENG_OLD", "English Old Edition (The Church Hymnal 1941 & Christ in Song 1900)", "English"),
    "kalenjin_tienwogik.json": ("KAL", "Tienwogik che Kilosune Jehobah", "Kalenjin"),
    "luganda_enyimba_za_kristo.json": ("LUG", "Enyimba za Kristo", "Luganda"),
    "silozi_kelesite_mwa_lipina.json": ("LOZ", "Kelesite mwa Lipina", "Silozi"),
    "kinande_esyo_nyimbo_sya_kristo.json": ("NAN", "Esyo Nyimbo sya Kristo", "Kinande"),
    "chitonga_kristu_mu_nyimbo.json": ("TON", "Kristu mu Nyimbo", "Chitonga"),
    "runyankore_ebyeshogoro.json": ("RUN", "Ebyeshongoro by'Okuhimbisa Ruhanga", "Runyankore-Rukiga"),
    "luo_uganda_buk_wer.json": ("LUO_UG", "Buk Wer", "Luo Uganda"),
    "sdah.json": ("SDAH", "Seventh-day Adventist Hymnal (1985)", "English"),
    "sdah_ext.json": ("SDAH_EXT", "Seventh-day Adventist Hymnal — Extended Collection (696–954)", "English"),
    "cis.json": ("ENG_OLD", "English Old Edition (The Church Hymnal 1941 & Christ in Song 1900)", "English"),
    "nzk.json": ("NZK", "Nyimbo Za Kristo", "Kiswahili"),
    "nca.json": ("NCA", "Nyĩmbo Cia Agendi (Ibuku Rĩerũ)", "Gĩkũyũ"),
    "nca_old.json": ("NCA_OLD", "Nyĩmbo Cia Agendi (Ibuku Rĩkũrũ)", "Gĩkũyũ"),
    "wny.json": ("DHO", "Wende Nyasaye", "Dholuo"),
    "okn.json": ("OKN", "Ogotera kw'Omonene", "Ekegusii"),
    "kmn.json": ("KMN", "Khristu Mu Nyimbo", "Chichewa"),
    "icb.json": ("ICB", "Kristu Mu Nyimbo", "Icibemba"),
    "kin.json": ("KIN", "Indirimbo Zo Guhimbaza Imana", "Kinyarwanda"),
    "sho.json": ("SHO", "Kristu MuNzwiyo", "Shona"),
    "uke.json": ("UKE", "UKrestu Esihlabelelweni", "IsiZulu / Ndebele"),
}

# Canonical metadata for the 16-hymnbook matrix
CANONICAL_METADATA = {
    "SDAH": ("Seventh-day Adventist Hymnal (1985)", "English"),
    "SDAH_EXT": ("Seventh-day Adventist Hymnal — Extended Collection (696–954)", "English"),
    "ENG_OLD": ("English Old Edition (The Church Hymnal 1941 & Christ in Song 1900)", "English"),
    "NZK": ("Nyimbo Za Kristo", "Kiswahili"),
    "NCA": ("Nyĩmbo Cia Agendi (Ibuku Rĩerũ)", "Gĩkũyũ"),
    "NCA_OLD": ("Nyĩmbo Cia Agendi (Ibuku Rĩkũrũ)", "Gĩkũyũ"),
    "DHO": ("Wende Nyasaye", "Dholuo"),
    "OKN": ("Ogotera kw'Omonene", "Ekegusii"),
    "KAL": ("Tienwogik che Kilosune Jehobah", "Kalenjin"),
    "LUG": ("Enyimba za Kristo", "Luganda"),
    "LOZ": ("Kelesite mwa Lipina", "Silozi"),
    "NAN": ("Esyo Nyimbo sya Kristo", "Kinande"),
    "TON": ("Kristu mu Nyimbo", "Chitonga"),
    "RUN": ("Ebyeshongoro by'Okuhimbisa Ruhanga", "Runyankore-Rukiga"),
    "LUO_UG": ("Buk Wer", "Luo Uganda"),
    "KMN": ("Khristu Mu Nyimbo", "Chichewa"),
    "SHO": ("Kristu MuNzwiyo", "Shona"),
    "UKE": ("UKrestu Esihlabelelweni", "IsiZulu / Ndebele"),
    "ICB": ("Kristu Mu Nyimbo", "Icibemba"),
    "KIN": ("Indirimbo Zo Guhimbaza Imana", "Kinyarwanda"),
}

# Map field variations in cross_references to standard hymnal codes
FIELD_TO_CODE = {
    "sdah_number": "SDAH",
    "kiswahili_nzk_number": "NZK",
    "gikuyu_nca_number": "NCA",
    "ekegusii_okn_number": "OKN",
    "dholuo_wny_number": "DHO",
    "kalenjin_kal_number": "KAL",
    "luganda_lug_number": "LUG",
    "silozi_loz_number": "LOZ",
    "kinande_nan_number": "NAN",
    "chitonga_ton_number": "TON",
    "runyankore_run_number": "RUN",
    "luo_uganda_number": "LUO_UG",
}

NAME_TO_CODE = {
    "SDAH (English)": "SDAH",
    "SDAH": "SDAH",
    "NZK (Swahili)": "NZK",
    "NZK": "NZK",
    "NCA (Kikuyu)": "NCA",
    "NCA": "NCA",
    "NCA-OLD": "NCA_OLD",
    "OKN (Gusii)": "OKN",
    "OKN": "OKN",
    "WNY (Dholuo)": "DHO",
    "WNY": "DHO",
    "DHO": "DHO",
    "KAL (Kalenjin)": "KAL",
    "KAL": "KAL",
    "LUG (Luganda)": "LUG",
    "LUG": "LUG",
    "LOZ (Silozi)": "LOZ",
    "LOZ": "LOZ",
    "NAN (Kinande)": "NAN",
    "NAN": "NAN",
    "TON (Chitonga)": "TON",
    "TON": "TON",
    "RUN (Runyankore)": "RUN",
    "RUN": "RUN",
    "LUO_UG": "LUO_UG",
    "ENG_OLD": "ENG_OLD",
    "CIS": "ENG_OLD",
    "ENG_EXT": "SDAH_EXT",
    "SDAH-EXT": "SDAH_EXT",
}


def normalize_code(name_or_field: str) -> str:
    cleaned = name_or_field.strip().upper().replace("-", "_")
    if cleaned in FIELD_TO_CODE:
        return FIELD_TO_CODE[cleaned.lower()]
    if cleaned in ("SDAH_EXT", "ENG_EXT", "EXT"):
        return "SDAH_EXT"
    if cleaned in ("NCA_OLD", "RIKURU", "RĨKŨRŨ"):
        return "NCA_OLD"
    if cleaned in ("ENG_OLD", "CIS", "OLD"):
        return "ENG_OLD"
    if cleaned in ("DHO", "WNY", "LUO_KE", "LUO"):
        return "DHO"
    if cleaned in ("LUO_UG", "ACHOLI", "LANGO"):
        return "LUO_UG"
    if cleaned in ("RUN", "RUNYANKORE", "RUKIGA"):
        return "RUN"
    if cleaned in ("TON", "CHITONGA", "TONGA"):
        return "TON"
    if cleaned in ("NAN", "KINANDE", "NANDE"):
        return "NAN"
    if cleaned in ("LOZ", "SILOZI", "LOZI"):
        return "LOZ"
    if cleaned in ("LUG", "LUGANDA", "GANDA"):
        return "LUG"
    if cleaned in ("KAL", "KALENJIN"):
        return "KAL"
    if cleaned in ("NZK", "SWAHILI", "KISWAHILI"):
        return "NZK"
    if cleaned in ("NCA", "GIKUYU", "KIKUYU"):
        return "NCA"
    if cleaned in ("OKN", "GUSII", "EKEGUSII"):
        return "OKN"
    if cleaned in ("KIN", "KINYARWANDA"):
        return "KIN"
    if cleaned in ("KMN", "CHICHEWA", "NYANJA"):
        return "KMN"
    if cleaned in ("ICB", "ICIBEMBA", "BEMBA"):
        return "ICB"
    if cleaned in ("SHO", "SHONA"):
        return "SHO"
    if cleaned in ("UKE", "NDEBELE", "ZULU"):
        return "UKE"
    if cleaned in ("SDAH", "ENGLISH"):
        return "SDAH"
    return cleaned


def init_database(db_path: str) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.executescript(SCHEMA_SQL)
    conn.commit()
    return conn


def extract_lyrics(hymn_data: Dict[str, Any]) -> str:
    """Extract formatted lyrics from stanzas, verses, or plain text."""
    if "stanzas" in hymn_data and isinstance(hymn_data["stanzas"], list):
        blocks = []
        for stanza in hymn_data["stanzas"]:
            if isinstance(stanza, dict):
                label = "Chorus" if stanza.get("is_chorus") or stanza.get("type") in ("chorus", "refrain") else f"Stanza {stanza.get('number', stanza.get('stanza_number', ''))}"
                lines = stanza.get("lines")
                if lines and isinstance(lines, list):
                    text = "\n".join(lines)
                else:
                    text = stanza.get("lyrics", stanza.get("text", ""))
                blocks.append(f"[{label.strip()}]\n{text.strip()}")
            elif isinstance(stanza, str):
                blocks.append(stanza.strip())
        return "\n\n".join(b for b in blocks if b)

    if "lyrics" in hymn_data and isinstance(hymn_data["lyrics"], str):
        return hymn_data["lyrics"].strip()

    if "verses" in hymn_data and isinstance(hymn_data["verses"], list):
        return "\n\n".join(str(v).strip() for v in hymn_data["verses"] if v)

    return ""


def ingest_hymnal_file(conn: sqlite3.Connection, filepath: str, explicit_code: Optional[str] = None) -> int:
    """Parse a hymnal JSON file and insert into SQLite with cross references."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    base_filename = os.path.basename(filepath).lower()

    # 1. Determine collection metadata
    if base_filename in FILE_PATTERN_MAP:
        code, name, language = FILE_PATTERN_MAP[base_filename]
        if isinstance(data, dict):
            hymns_list = data.get("hymns") or data.get("records") or []
        elif isinstance(data, list):
            hymns_list = data
        else:
            return 0
    elif isinstance(data, dict):
        code = explicit_code or data.get("hymnal_code") or data.get("code")
        name = data.get("hymnal_name") or data.get("collection_name") or data.get("name") or "Sanctuary Hymnal"
        language = data.get("language") or "Vernacular"
        hymns_list = data.get("hymns") or data.get("records") or []
    elif isinstance(data, list):
        # Array of hymn items
        code = explicit_code or os.path.splitext(os.path.basename(filepath))[0].upper()
        name = code
        language = "Unknown"
        hymns_list = data
    else:
        print(f"[!] Unknown JSON structure in {filepath}")
        return 0

    code = normalize_code(code)

    # Apply canonical metadata if recognized
    if code in CANONICAL_METADATA:
        canon_name, canon_lang = CANONICAL_METADATA[code]
        name = canon_name
        language = canon_lang

    cursor = conn.cursor()

    # Insert or update hymnal
    cursor.execute("""
        INSERT INTO hymnals (code, name, language, total_count)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(code) DO UPDATE SET
            name = excluded.name,
            language = excluded.language,
            total_count = excluded.total_count
    """, (code, name, language, len(hymns_list)))

    cursor.execute("SELECT id FROM hymnals WHERE code = ?", (code,))
    hymnal_id = cursor.fetchone()[0]

    hymns_inserted = 0
    cross_refs_inserted = 0

    for h in hymns_list:
        hymn_num = h.get("number") or h.get("hymn_number")
        if hymn_num is None:
            continue
        try:
            hymn_num = int(hymn_num)
        except (ValueError, TypeError):
            continue

        # Strict Rule 1: "English – SDA Hymnal 1985 (695)" strictly 1–695
        if code == "SDAH" and not (1 <= hymn_num <= 695):
            continue

        # SDAH Extended: replica of SDAH (1-695) plus the extra hymns (696-954)
        if code == "SDAH_EXT" and not (1 <= hymn_num <= 954):
            print(f"[Warning] Skipping hymn #{hymn_num} outside valid extended range 1–954")
            continue

        title = h.get("title") or f"Hymn {hymn_num}"
        lyrics = extract_lyrics(h)

        # Extract tune info
        tune_data = h.get("tune")
        if isinstance(tune_data, dict):
            tune_name = tune_data.get("tune_name") or tune_data.get("name")
            meter = tune_data.get("meter")
            musical_key = tune_data.get("key")
        else:
            tune_name = h.get("tune") or h.get("tune_name")
            meter = h.get("meter")
            musical_key = h.get("key")

        author = h.get("author") or h.get("composer")
        scripture = h.get("scripture") or h.get("scriptureReference")

        # Insert hymn
        cursor.execute("""
            INSERT INTO hymns (hymnal_id, hymn_number, title, lyrics, tune_name, meter, musical_key, scripture, author)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(hymnal_id, hymn_number) DO UPDATE SET
                title = excluded.title,
                lyrics = COALESCE(excluded.lyrics, hymns.lyrics),
                tune_name = COALESCE(excluded.tune_name, hymns.tune_name),
                meter = COALESCE(excluded.meter, hymns.meter),
                musical_key = COALESCE(excluded.musical_key, hymns.musical_key),
                scripture = COALESCE(excluded.scripture, hymns.scripture),
                author = COALESCE(excluded.author, hymns.author)
        """, (hymnal_id, hymn_num, title, lyrics, tune_name, meter, musical_key, scripture, author))

        cursor.execute("SELECT id FROM hymns WHERE hymnal_id = ? AND hymn_number = ?", (hymnal_id, hymn_num))
        hymn_id = cursor.fetchone()[0]
        hymns_inserted += 1

        # Ingest cross-references
        raw_refs = h.get("cross_references") or h.get("crossReferences")
        if isinstance(raw_refs, dict):
            for field, target_num in raw_refs.items():
                if target_num is not None:
                    try:
                        target_num_int = int(target_num)
                        target_code = normalize_code(field)
                        cursor.execute("""
                            INSERT INTO cross_references (source_hymn_id, target_hymnal_code, target_hymn_number)
                            VALUES (?, ?, ?)
                            ON CONFLICT(source_hymn_id, target_hymnal_code, target_hymn_number) DO NOTHING
                        """, (hymn_id, target_code, target_num_int))
                        cross_refs_inserted += 1
                    except (ValueError, TypeError):
                        pass

        elif isinstance(raw_refs, list):
            for ref_item in raw_refs:
                if isinstance(ref_item, dict):
                    target_code = normalize_code(ref_item.get("hymnal") or ref_item.get("collection") or "")
                    target_num = ref_item.get("number")
                    if target_code and target_num is not None:
                        try:
                            target_num_int = int(target_num)
                            cursor.execute("""
                                INSERT INTO cross_references (source_hymn_id, target_hymnal_code, target_hymn_number)
                                VALUES (?, ?, ?)
                                ON CONFLICT(source_hymn_id, target_hymnal_code, target_hymn_number) DO NOTHING
                            """, (hymn_id, target_code, target_num_int))
                            cross_refs_inserted += 1
                        except (ValueError, TypeError):
                            pass

    # Update total count
    cursor.execute("UPDATE hymnals SET total_count = ? WHERE id = ?", (hymns_inserted, hymnal_id))
    conn.commit()
    print(f"[+] Ingested [{code}] {name}: {hymns_inserted} hymns, {cross_refs_inserted} cross-refs.")
    return hymns_inserted


def query_hymn_concordance(conn: sqlite3.Connection, hymnal_code: str, hymn_number: int) -> Dict[str, Any]:
    """
    Demonstrates retrieving a hymn by number and simultaneously fetching its corresponding
    number across Swahili (NZK), Kikuyu (NCA), Kalenjin (KAL), Dholuo (DHO), and Ekegusii (OKN).
    """
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            h.id AS hymn_id,
            hym.code AS hymnal_code,
            hym.name AS hymnal_name,
            h.hymn_number,
            h.title,
            h.tune_name,
            h.meter,
            h.musical_key,
            h.scripture,
            h.lyrics
        FROM hymns h
        JOIN hymnals hym ON h.hymnal_id = hym.id
        WHERE hym.code = ? AND h.hymn_number = ?
    """, (hymnal_code, hymn_number))
    hymn_row = cursor.fetchone()

    if not hymn_row:
        return {"error": f"Hymn {hymnal_code} #{hymn_number} not found."}

    hymn_id = hymn_row["hymn_id"]

    # Fetch cross references
    cursor.execute("""
        SELECT target_hymnal_code, target_hymn_number
        FROM cross_references
        WHERE source_hymn_id = ?
    """, (hymn_id,))
    refs = {row["target_hymnal_code"]: row["target_hymn_number"] for row in cursor.fetchall()}

    # Also check bidirectional links where this hymn was targeted
    cursor.execute("""
        SELECT hym.code AS target_code, h.hymn_number AS target_num
        FROM cross_references cr
        JOIN hymns h ON cr.source_hymn_id = h.id
        JOIN hymnals hym ON h.hymnal_id = hym.id
        WHERE cr.target_hymnal_code = ? AND cr.target_hymn_number = ?
    """, (hymnal_code, hymn_number))
    for row in cursor.fetchall():
        if row["target_code"] not in refs:
            refs[row["target_code"]] = row["target_num"]

    return {
        "hymn": dict(hymn_row),
        "concordance": {
            "NZK (Swahili)": refs.get("NZK"),
            "NCA (Kikuyu)": refs.get("NCA"),
            "KAL (Kalenjin)": refs.get("KAL"),
            "DHO (Dholuo)": refs.get("DHO"),
            "OKN (Ekegusii)": refs.get("OKN"),
            "all_references": refs
        }
    }


def main():
    db_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB_PATH
    data_dir = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_DATA_DIR

    print(f"=== Initializing Sanctuary Hymnal SQLite Database at {db_path} ===")
    conn = init_database(db_path)

    # Ingest files from data directory
    if os.path.exists(data_dir):
        files = sorted(os.listdir(data_dir))
        for fname in files:
            if fname.endswith(".json") and not fname.startswith("nca_master_index"):
                filepath = os.path.join(data_dir, fname)
                ingest_hymnal_file(conn, filepath)

    # Verify query for Hymn #1 across NZK, NCA, KAL, DHO, OKN
    print("\n=== Testing Multi-Hymnal Concordance Query for Hymn #1 ===")
    for test_code in ["LUO_UG", "KAL", "LUG", "SDAH"]:
        res = query_hymn_concordance(conn, test_code, 1)
        if "error" not in res:
            h = res["hymn"]
            c = res["concordance"]
            print(f"[{test_code} #{h['hymn_number']}] {h['title']}")
            print(f"  -> NZK: {c['NZK (Swahili)']}, NCA: {c['NCA (Kikuyu)']}, KAL: {c['KAL (Kalenjin)']}, DHO: {c['DHO (Dholuo)']}, OKN: {c['OKN (Ekegusii)']}")

    conn.close()
    print("\n[✓] Ingestion and validation completed successfully.")


if __name__ == "__main__":
    main()
