/**
 * Comprehensive authentic data source for Berean: Hymnals, Bibles, and EGW writings.
 * Provides rich, authentic content across SDAH, foundational scriptures (KJV/NKJV), and core Ellen G. White writings.
 *
 * Data Extraction Sources:
 * - SDAH (Seventh-day Adventist Hymnal): 695 hymns with complete stanzas & refrains (cis-hymnals / open public domain).
 * - NZK (Nyimbo Za Kristo): 220 Swahili SDA hymns with stanzas & refrains.
 * - NCA (Nyĩmbo Cia Agendi): 299 Gikuyu SDA hymns with stanzas & refrains.
 * - BIBLE: Authentic Scripture engine supporting King James Version (KJV) and Swahili Union Version (SUV) via local caching and open public domain APIs (bolls.life & bible-api.com).
 * - EGW (Ellen G. White Writings): Core devotional and theological writings (Steps to Christ, Desire of Ages, Great Controversy, Ministry of Healing, Christ's Object Lessons) with standard page-paragraph citations.
 */

import {
  Hymn,
  HymnalCollection,
  BibleVerse,
  BibleVersionId,
  BibleVersionMeta,
  BibleBookInfo,
  EgwBook,
  EgwParagraph,
} from '../types';

import { HYMNAL_METAS, HYMNS_DATA } from '../data/hymnsData';
import { BIBLE_VERSIONS, BIBLE_BOOKS_CATALOG, BIBLE_TEXTS_STORE } from '../data/biblesData';
import { EGW_BOOKS, EGW_PARAGRAPHS } from '../data/egwData';
import {
  loadFullHymnCatalog,
  getAllLoadedHymns,
  useHymnCatalog,
} from './hymnLibrary';
import {
  fetchRealBibleChapter,
  resolveChapterVerses,
  saveCustomBibleChapter,
} from './bibleStorage';

// Re-export primary catalogs and metadata
export { HYMNAL_METAS, HYMNS_DATA };
export { BIBLE_VERSIONS, BIBLE_BOOKS_CATALOG, BIBLE_TEXTS_STORE };
export { EGW_BOOKS, EGW_PARAGRAPHS };

// Dynamic full hymn library helpers
export { loadFullHymnCatalog, getAllLoadedHymns, useHymnCatalog };
export { fetchRealBibleChapter, resolveChapterVerses, saveCustomBibleChapter };

// Aliases for explicit imports
export const SDAH_HYMNS: Hymn[] = HYMNS_DATA.filter((h) => h.collection === 'SDAH');
export const FOUNDATIONAL_BIBLE_VERSES = BIBLE_TEXTS_STORE;
export const EGW_CORE_WRITINGS = EGW_PARAGRAPHS;

/**
 * Lookup helper: Get hymn by collection and hymn number (checks full loaded catalog)
 */
export function getHymn(collection: HymnalCollection, number: number): Hymn | undefined {
  const catalog = getAllLoadedHymns();
  return catalog.find((h) => h.collection === collection && h.number === number) ||
    HYMNS_DATA.find((h) => h.collection === collection && h.number === number);
}

/**
 * Lookup helper: Get all hymns belonging to a specific hymnal collection
 */
export function getHymnsByCollection(collection: HymnalCollection): Hymn[] {
  const catalog = getAllLoadedHymns();
  const filtered = catalog.filter((h) => h.collection === collection);
  return filtered.length > 0 ? filtered : HYMNS_DATA.filter((h) => h.collection === collection);
}

/**
 * Lookup helper: Get foundational Bible chapter verses
 */
export function getBibleChapterVerses(
  version: BibleVersionId = 'KJV',
  book: string,
  chapter: number
): BibleVerse[] {
  const resolved = resolveChapterVerses(version, book, chapter);
  if (resolved && resolved.length > 0) {
    return resolved;
  }
  const store = BIBLE_TEXTS_STORE[version] || BIBLE_TEXTS_STORE['KJV'];
  const chapterKey = `${book} ${chapter}`;
  if (store && store[chapterKey]) {
    return store[chapterKey];
  }
  const altKey = book === 'Psalm' ? `Psalms ${chapter}` : book === 'Psalms' ? `Psalm ${chapter}` : null;
  if (altKey && store && store[altKey]) {
    return store[altKey];
  }
  return [];
}

/**
 * Lookup helper: Get EGW paragraphs by book code and optional chapter number
 */
export function getEgwParagraphs(bookCode: string, chapterNumber?: number): EgwParagraph[] {
  return EGW_PARAGRAPHS.filter((p) => {
    if (p.bookCode !== bookCode) return false;
    if (chapterNumber !== undefined && p.chapterNumber !== chapterNumber) return false;
    return true;
  });
}

/**
 * Lookup helper: Search across all hymnals, scriptures, and EGW writings simultaneously
 */
export function searchLibrary(query: string): {
  hymns: Hymn[];
  verses: BibleVerse[];
  egw: EgwParagraph[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { hymns: [], verses: [], egw: [] };
  }

  const catalog = getAllLoadedHymns();
  const hymns = catalog
    .filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.number.toString() === q ||
        h.stanzas.some((s) => s.lines.some((l) => l.toLowerCase().includes(q)))
    )
    .slice(0, 15);

  const matchedVerses: BibleVerse[] = [];
  const kjvStore = BIBLE_TEXTS_STORE['KJV'] || {};
  for (const chapterKey of Object.keys(kjvStore)) {
    const list = kjvStore[chapterKey];
    for (const v of list) {
      if (
        v.text.toLowerCase().includes(q) ||
        `${v.book} ${v.chapter}:${v.verse}`.toLowerCase().includes(q)
      ) {
        matchedVerses.push(v);
        if (matchedVerses.length >= 15) break;
      }
    }
    if (matchedVerses.length >= 15) break;
  }

  const egw = EGW_PARAGRAPHS.filter(
    (p) =>
      p.reference.toLowerCase().includes(q) ||
      p.chapterTitle.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q)
  ).slice(0, 15);

  return { hymns, verses: matchedVerses, egw };
}
