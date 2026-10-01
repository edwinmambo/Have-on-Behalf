import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/hymn.dart';
import '../models/worship_plan.dart';
import '../theme/liturgical_themes.dart';

class UserStorageService extends ChangeNotifier {
  static const String _keyFavorites = 'hob_favorites';
  static const String _keyNotes = 'hob_notes';
  static const String _keyPalette = 'hob_theme_palette';
  static const String _keyDarkMode = 'hob_dark_mode';
  static const String _keyPureOled = 'hob_pure_oled';
  static const String _keyUseSerif = 'hob_use_serif';
  static const String _keyFontScale = 'hob_font_scale';
  static const String _keyUserName = 'hob_user_name';
  static const String _keyUserRole = 'hob_user_role';
  static const String _keyChurchName = 'hob_church_name';
  static const String _keyUserEmail = 'hob_user_email';
  static const String _keyPlans = 'hob_worship_plans';
  static const String _keyActivePlanId = 'hob_active_plan_id';

  final Set<String> _favorites = {};
  final Map<String, String> _notes = {};
  LiturgicalPalette _activePalette = LiturgicalPalette.sapphire;
  bool _isDarkMode = true; // Default to modern sleek dark mode
  bool _pureOledBlack = false;
  bool _useSerif = false; // Default to modern sans-serif
  double _fontScale = 1.0;

  String _userName = 'Edwin Mambo';
  String _userRole = 'Chorister & Worship Leader';
  String _churchName = 'Nairobi Central SDA Church';
  String _userEmail = 'edwinmambo33@gmail.com';

  final List<WorshipPlan> _plans = [];
  String _activePlanId = 'plan_divine_service';
  bool _isLoaded = false;

  bool get isLoaded => _isLoaded;
  Set<String> get favorites => _favorites;
  LiturgicalPalette get activePalette => _activePalette;
  bool get isDarkMode => _isDarkMode;
  bool get pureOledBlack => _pureOledBlack;
  bool get useSerif => _useSerif;
  double get fontScale => _fontScale;

  String get userName => _userName;
  String get userRole => _userRole;
  String get churchName => _churchName;
  String get userEmail => _userEmail;

  List<WorshipPlan> get plans => List.unmodifiable(_plans);
  String get activePlanId => _activePlanId;

  WorshipPlan? get activePlan {
    if (_plans.isEmpty) return null;
    return _plans.firstWhere(
      (p) => p.id == _activePlanId,
      orElse: () => _plans.first,
    );
  }

  bool isFavorited(String hymnId) => _favorites.contains(hymnId);
  String? getNote(String hymnId) => _notes[hymnId];

  Future<void> initialize() async {
    if (_isLoaded) return;
    try {
      final prefs = await SharedPreferences.getInstance();

      // Favorites
      final favList = prefs.getStringList(_keyFavorites) ?? [];
      _favorites.addAll(favList);

      // Notes
      final notesJson = prefs.getString(_keyNotes);
      if (notesJson != null) {
        final decoded = jsonDecode(notesJson) as Map<String, dynamic>;
        decoded.forEach((key, value) {
          _notes[key] = value.toString();
        });
      }

      // Themes
      final paletteStr = prefs.getString(_keyPalette) ?? 'sapphire';
      _activePalette = LiturgicalPalette.values.firstWhere(
        (p) => p.id == paletteStr,
        orElse: () => LiturgicalPalette.sapphire,
      );

      _isDarkMode = prefs.getBool(_keyDarkMode) ?? true;
      _pureOledBlack = prefs.getBool(_keyPureOled) ?? false;
      _useSerif = prefs.getBool(_keyUseSerif) ?? false;
      _fontScale = prefs.getDouble(_keyFontScale) ?? 1.0;

      // Profile
      _userName = prefs.getString(_keyUserName) ?? 'Edwin Mambo';
      _userRole = prefs.getString(_keyUserRole) ?? 'Chorister & Worship Leader';
      _churchName = prefs.getString(_keyChurchName) ?? 'Nairobi Central SDA Church';
      _userEmail = prefs.getString(_keyUserEmail) ?? 'edwinmambo33@gmail.com';

      // Plans
      final plansJson = prefs.getString(_keyPlans);
      if (plansJson != null) {
        final decodedList = jsonDecode(plansJson) as List<dynamic>;
        _plans.clear();
        for (final item in decodedList) {
          _plans.add(WorshipPlan.fromJson(item as Map<String, dynamic>));
        }
      }

      _activePlanId = prefs.getString(_keyActivePlanId) ?? 'plan_divine_service';

      if (_plans.isEmpty) {
        _seedDefaultPlans();
      }

      _isLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading preferences: $e');
      if (_plans.isEmpty) _seedDefaultPlans();
      _isLoaded = true;
      notifyListeners();
    }
  }

  void _seedDefaultPlans() {
    _plans.add(
      WorshipPlan(
        id: 'plan_divine_service',
        title: 'Sabbath Divine Service',
        subtitle: 'Order of Liturgy & Song Service',
        date: 'This Sabbath',
        serviceType: 'Divine Service',
        items: [
          WorshipPlanItem(
            id: 'item_1',
            title: 'Song Service',
            category: 'hymn',
            hymnId: 'sdah_1',
            hymnNumber: 1,
            hymnCollection: 'SDAH',
            hymnTitle: 'Praise to the Lord',
            assignedTo: 'Edwin Mambo',
            notes: 'Stanzas 1, 2, 4',
          ),
          WorshipPlanItem(
            id: 'item_2',
            title: 'Opening Hymn',
            category: 'hymn',
            hymnId: 'sdah_100',
            hymnNumber: 100,
            hymnCollection: 'SDAH',
            hymnTitle: 'Great Is Thy Faithfulness',
            assignedTo: 'Congregation & Choir',
            notes: 'Stand for singing',
          ),
          WorshipPlanItem(
            id: 'item_3',
            title: 'Pastoral & Intercessory Prayer',
            category: 'prayer',
            assignedTo: 'Elder on Duty',
            notes: 'Kneel together in reverence',
          ),
          WorshipPlanItem(
            id: 'item_4',
            title: 'Scripture Reading',
            category: 'scripture',
            assignedTo: 'Youth Reader',
            notes: 'Revelation 14:6-12',
          ),
          WorshipPlanItem(
            id: 'item_5',
            title: 'Tithes & Offering (Worship in Giving)',
            category: 'general',
            hymnId: 'sdah_340',
            hymnNumber: 340,
            hymnCollection: 'SDAH',
            hymnTitle: 'Jesus Saves',
            assignedTo: 'Deaconry',
            notes: 'Offertory meditation',
          ),
          WorshipPlanItem(
            id: 'item_6',
            title: 'Special Item / Choir Anthem',
            category: 'general',
            assignedTo: 'Sanctuary Choir',
            notes: 'Acapella rendition',
          ),
          WorshipPlanItem(
            id: 'item_7',
            title: 'Sermon / Word of God',
            category: 'sermon',
            assignedTo: 'Guest Speaker',
            notes: 'Theme: The Everlasting Gospel',
          ),
          WorshipPlanItem(
            id: 'item_8',
            title: 'Closing Hymn',
            category: 'hymn',
            hymnId: 'sdah_537',
            hymnNumber: 537,
            hymnCollection: 'SDAH',
            hymnTitle: 'He Leadeth Me',
            assignedTo: 'Edwin Mambo',
            notes: 'Dedication stanza 3 with hands folded',
          ),
          WorshipPlanItem(
            id: 'item_9',
            title: 'Benediction & Silent Prayer',
            category: 'prayer',
            assignedTo: 'Preacher',
            notes: 'Choral Amen',
          ),
        ],
      ),
    );

    _plans.add(
      WorshipPlan(
        id: 'plan_vespers',
        title: 'Friday Evening Vespers',
        subtitle: 'Welcoming the Sabbath Hours',
        date: 'Friday Sunset',
        serviceType: 'Vespers',
        items: [
          WorshipPlanItem(
            id: 'v_item_1',
            title: 'Welcome & Sunset Reflection',
            category: 'general',
            assignedTo: 'Edwin Mambo',
          ),
          WorshipPlanItem(
            id: 'v_item_2',
            title: 'Sunset Hymn',
            category: 'hymn',
            hymnId: 'sdah_388',
            hymnNumber: 388,
            hymnCollection: 'SDAH',
            hymnTitle: "Don't Forget the Sabbath",
            notes: 'All verses',
          ),
          WorshipPlanItem(
            id: 'v_item_3',
            title: 'Testimonies & Thanksgiving',
            category: 'prayer',
            assignedTo: 'Family & Fellowship',
          ),
        ],
      ),
    );
  }

  // --- Theme & Typography Settings ---

  Future<void> toggleDarkMode([bool? explicitValue]) async {
    _isDarkMode = explicitValue ?? !_isDarkMode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyDarkMode, _isDarkMode);
  }

  Future<void> setPureOledBlack(bool val) async {
    _pureOledBlack = val;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyPureOled, _pureOledBlack);
  }

  Future<void> setUseSerif(bool val) async {
    _useSerif = val;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyUseSerif, _useSerif);
  }

  Future<void> setFontScale(double scale) async {
    _fontScale = scale;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_keyFontScale, _fontScale);
  }

  Future<void> setPalette(LiturgicalPalette palette) async {
    _activePalette = palette;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyPalette, palette.id);
  }

  // --- Profile Management ---

  Future<void> updateUserProfile({
    required String name,
    required String role,
    required String church,
    required String email,
  }) async {
    _userName = name.trim();
    _userRole = role.trim();
    _churchName = church.trim();
    _userEmail = email.trim();
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserName, _userName);
    await prefs.setString(_keyUserRole, _userRole);
    await prefs.setString(_keyChurchName, _churchName);
    await prefs.setString(_keyUserEmail, _userEmail);
  }

  // --- Favorites & Notes ---

  Future<void> toggleFavorite(String hymnId) async {
    if (_favorites.contains(hymnId)) {
      _favorites.remove(hymnId);
    } else {
      _favorites.add(hymnId);
    }
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_keyFavorites, _favorites.toList());
  }

  Future<void> saveNote(String hymnId, String note) async {
    if (note.trim().isEmpty) {
      _notes.remove(hymnId);
    } else {
      _notes[hymnId] = note.trim();
    }
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyNotes, jsonEncode(_notes));
  }

  // --- Plan Management (Worship Planner) ---

  void setActivePlan(String planId) {
    _activePlanId = planId;
    notifyListeners();
    SharedPreferences.getInstance().then((p) => p.setString(_keyActivePlanId, planId));
  }

  Future<void> _savePlans() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _keyPlans,
      jsonEncode(_plans.map((p) => p.toJson()).toList()),
    );
  }

  Future<void> togglePlanItemComplete(String planId, String itemId) async {
    final plan = _plans.firstWhere((p) => p.id == planId);
    final item = plan.items.firstWhere((i) => i.id == itemId);
    item.isCompleted = !item.isCompleted;
    notifyListeners();
    await _savePlans();
  }

  Future<void> reorderPlanItems(String planId, int oldIndex, int newIndex) async {
    final plan = _plans.firstWhere((p) => p.id == planId);
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    final item = plan.items.removeAt(oldIndex);
    plan.items.insert(newIndex, item);
    notifyListeners();
    await _savePlans();
  }

  Future<void> addPlanItem(String planId, WorshipPlanItem item) async {
    final plan = _plans.firstWhere((p) => p.id == planId);
    plan.items.add(item);
    notifyListeners();
    await _savePlans();
  }

  Future<void> addHymnToActivePlan(Hymn hymn, {String? itemRole}) async {
    final plan = activePlan;
    if (plan == null) return;

    final newItem = WorshipPlanItem(
      id: 'hymn_${DateTime.now().millisecondsSinceEpoch}',
      title: itemRole ?? 'Congregational Hymn',
      category: 'hymn',
      hymnId: hymn.id,
      hymnNumber: hymn.number,
      hymnCollection: hymn.collection,
      hymnTitle: hymn.title,
      assignedTo: _userName,
      notes: 'Key of ${hymn.key ?? "C"} · ${hymn.stanzas.length} stanzas',
    );
    plan.items.add(newItem);
    notifyListeners();
    await _savePlans();
  }

  Future<void> deletePlanItem(String planId, String itemId) async {
    final plan = _plans.firstWhere((p) => p.id == planId);
    plan.items.removeWhere((i) => i.id == itemId);
    notifyListeners();
    await _savePlans();
  }

  Future<void> createNewPlan({
    required String title,
    required String serviceType,
    required String date,
  }) async {
    final newPlan = WorshipPlan(
      id: 'plan_${DateTime.now().millisecondsSinceEpoch}',
      title: title.trim(),
      subtitle: '$serviceType Liturgy',
      date: date.trim(),
      serviceType: serviceType,
      items: [
        WorshipPlanItem(
          id: 'item_start_${DateTime.now().millisecondsSinceEpoch}',
          title: 'Opening & Welcome',
          category: 'general',
          assignedTo: _userName,
        ),
      ],
    );
    _plans.insert(0, newPlan);
    _activePlanId = newPlan.id;
    notifyListeners();
    await _savePlans();
  }
}
