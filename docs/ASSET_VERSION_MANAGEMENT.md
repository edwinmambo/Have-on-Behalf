# 📦 Have On Behalf — Asset & Version Management Architecture

This document outlines the versioning conventions, asset directory layout, and binary download management for the **Have On Behalf** ecosystem.

---

## 🏷️ Versioning Standard

Have On Behalf uses [Semantic Versioning 2.0.0](https://semver.org/):

$$\text{MAJOR}.\text{MINOR}.\text{PATCH}+\text{BUILD}$$

- **MAJOR**: Radical redesigns or breaking changes.
- **MINOR**: Major features (e.g. Beam Projector Sync, Red-Letter Bibles, EGW Library, Flutter Mobile Parity).
- **PATCH**: Bug fixes, typography adjustments, dataset cleanups.
- **BUILD**: Incremental CI/CD compilation sequence.

### Synchronized Version Manifests
When a version bump occurs, the version string is updated in:
1. `package.json`: `"version": "1.2.0"`
2. `mobile/pubspec.yaml`: `version: 1.2.0+2`
3. `mobile/android/app/build.gradle`: `versionCode 2`, `versionName "1.2.0"`
4. `assets/releases/manifest.json`: `"version": "1.2.0"`, `"buildNumber": 2`
5. `assets/releases/versions.json`: latest version entry
6. `CHANGELOG.md`: dedicated release section

---

## 📂 Asset Distribution Structure

The `assets/releases/` folder contains version manifests and binary packages:

```text
assets/releases/
├── manifest.json                            # Active build specification & metadata
├── versions.json                            # Multi-version catalog with SHA-256 hashes
├── HaveOnBehalf-Companion-v1.2.0.apk        # Version 1.2.0 Android production APK
├── HaveOnBehalf-Companion-Latest.apk        # Pointer to latest stable release
├── HaveOnBehalf-Companion-EarlyTester.apk   # Legacy v1.1.0 early tester APK
├── build-companion.sh                       # Local build helper script
└── TESTER_GUIDE.md                          # Walkthrough for chorister testing
```

These assets are mirrored in `public/assets/releases/` so that the web client can serve direct HTTP downloads without server-side redirects.

---

## 🔒 Cryptographic Verification (SHA-256)

Every release asset has a precomputed SHA-256 digest listed in `assets/releases/versions.json` and `manifest.json`.

Testers and administrators can verify binary integrity using:

```bash
sha256sum assets/releases/HaveOnBehalf-Companion-v1.2.0.apk
# Expected: 8f4d92a11b9c3f4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f
```

The web application's **Settings > Asset Downloads & Version Manager** allows 1-click clipboard copying of SHA-256 hashes for instant verification.
