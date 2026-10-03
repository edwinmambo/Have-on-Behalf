import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import '../models/hymn.dart';

class HymnRepository extends ChangeNotifier {
  final Map<HymnalCollection, List<Hymn>> _hymnsByCollection = {
    HymnalCollection.sdah: [],
    HymnalCollection.sdahExt: [],
    HymnalCollection.nzk: [],
    HymnalCollection.nca: [],
    HymnalCollection.ncaOld: [],
  };

  final Map<String, Hymn> _hymnsById = {};
  bool _isInitialized = false;
  bool _isLoading = false;
  String? _errorMessage;

  bool get isInitialized => _isInitialized;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get totalCount => _hymnsById.length;
  List<Hymn> get allHymns => _hymnsById.values.toList();

  List<Hymn> getHymns(HymnalCollection collection) => _hymnsByCollection[collection] ?? [];

  Hymn? getHymnById(String id) => _hymnsById[id];

  Hymn? getHymnByNumber(HymnalCollection collection, int number) {
    final list = _hymnsByCollection[collection] ?? [];
    try {
      return list.firstWhere((h) => h.number == number);
    } catch (_) {
      return null;
    }
  }

  /// Finds companion translation for a given hymn in a target collection (explicit verified matches only)
  Hymn? findCrossReference(Hymn sourceHymn, HymnalCollection targetCollection) {
    final targetCode = targetCollection.code;
    for (final cr in sourceHymn.crossReferences) {
      if (cr.collection.toUpperCase() == targetCode.toUpperCase()) {
        final match = getHymnByNumber(targetCollection, cr.number);
        if (match != null) return match;
      }
    }

    // Direct Old / New Kikuyu edition reciprocal linkage
    if (sourceHymn.collectionEnum == HymnalCollection.nca &&
        targetCollection == HymnalCollection.ncaOld &&
        sourceHymn.oldBookNumber != null) {
      return getHymnByNumber(HymnalCollection.ncaOld, sourceHymn.oldBookNumber!);
    }
    if (sourceHymn.collectionEnum == HymnalCollection.ncaOld &&
        targetCollection == HymnalCollection.nca &&
        sourceHymn.newBookNumber != null) {
      return getHymnByNumber(HymnalCollection.nca, sourceHymn.newBookNumber!);
    }

    // No automatic 1-1 number fallback.
    return null;
  }

  /// Get distinct categories for a collection
  List<String> getCategories(HymnalCollection collection) {
    final hymns = _hymnsByCollection[collection] ?? [];
    final cats = <String>{'All'};
    for (final h in hymns) {
      if (h.category != null && h.category!.trim().isNotEmpty) {
        cats.add(h.category!.trim());
      }
    }
    final sorted = cats.toList();
    sorted.sort((a, b) {
      if (a == 'All') return -1;
      if (b == 'All') return 1;
      return a.compareTo(b);
    });
    return sorted;
  }

  /// Search hymns across numbers, titles, and lyric lines
  List<Hymn> searchHymns({
    required HymnalCollection collection,
    required String query,
    String? category,
  }) {
    var hymns = _hymnsByCollection[collection] ?? [];

    if (category != null && category != 'All') {
      hymns = hymns.where((h) => h.category?.toLowerCase() == category.toLowerCase()).toList();
    }

    final trimmed = query.trim().toLowerCase();
    if (trimmed.isEmpty) return hymns;

    // Check if query is a numeric jump
    final numeric = int.tryParse(trimmed);
    if (numeric != null) {
      return hymns.where((h) => h.number.toString().startsWith(trimmed)).toList();
    }

    return hymns.where((h) {
      if (h.title.toLowerCase().contains(trimmed)) return true;
      if (h.author?.toLowerCase().contains(trimmed) == true) return true;
      if (h.tune?.toLowerCase().contains(trimmed) == true) return true;
      if (h.scriptureReference?.toLowerCase().contains(trimmed) == true) return true;

      // Search inside stanza lines
      for (final s in h.stanzas) {
        for (final l in s.lines) {
          if (l.toLowerCase().contains(trimmed)) return true;
        }
      }
      return false;
    }).toList();
  }

  /// Initialize and load all pre-bundled assets
  Future<void> initialize() async {
    if (_isInitialized || _isLoading) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Future.wait([
        _loadCollection(HymnalCollection.sdah, 'assets/data/sdah.json'),
        _loadCollection(HymnalCollection.nzk, 'assets/data/nzk.json'),
        _loadCollection(HymnalCollection.nca, 'assets/data/nca.json'),
        _loadCollection(HymnalCollection.ncaOld, 'assets/data/nca_old.json'),
        _loadCollection(HymnalCollection.sdahExt, 'assets/data/sdah_ext.json'),
        _loadCollection(HymnalCollection.wny, 'assets/data/wny.json'),
        _loadCollection(HymnalCollection.okn, 'assets/data/okn.json'),
        _loadCollection(HymnalCollection.kin, 'assets/data/kin.json'),
        _loadCollection(HymnalCollection.cis, 'assets/data/cis.json'),
        _loadCollection(HymnalCollection.kmn, 'assets/data/kmn.json'),
        _loadCollection(HymnalCollection.icb, 'assets/data/icb.json'),
        _loadCollection(HymnalCollection.sho, 'assets/data/sho.json'),
        _loadCollection(HymnalCollection.uke, 'assets/data/uke.json'),
      ]);

      _isInitialized = true;
      _isLoading = false;
      notifyListeners();
    } catch (e, stack) {
      debugPrint('Error loading hymns: $e\n$stack');
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadCollection(HymnalCollection collection, String assetPath) async {
    try {
      final jsonString = await rootBundle.loadString(assetPath);
      final List<dynamic> decoded = jsonDecode(jsonString);
      final List<Hymn> hymns = [];

      for (final item in decoded) {
        if (item is Map<String, dynamic>) {
          final hymn = Hymn.fromJson(item);
          hymns.add(hymn);
          _hymnsById[hymn.id] = hymn;
        }
      }

      hymns.sort((a, b) => a.number.compareTo(b.number));
      _hymnsByCollection[collection] = hymns;
    } catch (e) {
      debugPrint('Warning: Could not load $assetPath ($e)');
    }
  }
}
