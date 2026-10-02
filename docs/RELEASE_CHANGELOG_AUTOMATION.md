# 📜 Automated Changelog Generation & Release Notes Engine

This document details the automated changelog architecture implemented for the **Have On Behalf** ecosystem.

---

## 🎯 Purpose

Release managers, choristers, and beta testers require clear, verifiable documentation of what changed between builds without manual maintenance overhead. The automated changelog engine parses commit history, updates `CHANGELOG.md`, computes cryptographic SHA-256 digests, and formats release notes for continuous delivery.

---

## ⚡ Automated Lifecycle Hooks

Changelog generation is completely automated through npm lifecycle hooks and CI/CD triggers:

```bash
# 1. Manual trigger (anytime during development)
npm run changelog

# 2. Automated trigger on build (via prebuild lifecycle hook in package.json)
npm run build
# -> automatically triggers `npm run sync:data && npm run changelog:auto`

# 3. CI/CD automated trigger (GitHub Actions)
# Triggered on every git push to main/master or release tag
```

---

## 🛠️ Architecture & Scripts

### 1. `scripts/auto_changelog.ts` (`npm run changelog:auto`)
- **Primary Tasks**:
  1. Reads target version from `package.json` (e.g. `1.2.0`).
  2. Parses git commit history (`git log`) and extracts Conventional Commits types:
     - `feat:` -> Added
     - `fix:` -> Fixed
     - `docs:` -> Documentation
     - `perf:` / `theme:` -> Changed / Liturgical
     - `chore:` / `ci:` -> Tooling & CI/CD
  3. Formats entries with commit short hashes, scopes, authors, and dates.
  4. Generates/updates **`/CHANGELOG.md`** following the [Keep a Changelog](https://keepachangelog.com/) standard, preserving historical releases.
  5. Computes exact **SHA-256 hashes and file sizes** for any generated Android APKs (`HaveOnBehalf-Companion-*.apk`).
  6. Generates **`/assets/releases/TESTER_DISTRIBUTION_CHANGELOG.md`** tailored for beta testers.
  7. Updates `manifest.json` and `versions.json` in `assets/releases/` and `public/assets/releases/`.

---

## 🤖 GitHub Actions CI/CD Integration

In `.github/workflows/build_mobile.yml` and `.github/workflows/flutter-release.yml`:

```yaml
- name: Generate Automated Git Changelog & Tester Release Notes
  run: npm run changelog:auto

- name: Upload Release Artifacts to assets/releases
  uses: actions/upload-artifact@v4
  with:
    name: HaveOnBehalf-Mobile-Releases
    path: |
      assets/releases/*.apk
      assets/releases/TESTER_DISTRIBUTION_CHANGELOG.md
      assets/releases/manifest.json
      assets/releases/versions.json

- name: Commit Bundled Release Assets & Changelog
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
  run: |
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action [Release Builder]"
    git add assets/releases/ public/assets/releases/ CHANGELOG.md
    git diff --staged --quiet || git commit -m "chore(release): bundle mobile release binaries and update changelog [skip ci]"
    git push origin HEAD:${{ github.ref_name }} || true
```

---

## 🔒 Verification & Compliance
- **Keep a Changelog Standard**: Categorized under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- **Semantic Versioning 2.0.0**: Synchronized across `package.json`, `pubspec.yaml`, `build.gradle`, and `manifest.json`.
- **Direct Web Access**: Available in-app via the **Settings > Version History & Downloads Manager** view.
