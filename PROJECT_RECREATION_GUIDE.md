# Have On Behalf — Full Application Recreation Guide & Architecture

This guide provides a comprehensive blueprint to recreate the **Have On Behalf** Worship, Scripture, Hymnal, and Sanctuary Projection PWA locally from scratch.

---

## 1. Tech Stack Overview

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, TypeScript | Reactive component hierarchy, strict type contracts |
| **Build & Dev Tool** | Vite 6+, `@vitejs/plugin-react` | Ultra-fast HMR and production bundling |
| **Styling & Design System**| Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first styling with custom sanctuary color tokens |
| **Iconography** | Lucide React | Clean, consistent SVG icon set |
| **Motion & Animation** | Motion (`motion/react`) | Fluid slide transitions and modal entering/exiting states |
| **State Persistence** | Browser `localStorage` | Offline-first sync for Settings, Bookmarks, Plans, and History |
| **PWA & Offline** | `vite-plugin-pwa`, Service Workers | Add-to-homescreen, asset caching, full offline functionality |
| **Audio Synthesis** | Web Audio API (`AudioContext`) | Pitch-transposed initial-pitch tone generator for hymns |

---

## 2. Directory Structure

```text
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── icon.svg
│   └── manifest.webmanifest
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── index.css
    ├── components/
    │   ├── BeamModal.tsx           # Sanctuary projection engine (AdventistHymns style)
    │   ├── BibleView.tsx           # Multi-version scripture reader with Red Letter
    │   ├── EgwView.tsx             # E.G. White writings reader with paragraph beam
    │   ├── FavoritesView.tsx       # Saved bookmarks & quick access
    │   ├── HistoryView.tsx         # Chronological reading & viewing history
    │   ├── HymnalView.tsx          # SDAH, NZK, NCA browser with pitch transposition
    │   ├── OfflineIndicator.tsx    # Connection status monitor
    │   ├── PWAInstallButton.tsx    # Browser install prompt trigger
    │   ├── PlanView.tsx            # Sabbath / Vespers order-of-service planner
    │   ├── ScriptureModal.tsx      # Quick scripture lookup popup
    │   ├── SettingsView.tsx        # Typography, theme, and projection preferences
    │   ├── ToastContainer.tsx      # Transient user feedback toasts
    │   └── UniversalSearchModal.tsx# Cmd+K omni-search for hymns, scripture, and EGW
    ├── data/
    │   ├── sdahHymns.ts            # Seventh-day Adventist Hymnal data (1-695)
    │   ├── nzkHymns.ts             # Nyimbo Za Kristo hymnal data
    │   ├── ncaHymns.ts             # Nyĩmbo Cia Agendi hymnal data
    │   ├── bibles.ts               # Scripture books, chapters, and verses
    │   └── egwWritings.ts          # EGW books (Steps to Christ, Great Controversy, etc.)
    └── lib/
        ├── storage.ts              # Settings, favorites, and profile persistence
        ├── historyStorage.ts       # Reading history tracker
        ├── audio.ts                # Web Audio pitch synthesis engine
        └── toast.ts                # Event-driven toast notification emitter
```

---

## 3. Project Configuration Files

### `package.json`
```json
{
  "name": "have-on-behalf",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "tailwindcss": "^4.3.3",
    "typescript": "^7.0.2",
    "vite-plugin-pwa": "^1.3.0"
  }
}
```

### `vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Have On Behalf',
        short_name: 'HaveOnBehalf',
        description: 'Sanctuary Worship, Scripture, Hymnals & Beam Projection PWA',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
```

### `src/index.css`
```css
@import "tailwindcss";

@layer utilities {
  .beam-bg-ah-sanctuary {
    background: radial-gradient(circle at center, #1a202c 0%, #0d1117 100%);
  }
  .beam-bg-sanctuary-blue {
    background: radial-gradient(circle at center, #0f2b48 0%, #071526 100%);
  }
  .beam-bg-obsidian-dark {
    background: #090a0f;
  }
  .beam-bg-holy-gold {
    background: radial-gradient(circle at center, #2a220e 0%, #120e05 100%);
  }
  .beam-bg-cathedral-light {
    background: #fdfbf7;
  }
}
```

---

## 4. Key Functional Engines & Code Snippets

### A. Web Audio Tone Synthesizer for Hymn Pitches (`src/lib/audio.ts`)
Synthesizes clean sine waves for starting pitches with dynamic semitone transposition (+/- 6 semitones):

```ts
class PitchSynthesizer {
  private ctx: AudioContext | null = null;
  private currentOsc: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playPitch(noteFreq: number, semitoneShift = 0, durationMs = 3000) {
    this.stop();
    const ctx = this.getContext();
    const shiftedFreq = noteFreq * Math.pow(2, semitoneShift / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(shiftedFreq, ctx.currentTime);

    // Smooth envelope attack and release
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);

    this.currentOsc = osc;
    this.currentGain = gain;
  }

  stop() {
    if (this.currentOsc) {
      try { this.currentOsc.stop(); } catch {}
      this.currentOsc.disconnect();
      this.currentOsc = null;
    }
  }
}

export const pitchSynth = new PitchSynthesizer();
```

### B. AdventistHymns-Style Beam Slide Splitter (`src/components/BeamModal.tsx`)
Intelligently chunks long hymn stanzas into legible 2-4 line slides for projection screens:

```ts
export function buildHymnBeamSlides(hymn: Hymn, splitStanzas: boolean): BeamSlide[] {
  const slides: BeamSlide[] = [];

  hymn.stanzas.forEach((stanza) => {
    const lines = stanza.text.split('\n').map((l) => l.trim()).filter(Boolean);

    if (!splitStanzas || lines.length <= 4) {
      slides.push({
        title: `${hymn.number}. ${hymn.title}`,
        label: stanza.label,
        verseTag: stanza.type === 'chorus' ? 'Chorus' : stanza.label,
        sourceBadge: `Hymn ${hymn.number} · ${hymn.title}`,
        lines,
      });
    } else {
      // Split into part A and part B
      const mid = Math.ceil(lines.length / 2);
      const part1 = lines.slice(0, mid);
      const part2 = lines.slice(mid);

      slides.push({
        title: `${hymn.number}. ${hymn.title}`,
        label: `${stanza.label} (Pt 1)`,
        verseTag: `${stanza.label}a`,
        sourceBadge: `Hymn ${hymn.number} · ${hymn.title}`,
        lines: part1,
      });

      slides.push({
        title: `${hymn.number}. ${hymn.title}`,
        label: `${stanza.label} (Pt 2)`,
        verseTag: `${stanza.label}b`,
        sourceBadge: `Hymn ${hymn.number} · ${hymn.title}`,
        lines: part2,
      });
    }
  });

  return slides;
}
```

### C. Persistent Reading History Engine (`src/lib/historyStorage.ts`)
```ts
export interface HistoryItem {
  id: string;
  type: 'hymn' | 'bible' | 'egw';
  title: string;
  subtitle: string;
  reference: string;
  timestamp: number;
  metadata: {
    hymnId?: string;
    collection?: string;
    bookId?: string;
    chapter?: number;
    version?: string;
    bookCode?: string;
  };
}

const STORAGE_KEY = 'have_on_behalf_history';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
  const existing = getHistory();
  // Filter out recent duplicates of the exact same reference
  const filtered = existing.filter((e) => !(e.type === item.type && e.reference === item.reference));
  const newItem: HistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
  };
  const updated = [newItem, ...filtered].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
```

---

## 5. Local Setup Instructions

1. **Clone or Initialize Directory**:
   ```bash
   mkdir have-on-behalf && cd have-on-behalf
   npm init -y
   ```
2. **Install Dependencies**:
   ```bash
   npm install react react-dom lucide-react motion
   npm install -D typescript vite @vitejs/plugin-react tailwindcss @tailwindcss/vite vite-plugin-pwa @types/react @types/react-dom @types/node
   ```
3. **Copy Configuration Files**:
   Create `tsconfig.json`, `vite.config.ts`, `index.html`, and `src/index.css` as documented above.
4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
