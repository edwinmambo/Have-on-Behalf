import { BibleVersionId } from '../types';

export interface LocalizedBookEntry {
  en: string;
  abbrEn: string;
  sw: string;
  abbrSw: string;
  gik: string;
  abbrGik: string;
}

export const LOCALIZED_BIBLE_BOOKS: Record<string, LocalizedBookEntry> = {
  // OT Law
  Genesis: { en: 'Genesis', abbrEn: 'Gen', sw: 'Mwanzo', abbrSw: 'Mwa', gik: 'Kĩambĩrĩria', abbrGik: 'Kĩam' },
  Exodus: { en: 'Exodus', abbrEn: 'Exod', sw: 'Kutoka', abbrSw: 'Kut', gik: 'Rũaũ', abbrGik: 'Rũa' },
  Leviticus: { en: 'Leviticus', abbrEn: 'Lev', sw: 'Mambo ya Walawi', abbrSw: 'Law', gik: 'Alawi', abbrGik: 'Alaw' },
  Numbers: { en: 'Numbers', abbrEn: 'Num', sw: 'Hesabu', abbrSw: 'Hes', gik: 'Gũtara', abbrGik: 'Gũt' },
  Deuteronomy: { en: 'Deuteronomy', abbrEn: 'Deut', sw: 'Kumbukumbu la Torati', abbrSw: 'Kumb', gik: 'Gũcokerithia', abbrGik: 'Gũc' },

  // OT History
  Joshua: { en: 'Joshua', abbrEn: 'Josh', sw: 'Yoshua', abbrSw: 'Yos', gik: 'Joshua', abbrGik: 'Josh' },
  Judges: { en: 'Judges', abbrEn: 'Judg', sw: 'Waamuzi', abbrSw: 'Amu', gik: 'Athiĩ', abbrGik: 'Ath' },
  Ruth: { en: 'Ruth', abbrEn: 'Ruth', sw: 'Ruthu', abbrSw: 'Rut', gik: 'Ruthu', abbrGik: 'Rut' },
  '1 Samuel': { en: '1 Samuel', abbrEn: '1Sam', sw: '1 Samweli', abbrSw: '1Sam', gik: '1 Samueli', abbrGik: '1Sam' },
  '2 Samuel': { en: '2 Samuel', abbrEn: '2Sam', sw: '2 Samweli', abbrSw: '2Sam', gik: '2 Samueli', abbrGik: '2Sam' },
  '1 Kings': { en: '1 Kings', abbrEn: '1Kgs', sw: '1 Wafalme', abbrSw: '1Fal', gik: '1 Athamaki', abbrGik: '1Ath' },
  '2 Kings': { en: '2 Kings', abbrEn: '2Kgs', sw: '2 Wafalme', abbrSw: '2Fal', gik: '2 Athamaki', abbrGik: '2Ath' },
  '1 Chronicles': { en: '1 Chronicles', abbrEn: '1Chr', sw: '1 Mambo ya Nyakati', abbrSw: '1Nya', gik: '1 Mohoro ma Matukũ', abbrGik: '1Moh' },
  '2 Chronicles': { en: '2 Chronicles', abbrEn: '2Chr', sw: '2 Mambo ya Nyakati', abbrSw: '2Nya', gik: '2 Mohoro ma Matukũ', abbrGik: '2Moh' },
  Ezra: { en: 'Ezra', abbrEn: 'Ezra', sw: 'Ezra', abbrSw: 'Ezr', gik: 'Ezra', abbrGik: 'Ezr' },
  Nehemiah: { en: 'Nehemiah', abbrEn: 'Neh', sw: 'Nehemia', abbrSw: 'Neh', gik: 'Nehemia', abbrGik: 'Neh' },
  Esther: { en: 'Esther', abbrEn: 'Esth', sw: 'Esta', abbrSw: 'Est', gik: 'Esiteri', abbrGik: 'Esit' },

  // OT Poetry
  Job: { en: 'Job', abbrEn: 'Job', sw: 'Ayubu', abbrSw: 'Ayu', gik: 'Ayubu', abbrGik: 'Ayu' },
  Psalms: { en: 'Psalms', abbrEn: 'Ps', sw: 'Zaburi', abbrSw: 'Zab', gik: 'Thaburi', abbrGik: 'Thab' },
  Psalm: { en: 'Psalm', abbrEn: 'Ps', sw: 'Zaburi', abbrSw: 'Zab', gik: 'Thaburi', abbrGik: 'Thab' },
  Proverbs: { en: 'Proverbs', abbrEn: 'Prov', sw: 'Mithali', abbrSw: 'Mit', gik: 'Thimo', abbrGik: 'Thim' },
  Ecclesiastes: { en: 'Ecclesiastes', abbrEn: 'Eccl', sw: 'Mhubiri', abbrSw: 'Mhu', gik: 'Mũhunjia', abbrGik: 'Mũh' },
  'Song of Solomon': { en: 'Song of Solomon', abbrEn: 'Song', sw: 'Wimbo Ulio Bora', abbrSw: 'Wim', gik: 'Rwĩmbo rwa Solomoni', abbrGik: 'Rwĩ' },

  // OT Major Prophets
  Isaiah: { en: 'Isaiah', abbrEn: 'Isa', sw: 'Isaya', abbrSw: 'Isa', gik: 'Isaia', abbrGik: 'Isa' },
  Jeremiah: { en: 'Jeremiah', abbrEn: 'Jer', sw: 'Yeremia', abbrSw: 'Yer', gik: 'Jeremia', abbrGik: 'Jer' },
  Lamentations: { en: 'Lamentations', abbrEn: 'Lam', sw: 'Maombolezo', abbrSw: 'Mao', gik: 'Macakaya', abbrGik: 'Mac' },
  Ezekiel: { en: 'Ezekiel', abbrEn: 'Ezek', sw: 'Ezekieli', abbrSw: 'Eze', gik: 'Ezekieli', abbrGik: 'Eze' },
  Daniel: { en: 'Daniel', abbrEn: 'Dan', sw: 'Danieli', abbrSw: 'Dan', gik: 'Danieli', abbrGik: 'Dan' },

  // OT Minor Prophets (Complete 12 Minor Prophets)
  Hosea: { en: 'Hosea', abbrEn: 'Hos', sw: 'Hosea', abbrSw: 'Hos', gik: 'Hosea', abbrGik: 'Hos' },
  Joel: { en: 'Joel', abbrEn: 'Joel', sw: 'Yoeli', abbrSw: 'Yoe', gik: 'Joeli', abbrGik: 'Joe' },
  Amos: { en: 'Amos', abbrEn: 'Amos', sw: 'Amosi', abbrSw: 'Amo', gik: 'Amosi', abbrGik: 'Amo' },
  Obadiah: { en: 'Obadiah', abbrEn: 'Obad', sw: 'Obadia', abbrSw: 'Oba', gik: 'Obadia', abbrGik: 'Oba' },
  Jonah: { en: 'Jonah', abbrEn: 'Jonah', sw: 'Yona', abbrSw: 'Yon', gik: 'Jona', abbrGik: 'Jon' },
  Micah: { en: 'Micah', abbrEn: 'Mic', sw: 'Mika', abbrSw: 'Mik', gik: 'Mika', abbrGik: 'Mik' },
  Nahum: { en: 'Nahum', abbrEn: 'Nah', sw: 'Nahumu', abbrSw: 'Nah', gik: 'Nahumu', abbrGik: 'Nah' },
  Habakkuk: { en: 'Habakkuk', abbrEn: 'Hab', sw: 'Habakuki', abbrSw: 'Hab', gik: 'Habakuki', abbrGik: 'Hab' },
  Zephaniah: { en: 'Zephaniah', abbrEn: 'Zeph', sw: 'Sefania', abbrSw: 'Sef', gik: 'Zefania', abbrGik: 'Zef' },
  Haggai: { en: 'Haggai', abbrEn: 'Hag', sw: 'Hagai', abbrSw: 'Hag', gik: 'Hagai', abbrGik: 'Hag' },
  Zechariah: { en: 'Zechariah', abbrEn: 'Zech', sw: 'Zekaria', abbrSw: 'Zek', gik: 'Zekaria', abbrGik: 'Zek' },
  Malachi: { en: 'Malachi', abbrEn: 'Mal', sw: 'Malaki', abbrSw: 'Mal', gik: 'Malaki', abbrGik: 'Mal' },

  // NT Gospels
  Matthew: { en: 'Matthew', abbrEn: 'Matt', sw: 'Mathayo', abbrSw: 'Mat', gik: 'Mathayo', abbrGik: 'Mat' },
  Mark: { en: 'Mark', abbrEn: 'Mark', sw: 'Marko', abbrSw: 'Mar', gik: 'Mariko', abbrGik: 'Mar' },
  Luke: { en: 'Luke', abbrEn: 'Luke', sw: 'Luka', abbrSw: 'Luk', gik: 'Luka', abbrGik: 'Luk' },
  John: { en: 'John', abbrEn: 'John', sw: 'Yohana', abbrSw: 'Yoh', gik: 'Johana', abbrGik: 'Joh' },

  // NT Acts
  Acts: { en: 'Acts', abbrEn: 'Acts', sw: 'Matendo ya Mitume', abbrSw: 'Mdo', gik: 'Ciĩko cia Atũmwo', abbrGik: 'Ciĩ' },

  // NT Epistles
  Romans: { en: 'Romans', abbrEn: 'Rom', sw: 'Warumi', abbrSw: 'Rum', gik: 'Aroma', abbrGik: 'Arom' },
  '1 Corinthians': { en: '1 Corinthians', abbrEn: '1Cor', sw: '1 Wakorintho', abbrSw: '1Kor', gik: '1 Akorintho', abbrGik: '1Kor' },
  '2 Corinthians': { en: '2 Corinthians', abbrEn: '2Cor', sw: '2 Wakorintho', abbrSw: '2Kor', gik: '2 Akorintho', abbrGik: '2Kor' },
  Galatians: { en: 'Galatians', abbrEn: 'Gal', sw: 'Wagalatia', abbrSw: 'Gal', gik: 'Agalatia', abbrGik: 'Gal' },
  Ephesians: { en: 'Ephesians', abbrEn: 'Eph', sw: 'Waefeso', abbrSw: 'Efe', gik: 'Aefeso', abbrGik: 'Efe' },
  Philippians: { en: 'Philippians', abbrEn: 'Phil', sw: 'Wafilipi', abbrSw: 'Flp', gik: 'Afilipi', abbrGik: 'Flp' },
  Colossians: { en: 'Colossians', abbrEn: 'Col', sw: 'Wakolosai', abbrSw: 'Kol', gik: 'Akolosai', abbrGik: 'Kol' },
  '1 Thessalonians': { en: '1 Thessalonians', abbrEn: '1Thess', sw: '1 Wathesalonike', abbrSw: '1The', gik: '1 Athesalonike', abbrGik: '1The' },
  '2 Thessalonians': { en: '2 Thessalonians', abbrEn: '2Thess', sw: '2 Wathesalonike', abbrSw: '2The', gik: '2 Athesalonike', abbrGik: '2The' },
  '1 Timothy': { en: '1 Timothy', abbrEn: '1Tim', sw: '1 Timotheo', abbrSw: '1Tim', gik: '1 Timotheo', abbrGik: '1Tim' },
  '2 Timothy': { en: '2 Timothy', abbrEn: '2Tim', sw: '2 Timotheo', abbrSw: '2Tim', gik: '2 Timotheo', abbrGik: '2Tim' },
  Titus: { en: 'Titus', abbrEn: 'Tit', sw: 'Tito', abbrSw: 'Tit', gik: 'Tito', abbrGik: 'Tit' },
  Philemon: { en: 'Philemon', abbrEn: 'Phlm', sw: 'Filemoni', abbrSw: 'Flm', gik: 'Filemoni', abbrGik: 'Flm' },
  Hebrews: { en: 'Hebrews', abbrEn: 'Heb', sw: 'Waebrania', abbrSw: 'Ebr', gik: 'Ahibirania', abbrGik: 'Ebr' },
  James: { en: 'James', abbrEn: 'Jas', sw: 'Yakobo', abbrSw: 'Yak', gik: 'Jakubu', abbrGik: 'Jak' },
  '1 Peter': { en: '1 Peter', abbrEn: '1Pet', sw: '1 Petro', abbrSw: '1Pet', gik: '1 Petero', abbrGik: '1Pet' },
  '2 Peter': { en: '2 Peter', abbrEn: '2Pet', sw: '2 Petro', abbrSw: '2Pet', gik: '2 Petero', abbrGik: '2Pet' },
  '1 John': { en: '1 John', abbrEn: '1Jn', sw: '1 Yohana', abbrSw: '1Yoh', gik: '1 Johana', abbrGik: '1Joh' },
  '2 John': { en: '2 John', abbrEn: '2Jn', sw: '2 Yohana', abbrSw: '2Yoh', gik: '2 Johana', abbrGik: '2Joh' },
  '3 John': { en: '3 John', abbrEn: '3Jn', sw: '3 Yohana', abbrSw: '3Yoh', gik: '3 Johana', abbrGik: '3Joh' },
  Jude: { en: 'Jude', abbrEn: 'Jude', sw: 'Yuda', abbrSw: 'Yud', gik: 'Juda', abbrGik: 'Jud' },

  // NT Prophecy
  Revelation: { en: 'Revelation', abbrEn: 'Rev', sw: 'Ufunuo', abbrSw: 'Ufu', gik: 'Kũguũrĩrio', abbrGik: 'Kũg' },
};

/**
 * Returns localized name for a Bible book based on current active version
 */
export function getLocalizedBookName(englishBookName: string, versionId: BibleVersionId): string {
  const entry = LOCALIZED_BIBLE_BOOKS[englishBookName];
  if (!entry) return englishBookName;
  if (versionId === 'SUV') return entry.sw;
  if (versionId === 'GIK') return entry.gik;
  return entry.en;
}

/**
 * Returns localized abbreviation for a Bible book based on current active version
 */
export function getLocalizedBookAbbr(englishBookName: string, versionId: BibleVersionId): string {
  const entry = LOCALIZED_BIBLE_BOOKS[englishBookName];
  if (!entry) return englishBookName.slice(0, 3);
  if (versionId === 'SUV') return entry.abbrSw;
  if (versionId === 'GIK') return entry.abbrGik;
  return entry.abbrEn;
}

/**
 * Returns localized category label (e.g. Law -> Torati, History -> Historia)
 */
export function getLocalizedCategory(category: string, versionId: BibleVersionId): string {
  if (versionId === 'SUV') {
    switch (category) {
      case 'Law': return 'Torati';
      case 'History': return 'Historia';
      case 'Poetry': return 'Mashairi';
      case 'Major Prophets': return 'Manabii Wakuu';
      case 'Minor Prophets': return 'Manabii Wadogo';
      case 'Gospels': return 'Injili';
      case 'Acts': return 'Matendo';
      case 'Epistles': return 'Nyaraka';
      case 'Prophecy': return 'Unabii';
      default: return category;
    }
  }
  if (versionId === 'GIK') {
    switch (category) {
      case 'Law': return 'Watho';
      case 'History': return 'Rũgano';
      case 'Poetry': return 'Nyĩmbo';
      case 'Major Prophets': return 'Anabii Anene';
      case 'Minor Prophets': return 'Anabii Anini';
      case 'Gospels': return 'Ũhoro Mwega';
      case 'Acts': return 'Ciĩko';
      case 'Epistles': return 'Marũa';
      case 'Prophecy': return 'Ũrathi';
      default: return category;
    }
  }
  return category;
}

/**
 * Returns localized testament filter label
 */
export function getLocalizedTestament(testament: 'ALL' | 'OT' | 'NT', versionId: BibleVersionId): string {
  if (versionId === 'SUV') {
    if (testament === 'ALL') return 'Vitabu Vyote';
    if (testament === 'OT') return 'Agano la Kale';
    return 'Agano Jipya';
  }
  if (versionId === 'GIK') {
    if (testament === 'ALL') return 'Ibuku Ciothe';
    if (testament === 'OT') return 'Kĩrĩkanĩro Gĩkũrũ';
    return 'Kĩrĩkanĩro Kĩerũ';
  }
  if (testament === 'ALL') return 'All Books';
  if (testament === 'OT') return 'Old Test.';
  return 'New Test.';
}

/**
 * Checks if search query matches book name in current language or English
 */
export function matchBookSearch(
  englishBookName: string,
  query: string,
  versionId: BibleVersionId
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const entry = LOCALIZED_BIBLE_BOOKS[englishBookName];
  if (!entry) return englishBookName.toLowerCase().includes(q);

  // Normalize diacritics for friendly search (e.g. "kiambiriria" matches "Kĩambĩrĩria")
  const norm = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normQ = norm(q);
  const localized = getLocalizedBookName(englishBookName, versionId);
  const localizedAbbr = getLocalizedBookAbbr(englishBookName, versionId);

  return (
    norm(localized).includes(normQ) ||
    norm(localizedAbbr).includes(normQ) ||
    norm(entry.en).includes(normQ) ||
    norm(entry.abbrEn).includes(normQ) ||
    norm(entry.sw).includes(normQ) ||
    norm(entry.gik).includes(normQ)
  );
}

/**
 * Maps any localized name (Swahili, Kikuyu, English) or abbreviation back to canonical English book name
 */
export function getCanonicalEnglishBook(name: string): string {
  if (!name) return 'Genesis';
  const trimmed = name.trim().toLowerCase();
  
  for (const [englishName, entry] of Object.entries(LOCALIZED_BIBLE_BOOKS)) {
    if (
      englishName.toLowerCase() === trimmed ||
      entry.en.toLowerCase() === trimmed ||
      entry.abbrEn.toLowerCase() === trimmed ||
      entry.sw.toLowerCase() === trimmed ||
      entry.abbrSw.toLowerCase() === trimmed ||
      entry.gik.toLowerCase() === trimmed ||
      entry.abbrGik.toLowerCase() === trimmed
    ) {
      return englishName;
    }
  }
  return name;
}

