import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

console.log('📜 [Changelog Automation] Generating CHANGELOG.md from git commit history...');

interface CommitEntry {
  hash: string;
  author: string;
  date: string;
  subject: string;
  category: 'Features' | 'Fixes' | 'Documentation' | 'Liturgical' | 'Tooling';
}

function getGitCommits(): CommitEntry[] {
  try {
    const rawOutput = execSync('git log -n 50 --pretty=format:"%h|%an|%ad|%s" --date=short', {
      cwd: rootDir,
      encoding: 'utf-8',
    }).trim();

    if (!rawOutput) return [];

    return rawOutput.split('\n').map((line) => {
      const [hash, author, date, subject] = line.split('|');
      const cleanSub = subject || '';
      let category: CommitEntry['category'] = 'Tooling';

      const lower = cleanSub.toLowerCase();
      if (lower.startsWith('feat') || lower.includes('hymn') || lower.includes('bible') || lower.includes('beam')) {
        category = 'Features';
      } else if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('repair')) {
        category = 'Fixes';
      } else if (lower.startsWith('docs') || lower.includes('readme') || lower.includes('changelog')) {
        category = 'Documentation';
      } else if (lower.includes('theme') || lower.includes('pitch') || lower.includes('liturgy')) {
        category = 'Liturgical';
      }

      return {
        hash: hash || 'head',
        author: author || 'Contributor',
        date: date || new Date().toISOString().split('T')[0],
        subject: cleanSub,
        category,
      };
    });
  } catch (err) {
    console.log('⚠️ [Changelog Automation] Git log unavailable (shallow clone or environment constraint). Using milestone fallback.');
    return [];
  }
}

const commits = getGitCommits();
const currentDate = new Date().toISOString().split('T')[0];
const version = '1.2.0';

let dynamicSection = `## [${version}] - ${currentDate}\n\n`;

if (commits.length > 0) {
  const grouped: Record<string, CommitEntry[]> = {
    Features: [],
    Liturgical: [],
    Fixes: [],
    Documentation: [],
    Tooling: [],
  };

  commits.forEach((c) => {
    grouped[c.category].push(c);
  });

  if (grouped.Features.length > 0) {
    dynamicSection += '### 🚀 Features & New Capabilities\n';
    grouped.Features.forEach((c) => {
      dynamicSection += `- \`${c.hash}\`: ${c.subject} (${c.author}, ${c.date})\n`;
    });
    dynamicSection += '\n';
  }

  if (grouped.Liturgical.length > 0) {
    dynamicSection += '### 🎵 Liturgical & Sanctuary Enhancements\n';
    grouped.Liturgical.forEach((c) => {
      dynamicSection += `- \`${c.hash}\`: ${c.subject} (${c.author})\n`;
    });
    dynamicSection += '\n';
  }

  if (grouped.Fixes.length > 0) {
    dynamicSection += '### 🐛 Bug Fixes & Improvements\n';
    grouped.Fixes.forEach((c) => {
      dynamicSection += `- \`${c.hash}\`: ${c.subject} (${c.author})\n`;
    });
    dynamicSection += '\n';
  }

  if (grouped.Documentation.length > 0) {
    dynamicSection += '### 📚 Documentation & Tester Guides\n';
    grouped.Documentation.forEach((c) => {
      dynamicSection += `- \`${c.hash}\`: ${c.subject} (${c.author})\n`;
    });
    dynamicSection += '\n';
  }
} else {
  // Canonical milestone entry when git log is empty
  dynamicSection += `### Added
- **Automated Mobile Build & Distribution CI/CD (\`.github/workflows/build_mobile.yml\`)**:
  - Automatically compiles Flutter companion APKs on every push.
  - Bundles binaries into \`/assets/releases/\` with cryptographic SHA-256 validation.
- **Shared Data Bridge & Parity Provider (\`SharedDataProvider.dart\` & \`sync_data_bridge.ts\`)**:
  - Unifies dataset definitions between Web PWA and Flutter Mobile Companion.
  - Consumes exact canonical JSON representations for 13 hymnals, Holy Bibles (Red-Letter), and E.G. White writings.
- **Web PWA Navigation Parity on Mobile (\`MainNavigationShell.dart\`)**:
  - Synchronized tab-based layout: Hymnals, Bibles, and E.G. White.
  - Full-screen distraction-free **Reading Mode** with floating controls.
  - Responsive **Sanctuary Beam Remote** with live projection state and blackout.
`;
}

// Preserve historical changelog
let existingContent = '';
if (fs.existsSync(changelogPath)) {
  existingContent = fs.readFileSync(changelogPath, 'utf-8');
}

const header = `# 📜 Changelog

All notable changes to the **Have On Behalf** liturgical worship platform and its **Flutter Mobile Companion** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

`;

// Keep sections after the first version or combine
let finalChangelog = '';
if (existingContent.includes('## [1.1.0]')) {
  const parts = existingContent.split('## [1.1.0]');
  finalChangelog = header + dynamicSection + '\n---\n\n## [1.1.0]' + parts[1];
} else {
  finalChangelog = header + dynamicSection;
}

fs.writeFileSync(changelogPath, finalChangelog, 'utf-8');
console.log('✅ [Changelog Automation] CHANGELOG.md generated successfully!');
