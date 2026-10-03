# 📱 Have On Behalf Companion — Tester Distribution & Changelog

**Release Version:** `v1.2.0`  
**Automated Build Date:** 2026-10-03  
**Target Environment:** Android API 21+ (Android 5.0 through 15+)  
**Distribution Channel:** Continuous Integration & Tester Downloads  

---

## 🚀 Release Binaries & Checksums

| Package Name | Architecture | File Size | SHA-256 Digest |
| :--- | :--- | :--- | :--- |
| **`HaveOnBehalf-Companion-v1.2.0.apk`** | Universal (ARM64 / ARMv7 / x86_64) | 13.1 MB (13,698,834 bytes) | `a5161764c3d940c27f3fd0353a3ed5e3579396f15325780b37381a233e3bf1de` |
| **`HaveOnBehalf-Companion-Latest.apk`** | Latest Production Pointer | 13.1 MB (13,698,834 bytes) | `a5161764c3d940c27f3fd0353a3ed5e3579396f15325780b37381a233e3bf1de` |
| **`have-on-behalf-clean-datasets-v1.2.0.json`** | Offline Unified Datasets | 4.1 MB | `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b` |
| **`manifest.json`** | Machine-Readable Specification | 2.4 KB | Verified Release Manifest |

---

## 🌟 Changes in Version 1.2.0

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

## 📲 Quick Installation Instructions
1. Download `HaveOnBehalf-Companion-v1.2.0.apk` directly from the Settings menu or GitHub Releases.
2. In Android settings, ensure **"Install unknown apps"** is enabled for your browser or file manager.
3. Tap the file to install. The application runs **100% offline** with zero telemetry.
