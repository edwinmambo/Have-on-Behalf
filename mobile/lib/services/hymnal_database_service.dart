import 'dart:async';
import '../models/hymn_concordance.dart';

/// Database Access Object (DAO) for the Have On Behalf Sanctuary Hymnal.
/// All queries use strict snake_case table and column conventions.
class HymnalDatabaseService {
  // Accepts dynamic database client (e.g. sqflite Database or custom executor)
  final dynamic _db;

  HymnalDatabaseService(this._db);

  /// Retrieves a hymn by its number and hymnal code, while simultaneously
  /// fetching its corresponding numbers across Swahili (NZK), Kikuyu (NCA),
  /// Kalenjin (KAL), Dholuo (DHO), and Ekegusii (OKN).
  Future<HymnConcordance?> getHymnWithConcordance({
    required String hymnalCode,
    required int hymnNumber,
  }) async {
    final cleanCode = hymnalCode.trim().toUpperCase();

    // 1. Fetch core hymn record joined with hymnal metadata
    const hymnSql = '''
      SELECT 
        h.id AS hymn_id,
        hym.code AS hymnal_code,
        hym.name AS hymnal_name,
        hym.language,
        h.hymn_number,
        h.title,
        h.lyrics,
        h.author,
        h.tune_name,
        h.meter,
        h.musical_key,
        h.scripture
      FROM hymns h
      JOIN hymnals hym ON h.hymnal_id = hym.id
      WHERE UPPER(hym.code) = ? AND h.hymn_number = ?
      LIMIT 1;
    ''';

    final List<Map<String, dynamic>> hymnRows = await _db.rawQuery(hymnSql, [cleanCode, hymnNumber]);
    if (hymnRows.isEmpty) return null;

    final row = hymnRows.first;
    final int hymnId = row['hymn_id'] as int;

    // 2. Fetch all direct and inverse cross-references in a single UNION query
    const refSql = '''
      SELECT 
        UPPER(target_hymnal_code) AS target_code, 
        target_hymn_number AS target_num
      FROM cross_references
      WHERE source_hymn_id = ?
      
      UNION
      
      SELECT 
        UPPER(hym.code) AS target_code, 
        h.hymn_number AS target_num
      FROM cross_references cr
      JOIN hymns h ON cr.source_hymn_id = h.id
      JOIN hymnals hym ON h.hymnal_id = hym.id
      WHERE UPPER(cr.target_hymnal_code) = ? AND cr.target_hymn_number = ?;
    ''';

    final List<Map<String, dynamic>> refRows = await _db.rawQuery(refSql, [hymnId, cleanCode, hymnNumber]);

    final Map<String, int> crossRefs = {};
    for (final r in refRows) {
      final code = (r['target_code'] as String).trim().toUpperCase();
      final num = r['target_num'] as int;
      crossRefs[code] = num;
    }

    return HymnConcordance.fromSqlite(
      row: row,
      crossRefs: crossRefs,
    );
  }

  /// Queries the SQLite database for a hymn by its number and collection code,
  /// and returns the unified hymn object along with a list of its translated
  /// counterparts in the other 16 indexed languages.
  Future<UnifiedHymnWithCounterparts?> getUnifiedHymnWithCounterparts({
    required String collectionCode,
    required int hymnNumber,
  }) async {
    final cleanCode = collectionCode.trim().toUpperCase();

    // 1. Fetch the primary hymn concordance and its cross-reference links
    final baseHymn = await getHymnWithConcordance(
      hymnalCode: cleanCode,
      hymnNumber: hymnNumber,
    );

    if (baseHymn == null) return null;

    // 2. Fetch full translation records for each counterpart across the 16 other languages
    final List<TranslatedCounterpart> counterparts = [];
    final allRefs = baseHymn.allCrossReferences;

    for (final entry in allRefs.entries) {
      final targetCode = entry.key.trim().toUpperCase();
      final targetNum = entry.value;

      if (targetCode == cleanCode) continue;

      const counterpartSql = '''
        SELECT 
          hym.code AS hymnal_code,
          hym.name AS hymnal_name,
          hym.language,
          h.hymn_number,
          h.title,
          SUBSTR(h.lyrics, 1, 140) AS snippet
        FROM hymns h
        JOIN hymnals hym ON h.hymnal_id = hym.id
        WHERE UPPER(hym.code) = ? AND h.hymn_number = ?
        LIMIT 1;
      ''';

      final List<Map<String, dynamic>> rows = await _db.rawQuery(counterpartSql, [targetCode, targetNum]);
      if (rows.isNotEmpty) {
        counterparts.add(TranslatedCounterpart.fromMap(rows.first));
      }
    }

    // Sort counterparts by language / hymnal name for clean presentation
    counterparts.sort((a, b) => a.language.compareTo(b.language));

    return UnifiedHymnWithCounterparts(
      hymn: baseHymn,
      counterparts: counterparts,
    );
  }

  /// Searches hymns within a hymnal by number or keywords in title / lyrics.
  Future<List<HymnConcordance>> searchHymns({
    required String hymnalCode,
    required String query,
    int limit = 50,
  }) async {
    final cleanCode = hymnalCode.trim().toUpperCase();
    final trimmedQuery = query.trim();

    if (trimmedQuery.isEmpty) {
      const sql = '''
        SELECT 
          h.id AS hymn_id,
          hym.code AS hymnal_code,
          hym.name AS hymnal_name,
          hym.language,
          h.hymn_number,
          h.title,
          h.lyrics,
          h.author,
          h.tune_name,
          h.meter,
          h.musical_key,
          h.scripture
        FROM hymns h
        JOIN hymnals hym ON h.hymnal_id = hym.id
        WHERE UPPER(hym.code) = ?
        ORDER BY h.hymn_number ASC
        LIMIT ?;
      ''';
      final rows = await _db.rawQuery(sql, [cleanCode, limit]);
      return rows.map<HymnConcordance>((r) => HymnConcordance.fromSqlite(row: r, crossRefs: const {})).toList();
    }

    final numericVal = int.tryParse(trimmedQuery);
    if (numericVal != null) {
      const sql = '''
        SELECT 
          h.id AS hymn_id,
          hym.code AS hymnal_code,
          hym.name AS hymnal_name,
          hym.language,
          h.hymn_number,
          h.title,
          h.lyrics,
          h.author,
          h.tune_name,
          h.meter,
          h.musical_key,
          h.scripture
        FROM hymns h
        JOIN hymnals hym ON h.hymnal_id = hym.id
        WHERE UPPER(hym.code) = ? AND (h.hymn_number = ? OR CAST(h.hymn_number AS TEXT) LIKE ?)
        ORDER BY h.hymn_number ASC
        LIMIT ?;
      ''';
      final rows = await _db.rawQuery(sql, [cleanCode, numericVal, '$trimmedQuery%', limit]);
      return rows.map<HymnConcordance>((r) => HymnConcordance.fromSqlite(row: r, crossRefs: const {})).toList();
    }

    const sql = '''
      SELECT 
        h.id AS hymn_id,
        hym.code AS hymnal_code,
        hym.name AS hymnal_name,
        hym.language,
        h.hymn_number,
        h.title,
        h.lyrics,
        h.author,
        h.tune_name,
        h.meter,
        h.musical_key,
        h.scripture
      FROM hymns h
      JOIN hymnals hym ON h.hymnal_id = hym.id
      WHERE UPPER(hym.code) = ? AND (h.title LIKE ? OR h.lyrics LIKE ? OR h.tune_name LIKE ?)
      ORDER BY h.hymn_number ASC
      LIMIT ?;
    ''';
    final wildcard = '%$trimmedQuery%';
    final rows = await _db.rawQuery(sql, [cleanCode, wildcard, wildcard, wildcard, limit]);
    return rows.map<HymnConcordance>((r) => HymnConcordance.fromSqlite(row: r, crossRefs: const {})).toList();
  }

  /// Lists all registered hymnal collections in the database.
  Future<List<Map<String, dynamic>>> getAllHymnals() async {
    const sql = '''
      SELECT id, code, name, language, total_count
      FROM hymnals
      ORDER BY language ASC, name ASC;
    ''';
    return await _db.rawQuery(sql);
  }
}
