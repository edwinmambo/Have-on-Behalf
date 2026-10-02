# 📱 Have On Behalf — Flutter Mobile Companion Documentation

This document describes the architecture, codebase organization, state management, offline database storage, and publishing procedures for the **Have On Behalf Flutter Companion App** (`com.haveonbehalf.have_on_behalf_companion`).

---

## 🏛️ Architecture Overview

The mobile application is built using **Flutter 3.24+** (Dart 3.5+) following a reactive, offline-first Provider pattern:

```text
mobile/lib/
├── main.dart                          # App entry point, MultiProvider registration, Theme builder
├── models/
│   ├── hymn.dart                      # Hymn metadata, Stanzas, and Chorus structure
│   ├── hymn_concordance.dart          # Multi-language cross-references (SDAH ↔ NZK ↔ NCA)
│   ├── bible_model.dart               # Bible books, chapters, verses with Red-Letter flags
│   └── worship_plan.dart              # Liturgical agendas, items, and vespers sessions
├── services/
│   ├── hymn_repository.dart           # In-memory index & JSON dataset loader for 13 collections
│   ├── bible_service.dart             # Scripture verse repository with red-letter formatting
│   ├── pitch_synthesizer_service.dart # Sine oscillator audio engine & transposition calculator
│   └── user_storage_service.dart      # SharedPreferences persistence (Favorites, Pinned, History, Plans, Profiles, Beam remote)
├── screens/
│   ├── main_navigation_shell.dart     # 5-tab persistent bottom navigation bar & drawer
│   ├── hymn_list_screen.dart          # Hymnal catalog, collection switcher, pinned chips, search
│   ├── hymn_detail_screen.dart        # Hymn lyrics reader, pitch player, interlinear view, pin toggle, beam projection
│   ├── bible_reader_screen.dart       # Scripture reader, Red Letter toggle, verse projection, chapter picker
│   ├── egw_reader_screen.dart         # Spirit of Prophecy classic works, chapters, citations
│   ├── beam_remote_screen.dart        # Sanctuary projector remote controller with blackout & quick beam
│   ├── plan_screen.dart               # Drag-and-drop worship service agenda builder
│   ├── favorites_notes_screen.dart    # Bookmarked hymns, pinned Sabbath selections, and visit history
│   ├── feedback_screen.dart           # Tester bug reporting form and administrator review console
│   └── account_settings_screen.dart   # Profile editor, liturgical theme switcher, font scaler, backups
├── theme/
│   └── liturgical_themes.dart         # Sanctuary Sapphire, Gold, Burgundy, OLED Dark themes
└── widgets/
    ├── interlinear_stanza_card.dart   # Multi-language parallel translation card
    └── quick_keypad_dialog.dart       # Numerical dialing keypad for instant hymn jumping
```

---

## 📱 Feature Parity with Web Application

| Feature | Web App (React 19) | Mobile Companion (Flutter) |
| :--- | :--- | :--- |
| **13 Hymnal Collections** | Full offline JSON catalog | Full offline bundled assets (`assets/data/*.json`) |
| **Audio Pitch Pipe** | Web Audio API Oscillator | Native sine oscillator with semitone transpose |
| **Cross-Language Concordance** | Direct language tabs | Interlinear cards & 1-tap translation switch |
| **Sanctuary Beam Projection** | `BroadcastChannel` Dual-Screen | Handheld remote controller with slide stepping & blackout |
| **Holy Bibles with Red Letters** | Multi-version KJV, SUV, GIK | Multi-version reader with red-letter words of Jesus |
| **E.G. White Devotional Library** | Steps to Christ, Desire of Ages, GC | Steps to Christ, Desire of Ages, GC reader |
| **Pinned Hymns Quick-Access** | Sticky Sabbath toolbar | Top horizontal scroll chip bar & AppBar pin toggle |
| **Worship Service Liturgy** | Vespers & Divine Service planner | Drag-and-drop liturgy deck with clipboard export |
| **Chorister Feedback Center** | Admin feedback console | Report submission form & local admin review console |
| **Liturgical Theming** | Tailwind CSS dark & OLED mode | Material 3 dynamic color scheme with OLED pure black |

---

## 🚀 Building & Publishing

### Test Suite Execution
```bash
cd mobile
flutter test
```

### Compiling APKs for Distribution
```bash
cd mobile
flutter build apk --release --split-per-abi
# Artifacts placed in mobile/build/app/outputs/flutter-apk/
```

### Google Play Console App Bundle (.aab)
```bash
cd mobile
flutter build appbundle --release
# Artifact: mobile/build/app/outputs/bundle/release/app-release.aab
```

*See [mobile/RELEASE_AND_PUBLISHING.md](../mobile/RELEASE_AND_PUBLISHING.md) for full keystore setup and Play Console listing instructions.*
