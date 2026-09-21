# Contributing to Have On Behalf

Thank you for your interest in contributing to **Have On Behalf**! This project is built to empower Seventh-day Adventist congregations, choir directors, song leaders, and individual believers worldwide with high-quality worship, scripture, and projection tools.

---

## 1. Code of Conduct

We are dedicated to providing a peaceful, welcoming, and respectful environment for all contributors. Please communicate with grace, patience, and kindness.

---

## 2. Project Architecture

The project is structured into three layers:
1. **Core Web App & PWA (`/src`)**: Built with React 19, TypeScript, and Tailwind CSS. Runs in the browser and as an installed desktop/laptop application for sanctuary projection.
2. **Standardized Datasets (`/public/data`)**: Canonical JSON representations of the Seventh-day Adventist Hymnal (SDAH), Nyimbo Za Kristo (NZK), and Nyĩmbo Cia Agendi (NCA).
3. **Cross-Platform Roadmap (`/docs/ROADMAP_AND_PHASES.md`)**: Architectural blueprint for the upcoming Flutter mobile companion app and casting bridge.

---

## 3. Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/have-on-behalf.git
   cd have-on-behalf
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Verify TypeScript types and formatting:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 4. Contributing Hymn Data & Corrections

We take lyrical accuracy very seriously. If you find a typo or missing stanza in any hymnal:
1. Locate the hymnal file in `public/data/` (`sdah.json`, `nzk.json`, or `nca.json`).
2. Adhere strictly to the established stanza schema:
   ```json
   {
     "number": 1,
     "type": "verse",
     "lines": [
       "Line 1",
       "Line 2"
     ]
   }
   ```
3. Submit a Pull Request clearly identifying the hymn number and collection.

---

## 5. Pull Request Workflow

1. Fork the repo and create a feature branch (`git checkout -b feature/sanctuary-enhancement`).
2. Ensure `npm run lint` and `npm run build` pass with zero errors.
3. Commit your changes with clear, descriptive commit messages.
4. Push to your fork and submit a PR with a description of the problem solved.

Thank you for blessing congregations and worshippers with your contributions!
