import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;

class EgwBookItem {
  final String code;
  final String title;
  final String shortTitle;
  final int publicationYear;
  final String description;
  final int totalChapters;
  final List<EgwChapterItem> chapters;

  const EgwBookItem({
    required this.code,
    required this.title,
    required this.shortTitle,
    required this.publicationYear,
    required this.description,
    required this.totalChapters,
    required this.chapters,
  });

  factory EgwBookItem.fromJson(Map<String, dynamic> json) {
    final chRaw = json['chapters'] as List? ?? [];
    return EgwBookItem(
      code: json['code'] as String? ?? '',
      title: json['title'] as String? ?? '',
      shortTitle: json['shortTitle'] as String? ?? json['title'] as String? ?? '',
      publicationYear: json['publicationYear'] as int? ?? 1900,
      description: json['description'] as String? ?? '',
      totalChapters: json['totalChapters'] as int? ?? chRaw.length,
      chapters: chRaw.map((c) => EgwChapterItem.fromJson(Map<String, dynamic>.from(c as Map))).toList(),
    );
  }
}

class EgwChapterItem {
  final int number;
  final String title;
  final int? startPage;

  const EgwChapterItem({
    required this.number,
    required this.title,
    this.startPage,
  });

  factory EgwChapterItem.fromJson(Map<String, dynamic> json) {
    return EgwChapterItem(
      number: json['number'] as int? ?? 1,
      title: json['title'] as String? ?? '',
      startPage: json['startPage'] as int?,
    );
  }
}

class EgwParagraphItem {
  final String bookCode;
  final int chapterNumber;
  final int pageNumber;
  final int paragraphNumber;
  final String text;
  final String citation;

  const EgwParagraphItem({
    required this.bookCode,
    required this.chapterNumber,
    required this.pageNumber,
    required this.paragraphNumber,
    required this.text,
    required this.citation,
  });

  factory EgwParagraphItem.fromJson(Map<String, dynamic> json) {
    return EgwParagraphItem(
      bookCode: json['bookCode'] as String? ?? '',
      chapterNumber: json['chapterNumber'] as int? ?? 1,
      pageNumber: json['pageNumber'] as int? ?? 1,
      paragraphNumber: json['paragraphNumber'] as int? ?? 1,
      text: json['text'] as String? ?? '',
      citation: json['citation'] as String? ?? '',
    );
  }
}

class EgwService extends ChangeNotifier {
  static const List<EgwBookItem> defaultBooks = [
    EgwBookItem(
      code: 'SC',
      title: 'Steps to Christ',
      shortTitle: 'Steps to Christ',
      publicationYear: 1892,
      description: 'The definitive guide to finding true peace, repentance, faith, surrender to God, and victory in Jesus Christ.',
      totalChapters: 13,
      chapters: [
        EgwChapterItem(number: 1, title: 'God’s Love for Man', startPage: 9),
        EgwChapterItem(number: 2, title: 'The Sinner’s Need of Christ', startPage: 17),
        EgwChapterItem(number: 3, title: 'Repentance', startPage: 23),
        EgwChapterItem(number: 4, title: 'Confession', startPage: 37),
        EgwChapterItem(number: 5, title: 'Consecration', startPage: 43),
        EgwChapterItem(number: 11, title: 'The Privilege of Prayer', startPage: 93),
      ],
    ),
    EgwBookItem(
      code: 'DA',
      title: 'The Desire of Ages',
      shortTitle: 'Desire of Ages',
      publicationYear: 1898,
      description: 'The monumental life and earthly ministry of Jesus Christ.',
      totalChapters: 87,
      chapters: [
        EgwChapterItem(number: 1, title: '“God With Us”', startPage: 19),
        EgwChapterItem(number: 34, title: '“Peace, Be Still”', startPage: 333),
        EgwChapterItem(number: 86, title: '“Go Teach All Nations”', startPage: 818),
      ],
    ),
    EgwBookItem(
      code: 'GC',
      title: 'The Great Controversy',
      shortTitle: 'Great Controversy',
      publicationYear: 1911,
      description: 'The cosmic conflict between Christ and Satan from the fall of Jerusalem to the New Earth.',
      totalChapters: 42,
      chapters: [
        EgwChapterItem(number: 1, title: 'The Destruction of Jerusalem', startPage: 17),
        EgwChapterItem(number: 42, title: 'The Controversy Ended', startPage: 673),
      ],
    ),
    EgwBookItem(
      code: 'MOH',
      title: 'The Ministry of Healing',
      shortTitle: 'Ministry of Healing',
      publicationYear: 1905,
      description: 'Wholistic health, spiritual wellness, and medical missionary service.',
      totalChapters: 43,
      chapters: [
        EgwChapterItem(number: 1, title: 'Our Example', startPage: 17),
        EgwChapterItem(number: 2, title: 'Days of Ministry', startPage: 29),
      ],
    ),
  ];

  List<EgwBookItem> _books = defaultBooks;
  final List<EgwParagraphItem> _paragraphs = [];
  bool _isBridgeLoaded = false;

  String _activeBookCode = 'SC';
  int _activeChapterNumber = 1;

  List<EgwBookItem> get books => _books;
  String get activeBookCode => _activeBookCode;
  int get activeChapterNumber => _activeChapterNumber;
  bool get isBridgeLoaded => _isBridgeLoaded;

  EgwBookItem get activeBook =>
      _books.firstWhere((b) => b.code == _activeBookCode, orElse: () => _books.first);

  EgwChapterItem get activeChapter {
    final book = activeBook;
    return book.chapters.firstWhere(
      (c) => c.number == _activeChapterNumber,
      orElse: () => book.chapters.isNotEmpty ? book.chapters.first : const EgwChapterItem(number: 1, title: 'Chapter 1'),
    );
  }

  Future<void> initialize() async {
    try {
      final jsonStr = await rootBundle.loadString('assets/data/egw.json');
      final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;

      if (decoded.containsKey('books') && decoded['books'] is List) {
        final bList = decoded['books'] as List;
        _books = bList.map((b) => EgwBookItem.fromJson(Map<String, dynamic>.from(b as Map))).toList();
      }

      if (decoded.containsKey('paragraphs') && decoded['paragraphs'] is List) {
        final pList = decoded['paragraphs'] as List;
        _paragraphs.clear();
        for (final item in pList) {
          _paragraphs.add(EgwParagraphItem.fromJson(Map<String, dynamic>.from(item as Map)));
        }
      }

      _isBridgeLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Note: EgwService synchronized egw.json load status: $e');
    }
  }

  void selectBook(String bookCode) {
    if (_activeBookCode != bookCode) {
      _activeBookCode = bookCode;
      final book = activeBook;
      _activeChapterNumber = book.chapters.isNotEmpty ? book.chapters.first.number : 1;
      notifyListeners();
    }
  }

  void selectChapter(int chapterNumber) {
    if (_activeChapterNumber != chapterNumber) {
      _activeChapterNumber = chapterNumber;
      notifyListeners();
    }
  }

  List<EgwParagraphItem> getParagraphsForActiveChapter() {
    final matches = _paragraphs.where(
      (p) => p.bookCode == _activeBookCode && p.chapterNumber == _activeChapterNumber,
    ).toList();

    if (matches.isNotEmpty) return matches;

    // Fallback default devotional content
    return [
      EgwParagraphItem(
        bookCode: _activeBookCode,
        chapterNumber: _activeChapterNumber,
        pageNumber: 1,
        paragraphNumber: 1,
        text: 'Nature and revelation alike testify of God’s love. Our Father in heaven is the source of life, of wisdom, and of joy. Look at the wonderful and beautiful things of nature. Think of their marvelous adaptation to the needs and happiness, not only of man, but of all living creatures.',
        citation: 'SC 9.1',
      ),
      EgwParagraphItem(
        bookCode: _activeBookCode,
        chapterNumber: _activeChapterNumber,
        pageNumber: 1,
        paragraphNumber: 2,
        text: 'God is love is written upon every opening bud, upon every spire of springing grass. The lovely birds making the air vocal with their happy songs, the delicately tinted flowers in their perfection perfuming the air, the lofty trees of the forest with their rich foliage of living green—all testify to the tender, fatherly care of our God.',
        citation: 'SC 9.2',
      ),
    ];
  }
}
