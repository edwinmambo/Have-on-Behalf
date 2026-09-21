/**
 * Core type definitions for Berean: Bible, Hymnal & EGW Platform
 */

export type HymnalCollection = 'SDAH' | 'SDAH-EXT' | 'NZK' | 'NCA';

export interface HymnStanza {
  number: number;
  type: 'verse' | 'refrain' | 'chorus' | 'bridge';
  lines: string[];
  chords?: string[]; // Optional inline bracketed chords e.g. "[Bb] On a hill far a[Eb]way..." or chord line
}

export interface Hymn {
  id: string; // e.g. "sdah-478" or "sdah-ext-700"
  collection: HymnalCollection;
  number: number;
  title: string;
  category?: string;
  isResponsiveReading?: boolean;
  key?: string;
  meter?: string;
  author?: string;
  composer?: string;
  tune?: string;
  scriptureReference?: string;
  hasChords?: boolean;
  crossReferences?: {
    collection: HymnalCollection;
    number: number;
    title: string;
  }[];
  stanzas: HymnStanza[];
}

export type BibleVersionId = 'KJV' | 'NKJV' | 'ESV' | 'NLT' | 'MSG' | 'SUV' | 'GIK';

export interface BibleVersionMeta {
  id: BibleVersionId;
  name: string;
  language: string;
  isPublicDomain: boolean;
  hasRedLetter: boolean;
  description: string;
  isAvailable?: boolean;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  isRedLetter?: boolean; // Words of Jesus Christ
}

export interface BibleChapter {
  book: string;
  bookAbbr: string;
  testament: 'OT' | 'NT';
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBookInfo {
  name: string;
  abbr: string;
  testament: 'OT' | 'NT';
  category: 'Law' | 'History' | 'Poetry' | 'Major Prophets' | 'Minor Prophets' | 'Gospels' | 'Acts' | 'Epistles' | 'Prophecy';
  chaptersCount: number;
}

export interface EgwParagraph {
  id: string; // e.g. "MOH 17.1"
  bookCode: string; // "MOH", "SC", "DA", "GC", "COL"
  page: number;
  paragraphNumber: number;
  reference: string; // "MOH 17.1"
  chapterTitle: string;
  chapterNumber: number;
  text: string;
  scriptureReferences: string[]; // e.g. ["John 3:16", "Matthew 11:28"]
}

export interface EgwBook {
  code: string;
  title: string;
  shortTitle: string;
  publicationYear: number;
  description: string;
  totalChapters: number;
  chapters: {
    number: number;
    title: string;
    startPage: number;
  }[];
}

export type FavoriteType = 'hymn' | 'verse' | 'egw_paragraph';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  reference: string;
  snippet: string;
  notes?: string;
  tag?: string;
  createdAt: number;
  metadata?: Record<string, any>;
}

export type BeamTheme = 'ah-sanctuary' | 'sanctuary-blue' | 'obsidian-dark' | 'holy-gold' | 'cathedral-light' | 'auto-time';
export type BeamFont = 'lora' | 'playfair' | 'cinzel' | 'garamond' | 'merriweather' | 'sans' | 'mono';

export interface RecentBeamItem {
  id: string;
  title: string;
  subtitle: string;
  sourceBadge: string;
  timestamp: number;
  slideCount: number;
  slides: BeamSlide[];
  theme?: BeamTheme;
  font?: BeamFont;
}

export interface BeamSlide {
  label: string; // "Intro", "Verse 1", "Verse 2a", "Refrain"
  title: string;
  sourceBadge: string; // "Hymn 159", "John 14:1-3 (KJV)", "MOH 17.1"
  lines: string[];
  verseTag?: string; // e.g. "Verse 2a" as in image.png
  isIntro?: boolean;
  isRefrain?: boolean;
  introDetails?: {
    hymnNumber?: number;
    collection?: string;
    title?: string;
    author?: string;
    composer?: string;
    key?: string;
    tune?: string;
    scriptureReference?: string;
  };
  hymnId?: string;
  hymnIndexInSession?: number;
  totalHymnsInSession?: number;
  hymnSlideIndex?: number;
  totalHymnSlides?: number;
}

export interface BeamState {
  isOpen: boolean;
  title: string;
  subtitle: string;
  slides: BeamSlide[];
  currentSlideIndex: number;
  isBlackout: boolean;
  isTextCleared: boolean;
  theme: BeamTheme;
  font: BeamFont;
  fontSizeMultiplier: number; // 0.8 to 1.6
  sessionTitle?: string;
  isSessionBeam?: boolean;
}

export interface WorshipPlanItem {
  id: string;
  hymnId: string;
  collection: HymnalCollection;
  number: number;
  title: string;
  key?: string;
  notes?: string;
  stanzasToSing?: number[]; // e.g., [1, 2, 4] or empty for all
  transposedKey?: string;
  transposeSemiTones?: number; // e.g. +2, -1
}

export interface WorshipPlanSession {
  id: string;
  title: string; // e.g. "Friday Vespers — 'Abide With Me'", "Sabbath Divine Worship"
  date: string;
  leaderName?: string;
  description?: string;
  items: WorshipPlanItem[];
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  id: string;
  type: 'hymn' | 'bible' | 'egw';
  title: string;
  reference: string;
  excerpt: string;
  matchedField: string;
  payload: any;
}

export type MainTab = 'hymnals' | 'bibles' | 'egw' | 'saved' | 'history' | 'plan' | 'settings';

