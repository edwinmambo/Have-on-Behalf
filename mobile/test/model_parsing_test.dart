import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../lib/models/hymn.dart';

void main() {
  group('Hymn Model Parsing Tests', () {
    test('Correctly deserializes canonical SDAH hymn with cross-references', () {
      const sampleJson = '''
      {
        "id": "sdah-159",
        "collection": "SDAH",
        "number": 159,
        "title": "The Old Rugged Cross",
        "category": "Cross & Redemption",
        "key": "Bb",
        "meter": "Irregular",
        "author": "George Bennard",
        "crossReferences": [
          { "collection": "NZK", "number": 46, "title": "Msalabani Pa Mwokozi" },
          { "collection": "NCA", "number": 52, "title": "Mũtharaba-inĩ Wa Mwathani" }
        ],
        "stanzas": [
          {
            "number": 1,
            "type": "verse",
            "lines": [
              "[Bb]On a hill far away [Eb]stood an old rugged cross,",
              "[F7]The emblem of suffering and [Bb]shame;"
            ]
          },
          {
            "number": 1,
            "type": "chorus",
            "lines": [
              "So I'll cherish the old rugged cross,",
              "Till my trophies at last I lay down;"
            ]
          }
        ]
      }
      ''';

      final Map<String, dynamic> decoded = jsonDecode(sampleJson);
      final hymn = Hymn.fromJson(decoded);

      expect(hymn.id, 'sdah-159');
      expect(hymn.number, 159);
      expect(hymn.title, 'The Old Rugged Cross');
      expect(hymn.collectionEnum, HymnalCollection.sdah);
      expect(hymn.crossReferences.length, 2);
      expect(hymn.crossReferences[0].collection, 'NZK');
      expect(hymn.crossReferences[0].number, 46);

      // Verify Chord cleaning
      final cleanFirstLine = Hymn.cleanChordNotation(hymn.stanzas[0].lines[0]);
      expect(cleanFirstLine, 'On a hill far away stood an old rugged cross,');
      expect(hymn.stanzas[1].isChorus, isTrue);
    });
  });
}
