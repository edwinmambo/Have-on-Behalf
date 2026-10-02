import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import '../models/bible_model.dart';
import '../models/hymn.dart';
import 'egw_service.dart';

/// SharedDataProvider bridges the exact same JSON dataset definitions used by
/// the Web PWA into the Flutter mobile application, guaranteeing 100% data
/// and feature parity across platforms.
class SharedDataProvider extends ChangeNotifier {
  bool _isLoading = true;
  bool _isLoaded = false;
  String _syncVersion = '1.2.0';
  String _syncTimestamp = '';

  // 1. Hymnal Datasets
  final Map<HymnalCollection, List<Hymn>> _hymnsByCollection = {};
  final Map<String, Hymn> _hymnsById = {};
  int _totalHymnCount = 0;

  // 2. Scripture Datasets (Shared with PWA biblesData.ts)
  List<BibleVersion> _bibleVersions = [];
  List<BibleBook> _bibleBooks = [];
  final Map<String, List<BibleVerse>> _scriptureTexts = {};

  // 3. Spirit of Prophecy Datasets (Shared with PWA egwData.ts)
  List<EgwBookItem> _egwBooks = [];
  final List<EgwParagraphItem> _egwParagraphs = [];

  bool get isLoading => _isLoading;
  bool get isLoaded => _isLoaded;
  String get syncVersion => _syncVersion;
  String get syncTimestamp => _syncTimestamp;
  int get totalHymnCount => _totalHymnCount;

  List<BibleVersion> get bibleVersions => List.unmodifiable(_bibleVersions);
  List<BibleBook> get bibleBooks => List.unmodifiable(_bibleBooks);
  List<EgwBookItem> get egwBooks => List.unmodifiable(_egwBooks);

  Future<void> initialize() async {
    if (_isLoaded) return;
    _isLoading = true;
    notifyListeners();

    try {
      // Step A: Load Sync Manifest
      await _loadSyncManifest();

      // Step B: Load all Canonical Hymnal Collections
      await _loadAllHymnalCollections();

      // Step C: Load Holy Scriptures JSON
      await _loadScriptureDataset();

      // Step D: Load E.G. White Devotional Library JSON
      await _loadEgwDataset();

      _isLoading = false;
      _isLoaded = true;
      notifyListeners();
      debugPrint('✅ [SharedDataProvider] Fully initialized with $_totalHymnCount hymns, ${_bibleVersions.length} Bible versions, and ${_egwBooks.length} EGW books.');
    } catch (e) {
      debugPrint('⚠️ [SharedDataProvider] Error during asset loading: $e');
      _isLoading = false;
      _isLoaded = true; // Still allow app execution with fallbacks
      notifyListeners();
    }
  }

  // --- Step A: Sync Manifest ---
  Future<void> _loadSyncManifest() async {
    try {
      final manifestStr = await rootBundle.loadString('assets/data/sync_manifest.json');
      final decoded = jsonDecode(manifestStr) as Map<String, dynamic>;
      _syncVersion = decoded['version'] as String? ?? '1.2.0';
      _syncTimestamp = decoded['timestamp'] as String? ?? '';
    } catch (_) {
      _syncTimestamp = DateTime.now().toIso8601String();
    }
  }

  // --- Step B: Hymnal Collections ---
  static const Map<HymnalCollection, String> _collectionAssetPaths = {
    HymnalCollection.sdah: 'assets/data/sdah.json',
    HymnalCollection.nzk: 'assets/data/nzk.json',
    HymnalCollection.nca: 'assets/data/nca.json',
    HymnalCollection.ncaOld: 'assets/data/nca_old.json',
    HymnalCollection.wny: 'assets/data/wny.json',
    HymnalCollection.okn: 'assets/data/okn.json',
    HymnalCollection.kin: 'assets/data/kin.json',
    HymnalCollection.cis: 'assets/data/cis.json',
    HymnalCollection.kmn: 'assets/data/kmn.json',
    HymnalCollection.icb: 'assets/data/icb.json',
    HymnalCollection.sho: 'assets/data/sho.json',
    HymnalCollection.uke: 'assets/data/uke.json',
    HymnalCollection.sdahExt: 'assets/data/sdah_ext.json',
  };

  Future<void> _loadAllHymnalCollections() async {
    int total = 0;
    for (final entry in _collectionAssetPaths.entries) {
      final collection = entry.key;
      final path = entry.value;

      try {
        final jsonStr = await rootBundle.loadString(path);
        final dynamic decoded = jsonDecode(jsonStr);
        final List<dynamic> list = decoded is List
            ? decoded
            : (decoded is Map && decoded.containsKey('hymns') ? decoded['hymns'] as List : []);

        final hymns = list.map((item) {
          final hymn = Hymn.fromJson(Map<String, dynamic>.from(item as Map));
          _hymnsById[hymn.id] = hymn;
          return hymn;
        }).toList();

        _hymnsByCollection[collection] = hymns;
        total += hymns.length;
      } catch (e) {
        debugPrint('Note: Hymnal dataset $path could not be parsed: $e');
        _hymnsByCollection[collection] = [];
      }
    }
    _totalHymnCount = total;
  }

  // --- Step C: Holy Scriptures (Bibles) ---
  Future<void> _loadScriptureDataset() async {
    try {
      final jsonStr = await rootBundle.loadString('assets/data/bibles.json');
      final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;

      if (decoded.containsKey('versions') && decoded['versions'] is List) {
        final vList = decoded['versions'] as List;
        _bibleVersions = vList.map((v) => BibleVersion(
          id: v['id'] as String? ?? '',
          name: v['name'] as String? ?? '',
          language: v['language'] as String? ?? '',
          description: v['description'] as String? ?? '',
          hasRedLetter: v['hasRedLetter'] as bool? ?? true,
        )).toList();
      }

      if (decoded.containsKey('books') && decoded['books'] is List) {
        final bList = decoded['books'] as List;
        _bibleBooks = bList.map((b) => BibleBook(
          id: b['id'] as String? ?? '',
          name: b['name'] as String? ?? '',
          testament: b['testament'] as String? ?? 'OT',
          totalChapters: b['totalChapters'] as int? ?? 1,
        )).toList();
      }

      if (decoded.containsKey('texts') && decoded['texts'] is Map) {
        final textsMap = decoded['texts'] as Map<String, dynamic>;
        textsMap.forEach((verId, bookMap) {
          if (bookMap is Map) {
            bookMap.forEach((chapKey, versesRaw) {
              if (versesRaw is List) {
                final fullKey = '${verId}_$chapKey';
                _scriptureTexts[fullKey] = versesRaw.map((v) {
                  return BibleVerse(
                    bookId: v['bookId'] as String? ?? '',
                    chapter: v['chapter'] as int? ?? 1,
                    verse: v['verse'] as int? ?? 1,
                    text: v['text'] as String? ?? '',
                    isRedLetter: v['isRedLetter'] as bool? ?? false,
                  );
                }).toList();
              }
            });
          }
        });
      }
    } catch (e) {
      debugPrint('Note: Scripture dataset bibles.json error: $e');
    }
  }

  // --- Step D: E.G. White Writings ---
  Future<void> _loadEgwDataset() async {
    try {
      final jsonStr = await rootBundle.loadString('assets/data/egw.json');
      final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;

      if (decoded.containsKey('books') && decoded['books'] is List) {
        final bList = decoded['books'] as List;
        _egwBooks = bList.map((b) => EgwBookItem.fromJson(Map<String, dynamic>.from(b as Map))).toList();
      }

      if (decoded.containsKey('paragraphs') && decoded['paragraphs'] is List) {
        final pList = decoded['paragraphs'] as List;
        _egwParagraphs.clear();
        for (final item in pList) {
          _egwParagraphs.add(EgwParagraphItem.fromJson(Map<String, dynamic>.from(item as Map)));
        }
      }
    } catch (e) {
      debugPrint('Note: EGW dataset egw.json error: $e');
    }
  }

  // --- Public Retrieval APIs ---

  List<Hymn> getHymns(HymnalCollection collection) {
    return _hymnsByCollection[collection] ?? [];
  }

  Hymn? getHymnById(String id) {
    return _hymnsById[id];
  }

  Hymn? getHymnByNumber(HymnalCollection collection, int number) {
    final list = _hymnsByCollection[collection] ?? [];
    return list.firstWhere((h) => h.number == number, orElse: () => list.first);
  }

  List<BibleVerse> getScriptureVerses(String bookId, int chapter, String versionId) {
    final key = '${versionId}_${bookId}_$chapter';
    if (_scriptureTexts.containsKey(key)) {
      return _scriptureTexts[key]!;
    }
    final normKey = '${versionId}_$bookId$chapter';
    if (_scriptureTexts.containsKey(normKey)) {
      return _scriptureTexts[normKey]!;
    }
    // Fallback to KJV
    final fallbackKey = 'KJV_${bookId}_$chapter';
    if (_scriptureTexts.containsKey(fallbackKey)) {
      return _scriptureTexts[fallbackKey]!;
    }
    return [];
  }

  List<EgwParagraphItem> getEgwParagraphs(String bookCode, int chapterNumber) {
    return _egwParagraphs.where(
      (p) => p.bookCode == bookCode && p.chapterNumber == chapterNumber,
    ).toList();
  }
}
