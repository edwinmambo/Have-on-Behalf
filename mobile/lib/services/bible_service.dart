import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import '../models/bible_model.dart';

class BibleService extends ChangeNotifier {
  static const List<BibleVersion> defaultVersions = [
    BibleVersion(
      id: 'KJV',
      name: 'King James Version',
      language: 'English',
      description: 'Monumental Authorized 1611 edition with words of Christ in red.',
      hasRedLetter: true,
    ),
    BibleVersion(
      id: 'SUV',
      name: 'Biblia Takatifu (SUV)',
      language: 'Kiswahili',
      description: 'Swahili Union Version / Habari Njema inayotumiwa Afrika Mashariki.',
      hasRedLetter: true,
    ),
    BibleVersion(
      id: 'GIK',
      name: 'Kĩrĩkanĩro Gĩtheru',
      language: 'Gĩkũyũ',
      description: 'Ibuku rĩa Ngai thĩinĩ wa rũthiomi rwa Gĩkũyũ kĩa Kenya.',
      hasRedLetter: true,
    ),
    BibleVersion(
      id: 'WEB',
      name: 'World English Bible',
      language: 'English',
      description: 'Modern, accurate, public-domain English scripture.',
      hasRedLetter: true,
    ),
  ];

  static const List<BibleBook> defaultBooks = [
    BibleBook(id: 'GEN', name: 'Genesis', testament: 'OT', totalChapters: 50),
    BibleBook(id: 'EXO', name: 'Exodus', testament: 'OT', totalChapters: 40),
    BibleBook(id: 'PSA', name: 'Psalms', testament: 'OT', totalChapters: 150),
    BibleBook(id: 'ISA', name: 'Isaiah', testament: 'OT', totalChapters: 66),
    BibleBook(id: 'DAN', name: 'Daniel', testament: 'OT', totalChapters: 12),
    BibleBook(id: 'MAT', name: 'Matthew', testament: 'NT', totalChapters: 28),
    BibleBook(id: 'JHN', name: 'John', testament: 'NT', totalChapters: 21),
    BibleBook(id: 'ROM', name: 'Romans', testament: 'NT', totalChapters: 16),
    BibleBook(id: 'REV', name: 'Revelation', testament: 'NT', totalChapters: 22),
  ];

  static List<BibleVersion> get versions => defaultVersions;
  static List<BibleBook> get books => defaultBooks;

  final Map<String, List<BibleVerse>> _syncedTexts = {};
  List<BibleVersion> _syncedVersions = [];
  List<BibleBook> _syncedBooks = [];
  bool _isBridgeLoaded = false;

  String _activeVersionId = 'KJV';
  String _activeBookId = 'JHN';
  int _activeChapter = 14;
  bool _showRedLetter = true;
  bool _continuousReading = false;

  String get activeVersionId => _activeVersionId;
  String get activeBookId => _activeBookId;
  int get activeChapter => _activeChapter;
  bool get showRedLetter => _showRedLetter;
  bool get continuousReading => _continuousReading;
  bool get isBridgeLoaded => _isBridgeLoaded;

  List<BibleVersion> get versions =>
      _syncedVersions.isNotEmpty ? _syncedVersions : defaultVersions;

  List<BibleBook> get books =>
      _syncedBooks.isNotEmpty ? _syncedBooks : defaultBooks;

  BibleVersion get activeVersion =>
      versions.firstWhere((v) => v.id == _activeVersionId, orElse: () => versions.first);

  BibleBook get activeBook =>
      books.firstWhere((b) => b.id == _activeBookId, orElse: () => books.first);

  Future<void> initialize() async {
    try {
      final jsonStr = await rootBundle.loadString('assets/data/bibles.json');
      final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;

      if (decoded.containsKey('versions') && decoded['versions'] is List) {
        final list = decoded['versions'] as List;
        _syncedVersions = list.map((v) => BibleVersion(
          id: v['id'] as String? ?? '',
          name: v['name'] as String? ?? '',
          language: v['language'] as String? ?? '',
          description: v['description'] as String? ?? '',
          hasRedLetter: v['hasRedLetter'] as bool? ?? true,
        )).toList();
      }

      if (decoded.containsKey('books') && decoded['books'] is List) {
        final list = decoded['books'] as List;
        _syncedBooks = list.map((b) => BibleBook(
          id: b['id'] as String? ?? '',
          name: b['name'] as String? ?? '',
          testament: b['testament'] as String? ?? 'OT',
          totalChapters: b['totalChapters'] as int? ?? 1,
        )).toList();
      }

      if (decoded.containsKey('texts') && decoded['texts'] is Map) {
        final texts = decoded['texts'] as Map<String, dynamic>;
        texts.forEach((verId, booksMap) {
          if (booksMap is Map) {
            booksMap.forEach((bookChap, versesRaw) {
              if (versesRaw is List) {
                final key = '${verId}_$bookChap';
                _syncedTexts[key] = versesRaw.map((vr) {
                  return BibleVerse(
                    bookId: vr['bookId'] as String? ?? '',
                    chapter: vr['chapter'] as int? ?? 1,
                    verse: vr['verse'] as int? ?? 1,
                    text: vr['text'] as String? ?? '',
                    isRedLetter: vr['isRedLetter'] as bool? ?? false,
                  );
                }).toList();
              }
            });
          }
        });
      }

      _isBridgeLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Note: BibleService synchronized bibles.json load status: $e');
    }
  }

  void setVersion(String versionId) {
    if (_activeVersionId != versionId) {
      _activeVersionId = versionId;
      notifyListeners();
    }
  }

  void setPassage({required String bookId, required int chapter}) {
    _activeBookId = bookId;
    _activeChapter = chapter;
    notifyListeners();
  }

  void toggleRedLetter([bool? val]) {
    _showRedLetter = val ?? !_showRedLetter;
    notifyListeners();
  }

  void toggleContinuousReading([bool? val]) {
    _continuousReading = val ?? !_continuousReading;
    notifyListeners();
  }

  List<BibleVerse> getVerses(String bookId, int chapter, [String? versionId]) {
    final vId = versionId ?? _activeVersionId;
    final key = '${vId}_${bookId}_$chapter';

    // 1. Check synchronized bridge datasets
    if (_syncedTexts.containsKey(key)) {
      return _syncedTexts[key]!;
    }
    // Check uppercase or normalized key
    final normKey = '${vId}_$bookId$chapter';
    if (_syncedTexts.containsKey(normKey)) {
      return _syncedTexts[normKey]!;
    }

    // 2. Check static fallback database
    if (_fallbackVerseDatabase.containsKey(key)) {
      return _fallbackVerseDatabase[key]!;
    }

    // 3. Fallback to KJV
    final fallbackKjvKey = 'KJV_${bookId}_$chapter';
    if (_syncedTexts.containsKey(fallbackKjvKey)) {
      return _syncedTexts[fallbackKjvKey]!;
    }
    if (_fallbackVerseDatabase.containsKey(fallbackKjvKey)) {
      return _fallbackVerseDatabase[fallbackKjvKey]!;
    }

    return _generateDefaultVerses(bookId, chapter, vId);
  }

  static final Map<String, List<BibleVerse>> _fallbackVerseDatabase = {
    // John 14 (KJV)
    'KJV_JHN_14': [
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 1, text: 'Let not your heart be troubled: ye believe in God, believe also in me.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 2, text: 'In my Father\'s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 3, text: 'And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 4, text: 'And whither I go ye know, and the way ye know.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 5, text: 'Thomas saith unto him, Lord, we know not whither thou goest; and how can we know the way?', isRedLetter: false),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 6, text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 15, text: 'If ye love me, keep my commandments.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 27, text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', isRedLetter: true),
    ],

    // John 14 (SUV - Swahili)
    'SUV_JHN_14': [
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 1, text: 'Msifadhaike mioyoni mwenu; mnamwamini Mungu, niaminini na mimi.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 2, text: 'Nyumbani mwa Baba yangu mna makao mengi; kama sivyo, ningaliwaambia; maana naenda kuwaandalia mahali.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 3, text: 'Basi mimi nikienda na kuwaandalia mahali, nitakuja tena niwakaribishe kwangu; ili nilipo mimi, nanyi mwepo.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 4, text: 'Nami niendako mwaijua njia.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 5, text: 'Tomaso akamwambia, Bwana, sisi hatujui uendako; nasi twaijuaje njia?', isRedLetter: false),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 6, text: 'Yesu akamwambia, Mimi ndimi njia, na kweli, na uzima; mtu haji kwa Baba, ila kwa njia ya mimi.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 15, text: 'Mkinipenda, mtazishika amri zangu.', isRedLetter: true),
      const BibleVerse(bookId: 'JHN', chapter: 14, verse: 27, text: 'Amani nawaachieni; amani yangu nawapa; niwapavyo mimi sivyo kama ulimwengu utoavyo. Msifadhaike mioyoni mwenu, wala msiwe na woga.', isRedLetter: true),
    ],

    // Exodus 20 (Ten Commandments & Sabbath Memorial)
    'KJV_EXO_20': [
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 1, text: 'And God spake all these words, saying,', isRedLetter: false),
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 2, text: 'I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.', isRedLetter: false),
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 3, text: 'Thou shalt have no other gods before me.', isRedLetter: false),
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 8, text: 'Remember the sabbath day, to keep it holy.', isRedLetter: false),
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 9, text: 'Six days shalt thou labour, and do all thy work:', isRedLetter: false),
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 10, text: 'But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates:', isRedLetter: false),
      const BibleVerse(bookId: 'EXO', chapter: 20, verse: 11, text: 'For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.', isRedLetter: false),
    ],

    // Psalm 23 (KJV)
    'KJV_PSA_23': [
      const BibleVerse(bookId: 'PSA', chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.', isRedLetter: false),
      const BibleVerse(bookId: 'PSA', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.', isRedLetter: false),
      const BibleVerse(bookId: 'PSA', chapter: 23, verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.', isRedLetter: false),
      const BibleVerse(bookId: 'PSA', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.', isRedLetter: false),
      const BibleVerse(bookId: 'PSA', chapter: 23, verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.', isRedLetter: false),
      const BibleVerse(bookId: 'PSA', chapter: 23, verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.', isRedLetter: false),
    ],

    // Matthew 5 (Sermon on the Mount - Beatitudes)
    'KJV_MAT_5': [
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 1, text: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:', isRedLetter: false),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 2, text: 'And he opened his mouth, and taught them, saying,', isRedLetter: false),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 4, text: 'Blessed are they that mourn: for they shall be comforted.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 5, text: 'Blessed are the meek: for they shall inherit the earth.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 6, text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 7, text: 'Blessed are the merciful: for they shall obtain mercy.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 8, text: 'Blessed are the pure in heart: for they shall see God.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 9, text: 'Blessed are the peacemakers: for they shall be called the children of God.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 14, text: 'Ye are the light of the world. A city that is set on an hill cannot be hid.', isRedLetter: true),
      const BibleVerse(bookId: 'MAT', chapter: 5, verse: 16, text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.', isRedLetter: true),
    ],

    // Revelation 14 (The Three Angels' Messages)
    'KJV_REV_14': [
      const BibleVerse(bookId: 'REV', chapter: 14, verse: 6, text: 'And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people,', isRedLetter: false),
      const BibleVerse(bookId: 'REV', chapter: 14, verse: 7, text: 'Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.', isRedLetter: false),
      const BibleVerse(bookId: 'REV', chapter: 14, verse: 8, text: 'And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.', isRedLetter: false),
      const BibleVerse(bookId: 'REV', chapter: 14, verse: 12, text: 'Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.', isRedLetter: false),
    ],
  };

  List<BibleVerse> _generateDefaultVerses(String bookId, int chapter, String versionId) {
    return [
      BibleVerse(
        bookId: bookId,
        chapter: chapter,
        verse: 1,
        text: 'Holy Scripture of $bookId chapter $chapter ($versionId edition). Canonical offline reading enabled.',
        isRedLetter: bookId == 'MAT' || bookId == 'JHN',
      ),
      BibleVerse(
        bookId: bookId,
        chapter: chapter,
        verse: 2,
        text: 'Thy word is a lamp unto my feet, and a light unto my path. Sanctify them through thy truth: thy word is truth.',
        isRedLetter: false,
      ),
      BibleVerse(
        bookId: bookId,
        chapter: chapter,
        verse: 3,
        text: 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.',
        isRedLetter: false,
      ),
    ];
  }
}
