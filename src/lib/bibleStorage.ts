import { BibleVerse, BibleVersionId } from '../types';
import { BIBLE_TEXTS_STORE } from '../data/biblesData';
import { getCanonicalEnglishBook, getLocalizedBookName } from './bibleLocalization';

const CUSTOM_BIBLES_KEY = 'haveonbehalf_custom_bibles_v1';

export interface CustomBiblePayload {
  version: string;
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

/**
 * Retrieves custom imported Bible verses from local storage
 */
export function getCustomBibleStore(): Record<string, Record<string, BibleVerse[]>> {
  try {
    const raw = localStorage.getItem(CUSTOM_BIBLES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse custom bibles store', e);
    return {};
  }
}

/**
 * Saves or updates custom Bible verses
 */
export function saveCustomBibleChapter(payload: CustomBiblePayload): void {
  try {
    const current = getCustomBibleStore();
    if (!current[payload.version]) {
      current[payload.version] = {};
    }
    const chapterKey = `${payload.book} ${payload.chapter}`;
    current[payload.version][chapterKey] = payload.verses;
    localStorage.setItem(CUSTOM_BIBLES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save custom bible chapter', e);
  }
}

/**
 * Returns verses for book + chapter, checking:
 * 1. Bundled authentic store
 * 2. User-imported custom store in localStorage
 */
export function resolveChapterVerses(
  version: BibleVersionId | string,
  book: string,
  chapter: number
): BibleVerse[] | null {
  const canonical = getCanonicalEnglishBook(book);
  const keysToTry = Array.from(
    new Set([
      `${book} ${chapter}`,
      `${canonical} ${chapter}`,
      `${getLocalizedBookName(canonical, 'SUV')} ${chapter}`,
      `${getLocalizedBookName(canonical, 'GIK')} ${chapter}`,
    ])
  );

  // Check bundled store first
  const bundledStore = BIBLE_TEXTS_STORE[version as BibleVersionId];
  if (bundledStore) {
    for (const key of keysToTry) {
      if (bundledStore[key] && bundledStore[key].length > 0) {
        return bundledStore[key];
      }
    }
  }

  // Check custom imported storage
  const customStore = getCustomBibleStore();
  if (customStore[version]) {
    for (const key of keysToTry) {
      if (customStore[version][key] && customStore[version][key].length > 0) {
        return customStore[version][key];
      }
    }
  }

  // Fallback to KJV if available
  if (version !== 'KJV') {
    for (const key of keysToTry) {
      if (BIBLE_TEXTS_STORE.KJV[key] && BIBLE_TEXTS_STORE.KJV[key].length > 0) {
        return BIBLE_TEXTS_STORE.KJV[key];
      }
    }
  }

  return null;
}

const BIBLE_BOOK_ORDER: Record<string, number> = {
  Genesis: 1,
  Exodus: 2,
  Leviticus: 3,
  Numbers: 4,
  Deuteronomy: 5,
  Joshua: 6,
  Judges: 7,
  Ruth: 8,
  '1 Samuel': 9,
  '2 Samuel': 10,
  '1 Kings': 11,
  '2 Kings': 12,
  '1 Chronicles': 13,
  '2 Chronicles': 14,
  Ezra: 15,
  Nehemiah: 16,
  Esther: 17,
  Job: 18,
  Psalms: 19,
  Psalm: 19,
  Proverbs: 20,
  Ecclesiastes: 21,
  'Song of Solomon': 22,
  Isaiah: 23,
  Jeremiah: 24,
  Lamentations: 25,
  Ezekiel: 26,
  Daniel: 27,
  Hosea: 28,
  Joel: 29,
  Amos: 30,
  Obadiah: 31,
  Jonah: 32,
  Micah: 33,
  Nahum: 34,
  Habakkuk: 35,
  Zephaniah: 36,
  Haggai: 37,
  Zechariah: 38,
  Malachi: 39,
  Matthew: 40,
  Mark: 41,
  Luke: 42,
  John: 43,
  Acts: 44,
  Romans: 45,
  '1 Corinthians': 46,
  '2 Corinthians': 47,
  Galatians: 48,
  Ephesians: 49,
  Philippians: 50,
  Colossians: 51,
  '1 Thessalonians': 52,
  '2 Thessalonians': 53,
  '1 Timothy': 54,
  '2 Timothy': 55,
  Titus: 56,
  Philemon: 57,
  Hebrews: 58,
  James: 59,
  '1 Peter': 60,
  '2 Peter': 61,
  '1 John': 62,
  '2 John': 63,
  '3 John': 64,
  Jude: 65,
  Revelation: 66,
};

/**
 * Fetches authentic real scripture chapter from open public domain Bible API
 * (supporting English KJV via bible-api.com & bolls.life, and Swahili SUV via bolls.life)
 * and caches it in local storage so it remains permanently available offline.
 */
export async function fetchRealBibleChapter(
  version: string,
  book: string,
  chapter: number
): Promise<BibleVerse[] | null> {
  // Check if already available locally
  const existing = resolveChapterVerses(version, book, chapter);
  if (existing && existing.length > 0) {
    return existing;
  }

  const canonical = getCanonicalEnglishBook(book);
  const bookNumber = BIBLE_BOOK_ORDER[canonical] || 1;
  const swahiliName = getLocalizedBookName(canonical, 'SUV');
  const kikuyuName = getLocalizedBookName(canonical, 'GIK');

  const cacheVerses = (verses: BibleVerse[]) => {
    saveCustomBibleChapter({ version, book, chapter, verses });
    if (canonical !== book) {
      saveCustomBibleChapter({ version, book: canonical, chapter, verses });
    }
    if (version === 'SUV' && swahiliName !== book) {
      saveCustomBibleChapter({ version, book: swahiliName, chapter, verses });
    }
    if (version === 'GIK' && kikuyuName !== book) {
      saveCustomBibleChapter({ version, book: kikuyuName, chapter, verses });
    }
  };

  // 1. Swahili Union Version (SUV) via bolls.life
  if (version === 'SUV') {
    try {
      const res = await fetch(`https://bolls.life/get-chapter/SUV/${bookNumber}/${chapter}/`);
      if (res.ok) {
        const rawList = await res.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const verses: BibleVerse[] = rawList.map((item: any) => ({
            book: swahiliName || book,
            chapter,
            verse: Number(item.verse),
            text: String(item.text || '')
              .replace(/<[^>]+>/g, '')
              .replace(/\s+/g, ' ')
              .trim(),
            isRedLetter: false,
          }));

          cacheVerses(verses);
          return verses;
        }
      }
    } catch (err) {
      console.warn(`Could not fetch online SUV for ${book} ${chapter}:`, err);
    }
  }

  // 2. English (KJV, NKJV, ESV fallback) via bible-api.com
  try {
    const query = encodeURIComponent(`${canonical} ${chapter}`);
    const res = await fetch(`https://bible-api.com/${query}?translation=kjv`);
    if (res.ok) {
      const data = await res.json();
      if (data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        const verses: BibleVerse[] = data.verses.map((v: any) => ({
          book,
          chapter,
          verse: Number(v.verse),
          text: String(v.text || '').replace(/\s+/g, ' ').trim(),
          isRedLetter: false,
        }));

        cacheVerses(verses);
        return verses;
      }
    }
  } catch (err) {
    console.warn(`bible-api.com fetch failed for ${book} ${chapter}, trying bolls.life:`, err);
  }

  // 3. Fallback to bolls.life for KJV
  try {
    const res = await fetch(`https://bolls.life/get-chapter/KJV/${bookNumber}/${chapter}/`);
    if (res.ok) {
      const rawList = await res.json();
      if (Array.isArray(rawList) && rawList.length > 0) {
        const verses: BibleVerse[] = rawList.map((item: any) => ({
          book,
          chapter,
          verse: Number(item.verse),
          text: String(item.text || '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
          isRedLetter: false,
        }));

        cacheVerses(verses);
        return verses;
      }
    }
  } catch (err) {
    console.warn(`Could not fetch online KJV for ${book} ${chapter}:`, err);
  }

  return null;
}

