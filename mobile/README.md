# Have On Behalf — Flutter Mobile Companion (Phase 2)

Offline-first personal liturgical companion app for Seventh-day Adventist worshipers, choristers, and song leaders. Built with Flutter, supporting Android and iOS with 100% offline access to canonical hymnals:
- **SDAH**: Seventh-day Adventist Hymnal (English, 695 hymns)
- **NZK**: Nyimbo Za Kristo (Kiswahili, 220 hymns)
- **NCA**: Nyĩmbo Cia Agendi (Gĩkũyũ, 299 hymns)
- **SDAH-EXT**: Extended Historical Adventist Hymns

---

## 🎯 Key Design & Architecture Directives

1. **Dedicated Full-Bleed Hymn View (No Modal Bottom Sheets)**:
   - Hymns open on a dedicated `HymnDetailScreen` via standard navigation back-stack.
   - Eliminates accidental modal dismissals while holding the phone and singing.
   - Includes tactile `← Back` arrow, Hymn Badge, and title.

2. **Inline Interlinear Parallel Verses**:
   - Tap **"Parallel"** in the hymn toolbar to show translated companion verses (e.g. Swahili or Gĩkũyũ) directly underneath each stanza.
   - Automatic cross-reference matching based on canonical cross-reference tables.

3. **5 Liturgical Theme Palettes**:
   - Sanctuary Sapphire (Default regal navy & gold)
   - Sacred Emerald (Forest green)
   - Royal Amethyst (Deep majesty purple)
   - Cathedral Bronze (Altar brass warmth)
   - Words of Christ (Atonement deep rose)
   - Full Light & Dark mode support with WCAG AA contrast.

4. **Zero-Latency Offline Assets**:
   - All datasets are pre-packaged in `assets/data/` (`sdah.json`, `nzk.json`, `nca.json`, `sdah_ext.json`).
   - Zero network dependencies — works in airplane mode and basement sanctuaries.

5. **Acoustic Pitch Pipe Synthesizer**:
   - Pitch tone sounder with natural piano/sine attack and decay.
   - Semitone transposition selector (-3 to +3 semitones).

---

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (3.10.0 or higher)
- Android Studio / Xcode / VS Code with Flutter extension

### Installation & Run

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Fetch Flutter packages:
   ```bash
   flutter pub get
   ```

3. Run on connected Android or iOS device / simulator:
   ```bash
   flutter run
   ```

4. Run unit tests:
   ```bash
   flutter test
   ```

---

## 📁 Directory Structure

```
mobile/
├── assets/
│   └── data/
│       ├── sdah.json        # 695 English hymns
│       ├── nzk.json         # 220 Swahili hymns
│       ├── nca.json         # 299 Gĩkũyũ hymns
│       └── sdah_ext.json    # Extended collection
├── lib/
│   ├── main.dart            # MultiProvider & MaterialApp setup
│   ├── models/
│   │   └── hymn.dart        # Hymn, HymnStanza, CrossReference models
│   ├── services/
│   │   ├── hymn_repository.dart       # Offline asset loader & indexer
│   │   ├── pitch_synthesizer_service.dart # Pitch tone sounder & transposition
│   │   └── user_storage_service.dart  # Favorites & personal notes storage
│   ├── theme/
│   │   └── liturgical_themes.dart     # 5 Liturgical themes (Light/Dark)
│   ├── widgets/
│   │   ├── interlinear_stanza_card.dart # Antiphonal & parallel stanza card
│   │   └── quick_keypad_dialog.dart     # 1-9 Numeric jump dialer
│   └── screens/
│       ├── hymn_list_screen.dart        # Catalog browser with instant search
│       ├── hymn_detail_screen.dart      # Dedicated hymn reader
│       └── favorites_notes_screen.dart  # Saved hymns & reflections
└── test/
    └── model_parsing_test.dart          # Deserialization test suite
```
