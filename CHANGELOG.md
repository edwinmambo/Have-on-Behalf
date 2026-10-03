# 📜 Changelog

All notable changes to the **Have On Behalf** liturgical worship platform and its **Flutter Mobile Companion** are automatically documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-03

### Added
- `7ab3358` **release**: version v1.2.0, mobile web parity, shared data bridge, and CI/CD automation *(Edwin Mambo)*
- `5e9a90f` implement Beam projector synchronization *(Edwin Mambo)*
- `d0a4cf3` add customizable accent themes *(Edwin Mambo)*
- `b6e879d` initialize project structure and base app *(Edwin Mambo)*

### Changed
- **Automated CI/CD Workflows**: Added `.github/workflows/build_mobile.yml` to automatically build APKs and bundle binaries into `/assets/releases/`.
- **Standardized Version Manifests**: Synchronized `package.json`, `pubspec.yaml`, `build.gradle`, and `manifest.json` to v1.2.0.

### Fixed
- **Screen Overflow Fixes**: Resolved layout and font scaling behavior across mobile viewports (320dp to foldables).
- **Dataset Typography Sanitization**: Cleaned HTML entities, mojibake characters, and stanza line breaks in Swahili and Gĩkũyũ editions.

### Tooling & CI/CD
- `a9ac658` improve Android build stability and icons *(Edwin Mambo)*
- `5c2add2` **android**: configure release signing and gradle *(Edwin Mambo)*
- `71dbca4` improve mobile build stability and release process *(Edwin Mambo)*
- `286c0b4` Initial commit *(Edwin Mambo)*

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
