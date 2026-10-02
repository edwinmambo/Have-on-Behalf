# 📜 Changelog

All notable changes to the **Have On Behalf** liturgical worship platform and its **Flutter Mobile Companion** are automatically documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-02

### Added
- **Sanctuary Beam Projector Synchronization**: Pop-out second screen broadcast engine using modern `BroadcastChannel` with continuous flow layout and scrollbar suppression.
- **Holy Bible Reader with Red Letter Words of Christ**: Multi-translation reader supporting KJV Authorized, SUV Swahili, Gĩkũyũ, and WEB with verse projection.
- **Ellen G. White Spirit of Prophecy Library**: Integrated study center with Steps to Christ, Desire of Ages, Great Controversy, and Ministry of Healing.
- **Flutter Mobile Companion App Parity**: SharedDataProvider ingesting exact PWA JSON datasets for hymns, Bibles, EGW study, and handheld Beam remote.
- **Distraction-Free Reading Mode**: Immersive reading experience with dynamic typography scaling and floating toolbar.
- **Hymn Frequency Analytics (Recharts)**: Interactive bar and area charts tracking hymn usage.
- **Pinned Sabbath Selections**: 1-tap quick access bar for Sabbath song services.

### Changed
- **Automated CI/CD Workflows**: Added `.github/workflows/build_mobile.yml` to automatically build APKs and bundle binaries into `/assets/releases/`.
- **Standardized Version Manifests**: Synchronized `package.json`, `pubspec.yaml`, `build.gradle`, and `manifest.json` to v1.2.0.

### Fixed
- **Screen Overflow Fixes**: Resolved layout and font scaling behavior across mobile viewports (320dp to foldables).
- **Dataset Typography Sanitization**: Cleaned HTML entities, mojibake characters, and stanza line breaks in Swahili and Gĩkũyũ editions.

---

## [1.1.0] - 2026-09-20

### Added
- **Audio Pitch Pipe Synthesizer**:
  - Clean liturgical 440Hz reference oscillator.
  - Transposition support from -5 to +6 semitones with key signature calculator.
- **Worship Service & Vespers Liturgy Planner**:
  - Drag-and-drop worship service ordering (Prelude, Song Service, Scripture, Sermon, Benediction).
  - Export service agenda to Markdown and clipboard.
- **Pan-African Dialect Collections**:
  - Expanded catalog to 13 collections including WNY (Dholuo), OKN (Maasai), KIN (Ekegusii), CIS (Meru), KMN (Kikamba), ICB (Kiembu), SHO (Shona), and UKE (Teso).
- **Interlinear Cross-Reference Concordance**:
  - Automatic language hopping between English (SDAH), Swahili (NZK), and Kikuyu (NCA Old/New).

---

## [1.0.0] - 2026-09-01

### Added
- Initial release of the Have On Behalf Liturgical Platform.
- Complete offline databases for Seventh-day Adventist Hymnal (SDAH, 695 hymns), Nyimbo Za Kristo (NZK, 220 hymns), and Nyĩmbo Cia Agendi (NCA, 334 hymns).
- Responsive PWA with offline Service Worker caching.
- Liturgical palettes: Sanctuary Gold, Adventist Burgundy, Celestial Deep Blue, and Pure OLED Dark mode.
- Chord notation cleaning and interlinear stanza display.
