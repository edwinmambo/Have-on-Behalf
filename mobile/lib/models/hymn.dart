/// Supported canonical hymnal collections
enum HymnalCollection {
  sdah,
  sdahExt,
  nzk,
  wny,
  okn,
  kin,
  cis,
  nca,
  ncaOld,
  kmn,
  icb,
  sho,
  uke;

  String get code {
    switch (this) {
      case HymnalCollection.sdah:
        return 'SDAH';
      case HymnalCollection.sdahExt:
        return 'SDAH-EXT';
      case HymnalCollection.nzk:
        return 'NZK';
      case HymnalCollection.wny:
        return 'WNY';
      case HymnalCollection.okn:
        return 'OKN';
      case HymnalCollection.kin:
        return 'KIN';
      case HymnalCollection.cis:
        return 'CIS';
      case HymnalCollection.nca:
        return 'NCA';
      case HymnalCollection.ncaOld:
        return 'NCA-OLD';
      case HymnalCollection.kmn:
        return 'KMN';
      case HymnalCollection.icb:
        return 'ICB';
      case HymnalCollection.sho:
        return 'SHO';
      case HymnalCollection.uke:
        return 'UKE';
    }
  }

  String get fullName {
    switch (this) {
      case HymnalCollection.sdah:
        return 'Seventh-day Adventist Hymnal';
      case HymnalCollection.sdahExt:
        return 'SDAH Extended & Readings';
      case HymnalCollection.nzk:
        return 'Nyimbo Za Kristo';
      case HymnalCollection.wny:
        return 'Wende Nyasaye';
      case HymnalCollection.okn:
        return "Ogotera kw'Omonene";
      case HymnalCollection.kin:
        return 'Indirimbo Zo Guhimbaza Imana';
      case HymnalCollection.cis:
        return 'Christ in Song';
      case HymnalCollection.nca:
        return 'Nyĩmbo Cia Agendi (Ibuku Rĩerũ)';
      case HymnalCollection.ncaOld:
        return 'Nyĩmbo Cia Agendi (Ibuku Rĩkũrũ)';
      case HymnalCollection.kmn:
        return 'Khristu Mu Nyimbo';
      case HymnalCollection.icb:
        return 'Kristu Mu Nyimbo';
      case HymnalCollection.sho:
        return 'Kristu MuNzwiyo';
      case HymnalCollection.uke:
        return 'UKrestu Esihlabelelweni';
    }
  }

  String get languageName {
    switch (this) {
      case HymnalCollection.sdah:
      case HymnalCollection.sdahExt:
      case HymnalCollection.cis:
        return 'English';
      case HymnalCollection.nzk:
        return 'Kiswahili';
      case HymnalCollection.wny:
        return 'Dholuo';
      case HymnalCollection.okn:
        return 'Ekegusii';
      case HymnalCollection.kin:
        return 'Kinyarwanda';
      case HymnalCollection.nca:
      case HymnalCollection.ncaOld:
        return 'Gĩkũyũ';
      case HymnalCollection.kmn:
        return 'Chichewa';
      case HymnalCollection.icb:
        return 'Icibemba';
      case HymnalCollection.sho:
        return 'Shona';
      case HymnalCollection.uke:
        return 'Ndebele / Zulu';
    }
  }

  static HymnalCollection fromString(String val) {
    final upper = val.toUpperCase().trim();
    if (upper == 'NZK') return HymnalCollection.nzk;
    if (upper == 'WNY' || upper == 'DHO') return HymnalCollection.wny;
    if (upper == 'OKN' || upper == 'ABA') return HymnalCollection.okn;
    if (upper == 'KIN') return HymnalCollection.kin;
    if (upper == 'CIS') return HymnalCollection.cis;
    if (upper == 'KMN' || upper == 'CHW') return HymnalCollection.kmn;
    if (upper == 'ICB') return HymnalCollection.icb;
    if (upper == 'SHO') return HymnalCollection.sho;
    if (upper == 'UKE') return HymnalCollection.uke;
    if (upper == 'NCA-OLD' || upper == 'NCA_OLD') return HymnalCollection.ncaOld;
    if (upper == 'NCA') return HymnalCollection.nca;
    if (upper == 'SDAH-EXT' || upper == 'SDAH_EXT') return HymnalCollection.sdahExt;
    return HymnalCollection.sdah;
  }
}

/// Cross-reference translation link between hymnals
class CrossReference {
  final String collection;
  final int number;
  final String title;

  CrossReference({
    required this.collection,
    required this.number,
    required this.title,
  });

  factory CrossReference.fromJson(Map<String, dynamic> json) {
    return CrossReference(
      collection: json['collection'] as String? ?? 'SDAH',
      number: json['number'] is int ? json['number'] as int : int.tryParse(json['number'].toString()) ?? 0,
      title: json['title'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'collection': collection,
    'number': number,
    'title': title,
  };
}

/// Stanza representation for verses, refrains, and responsive readings
class HymnStanza {
  final int number;
  final String type; // 'verse', 'chorus', 'refrain', 'antiphonal-leader', 'antiphonal-congregation'
  final List<String> lines;

  HymnStanza({
    required this.number,
    required this.type,
    required this.lines,
  });

  bool get isChorus => type.toLowerCase() == 'chorus' || type.toLowerCase() == 'refrain';

  factory HymnStanza.fromJson(Map<String, dynamic> json) {
    final rawLines = json['lines'];
    final List<String> parsedLines = [];
    if (rawLines is List) {
      for (final line in rawLines) {
        parsedLines.add(line.toString());
      }
    } else if (rawLines is String) {
      parsedLines.addAll(rawLines.split('\n'));
    }

    return HymnStanza(
      number: json['number'] is int ? json['number'] as int : int.tryParse(json['number'].toString()) ?? 1,
      type: json['type'] as String? ?? 'verse',
      lines: parsedLines,
    );
  }

  Map<String, dynamic> toJson() => {
    'number': number,
    'type': type,
    'lines': lines,
  };
}

/// Canonical Hymn representation
class Hymn {
  final String id;
  final String collection;
  final int number;
  final String title;
  final String? category;
  final String? key;
  final String? meter;
  final String? author;
  final String? composer;
  final String? tune;
  final String? scriptureReference;
  final int? oldBookNumber;
  final int? newBookNumber;
  final List<CrossReference> crossReferences;
  final List<HymnStanza> stanzas;

  Hymn({
    required this.id,
    required this.collection,
    required this.number,
    required this.title,
    this.category,
    this.key,
    this.meter,
    this.author,
    this.composer,
    this.tune,
    this.scriptureReference,
    this.oldBookNumber,
    this.newBookNumber,
    this.crossReferences = const [],
    required this.stanzas,
  });

  HymnalCollection get collectionEnum => HymnalCollection.fromString(collection);

  /// Strips musical chord brackets [C], [G7], etc. for clean singing lyrics
  static String cleanChordNotation(String text) {
    return text.replaceAll(RegExp(r'\[[A-G][b#]?[^\]]*\]'), '').replaceAll(RegExp(r'\s{2,}'), ' ').trim();
  }

  factory Hymn.fromJson(Map<String, dynamic> json) {
    final rawCross = json['crossReferences'];
    final List<CrossReference> parsedCross = [];
    if (rawCross is List) {
      for (final item in rawCross) {
        if (item is Map<String, dynamic>) {
          parsedCross.add(CrossReference.fromJson(item));
        }
      }
    }

    final rawStanzas = json['stanzas'];
    final List<HymnStanza> parsedStanzas = [];
    if (rawStanzas is List) {
      for (final item in rawStanzas) {
        if (item is Map<String, dynamic>) {
          parsedStanzas.add(HymnStanza.fromJson(item));
        }
      }
    }

    return Hymn(
      id: json['id'] as String? ?? '',
      collection: json['collection'] as String? ?? 'SDAH',
      number: json['number'] is int ? json['number'] as int : int.tryParse(json['number'].toString()) ?? 0,
      title: json['title'] as String? ?? '',
      category: json['category'] as String?,
      key: json['key'] as String?,
      meter: json['meter'] as String?,
      author: json['author'] as String?,
      composer: json['composer'] as String?,
      tune: json['tune'] as String?,
      scriptureReference: json['scriptureReference'] as String?,
      oldBookNumber: json['oldBookNumber'] is int
          ? json['oldBookNumber'] as int
          : int.tryParse(json['oldBookNumber']?.toString() ?? ''),
      newBookNumber: json['newBookNumber'] is int
          ? json['newBookNumber'] as int
          : int.tryParse(json['newBookNumber']?.toString() ?? ''),
      crossReferences: parsedCross,
      stanzas: parsedStanzas,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'collection': collection,
    'number': number,
    'title': title,
    'category': category,
    'key': key,
    'meter': meter,
    'author': author,
    'composer': composer,
    'tune': tune,
    'scriptureReference': scriptureReference,
    'oldBookNumber': oldBookNumber,
    'newBookNumber': newBookNumber,
    'crossReferences': crossReferences.map((c) => c.toJson()).toList(),
    'stanzas': stanzas.map((s) => s.toJson()).toList(),
  };
}
