# 📱 Have On Behalf (H.O.B) Companion App — Early Stage Tester Guide

Welcome to the early-stage tester release of the **Have On Behalf Liturgical Companion App** (built with Flutter & Dart).

---

## 🎯 What is in this Release?

1. **Complete Hymnal Collections (Offline)**
   - **SDAH**: Seventh-day Adventist Hymnal (English, 695 hymns)
   - **NZK**: Nyimbo Za Kristo (Swahili, 220+ hymns)
   - **NCA**: Nyĩmbo Cia Agendi (Gĩkũyũ, 334 hymns)
   - **NCA Old**: Nyĩmbo Cia Agendi Old Edition
   - **Regional Collections**: WNY (Wende Nyasaye - Dholuo), OKN (Olodoo Le Nkai - Maasai), KIN (Ogotera Kw'Omonene - Ekegusii), CIS (Nyimbo cia Ciugo cia Kuuma - Meru), KMN (Nymburo sya Kumutaia Ngai - Kikamba), ICB (Wendi Wa Kukaatha Ngai - Kiembu), SHO (Tshiluba/Shona), UKE (Kalembe/Teso)
   - **SDAH Ext**: Supplemental Adventist Anthems

2. **Cross-Reference Engine**
   - Instant translation hopping between English, Swahili, and Gĩkũyũ stanzas
   - Direct matching between Old and New Kikuyu editions

3. **Pitch Pipe Synthesizer**
   - Clean liturgical sine-wave oscillator
   - Transposition support (from -5 to +6 semitones)
   - Liturgical key signature visualizer (number of flats/sharps)

4. **Worship Service & Liturgy Planner**
   - Drag-and-drop worship items (Divine Service, Vespers, Song Service)
   - Markdown & plain text service agenda exporter

5. **Liturgical Theming**
   - Sanctuary Gold (Amber & Slate)
   - Adventist Burgundy (Warm Royal Crimson)
   - Celestial Deep Blue (Indigo & Gold)
   - Pure OLED Black Mode & High Legibility Serif/Sans toggles

---

## 🚀 How to Share with Testers on GitHub

When you commit and push this repository to GitHub:

1. **Automatic GitHub Actions Build**:
   - The included workflow `.github/workflows/flutter-release.yml` automatically triggers on every push to `main`/`master` and tag (e.g. `git tag v1.0.0-beta && git push --tags`).
   - GitHub's cloud runners will build the APK (`app-release.apk`) and make it downloadable under the **Actions** tab as an artifact, or publish it directly under **Releases**!

2. **Direct Tester Installation (Android)**:
   - Testers download `app-release.apk` to their Android phone.
   - Tap the APK file and select "Install" (enable "Install unknown apps" if prompted).
   - The app opens with zero configuration and full offline data ready!

3. **Local Development & Testing**:
   To test or run the companion app locally on your machine or emulator:
   ```bash
   cd mobile
   flutter pub get
   flutter test
   flutter run
   ```

---

## 🧪 Testing Checklist for Early Testers

- [ ] Search for hymns by number (e.g. `159`, `46`, `52`)
- [ ] Test cross-language button (switch from SDAH #159 to NZK #46 and NCA #52)
- [ ] Test the pitch pipe by selecting a key (e.g. `Bb` or `F`) and tapping "Play Pitch"
- [ ] Create a worship service plan in the Liturgy tab and export it to clipboard
- [ ] Toggle Dark Mode and test the Pure OLED Black mode in Settings
