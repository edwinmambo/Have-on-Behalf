import { BIBLE_BOOKS_CATALOG } from '../data/biblesData';

export interface ParsedScriptureRef {
  book: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  verses: number[];
  originalQuery: string;
}

// Map common book aliases to official book catalog names
const BOOK_ALIASES: Record<string, string> = {
  // Old Testament
  gen: 'Genesis',
  genesis: 'Genesis',
  gn: 'Genesis',
  ex: 'Exodus',
  exod: 'Exodus',
  exodus: 'Exodus',
  lev: 'Leviticus',
  leviticus: 'Leviticus',
  num: 'Numbers',
  numbers: 'Numbers',
  deut: 'Deuteronomy',
  deuteronomy: 'Deuteronomy',
  dt: 'Deuteronomy',
  josh: 'Joshua',
  joshua: 'Joshua',
  judg: 'Judges',
  judges: 'Judges',
  ruth: 'Ruth',
  '1 sam': '1 Samuel',
  '1sam': '1 Samuel',
  '1 samuel': '1 Samuel',
  '2 sam': '2 Samuel',
  '2sam': '2 Samuel',
  '2 samuel': '2 Samuel',
  '1 kgs': '1 Kings',
  '1kings': '1 Kings',
  '1 kings': '1 Kings',
  '2 kgs': '2 Kings',
  '2kings': '2 Kings',
  '2 kings': '2 Kings',
  '1 chr': '1 Chronicles',
  '1chronicles': '1 Chronicles',
  '2 chr': '2 Chronicles',
  '2chronicles': '2 Chronicles',
  ezra: 'Ezra',
  neh: 'Nehemiah',
  nehemiah: 'Nehemiah',
  est: 'Esther',
  esther: 'Esther',
  job: 'Job',
  ps: 'Psalms',
  psa: 'Psalms',
  psalm: 'Psalms',
  psalms: 'Psalms',
  prov: 'Proverbs',
  proverbs: 'Proverbs',
  prv: 'Proverbs',
  eccl: 'Ecclesiastes',
  ecclesiastes: 'Ecclesiastes',
  song: 'Song of Solomon',
  songs: 'Song of Solomon',
  'song of solomon': 'Song of Solomon',
  isa: 'Isaiah',
  isaiah: 'Isaiah',
  is: 'Isaiah',
  jer: 'Jeremiah',
  jeremiah: 'Jeremiah',
  lam: 'Lamentations',
  lamentations: 'Lamentations',
  ezek: 'Ezekiel',
  ezekiel: 'Ezekiel',
  dan: 'Daniel',
  daniel: 'Daniel',
  hos: 'Hosea',
  hosea: 'Hosea',
  joel: 'Joel',
  amos: 'Amos',
  obad: 'Obadiah',
  obadiah: 'Obadiah',
  jon: 'Jonah',
  jonah: 'Jonah',
  mic: 'Micah',
  micah: 'Micah',
  nah: 'Nahum',
  nahum: 'Nahum',
  hab: 'Habakkuk',
  habakkuk: 'Habakkuk',
  zeph: 'Zephaniah',
  zephaniah: 'Zephaniah',
  hag: 'Haggai',
  haggai: 'Haggai',
  zech: 'Zechariah',
  zechariah: 'Zechariah',
  mal: 'Malachi',
  malachi: 'Malachi',

  // New Testament
  matt: 'Matthew',
  matthew: 'Matthew',
  mt: 'Matthew',
  mark: 'Mark',
  mk: 'Mark',
  luke: 'Luke',
  lk: 'Luke',
  john: 'John',
  jn: 'John',
  jhn: 'John',
  acts: 'Acts',
  ac: 'Acts',
  rom: 'Romans',
  romans: 'Romans',
  rm: 'Romans',
  '1 cor': '1 Corinthians',
  '1cor': '1 Corinthians',
  '1 corinthians': '1 Corinthians',
  '2 cor': '2 Corinthians',
  '2cor': '2 Corinthians',
  '2 corinthians': '2 Corinthians',
  gal: 'Galatians',
  galatians: 'Galatians',
  eph: 'Ephesians',
  ephesians: 'Ephesians',
  phil: 'Philippians',
  philippians: 'Philippians',
  php: 'Philippians',
  col: 'Colossians',
  colossians: 'Colossians',
  '1 thess': '1 Thessalonians',
  '1thess': '1 Thessalonians',
  '1 thessalonians': '1 Thessalonians',
  '2 thess': '2 Thessalonians',
  '2thess': '2 Thessalonians',
  '2 thessalonians': '2 Thessalonians',
  '1 tim': '1 Timothy',
  '1tim': '1 Timothy',
  '1 timothy': '1 Timothy',
  '2 tim': '2 Timothy',
  '2tim': '2 Timothy',
  '2 timothy': '2 Timothy',
  titus: 'Titus',
  philem: 'Philemon',
  philemon: 'Philemon',
  heb: 'Hebrews',
  hebrews: 'Hebrews',
  jas: 'James',
  james: 'James',
  '1 pet': '1 Peter',
  '1pet': '1 Peter',
  '1 peter': '1 Peter',
  '2 pet': '2 Peter',
  '2pet': '2 Peter',
  '2 peter': '2 Peter',
  '1 jn': '1 John',
  '1jn': '1 John',
  '1 john': '1 John',
  '2 jn': '2 John',
  '2jn': '2 John',
  '2 john': '2 John',
  '3 jn': '3 John',
  '3jn': '3 John',
  '3 john': '3 John',
  jude: 'Jude',
  rev: 'Revelation',
  revelation: 'Revelation',
  revelations: 'Revelation',
  apoc: 'Revelation',
};

/**
 * Parses user input like:
 * "John 1: 1-14"
 * "John 1:1-14"
 * "John 1:14"
 * "John 1"
 * "Ps 23: 1-6"
 * "1 Cor 13: 1-8"
 */
export function parseScriptureQuery(query: string): ParsedScriptureRef | null {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().replace(/\s+/g, ' ');

  // Regex to capture:
  // (Book Name with optional leading digit) (Chapter) [ : (StartVerse) [ - (EndVerse) ] ]
  // Examples:
  // "John 1: 1-14" -> book="John", ch=1, v1=1, v2=14
  // "1 Cor 13: 4-8" -> book="1 Cor", ch=13, v1=4, v2=8
  // "Genesis 1:1" -> book="Genesis", ch=1, v1=1, v2=undefined
  // "Psalm 23" -> book="Psalm", ch=23
  const regex = /^([1-3]?\s*[a-zA-Z\s]+?)\s+(\d+)(?:\s*[:,\.]\s*(\d+)(?:\s*[-–—to]+\s*(\d+))?)?$/i;
  const match = clean.match(regex);

  if (!match) {
    return null;
  }

  const rawBook = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const startVerse = match[3] ? parseInt(match[3], 10) : undefined;
  const endVerse = match[4] ? parseInt(match[4], 10) : undefined;

  // Resolve official book name
  let officialBook: string | null = BOOK_ALIASES[rawBook] || null;

  if (!officialBook) {
    // Try fuzzy match in catalog
    const found = BIBLE_BOOKS_CATALOG.find(
      (b) =>
        b.name.toLowerCase() === rawBook ||
        b.abbr.toLowerCase() === rawBook ||
        b.name.toLowerCase().startsWith(rawBook)
    );
    if (found) {
      officialBook = found.name;
    }
  }

  if (!officialBook) {
    return null;
  }

  // Generate range of verses if specified
  const verses: number[] = [];
  if (startVerse !== undefined) {
    if (endVerse !== undefined && endVerse >= startVerse) {
      for (let v = startVerse; v <= endVerse; v++) {
        verses.push(v);
      }
    } else {
      verses.push(startVerse);
    }
  }

  return {
    book: officialBook,
    chapter,
    startVerse,
    endVerse,
    verses,
    originalQuery: query,
  };
}
