# Project Backlog & Feature Grooming: Have On Behalf (H.O.B)

This document provides the formal engineering grooming, sprint epics, user stories, acceptance criteria, and architectural specifications for **Have On Behalf**.

---

## 📌 Phase 1: Web Console & Data Normalization (Completed)

### Summary of Completed Deliverables
| Deliverable | Description | Status |
| :--- | :--- | :--- |
| **Liturgical Theme Palette** | Introduced *Sanctuary Sapphire* (Navy), *Sacred Emerald* (Forest), *Royal Amethyst* (Purple), *Cathedral Bronze* (Gold), and *Words of Christ* (Rose). Replaced harsh orange accents. | ✅ Done |
| **Blank Hymnal Entry** | Main hymnal reader starts on a clean, peaceful blank canvas instead of auto-loading #159, with instant directory selection or keypad jump. | ✅ Done |
| **Clean Scripture Version State** | Replaced strikethrough styling on unavailable Bible versions (NKJV, ESV, NLT, MSG) with subtle, accessible opacity grey-out. | ✅ Done |
| **Clean JSON Data Exporter** | Built 1-click dataset exporter in Settings & Sync producing normalized, validated JSON schemas (`sdah.json`, `nzk.json`, `nca.json`, cross-references). | ✅ Done |
| **Dual-Screen Beam Projector** | Full 16:9 minimalist sanctuary projection with automated stanza chunking and multi-monitor output. | ✅ Done |
| **Responsive Reading Antiphonal Formatting** | Distinct Leader (Italic) and Congregation (Bold) styling for responsive readings (SDAH 696–830). | ✅ Done |

---

## 📱 Phase 2 Grooming: Flutter Mobile Companion App

### Epic 1: Flutter Project Bootstrap & Clean Ingestion
* **Story 1.1: Canonical Data Asset Loading**
  * *As a* worshiper in a basement sanctuary with no mobile signal,
  * *I want* all 695 English hymns, 220 Swahili hymns, and 299 Gĩkũyũ hymns pre-bundled or cached locally,
  * *So that* the app opens instantly with 0ms network latency.
  * **Acceptance Criteria**:
    - App ships with pre-compiled SQLite or bundled JSON assets extracted from Phase 1.
    - Cold boot to ready-to-read is under 500ms.
    - Fully functional in Airplane Mode.

### Epic 2: Dedicated Hymn View (No Bottom Sheets)
* **Story 2.1: Full-Bleed Reading Surface**
  * *As a* chorister holding my phone while singing,
  * *I want* hymns to open in a dedicated full-screen page with an easy back arrow,
  * *So that* I never accidentally dismiss a modal bottom sheet while scrolling.
  * **Acceptance Criteria**:
    - Tapping any hymn navigates to a dedicated `HymnDetailScreen` via standard Navigator back-stack.
    - Top App Bar includes `← Back`, Hymn Number badge, and quick actions (Favorite, Pitch, Cast).
    - Preserves scroll position in the master hymn list when navigating back.

### Epic 3: Cross-Language Parallel & Interlinear Stanzas
* **Story 3.1: Language Segment Switcher**
  * *As a* multilingual worshiper,
  * *I want* to switch between SDAH (English), NZK (Swahili), and NCA (Gĩkũyũ) for the current hymn,
  * *So that* I can follow along regardless of the service language.
  * **Acceptance Criteria**:
    - Segmented tab bar at top: `[ English (SDAH) ] [ Kiswahili (NZK) ] [ Gĩkũyũ (NCA) ]`.
    - Automatically displays equivalent hymn number in active collection based on cross-reference mapping.
* **Story 3.2: Inline Stanza Translation**
  * *As a* church choir member learning local translations,
  * *I want* an optional "Interlinear / Parallel View" showing the translated stanza directly beneath each line,
  * *So that* I do not have to flip back and forth between screens.
  * **Acceptance Criteria**:
    - Toggle button "Parallel View".
    - Displays primary language in high contrast, with translated verse in a subtle shaded box immediately underneath.

### Epic 4: Offline Pitch Synthesizer
* **Story 4.1: Natural Piano Pitch Sounding**
  * *As a* song service leader,
  * *I want* to tap a pitch pipe icon to hear the starting tone of the hymn in its original or transposed key,
  * *So that* I can pitch the congregation without needing a piano.
  * **Acceptance Criteria**:
    - Web Audio / Soundpool synthesizes pitch with gentle attack and decay envelope.
    - Semitone transposition selector (-3 to +3 semitones).

---

## 📡 Phase 3 Grooming: Sanctuary Cast & Worship Planner

### Epic 1: Sabbath Order of Service Planner
* **Story 1.1: Service Program Deck**
  * *As a* church elder or AV coordinator,
  * *I want* to arrange the order of service (Opening Hymn, Scripture Reading, Sermon Notes, Closing Hymn),
  * *So that* the projectionist or pastor can advance through the service seamlessly.
  * **Acceptance Criteria**:
    - Drag-and-drop or reorderable list of worship items.
    - Support for custom announcement slides and responsive readings.

### Epic 2: Sanctuary Remote Casting Protocol
* **Story 2.1: Zero-Config Room Pairing**
  * *As a* pastor standing at the pulpit with my mobile phone,
  * *I want* to control the sanctuary projector screen without connecting cables or installing proprietary server software,
  * *So that* I can advance sermon slides and hymns at my own pace.
  * **Acceptance Criteria**:
    - The Sanctuary Desktop Web App displays a unique 6-character room code or QR code on request.
    - The mobile phone scans the QR code or enters the PIN to establish a secure peer-to-peer or lightweight WebSocket connection.
    - Controller screen provides:
      - Big tactile `[ Next Slide ]` and `[ Previous Slide ]` touch targets.
      - Live slide preview showing current line and upcoming verse.
      - Emergency `[ Blackout (B) ]` and `[ Clear Text (C) ]` buttons.
    - Latency from tap to screen update is under 80ms.

---

## 🏗️ Architectural Decisions Record (ADR)

### ADR-1: Why No Heavy Backend Server or Cloud Database?
1. **Zero Downtime During Divine Worship**: Online church databases fail when sanctuary cellular or Wi-Fi drops. Canonical religious texts do not change; packaging them locally guarantees 100% reliability.
2. **Zero Maintenance & Operating Costs**: Eliminates cloud database costs, server hosting, and API rate limits.
3. **Low-Latency Casting**: Direct peer-to-peer signaling or local LAN WebSockets are faster and more private than routing slide clicks through an external cloud database.

---

## 🔄 How to Push & Sync Changes to GitHub from AI Studio

Google AI Studio operates in a secure cloud container. To synchronize these changes with your GitHub repository:

1. **Use AI Studio's Built-In GitHub Export**:
   - In the top-right corner of the AI Studio workspace, open the **Project Settings / Options** menu (three dots or gear icon).
   - Select **Export to GitHub** (or **Download as ZIP**).
   - Authorize your GitHub account if prompted and choose your target repository and branch (`main`).
   - AI Studio will push the complete, updated project tree including all Phase 1 source code, documentation, and grooming files.

2. **Local Git Tracking**:
   - A clean Git repository has also been initialized locally in this workspace with all changes committed to the `main` branch.
