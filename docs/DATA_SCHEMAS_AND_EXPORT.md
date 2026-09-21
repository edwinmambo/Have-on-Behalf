# Have On Behalf — Data Schemas & Cross-Platform Ingestion Guide

This document defines the canonical JSON schemas for all worship datasets in **Have On Behalf**. These schemas are designed for direct ingestion into web apps, desktop apps, and mobile Flutter/React Native clients.

---

## 1. Hymnal JSON Schema

File format: `sdah.json`, `nzk.json`, `nca.json`

```json
[
  {
    "id": "sdah-159",
    "collection": "SDAH",
    "number": 159,
    "title": "The Old Rugged Cross",
    "category": "Cross & Redemption",
    "key": "Bb",
    "meter": "Irregular",
    "author": "George Bennard",
    "composer": "George Bennard",
    "tune": "OLD RUGGED CROSS",
    "scriptureReference": "Galatians 6:14",
    "crossReferences": [
      { "collection": "NZK", "number": 46, "title": "Msalabani Pa Mwokozi" },
      { "collection": "NCA", "number": 52, "title": "Mũtharaba-inĩ Wa Mwathani" }
    ],
    "stanzas": [
      {
        "number": 1,
        "type": "verse",
        "lines": [
          "On a hill far away stood an old rugged cross,",
          "The emblem of suffering and shame;",
          "And I love that old cross where the dearest and best",
          "For a world of lost sinners was slain."
        ]
      },
      {
        "number": 1,
        "type": "chorus",
        "lines": [
          "So I'll cherish the old rugged cross,",
          "Till my trophies at last I lay down;",
          "I will cling to the old rugged cross,",
          "And exchange it some day for a crown."
        ]
      }
    ]
  }
]
```

---

## 2. Cross-Language Mapping Format

For fast lookup between English, Swahili, and Gĩkũyũ hymns:

```json
{
  "sdah_to_nzk": {
    "159": 46,
    "1": 1,
    "326": 120
  },
  "sdah_to_nca": {
    "159": 52,
    "1": 2
  }
}
```

---

## 3. Flutter Dart Model (Ready for Ingestion)

```dart
class Hymn {
  final String id;
  final String collection;
  final int number;
  final String title;
  final String? category;
  final String? key;
  final String? scriptureReference;
  final List<CrossReference>? crossReferences;
  final List<HymnStanza> stanzas;

  Hymn({
    required this.id,
    required this.collection,
    required this.number,
    required this.title,
    this.category,
    this.key,
    this.scriptureReference,
    this.crossReferences,
    required this.stanzas,
  });

  factory Hymn.fromJson(Map<String, dynamic> json) {
    return Hymn(
      id: json['id'] as String,
      collection: json['collection'] as String,
      number: json['number'] as int,
      title: json['title'] as String,
      category: json['category'] as String?,
      key: json['key'] as String?,
      scriptureReference: json['scriptureReference'] as String?,
      crossReferences: (json['crossReferences'] as List<dynamic>?)
          ?.map((e) => CrossReference.fromJson(e as Map<String, dynamic>))
          .toList(),
      stanzas: (json['stanzas'] as List<dynamic>)
          .map((e) => HymnStanza.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class HymnStanza {
  final int number;
  final String type; // 'verse' | 'chorus' | 'refrain'
  final List<String> lines;

  HymnStanza({
    required this.number,
    required this.type,
    required this.lines,
  });

  factory HymnStanza.fromJson(Map<String, dynamic> json) {
    return HymnStanza(
      number: json['number'] as int,
      type: json['type'] as String,
      lines: (json['lines'] as List<dynamic>).map((e) => e as String).toList(),
    );
  }
}

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
      collection: json['collection'] as String,
      number: json['number'] as int,
      title: json['title'] as String,
    );
  }
}
```

---

## 4. How to Export Datasets

In the application:
1. Navigate to **Settings & Sync** (via the top menu).
2. Scroll to **Extracted Datasets & Offline Data Engine**.
3. Click **Download sdah.json**, **Download nzk.json**, or **Download nca.json**.
4. The downloaded files are formatted, validated, and ready to be dropped into any mobile asset directory (`assets/data/`).
