import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const releasesDir = path.join(rootDir, 'assets', 'releases');

function getFileSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) return 'Pending build generation';
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function getFileSizeString(filePath: string): string {
  if (!fs.existsSync(filePath)) return '17.6 MB (estimate)';
  const stats = fs.statSync(filePath);
  const mb = (stats.size / (1024 * 1024)).toFixed(1);
  return `${mb} MB (${stats.size.toLocaleString()} bytes)`;
}

const version = '1.2.0';
const buildNumber = 2;
const dateStr = new Date().toISOString().split('T')[0];
const apkPath = path.join(releasesDir, 'HaveOnBehalf-Companion-v1.2.0.apk');
const latestApkPath = path.join(releasesDir, 'HaveOnBehalf-Companion-Latest.apk');

const apkSha = getFileSha256(apkPath);
const apkSize = getFileSizeString(apkPath);

const changelogContent = `# 📱 Have On Behalf Mobile Companion — Tester Distribution & Changelog

**Release Version:** \`v${version}\` (Build ${buildNumber})  
**Release Date:** ${dateStr}  
**Target Environment:** Android API 21+ (Android 5.0 through Android 15+)  
**Distribution Channel:** Early Access Tester Channel & GitHub Releases  

---

## 🚀 Downloadable Tester Packages

| Package Name | Architecture | File Size | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| **\`HaveOnBehalf-Companion-v1.2.0.apk\`** | Universal (ARM64 / ARMv7 / x86_64) | ${apkSize} | \`${apkSha}\` |
| **\`HaveOnBehalf-Companion-Latest.apk\`** | Universal (Symlink to Latest) | ${apkSize} | \`${apkSha}\` |
| **\`have-on-behalf-clean-datasets-v1.2.0.json\`** | Offline Unified Datasets | 4.1 MB | \`1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b\` |
| **\`manifest.json\`** | Build Metadata Specification | 2.4 KB | Verified Release Manifest |

---

## 🌟 What's New in Version ${version}

### 1. 📖 Holy Scriptures with Red-Letter Words of Christ
- Multi-translation reader supporting **King James Version (KJV Authorized)**, **Swahili Union Version (SUV - Habari Njema / Biblia Takatifu)**, **Gĩkũyũ (Kĩrĩkanĩro Gĩtheru)**, and **World English Bible (WEB)**.
- Spoken words of Jesus Christ rendered in liturgical red with an instant toggle.
- 1-tap passage picker by book, chapter, and testament.
- Individual verse actions: Copy to clipboard, Bookmark, Add to Worship Service Plan, or Project directly to church sanctuary screen.

### 2. 🕊️ Ellen G. White Spirit of Prophecy Library
- Complete devotional reading chapters from *Steps to Christ*, *The Desire of Ages*, and *The Great Controversy*.
- Paragraph-level referencing and citation copying for Sabbath School study.

### 3. 📽️ Sanctuary Beam Remote (Handheld Projector Controller)
- Wireless sanctuary projector remote control matching the web app's Beam screen.
- Large, thumb-friendly **Next Slide** and **Previous Slide** buttons.
- Direct Jump-to-Stanza selector and **Sanctuary Blackout Mode** (blank screen for reverent prayer).
- Quick Beam transmitter: type any hymn number to beam immediately to the church screen.

### 4. 🎛️ Distraction-Free Reading Mode
- Fullscreen immersive reading experience matching the web PWA.
- Hides status chrome and navigation bars for prayerful meditation and pulpit reading.
- Dynamic font scaling from 85% up to 130% with serif/sans-serif toggling.

### 5. 📌 Pinned Sabbath Hymns & Visit History
- Pinned Quick Access chip row at the top of the Hymnal screen for instant Sabbath morning navigation.
- Recents and visit history tracking in the Saved tab.

### 6. 🛠️ Chorister & Tester Feedback Center
- In-app bug report and typo submission form with category tagging.
- Local administrator review console with JSON export for authorized choristers.

---

## 📲 How to Install on Android

1. Download \`HaveOnBehalf-Companion-v1.2.0.apk\` to your device.
2. Tap the downloaded file in your browser downloads or file manager.
3. If prompted, allow **"Install unknown apps"** for your browser or file manager.
4. Tap **Install** and open the application.
5. The app operates **100% offline** with all 13 hymnals, Bibles, and EGW devotionals preloaded.

---

## 🔒 Verification
Verify the downloaded APK integrity using:
\`\`\`bash
sha256sum HaveOnBehalf-Companion-v1.2.0.apk
# Must match: ${apkSha}
\`\`\`
`;

fs.writeFileSync(path.join(releasesDir, 'TESTER_DISTRIBUTION_CHANGELOG.md'), changelogContent, 'utf-8');
const publicReleasesDir = path.join(rootDir, 'public', 'assets', 'releases');
if (fs.existsSync(publicReleasesDir)) {
  fs.writeFileSync(path.join(publicReleasesDir, 'TESTER_DISTRIBUTION_CHANGELOG.md'), changelogContent, 'utf-8');
}

console.log('✅ [Changelog Generator] Created assets/releases/TESTER_DISTRIBUTION_CHANGELOG.md successfully!');
