# Have On Behalf — Comprehensive Engineering Roadmap & Phased Plan

This document outlines the strategic roadmap for transforming **Have On Behalf** into a unified cross-platform worship ecosystem.

---

## Strategic Vision

```text
┌────────────────────────────────────────────────────────┐
│             CANONICAL OPEN WORSHIP DATASETS            │
│  • SDAH (1-695)  • NZK (Swahili)  • NCA (Gĩkũyũ)       │
│  • Bibles (KJV, NKJV, SUV)  • Cross-Language Mappings  │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     SANCTUARY DESKTOP   │ │      MOBILE COMPANION   │
│       (Web PWA / Tauri) │ │         (Flutter)       │
│ • Fullscreen 16:9 Beam  │ │ • Fluent Hymnal Reader  │
│ • Multi-Monitor Output  │ │ • Inline Cross-Language │
│ • Vespers Plan Deck     │ │ • Dedicated Back-Stack  │
│ • Web Audio Synthesizer │ │ • Local Plan & Favs     │
└────────────┬────────────┘ └────────────┬────────────┘
             │                           │
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │    CAST & REMOTE CONTROL  │
             │ • 6-Digit Sanctuary Code  │
             │ • Pastor / Chorister Deck │
             │ • Slide Advance & Blackout│
             └───────────────────────────┘
```

---

## Phase Breakdown

### Phase 1: Data Stabilization, Themes & Web Optimization (Current Focus)
- **Palette Evolution**: Shift away from harsh saturated orange to reverent liturgical palettes:
  - *Sanctuary Sapphire* (Deep Navy & Indigo — default)
  - *Sacred Emerald* (Living Waters Green)
  - *Royal Amethyst* (Evening Vespers Purple)
  - *Cathedral Bronze* (Muted Warm Gold)
  - *Words of Christ* (Crimson Rose)
- **Data Export & Portability**: Provide 1-click export of clean, validated JSON datasets (`sdah.json`, `nzk.json`, `nca.json`, cross-references) for mobile and external ingestion.
- **Web Desktop Hardening**: Optimize the desktop web app for church sanctuary projection laptops (keyboard shortcuts, multi-display support, responsive chapter selectors).

---

### Phase 2: Mobile-First Hymnal Architecture (Flutter Companion — Implemented)
The Flutter mobile companion app is bootstrapped and fully functional in `/mobile/`:
1. **Dedicated Tab Stack with Fluent Back-Navigation**:
   - Tapping a hymn transitions cleanly to a full-screen **Dedicated Hymn Detail Screen** (no modal bottom sheets).
   - High-contrast, thumb-friendly top **Quick Back Button** (`← Hymns`) returning instantly without losing catalog scroll position.
2. **Inline Cross-Language Stanzas (No Cramped Columns)**:
   - Toggle languages at the top (`EN (SDAH)` | `SW (NZK)` | `KIK (NCA)`).
   - **Inline Interlinear Parallel View**: Displays the Swahili or Gĩkũyũ translation *directly underneath each stanza* in a distinct liturgical callout card.
3. **Pulpit & Pew Ergonomics**:
   - Audio starting-pitch pipe synthesizer with semitone transposition.
   - Offline-first local storage for personal study notes and favorite hymns.
   - 5 Liturgical themes in both Light and Dark mode.
   - Bundled canonical datasets in `mobile/assets/data/`.

---

### Phase 3: Worship Session Planning & Local Sync
- Create, reorder, and rehearse Sabbath divine services, Friday evening vespers, and AY programs.
- Mix and match opening hymns, scripture readings, and closing songs.
- Store plans locally on device; export plans as shareable QR codes or JSON payloads.

---

### Phase 4: Remote Control & Sanctuary Casting Bridge
- **The Concept**: The laptop connected to the church projector runs the **Have On Behalf Web / Desktop App** displaying the clean, borderless Beam view.
- **The Remote**: The song leader, pastor, or chorister opens the **Mobile App**, taps **"Cast to Sanctuary"**, and enters the 6-character room code displayed on the projection screen.
- **Presenter Controls**:
  - Tactile Next / Previous slide triggers.
  - Teleprompter preview showing current text and incoming stanza.
  - Emergency **Blackout** (B) and **Clear Text** (C) switches.
  - Key signature and pitch sounding directly from the phone.

---

## Key Architectural Decisions

### Do We Need a Backend?
**Short answer: No, you do not need a traditional heavy backend.**
- **Hymns, Scripture, and EGW are read-only canonical texts**: Hosting them on a heavy server or database introduces unnecessary hosting costs, server downtime risks, and fails when church Wi-Fi drops. Bundling them as static JSON / SQLite assets provides **100% offline reliability**.
- **For Remote Casting**: A lightweight, serverless real-time relay (e.g., Firebase Realtime Database or Supabase WebSockets) or local network mDNS broadcast is all that is required to pass tiny 50-byte slide trigger packets (`{ slide: 4, blackout: false }`).
