# 📱 Have On Behalf Mobile Companion — Google Play Store & Release Guide

This document details the exact steps to build, sign, and publish the **Have On Behalf Companion App** (`com.haveonbehalf.have_on_behalf_companion`) to the **Google Play Store**, **F-Droid**, and **GitHub Releases**.

---

## 📋 Release Checklist

- [x] Application ID confirmed: `com.haveonbehalf.have_on_behalf_companion`
- [x] Version Code and Name updated in `pubspec.yaml` (`version: 1.2.0+2`) and `android/app/build.gradle`
- [x] Android target SDK 36 (Android 15), minimum SDK 21 (Android 5.0 Lollipop)
- [x] All 13 hymnal collections and Holy Scriptures bundled for 100% offline usage
- [x] Permissions restricted to minimum required: `INTERNET` (for Beam Wi-Fi sync), `WAKE_LOCK` (keep screen on during worship)
- [x] Vector app icon and launcher resources properly configured
- [x] Unit and model parsing tests passing (`flutter test`)
- [ ] Production keystore generated and configured in `key.properties` (see below)
- [ ] Signed Android App Bundle (`.aab`) generated for Google Play Console

---

## 🔑 1. Keystore Generation & Signing Configuration

### Step 1: Generate Release Keystore
Run the following command on your terminal (store the generated file safely):

```bash
keytool -genkey -v -keystore mobile/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias haveonbehalf-key
```

### Step 2: Configure `key.properties`
Create `mobile/android/key.properties` (this file is ignored by `.gitignore` so secrets are never committed):

```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=haveonbehalf-key
storeFile=../upload-keystore.jks
```

### Step 3: Reference `key.properties` in `android/app/build.gradle`
When building for production:
```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🏗️ 2. Building Release Packages

### For Google Play Store (Android App Bundle - `.aab`)
Google Play requires `.aab` format:
```bash
cd mobile
flutter clean
flutter pub get
flutter build appbundle --release
```
The output file will be at:
`mobile/build/app/outputs/bundle/release/app-release.aab`

### For Direct APK Distribution & GitHub Releases
```bash
cd mobile
flutter build apk --release --split-per-abi
# Generates optimized APKs:
# - app-arm64-v8a-release.apk (most modern phones)
# - app-armeabi-v7a-release.apk (older 32-bit phones)
# - app-x86_64-release.apk (emulators & Chromebooks)

# Or a single Universal APK:
flutter build apk --release
# - app-release.apk
```

---

## 🏛️ 3. Google Play Store Listing Information

| Field | Production Value |
| :--- | :--- |
| **App Name** | Have On Behalf: Adventist Hymnal & Sanctuary Companion |
| **Short Description** | Offline SDAH, Nyimbo Za Kristo, Bibles with Red Letters & Sanctuary Beam Remote. |
| **Full Description** | Have On Behalf is an offline-first worship companion engineered specifically for Seventh-day Adventist divine service, vespers, song service choristers, and church projectionists.<br><br>Features include:<br>• 13 Canonical Collections: SDAH (1-695), Nyimbo Za Kristo, Nyĩmbo Cia Agendi, WNY, OKN, KIN, CIS, KMN, ICB, SHO, UKE, and Adventist Anthems.<br>• Holy Bibles with Red Letter Words of Jesus (KJV, Swahili Union Version SUV, Gĩkũyũ, WEB).<br>• Ellen G. White Classic Writings (Steps to Christ, Desire of Ages, Great Controversy).<br>• Sanctuary Beam Remote: Control church projection slides directly from the pulpit.<br>• Audio Pitch Pipe Synthesizer: 440Hz reference oscillator with liturgical transposer.<br>• Pinned Hymns: 1-tap quick access to Sabbath worship selections.<br>• Vespers & Divine Service Liturgy Planner with export.<br>• Liturgical Themes: Sanctuary Gold, Adventist Burgundy, Celestial Deep Blue, and Pure OLED Dark mode.<br><br>100% offline. Zero ads. Zero subscriptions. Built for God's glory. |
| **Category** | Books & Reference / Lifestyle |
| **Content Rating** | Everyone (PEGI 3 / USK 0) |
| **Privacy Policy** | No personal telemetry or user data is collected. All hymns, notes, and plans are stored locally on device. |
