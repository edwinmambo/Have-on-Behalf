import 'package:flutter/foundation.dart';

/// Represents a hymn accompanied by its multi-language liturgical concordance
/// across standard East African and Southern African hymnals.
@immutable
class HymnConcordance {
  final int hymnId;
  final String hymnalCode;
  final String hymnalName;
  final String language;
  final int hymnNumber;
  final String title;
  final String? lyrics;
  final String? author;
  final String? tuneName;
  final String? meter;
  final String? musicalKey;
  final String? scripture;

  /// Direct cross-reference numbers mapped to specific target hymnals
  final int? nzkNumber; // Kiswahili: Nyimbo Za Kristo
  final int? ncaNumber; // Gĩkũyũ: Nyĩmbo Cia Agendi (Rĩerũ)
  final int? kalNumber; // Kalenjin: Tienwogik Che Kilosune Jehovah
  final int? dhoNumber; // Dholuo: Wende Nyasaye
  final int? oknNumber; // Ekegusii: Ogotera kw'Omonene

  /// Full dictionary of all cross-references (e.g. {'SDAH': 73, 'LUG': 1, 'TON': 1})
  final Map<String, int> allCrossReferences;

  const HymnConcordance({
    required this.hymnId,
    required this.hymnalCode,
    required this.hymnalName,
    required this.language,
    required this.hymnNumber,
    required this.title,
    this.lyrics,
    this.author,
    this.tuneName,
    this.meter,
    this.musicalKey,
    this.scripture,
    this.nzkNumber,
    this.ncaNumber,
    this.kalNumber,
    this.dhoNumber,
    this.oknNumber,
    this.allCrossReferences = const {},
  });

  /// Factory constructor to deserialize from an SQLite row + cross-references map
  factory HymnConcordance.fromSqlite({
    required Map<String, dynamic> row,
    required Map<String, int> crossRefs,
  }) {
    return HymnConcordance(
      hymnId: row['hymn_id'] as int,
      hymnalCode: (row['hymnal_code'] as String).toUpperCase(),
      hymnalName: row['hymnal_name'] as String,
      language: row['language'] as String? ?? 'English',
      hymnNumber: row['hymn_number'] as int,
      title: row['title'] as String,
      lyrics: row['lyrics'] as String?,
      author: row['author'] as String?,
      tuneName: row['tune_name'] as String?,
      meter: row['meter'] as String?,
      musicalKey: row['musical_key'] as String?,
      scripture: row['scripture'] as String?,
      nzkNumber: crossRefs['NZK'],
      ncaNumber: crossRefs['NCA'],
      kalNumber: crossRefs['KAL'],
      dhoNumber: crossRefs['DHO'] ?? crossRefs['WNY'],
      oknNumber: crossRefs['OKN'],
      allCrossReferences: crossRefs,
    );
  }

  /// Convenience getter for display subtitle (e.g. "NZK #221 • NCA #1 • KAL #1")
  String get concordanceSummary {
    final parts = <String>[];
    if (nzkNumber != null) parts.add('NZK #$nzkNumber');
    if (ncaNumber != null) parts.add('NCA #$ncaNumber');
    if (kalNumber != null) parts.add('KAL #$kalNumber');
    if (dhoNumber != null) parts.add('DHO #$dhoNumber');
    if (oknNumber != null) parts.add('OKN #$oknNumber');
    return parts.join(' • ');
  }
}

/// Represents a translated counterpart of a hymn in another indexed language.
@immutable
class TranslatedCounterpart {
  final String hymnalCode;
  final String hymnalName;
  final String language;
  final int hymnNumber;
  final String title;
  final String? snippet;

  const TranslatedCounterpart({
    required this.hymnalCode,
    required this.hymnalName,
    required this.language,
    required this.hymnNumber,
    required this.title,
    this.snippet,
  });

  factory TranslatedCounterpart.fromMap(Map<String, dynamic> map) {
    return TranslatedCounterpart(
      hymnalCode: (map['hymnal_code'] as String).toUpperCase(),
      hymnalName: map['hymnal_name'] as String,
      language: map['language'] as String? ?? 'Vernacular',
      hymnNumber: map['hymn_number'] as int,
      title: map['title'] as String,
      snippet: map['snippet'] as String?,
    );
  }
}

/// Unified hymn model returned by the DAO with all 16 counterparts across the matrix.
@immutable
class UnifiedHymnWithCounterparts {
  final HymnConcordance hymn;
  final List<TranslatedCounterpart> counterparts;

  const UnifiedHymnWithCounterparts({
    required this.hymn,
    required this.counterparts,
  });

  /// Map of counterparts keyed by hymnal code (e.g. counterpartsByCode['NZK'])
  Map<String, TranslatedCounterpart> get counterpartsByCode {
    return {for (final c in counterparts) c.hymnalCode: c};
  }
}

