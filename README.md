# Have On Behalf (H.O.B)

<p align="center">
  <img src="public/icon.svg" alt="Have On Behalf Logo" width="130" height="130" />
</p>

<p align="center">
  <strong>An offline-first worship suite, scripture study sanctuary, and projection platform with a native Flutter mobile companion for Seventh-day Adventist congregations and believers worldwide.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.2.0-blue.svg?style=for-the-badge" alt="Version 1.2.0" />
  <img src="https://img.shields.io/badge/Release-Production_Ready-emerald.svg?style=for-the-badge" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Flutter-3.24.3-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter 3.24.3" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License MIT" />
</p>

---

## 📜 Table of Contents
- [📖 Overview & Architecture](#-overview--architecture)
- [✨ Key Platform Features](#-key-platform-features)
  - [1. 🎵 Canonical Multi-Lingual Adventist Hymnology](#1--canonical-multi-lingual-adventist-hymnology)
  - [2. 📽️ Sanctuary Beam Projector & Broadcast Synchronization](#2-️-sanctuary-beam-projector--broadcast-synchronization)
  - [3. 📖 Holy Scriptures with Red-Letter Words of Christ](#3--holy-scriptures-with-red-letter-words-of-christ)
  - [4. 🕊️ Ellen G. White Spirit of Prophecy Library](#4-️-ellen-g-white-spirit-of-prophecy-library)
  - [5. 📊 Hymn Frequency & Usage Analytics (Recharts)](#5--hymn-frequency--usage-analytics-recharts)
  - [6. 📌 Pinned Hymns & Sabbath Quick Access](#6--pinned-hymns--sabbath-quick-access)
  - [7. 🛠️ Administrator & Chorister Feedback Center](#7-️-administrator--chorister-feedback-center)
- [📱 Flutter Mobile Companion App](#-flutter-mobile-companion-app)
- [📦 Asset Downloads & Version Management](#-asset-downloads--version-management)
- [📋 Changelog](#-changelog)
- [🚀 Quick Start & Development Guide](#-quick-start--development-guide)
- [📱 Android APK Build & Play Store Publishing](#-android-apk-build--play-store-publishing)
- [🤝 Contributing & License](#-contributing--license)

---

## 📖 Overview & Architecture

**Have On Behalf** is engineered specifically for Sabbath divine service leadership, vespers, song service choristers, church projectionists, and personal devotional study.

Unlike generic presentation tools that require costly recurring monthly subscriptions or online cloud connectivity that drops during church services, Have On Behalf is **100% offline-first**. All 13 hymnal collections, multi-version Holy Bibles, and Ellen G. White classic devotional books are permanently bundled and cached locally.

```
have-on-behalf/
├── assets/                    # Version management & binary distributions
│   ├── releases/              # Android APKs, version catalogs, release manifests
│   └── README.md              # Asset verification and checksum guide
├── docs/                      # Technical architecture & schema specifications
│   ├── DATA_SCHEMAS_AND_EXPORT.md
│   ├── MOBILE_FLUTTER_COMPANION.md
│   └── ROADMAP_AND_PHASES.md
├── mobile/                    # Native Flutter Companion App (Android/iOS)
│   ├── android/               # Android native project & manifest
│   ├── lib/
│   │   ├── models/            # Hymn, Bible, EGW, and Worship Plan data models
│   │   ├── screens/           # Hymnals, Bibles, EGW, Beam Remote, Plan, Settings
│   │   ├── services/          # Pitch Synth, Hymn Repository, Storage, Bible Service
│   │   └── theme/             # Sanctuary Gold, Burgundy, Deep Blue, OLED Dark
│   └── pubspec.yaml           # Flutter dependencies and version (1.2.0+2)
├── public/                    # Static web assets & offline datasets
│   └── data/                  # Clean canonical JSON datasets
├── src/                       # React 19 + TypeScript Sanctuary Web Application
│   ├── components/            # Beam Projector, Hymnal, Bible, EGW, Analytics, Settings
│   ├── data/                  # Static scripture, hymnal, and EGW datasets
│   ├── lib/                   # Beam sync (BroadcastChannel), audio synth, data cleaning
│   └── types/                 # Universal TypeScript interfaces
├── CHANGELOG.md               # Version history adhering to Keep a Changelog
└── package.json               # Web package manifest (v1.2.0)
```

---

## ✨ Key Platform Features

### 1. 🎵 Canonical Multi-Lingual Adventist Hymnology
- **13 Complete Collections**:
  - `SDAH`: Seventh-day Adventist Hymnal (English, 1–695 complete)
  - `NZK`: Nyimbo Za Kristo (Swahili, 1–220 complete)
  - `NCA`: Nyĩmbo Cia Agendi (Gĩkũyũ New, 1–334 complete)
  - `NCA_OLD`: Nyĩmbo Cia Agendi (Gĩkũyũ Old Edition)
  - `WNY`: Wende Nyasaye (Dholuo)
  - `OKN`: Olodoo Le Nkai (Maasai)
  - `KIN`: Ogotera Kw'Omonene (Ekegusii)
  - `CIS`: Nyimbo cia Ciugo cia Kuuma (Meru)
  - `KMN`: Nymburo sya Kumutaia Ngai (Kikamba)
  - `ICB`: Wendi Wa Kukaatha Ngai (Kiembu)
  - `SHO`: Shona / Tshiluba
  - `UKE`: Kalembe / Teso
  - `SDAH_EXT`: Supplemental Adventist Anthems
- **Interlinear Concordance**: One-tap switching between languages (e.g. SDAH #159 ↔ NZK #46 ↔ NCA #52) preserving stanza position.
- **Audio Pitch Pipe Synthesizer**: 440Hz clean sine wave oscillator with semitone transposer (-5 to +6) and liturgical key signatures.
- **Text Purification Pipeline**: Automatic HTML entity decoding, UTF-8 mojibake repair, and clean stanza line-break formatting.

### 2. 📽️ Sanctuary Beam Projector & Broadcast Synchronization
- **Second-Screen Pop-Out**: Live dual-screen projection using `BroadcastChannel` with seamless fallback to `localStorage`.
- **AdventistHymns-Style Continuous Flow**: Vertical layout with elegant gradient fade masks at top and bottom margins.
- **Scrollbar Suppression**: Complete suppression of scrollbars across WebKit, Blink, and Gecko engines.
- **Live Theme & Font Synchronization**: Sanctuary Gold, Adventist Burgundy, Celestial Deep Blue, and Obsidian OLED Dark mode sync in real time with high-legibility typography (Lora, Playfair, Cinzel, Inter, Plus Jakarta Sans).
- **Sanctuary Keyboard Shortcuts**: Arrow keys (`Next`/`Prev`), `Space`, `B` (Blackout screen), `F` (Fullscreen).

### 3. 📖 Holy Scriptures with Red-Letter Words of Christ
- **Multi-Version Scripture Engine**: King James Version (KJV Authorized), World English Bible (WEB), Swahili Union Version (SUV - Habari Njema / Biblia Takatifu), and Gĩkũyũ (Kĩrĩkanĩro Gĩtheru).
- **Words of Christ in Red**: Canonical words of Jesus highlighted in liturgical red with an instant on/off toggle.
- **Direct Verse Beaming**: Select verses and project them instantly to the sanctuary screen.

### 4. 🕊️ Ellen G. White Spirit of Prophecy Library
- Built-in reader for classic Adventist foundational literature:
  - *Steps to Christ* (13 Chapters)
  - *The Desire of Ages* (The Life and Ministry of Jesus Christ)
  - *The Great Controversy* (The Cosmic Conflict)
  - *The Ministry of Healing* (Wholistic Health & Medical Missionary Work)
  - *Patriarchs and Prophets*
- Chapter navigation, paragraph citation references, and direct projection support.

### 5. 📊 Hymn Frequency & Usage Analytics (Recharts)
- Interactive visual analytics tracking hymn usage, popular Sabbath anthems, and seasonal liturgical themes.
- Rendered with Recharts: Bar charts of top-sung hymns, area trend charts, and category pie distributions.

### 6. 📌 Pinned Hymns & Sabbath Quick Access
- Pin Sabbath service selections directly to a sticky Quick Access bar at the top of the Hymnal and Settings views.
- No typing required during live song services.

### 7. 🛠️ Administrator & Chorister Feedback Center
- Built-in bug report and translation feedback submission system.
- Administrative console for authorized choristers (`edwinmambo33@gmail.com`) to filter, inspect, resolve, and export feedback as JSON.

---

## 📱 Flutter Mobile Companion App

The Flutter companion app (`mobile/`) brings 100% feature parity to Android phones, tablets, and foldables:

- **Offline Databases**: Bundled JSON datasets for all 13 collections, Bibles, and EGW writings.
- **Sanctuary Beam Remote**: Control church sanctuary projection directly from your phone while standing at the podium.
- **Pitch Pipe Synthesizer**: Native audio synthesis for starting pitches.
- **Worship Liturgy Planner**: Create, reorder, and export service agendas.
- **Liturgical Themes**: Tailored dark mode, pure OLED black, and custom font scaling.

---

## 📦 Asset Downloads & Version Management

All binary releases, manifests, and checksums are cataloged in the `assets/releases/` folder and accessible directly within the web app's **Settings > Downloads & Version Manager**:

| Asset Package | Target Platform | Size | Description |
| :--- | :--- | :--- | :--- |
| `HaveOnBehalf-Companion-v1.2.0.apk` | Android API 21+ | 17.6 MB | Current production Android APK |
| `HaveOnBehalf-Companion-Latest.apk` | Android Universal | 17.6 MB | Pointer to latest stable release |
| `have-on-behalf-clean-datasets-v1.2.0.json` | Universal JSON | 4.1 MB | Clean offline hymnal datasets |
| `manifest.json` | JSON Spec | 2.4 KB | Official release specification |
| `versions.json` | JSON Catalog | 3.1 KB | Multi-version history & checksums |

---

## 📋 Changelog

Please refer to [CHANGELOG.md](CHANGELOG.md) for full details on each release, following the Keep a Changelog standard.

---

## 🚀 Quick Start & Development Guide

### Prerequisites
- Node.js 20+ (for Web App)
- Flutter SDK 3.24+ & Dart 3.5+ (for Mobile Companion)

### Web Application Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-username/have-on-behalf.git
cd have-on-behalf

# 2. Install dependencies
npm install

# 3. Launch development server (Runs on port 3000)
npm run dev

# 4. Verify TypeScript and production build
npm run lint
npm run build
```

### Flutter Mobile App Setup
```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Fetch Flutter packages
flutter pub get

# 3. Run unit and widget tests
flutter test

# 4. Launch on connected Android device or emulator
flutter run
```

---

## 📱 Android APK Build & Play Store Publishing

### Automated Cloud Builds (GitHub Actions)
Pushing a git tag (e.g. `git tag v1.2.0 && git push --tags`) triggers `.github/workflows/flutter-release.yml`, which compiles release APKs and automatically publishes them to GitHub Releases.

### Manual Local APK Build
```bash
cd mobile
flutter build apk --release --split-per-abi
# Output APKs will be located at:
# mobile/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
```

### Google Play Console App Bundle (.aab)
```bash
cd mobile
flutter build appbundle --release
# Output App Bundle:
# mobile/build/app/outputs/bundle/release/app-release.aab
```

*See [mobile/RELEASE_AND_PUBLISHING.md](mobile/RELEASE_AND_PUBLISHING.md) for signing key generation (`key.properties`), ProGuard rules, and Play Store store listing assets.*

---

## 🤝 Contributing & License

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ROADMAP_AND_PHASES.md](docs/ROADMAP_AND_PHASES.md).

Distributed under the **MIT License**. See `LICENSE` for more information.
