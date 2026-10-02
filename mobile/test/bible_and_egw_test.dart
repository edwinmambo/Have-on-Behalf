import 'package:flutter_test/flutter_test.dart';
import '../lib/models/bible_model.dart';
import '../lib/services/egw_service.dart';

void main() {
  group('Bible & EGW Bridge Model Tests', () {
    test('BibleVerse serializes and deserializes correctly with Red-Letter flag', () {
      const verse = BibleVerse(
        bookId: 'JHN',
        chapter: 14,
        verse: 6,
        text: 'Jesus saith unto him, I am the way, the truth, and the life...',
        isRedLetter: true,
      );

      final json = verse.toJson();
      final restored = BibleVerse.fromJson(json);

      expect(restored.bookId, 'JHN');
      expect(restored.chapter, 14);
      expect(restored.verse, 6);
      expect(restored.isRedLetter, isTrue);
      expect(restored.text, contains('I am the way'));
    });

    test('EgwParagraphItem serializes and deserializes correctly', () {
      final json = {
        'bookCode': 'SC',
        'chapterNumber': 1,
        'pageNumber': 9,
        'paragraphNumber': 1,
        'text': 'Nature and revelation alike testify of God’s love.',
        'citation': 'SC 9.1',
      };

      final paragraph = EgwParagraphItem.fromJson(json);

      expect(paragraph.bookCode, 'SC');
      expect(paragraph.chapterNumber, 1);
      expect(paragraph.pageNumber, 9);
      expect(paragraph.citation, 'SC 9.1');
      expect(paragraph.text, contains('God’s love'));
    });
  });
}
