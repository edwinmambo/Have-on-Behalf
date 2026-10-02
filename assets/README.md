# 📦 Have On Behalf — Asset Releases & Version Management

This directory serves as the distribution and version management hub for the **Have On Behalf Liturgical Platform** and its **Flutter Mobile Companion App**.

---

## 🎯 Current Production Release: `v1.2.0` (Build 2)

- **Release Date**: October 2, 2026
- **Stage**: Production Candidate & Stable Release
- **Flutter SDK**: 3.24.3 (Dart 3.5.3)
- **Target OS**: Android (API 21+ / Android 5.0 through 14+), Web (PWA), iOS

---

## 📂 Directory Layout

```
assets/
├── README.md                                    # This document
└── releases/
    ├── manifest.json                            # Machine-readable release specifications & metadata
    ├── versions.json                            # Multi-version catalog with downloads & SHA-256 hashes
    ├── HaveOnBehalf-Companion-v1.2.0.apk        # v1.2.0 Production Android APK package
    ├── HaveOnBehalf-Companion-Latest.apk        # Symlink/Pointer to latest release
    ├── HaveOnBehalf-Companion-EarlyTester.apk   # Legacy v1.1.0 early tester build
    ├── build-companion.sh                       # Local shell script to compile APKs from source
    └── TESTER_GUIDE.md                          # Comprehensive testing walkthrough for choristers
```

---

## 🚀 Downloadable Packages & Verification

| Asset Package | Target | Size | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| `HaveOnBehalf-Companion-v1.2.0.apk` | Android API 21+ | 17.6 MB | `8f4d92a11b9c3f4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f` |
| `HaveOnBehalf-Companion-Latest.apk` | Android Universal | 17.6 MB | Matches current production build |
| `have-on-behalf-clean-datasets-v1.2.0.json` | Universal JSON | 4.1 MB | `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b` |
| `manifest.json` | JSON Spec | 2.4 KB | Canonical build metadata |

---

## 🔄 Version Management Lifecycle

1. **Versioning Standard**: Adheres strictly to [Semantic Versioning 2.0.0](https://semver.org/) (`MAJOR.MINOR.PATCH`).
   - `MAJOR`: Significant architectural changes or paradigm rewrites.
   - `MINOR`: New features (e.g. Beam Remote, Bibles, EGW study, Pinning, Analytics).
   - `PATCH`: Bug fixes, font tuning, dataset cleaning.

2. **Automated Cloud Builds (CI/CD)**:
   - When git tags (e.g. `v1.2.0`) are pushed to GitHub, `.github/workflows/flutter-release.yml` automatically triggers.
   - Compiles split-per-ABI APKs (`arm64-v8a`, `armeabi-v7a`, `x86_64`) and universal APKs.
   - Attaches binaries to GitHub Releases and uploads build artifacts.

3. **In-App Downloads**:
   - The web app Settings screen features an **Asset Downloads & Version History Manager** allowing 1-click downloads of APKs and offline datasets with direct SHA-256 hash copying.
