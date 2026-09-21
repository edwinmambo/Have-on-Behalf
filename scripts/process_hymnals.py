import urllib.request
import json
import re

print("Fetching raw hymnals from cis-hymnals repository...")

req_nzk = urllib.request.Request('https://raw.githubusercontent.com/TinasheMzondiwa/cis-hymnals/main/swahili.json', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req_nzk) as resp:
    nzk_raw = json.loads(resp.read().decode('utf-8'))

req_nca = urllib.request.Request('https://raw.githubusercontent.com/TinasheMzondiwa/cis-hymnals/main/gikuyu.json', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req_nca) as resp:
    nca_raw = json.loads(resp.read().decode('utf-8'))

req_sdah = urllib.request.Request('https://raw.githubusercontent.com/TinasheMzondiwa/cis-hymnals/main/sdah.json', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req_sdah) as resp:
    sdah_raw = json.loads(resp.read().decode('utf-8'))

print(f"Downloaded: NZK={len(nzk_raw)}, NCA={len(nca_raw)}, SDAH={len(sdah_raw)}")

def clean_lines_for_stanza(lines, s_type):
    valid_lines = [l.strip() for l in lines if l.strip() and not l.startswith('[[') and not l.endswith(']]')]
    if s_type == 'refrain':
        # Strip colon and any 'CHORUS:' or 'REFRAIN:' labels
        cleaned = []
        for l in valid_lines:
            sub = re.sub(r'^(?:refrain|chorus|korasi|korus)\s*:\s*', '', l, flags=re.IGNORECASE).strip()
            sub = re.sub(r'^(?:refrain|chorus|korasi|korus)\s*', '', sub, flags=re.IGNORECASE).strip()
            if sub and sub.lower() not in ['refrain', 'chorus', 'korasi', 'korus']:
                cleaned.append(sub)
        return cleaned
    return valid_lines

def parse_nzk(item):
    number = item['number']
    raw_title = item.get('title', f"Hymn {number}")
    title = re.sub(r'^\d+[\s\.-]*', '', raw_title).strip()
    title = re.sub(r'<[^>]+>', '', title).strip().rstrip('.,-')
    if number == 1:
        title = "U Mtakatifu"

    content = item.get('content', '')
    content = re.sub(r'<h1[^>]*>.*?</h1>', '', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<font color=[^>]*><b>(\d+)</b></font>', r'\n\n[[STANZA_\1]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<b>(\d+)[\.\s]*</b>', r'\n\n[[STANZA_\1]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<i><b><font[^>]*>CHORUS:?</font></b><br/>', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<font color=[^>]*>CHORUS:?</font>', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<b>CHORUS:?</b>', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'CHORUS:', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</i>', r'\n\n[[END_CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</?(?:p|div|span|font|b|i)[^>]*>', '', content, flags=re.IGNORECASE)

    raw_lines = [l.strip() for l in content.split('\n')]
    stanzas = []
    curr_type = 'verse'
    curr_num = 1
    curr_lines = []

    def flush_stanza():
        nonlocal curr_lines, curr_type, curr_num
        clean = clean_lines_for_stanza(curr_lines, curr_type)
        if clean:
            stanzas.append({
                'number': curr_num,
                'type': curr_type,
                'lines': clean
            })
        curr_lines = []

    for line in raw_lines:
        if not line:
            continue
        m_st = re.match(r'\[\[STANZA_(\d+)\]\]', line)
        if m_st:
            flush_stanza()
            curr_type = 'verse'
            curr_num = int(m_st.group(1))
            continue
        if line == '[[CHORUS]]':
            flush_stanza()
            curr_type = 'refrain'
            continue
        if line == '[[END_CHORUS]]':
            flush_stanza()
            curr_type = 'verse'
            continue
        m_num = re.match(r'^(\d+)\.?$', line)
        if m_num and int(m_num.group(1)) > 1:
            flush_stanza()
            curr_type = 'verse'
            curr_num = int(m_num.group(1))
            continue
        curr_lines.append(line)

    flush_stanza()

    hymn_obj = {
        'id': f"nzk-{number}",
        'collection': 'NZK',
        'number': number,
        'title': title,
        'stanzas': stanzas,
        'hasChords': False,
    }
    if number == 1:
        hymn_obj['scriptureReference'] = 'Ufunuo 4:8-11'
        hymn_obj['crossReferences'] = [
            {'collection': 'SDAH', 'number': 73, 'title': 'Holy, Holy, Holy'},
            {'collection': 'NCA', 'number': 1, 'title': 'No Wee Wi Mutheru'}
        ]
    elif number == 2:
        hymn_obj['crossReferences'] = [
            {'collection': 'SDAH', 'number': 334, 'title': 'Come, Thou Fount of Every Blessing'},
            {'collection': 'NCA', 'number': 2, 'title': 'Twakugatha Ngai'}
        ]
    elif number == 3:
        hymn_obj['crossReferences'] = [
            {'collection': 'SDAH', 'number': 341, 'title': 'To God Be the Glory'},
            {'collection': 'NCA', 'number': 3, 'title': 'Ngai Niagoocwo Nĩ Ciumbe Ciake'}
        ]
    elif number == 7:
        hymn_obj['crossReferences'] = [
            {'collection': 'SDAH', 'number': 103, 'title': 'O God, Our Help in Ages Past'},
            {'collection': 'NCA', 'number': 7, 'title': 'Ngai Atuire Atuteithagia'}
        ]
    elif number == 10:
        hymn_obj['crossReferences'] = [
            {'collection': 'NCA', 'number': 10, 'title': 'Kristo Muiguaniri Tha'}
        ]
    return hymn_obj

nzk_processed = [parse_nzk(item) for item in nzk_raw]
nzk_title_map = {h['number']: h['title'] for h in nzk_processed}
print("NZK processing complete.")

def parse_nca(item):
    number = item['number']
    raw_title = item.get('title', f"Hymn {number}")
    cr_nzk = re.search(r'\(NZK\s*(\d+)\)', raw_title, re.IGNORECASE)
    cr_sdah = re.search(r'\(SDAH\s*(\d+)\)', raw_title, re.IGNORECASE)

    clean_title = re.sub(r'\(NZK\s*\d+\)', '', raw_title, flags=re.IGNORECASE)
    clean_title = re.sub(r'\(SDAH\s*\d+\)', '', clean_title, flags=re.IGNORECASE)
    clean_title = re.sub(r'^\d+[\.\s-]*', '', clean_title)
    clean_title = re.sub(r'<[^>]+>', '', clean_title).strip().rstrip('.,-')
    clean_title = clean_title.replace('<br/>', '').replace('<br>', '').strip()
    if number == 1:
        clean_title = "No Wee Wi Mutheru"

    cross_refs = []
    if cr_nzk:
        nzk_num = int(cr_nzk.group(1))
        nzk_t = nzk_title_map.get(nzk_num, f"Nyimbo Za Kristo #{nzk_num}")
        cross_refs.append({'collection': 'NZK', 'number': nzk_num, 'title': nzk_t})
    if cr_sdah:
        sdah_num = int(cr_sdah.group(1))
        cross_refs.append({'collection': 'SDAH', 'number': sdah_num, 'title': f"SDAH #{sdah_num}"})

    if number == 1:
        cross_refs = [
            {'collection': 'NZK', 'number': 1, 'title': 'U Mtakatifu'},
            {'collection': 'SDAH', 'number': 73, 'title': 'Holy, Holy, Holy'}
        ]
    elif number == 2 and not cross_refs:
        cross_refs = [
            {'collection': 'NZK', 'number': 2, 'title': 'Twamsifu Mungu'},
            {'collection': 'SDAH', 'number': 334, 'title': 'Come, Thou Fount of Every Blessing'}
        ]

    content = item.get('content', '')
    content = re.sub(r'<h1[^>]*>.*?</h1>', '', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'</b>(\d+)[\.\s]*<br/?>', r'\n\n[[STANZA_\1]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'(\d+)[\.\s]*<br/?>', r'\n\n[[STANZA_\1]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</?(?:p|div|span|font|b|i)[^>]*>', '', content, flags=re.IGNORECASE)

    raw_lines = [l.strip() for l in content.split('\n')]
    stanzas = []
    curr_type = 'verse'
    curr_num = 1
    curr_lines = []

    def flush_nca_st():
        nonlocal curr_lines, curr_type, curr_num
        clean = clean_lines_for_stanza(curr_lines, curr_type)
        if clean:
            stanzas.append({
                'number': curr_num,
                'type': curr_type,
                'lines': clean
            })
        curr_lines = []

    for line in raw_lines:
        if not line:
            continue
        m_st = re.match(r'\[\[STANZA_(\d+)\]\]', line)
        if m_st:
            flush_nca_st()
            curr_type = 'verse'
            curr_num = int(m_st.group(1))
            continue
        m_num = re.match(r'^(\d+)\.?$', line)
        if m_num and int(m_num.group(1)) > 1:
            flush_nca_st()
            curr_type = 'verse'
            curr_num = int(m_num.group(1))
            continue
        curr_lines.append(line)

    flush_nca_st()

    hymn_obj = {
        'id': f"nca-{number}",
        'collection': 'NCA',
        'number': number,
        'title': clean_title,
        'stanzas': stanzas,
        'hasChords': False,
    }
    if cross_refs:
        hymn_obj['crossReferences'] = cross_refs
    if number == 1:
        hymn_obj['scriptureReference'] = 'Kũguũrĩrio 4:8-11'
    return hymn_obj

nca_processed = [parse_nca(item) for item in nca_raw]
print("NCA processing complete.")

def parse_sdah(item):
    number = item['number']
    raw_title = item.get('title', f"Hymn {number}")
    title = re.sub(r'^\d+[\s\.-]*', '', raw_title).strip()
    title = re.sub(r'<[^>]+>', '', title).strip().rstrip('.,-')

    content = item.get('content', '')
    content = re.sub(r'<h1[^>]*>.*?</h1>', '', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<font color=[^>]*><b>(\d+)</b></font>', r'\n\n[[STANZA_\1]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<b>(\d+)[\.\s]*</b>', r'\n\n[[STANZA_\1]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<i><b><font[^>]*>REFRAIN:?</font></b><br/>', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<font color=[^>]*>REFRAIN:?</font>', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<b>REFRAIN:?</b>', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'REFRAIN:', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'CHORUS:', r'\n\n[[CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</i>', r'\n\n[[END_CHORUS]]\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</?(?:p|div|span|font|b|i)[^>]*>', '', content, flags=re.IGNORECASE)

    raw_lines = [l.strip() for l in content.split('\n')]
    stanzas = []
    curr_type = 'verse'
    curr_num = 1
    curr_lines = []

    def flush_sdah_st():
        nonlocal curr_lines, curr_type, curr_num
        clean = clean_lines_for_stanza(curr_lines, curr_type)
        if clean:
            stanzas.append({
                'number': curr_num,
                'type': curr_type,
                'lines': clean
            })
        curr_lines = []

    for line in raw_lines:
        if not line:
            continue
        m_st = re.match(r'\[\[STANZA_(\d+)\]\]', line)
        if m_st:
            flush_sdah_st()
            curr_type = 'verse'
            curr_num = int(m_st.group(1))
            continue
        if line == '[[CHORUS]]':
            flush_sdah_st()
            curr_type = 'refrain'
            continue
        if line == '[[END_CHORUS]]':
            flush_sdah_st()
            curr_type = 'verse'
            continue
        m_num = re.match(r'^(\d+)\.?$', line)
        if m_num and int(m_num.group(1)) > 1:
            flush_sdah_st()
            curr_type = 'verse'
            curr_num = int(m_num.group(1))
            continue
        curr_lines.append(line)

    flush_sdah_st()

    hymn_obj = {
        'id': f"sdah-{number}",
        'collection': 'SDAH',
        'number': number,
        'title': title,
        'stanzas': stanzas,
        'hasChords': False,
    }
    if number == 1:
        hymn_obj['scriptureReference'] = 'Psalm 103:1-5'
    elif number == 73:
        hymn_obj['scriptureReference'] = 'Revelation 4:8-11'
        hymn_obj['crossReferences'] = [
            {'collection': 'NZK', 'number': 1, 'title': 'U Mtakatifu'},
            {'collection': 'NCA', 'number': 1, 'title': 'No Wee Wi Mutheru'}
        ]
    elif number == 334:
        hymn_obj['crossReferences'] = [
            {'collection': 'NZK', 'number': 2, 'title': 'Twamsifu Mungu'},
            {'collection': 'NCA', 'number': 2, 'title': 'Twakugatha Ngai'}
        ]
    elif number == 341:
        hymn_obj['crossReferences'] = [
            {'collection': 'NZK', 'number': 3, 'title': 'Mungu Atukuzwe'},
            {'collection': 'NCA', 'number': 3, 'title': 'Ngai Niagoocwo Nĩ Ciumbe Ciake'}
        ]
    elif number == 103:
        hymn_obj['crossReferences'] = [
            {'collection': 'NZK', 'number': 7, 'title': 'Mungu Msaada Wetu'},
            {'collection': 'NCA', 'number': 7, 'title': 'Ngai Atuire Atuteithagia'}
        ]
    elif number == 250:
        hymn_obj['crossReferences'] = [
            {'collection': 'NZK', 'number': 11, 'title': 'Sauti Zote Ziimbe'},
            {'collection': 'NCA', 'number': 12, 'title': 'Migambo Yothe Nĩ iinire'}
        ]
    return hymn_obj

sdah_processed = [parse_sdah(item) for item in sdah_raw]
print("SDAH processing complete.")

with open('public/data/nzk.json', 'w', encoding='utf-8') as f:
    json.dump(nzk_processed, f, ensure_ascii=False, indent=2)

with open('public/data/nca.json', 'w', encoding='utf-8') as f:
    json.dump(nca_processed, f, ensure_ascii=False, indent=2)

with open('public/data/sdah.json', 'w', encoding='utf-8') as f:
    json.dump(sdah_processed, f, ensure_ascii=False, indent=2)

print("Successfully written public/data/nzk.json, public/data/nca.json, public/data/sdah.json")
