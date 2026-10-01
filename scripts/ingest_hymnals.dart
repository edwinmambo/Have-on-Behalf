import 'dart:convert';
import 'dart:io';
import 'package:sqlite3/sqlite3.dart';

/// Have on Behalf — Sanctuary Hymnal Ingestion Script (Dart / SQLite)
/// Ingests SDAH 1–695, SDAH Extended 696–954, English Old Edition,
/// and African regional hymnals into normalized SQLite tables using snake_case.

const schemaSql = '''
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
''';

final Map<String, List<String>> filePatternMap = {
  'english_sdah_extended_954.json': ['SDAH_EXT', 'Seventh-day Adventist Hymnal — Extended Collection (696–954)', 'English'],
  'english_old_edition_church_hymnal_and_christ_in_song.json': ['ENG_OLD', 'English Old Edition (The Church Hymnal 1941 & Christ in Song 1900)', 'English'],
  'kalenjin_tienwogik.json': ['KAL', 'Tienwogik che Kilosune Jehobah', 'Kalenjin'],
  'luganda_enyimba_za_kristo.json': ['LUG', 'Enyimba za Kristo', 'Luganda'],
  'silozi_kelesite_mwa_lipina.json': ['LOZ', 'Kelesite mwa Lipina', 'Silozi'],
  'kinande_esyo_nyimbo_sya_kristo.json': ['NAN', 'Esyo Nyimbo sya Kristo', 'Kinande'],
  'chitonga_kristu_mu_nyimbo.json': ['TON', 'Kristu mu Nyimbo', 'Chitonga'],
  'runyankore_ebyeshogoro.json': ['RUN', "Ebyeshongoro by'Okuhimbisa Ruhanga", 'Runyankore-Rukiga'],
  'luo_uganda_buk_wer.json': ['LUO_UG', 'Buk Wer', 'Luo Uganda'],
  'sdah.json': ['SDAH', 'Seventh-day Adventist Hymnal (1985)', 'English'],
  'sdah_ext.json': ['SDAH_EXT', 'Seventh-day Adventist Hymnal — Extended Collection (696–954)', 'English'],
  'cis.json': ['ENG_OLD', 'English Old Edition (The Church Hymnal 1941 & Christ in Song 1900)', 'English'],
  'nzk.json': ['NZK', 'Nyimbo Za Kristo', 'Kiswahili'],
  'nca.json': ['NCA', 'Nyĩmbo Cia Agendi (Ibuku Rĩerũ)', 'Gĩkũyũ'],
  'nca_old.json': ['NCA_OLD', 'Nyĩmbo Cia Agendi (Ibuku Rĩkũrũ)', 'Gĩkũyũ'],
  'wny.json': ['DHO', 'Wende Nyasaye', 'Dholuo'],
  'okn.json': ['OKN', "Ogotera kw'Omonene", 'Ekegusii'],
  'kmn.json': ['KMN', 'Khristu Mu Nyimbo', 'Chichewa'],
  'icb.json': ['ICB', 'Kristu Mu Nyimbo', 'Icibemba'],
  'kin.json': ['KIN', 'Indirimbo Zo Guhimbaza Imana', 'Kinyarwanda'],
  'sho.json': ['SHO', 'Kristu MuNzwiyo', 'Shona'],
  'uke.json': ['UKE', 'UKrestu Esihlabelelweni', 'IsiZulu / Ndebele'],
};

String normalizeCode(String input) {
  final upper = input.trim().toUpperCase().replaceAll('-', '_');
  switch (upper) {
    case 'SDAH_EXT':
    case 'ENG_EXT':
    case 'EXT':
      return 'SDAH_EXT';
    case 'ENG_OLD':
    case 'CIS':
    case 'OLD':
      return 'ENG_OLD';
    case 'DHO':
    case 'WNY':
    case 'LUO':
      return 'DHO';
    case 'LUO_UG':
    case 'ACHOLI':
      return 'LUO_UG';
    case 'RUN':
    case 'RUNYANKORE':
      return 'RUN';
    case 'TON':
    case 'CHITONGA':
      return 'TON';
    case 'NAN':
    case 'KINANDE':
      return 'NAN';
    case 'LOZ':
    case 'SILOZI':
      return 'LOZ';
    case 'LUG':
    case 'LUGANDA':
      return 'LUG';
    case 'KAL':
    case 'KALENJIN':
      return 'KAL';
    case 'NZK':
    case 'SWAHILI':
      return 'NZK';
    case 'NCA':
    case 'GIKUYU':
      return 'NCA';
    case 'OKN':
    case 'EKEGUSII':
      return 'OKN';
    case 'NCA_OLD':
      return 'NCA_OLD';
    case 'SDAH':
    case 'ENGLISH':
      return 'SDAH';
    default:
      return upper;
  }
}

String extractLyrics(Map<String, dynamic> hymn) {
  if (hymn.containsKey('stanzas') && hymn['stanzas'] is List) {
    final stanzas = hymn['stanzas'] as List;
    final blocks = <String>[];
    for (final s in stanzas) {
      if (s is Map<String, dynamic>) {
        final isChorus = s['is_chorus'] == true || s['type'] == 'chorus' || s['type'] == 'refrain';
        final label = isChorus ? '[Chorus]' : '[Stanza ${s['number'] ?? ''}]';
        if (s['lines'] is List) {
          final lines = (s['lines'] as List).map((l) => l.toString()).join('\n');
          blocks.add('$label\n$lines');
        } else if (s['lyrics'] != null) {
          blocks.add('$label\n${s['lyrics']}');
        }
      } else if (s is String) {
        blocks.add(s);
      }
    }
    return blocks.join('\n\n');
  }
  if (hymn['lyrics'] is String) {
    return (hymn['lyrics'] as String).trim();
  }
  return '';
}

void ingestHymnalFile(Database db, String filepath) {
  final file = File(filepath);
  if (!file.existsSync()) return;

  final filename = file.uri.pathSegments.last.toLowerCase();
  final rawContent = file.readAsStringSync();
  final parsed = jsonDecode(rawContent);

  String code = 'UNKNOWN';
  String name = 'Hymnal';
  String language = 'Vernacular';
  List<dynamic> hymnsList = [];

  if (filePatternMap.containsKey(filename)) {
    final meta = filePatternMap[filename]!;
    code = meta[0];
    name = meta[1];
    language = meta[2];
    if (parsed is List) {
      hymnsList = parsed;
    } else if (parsed is Map) {
      hymnsList = (parsed['hymns'] ?? parsed['records'] ?? []) as List;
    }
  } else if (parsed is Map<String, dynamic>) {
    code = parsed['code'] ?? parsed['hymnal_code'] ?? 'UNKNOWN';
    name = parsed['name'] ?? parsed['hymnal_name'] ?? code;
    language = parsed['language'] ?? 'Vernacular';
    hymnsList = (parsed['hymns'] ?? parsed['records'] ?? []) as List;
  } else if (parsed is List) {
    code = filename.replaceAll('.json', '').toUpperCase();
    name = code;
    hymnsList = parsed;
  }

  code = normalizeCode(code);

  db.execute('''
    INSERT INTO hymnals (code, name, language, total_count)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      language = excluded.language,
      total_count = excluded.total_count;
  ''', [code, name, language, hymnsList.length]);

  final hymnalIdRow = db.select('SELECT id FROM hymnals WHERE code = ?;', [code]);
  final hymnalId = hymnalIdRow.first['id'] as int;

  db.execute('BEGIN TRANSACTION;');
  int count = 0;
  for (final item in hymnsList) {
    if (item is! Map<String, dynamic>) continue;
    final rawNum = item['number'] ?? item['hymn_number'];
    if (rawNum == null) continue;
    final hymnNum = int.tryParse(rawNum.toString());
    if (hymnNum == null) continue;

    // Strict Architectural Rules: SDAH strictly 1–695, SDAH_EXT 1–954 (replica of SDAH + extra hymns)
    if (code == 'SDAH' && (hymnNum < 1 || hymnNum > 695)) {
      continue;
    }
    if (code == 'SDAH_EXT' && (hymnNum < 1 || hymnNum > 954)) {
      continue;
    }

    final title = (item['title'] ?? 'Hymn $hymnNum').toString();
    final lyrics = extractLyrics(item);
    final tune = item['tune'] is Map ? item['tune']['name'] : item['tune']?.toString();
    final scripture = (item['scripture'] ?? item['scriptureReference'])?.toString();
    final author = (item['author'] ?? item['composer'])?.toString();

    db.execute('''
      INSERT INTO hymns (hymnal_id, hymn_number, title, lyrics, tune_name, scripture, author)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(hymnal_id, hymn_number) DO UPDATE SET
        title = excluded.title,
        lyrics = COALESCE(excluded.lyrics, hymns.lyrics),
        tune_name = COALESCE(excluded.tune_name, hymns.tune_name),
        scripture = COALESCE(excluded.scripture, hymns.scripture),
        author = COALESCE(excluded.author, hymns.author);
    ''', [hymnalId, hymnNum, title, lyrics, tune, scripture, author]);

    final hymnIdRow = db.select('SELECT id FROM hymns WHERE hymnal_id = ? AND hymn_number = ?;', [hymnalId, hymnNum]);
    final hymnId = hymnIdRow.first['id'] as int;
    count++;

    // Ingest cross references
    final rawRefs = item['cross_references'] ?? item['crossReferences'];
    if (rawRefs is Map<String, dynamic>) {
      rawRefs.forEach((targetKey, targetNum) {
        if (targetNum != null) {
          final tNum = int.tryParse(targetNum.toString());
          if (tNum != null) {
            final targetCode = normalizeCode(targetKey);
            db.execute('''
              INSERT INTO cross_references (source_hymn_id, target_hymnal_code, target_hymn_number)
              VALUES (?, ?, ?)
              ON CONFLICT(source_hymn_id, target_hymnal_code, target_hymn_number) DO NOTHING;
            ''', [hymnId, targetCode, tNum]);
          }
        }
      });
    }
  }

  db.execute('UPDATE hymnals SET total_count = ? WHERE id = ?;', [count, hymnalId]);
  db.execute('COMMIT;');
  stdout.writeln('[+] Ingested [$code] $name ($count hymns).');
}

void main(List<String> args) {
  final dbPath = args.isNotEmpty ? args[0] : 'mobile/assets/data/sanctuary_hymnal.db';
  final dataDir = args.length > 1 ? args[1] : 'public/data';

  stdout.writeln('=== Ingesting Sanctuary Hymnals to SQLite ($dbPath) ===');
  final db = sqlite3.open(dbPath);
  db.execute(schemaSql);

  final dir = Directory(dataDir);
  if (dir.existsSync()) {
    final files = dir.listSync().whereType<File>().where((f) => f.path.endsWith('.json')).toList();
    for (final f in files) {
      if (!f.path.contains('master_index')) {
        ingestHymnalFile(db, f.path);
      }
    }
  }

  stdout.writeln('[✓] Ingestion complete.');
  db.dispose();
}
