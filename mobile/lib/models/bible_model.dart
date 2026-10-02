class BibleVersion {
  final String id;
  final String name;
  final String language;
  final String description;
  final bool hasRedLetter;

  const BibleVersion({
    required this.id,
    required this.name,
    required this.language,
    required this.description,
    this.hasRedLetter = true,
  });
}

class BibleBook {
  final String id;
  final String name;
  final String testament; // 'OT' or 'NT'
  final int totalChapters;

  const BibleBook({
    required this.id,
    required this.name,
    required this.testament,
    required this.totalChapters,
  });
}

class BibleVerse {
  final String bookId;
  final int chapter;
  final int verse;
  final String text;
  final bool isRedLetter;

  const BibleVerse({
    required this.bookId,
    required this.chapter,
    required this.verse,
    required this.text,
    this.isRedLetter = false,
  });

  factory BibleVerse.fromJson(Map<String, dynamic> json) {
    return BibleVerse(
      bookId: json['bookId'] as String? ?? '',
      chapter: json['chapter'] as int? ?? 1,
      verse: json['verse'] as int? ?? 1,
      text: json['text'] as String? ?? '',
      isRedLetter: json['isRedLetter'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bookId': bookId,
      'chapter': chapter,
      'verse': verse,
      'text': text,
      'isRedLetter': isRedLetter,
    };
  }
}
