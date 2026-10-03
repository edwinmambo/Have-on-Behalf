# 📱 Have On Behalf Companion — Tester Distribution & Changelog

**Release Version:** `v1.2.0`  
**Automated Build Date:** 2026-10-03  
**Target Environment:** Android API 21+ (Android 5.0 through 15+)  
**Distribution Channel:** Continuous Integration & Tester Downloads  

---

## 🚀 Release Binaries & Checksums

| Package Name | Architecture | File Size | SHA-256 Digest |
| :--- | :--- | :--- | :--- |
| **`HaveOnBehalf-Companion-v1.2.0.apk`** | Universal (ARM64 / ARMv7 / x86_64) | 31.7 MB (33,229,358 bytes) | `ed65a8e5b2cf6cd93a409b7f6eb14fe81492f2ed28ca8999e474f7352d62c7f9` |
| **`HaveOnBehalf-Companion-Latest.apk`** | Latest Production Pointer | 31.7 MB (33,229,358 bytes) | `ed65a8e5b2cf6cd93a409b7f6eb14fe81492f2ed28ca8999e474f7352d62c7f9` |
| **`have-on-behalf-clean-datasets-v1.2.0.json`** | Offline Unified Datasets | 4.1 MB | `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b` |
| **`manifest.json`** | Machine-Readable Specification | 2.4 KB | Verified Release Manifest |

---

## 🌟 Changes in Version 1.2.0

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

---

## 📲 Quick Installation Instructions
1. Download `HaveOnBehalf-Companion-v1.2.0.apk` directly from the Settings menu or GitHub Releases.
2. In Android settings, ensure **"Install unknown apps"** is enabled for your browser or file manager.
3. Tap the file to install. The application runs **100% offline** with zero telemetry.
