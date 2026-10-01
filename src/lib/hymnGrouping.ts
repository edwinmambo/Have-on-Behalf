import { Hymn, HymnalCollection } from '../types';

/**
 * Official Topical Groups for Seventh-day Adventist Hymnals
 */
export interface HymnGroupMeta {
  id: string;
  name: string;
  nativeName?: string;
  description: string;
  iconName?: string;
  rangeStart?: number;
  rangeEnd?: number;
}

/**
 * Returns canonical SDAH (1985) hymn topical section / group
 */
export function getSdahCanonicalGroup(number: number): string {
  if (number >= 1 && number <= 38) return 'Worship & Adoration';
  if (number >= 39 && number <= 58) return 'Morning & Evening Worship';
  if (number >= 59 && number <= 69) return 'Opening of Worship';
  if (number >= 70 && number <= 91) return 'God the Father & Trinity';
  if (number >= 92 && number <= 114) return 'Praise to Christ';
  if (number >= 115 && number <= 143) return 'First Advent & Incarnation';
  if (number >= 144 && number <= 153) return 'Life & Ministry of Jesus';
  if (number >= 154 && number <= 164) return 'Sufferings & Death of Christ';
  if (number >= 165 && number <= 176) return 'Resurrection & Ascension';
  if (number >= 177 && number <= 180) return 'Priesthood & Sanctuary';
  if (number >= 181 && number <= 219) return 'Second Coming of Christ';
  if (number >= 220 && number <= 227) return 'Kingdom of God & Eternity';
  if (number >= 228 && number <= 256) return 'Glory of God in Creation';
  if (number >= 257 && number <= 270) return 'The Holy Spirit';
  if (number >= 271 && number <= 278) return 'The Holy Scriptures';
  if (number >= 279 && number <= 290) return 'Gospel: Invitation';
  if (number >= 291 && number <= 300) return 'Gospel: Repentance & Forgiveness';
  if (number >= 301 && number <= 333) return 'Gospel: Salvation & Grace';
  if (number >= 334 && number <= 343) return 'Consecration & Dedication';
  if (number >= 344 && number <= 354) return 'The Church & Fellowship';
  if (number >= 355 && number <= 375) return 'Mission & Witnessing';
  if (number >= 376 && number <= 383) return 'Christian Ministry';
  if (number >= 384 && number <= 395) return 'The Sabbath: Delight & Rest';
  if (number >= 396 && number <= 411) return 'Communion & Lord’s Supper';
  if (number >= 412 && number <= 419) return 'Baptism & Dedication';
  if (number >= 420 && number <= 437) return 'Advent Hope & Resurrection';
  if (number >= 438 && number <= 454) return 'Early Advent Heritage & Pioneers';
  if (number >= 455 && number <= 477) return 'Christian Warfare & Pilgrimage';
  if (number >= 478 && number <= 505) return 'Prayer & Devotion';
  if (number >= 506 && number <= 535) return 'Faith & Trust';
  if (number >= 536 && number <= 555) return 'Peace & Comfort';
  if (number >= 556 && number <= 566) return 'Guidance & Protection';
  if (number >= 567 && number <= 589) return 'Love & Christian Stewardship';
  if (number >= 590 && number <= 605) return 'Christ’s Reward & Triumph';
  if (number >= 606 && number <= 641) return 'Heaven & The New Earth';
  if (number >= 642 && number <= 659) return 'Christian Home & Youth';
  if (number >= 660 && number <= 695) return 'Closing of Worship & Amens';
  if (number >= 696 && number <= 954) return 'Youth & Supplemental Gospel Songs';
  return 'General Hymns of Praise';
}

/**
 * Returns canonical Nyimbo Za Kristo (NZK) group
 */
export function getNzkCanonicalGroup(number: number): string {
  if (number >= 1 && number <= 20) return 'Sifa na Kuabudu (Praise & Worship)';
  if (number >= 21 && number <= 35) return 'Mungu Baba na Uumbaji (God & Creation)';
  if (number >= 36 && number <= 55) return 'Bwana Yesu Kristo: Kuzaliwa na Maisha (Jesus Christ)';
  if (number >= 56 && number <= 75) return 'Kifo na Ufufuo wa Kristo (Suffering & Resurrection)';
  if (number >= 76 && number <= 98) return 'Msalaba na Damu ya Yesu (The Cross & Atonement)';
  if (number >= 99 && number <= 125) return 'Kutubu na Kuamini (Repentance & Faith)';
  if (number >= 126 && number <= 145) return 'Roho Mtakatifu na Neno (Holy Spirit & The Word)';
  if (number >= 146 && number <= 160) return 'Sabato Takatifu (The Holy Sabbath)';
  if (number >= 161 && number <= 185) return 'Kuja kwa Yesu Mara ya Pili (Second Coming)';
  if (number >= 186 && number <= 205) return 'Matumaini na Maombi (Prayer & Christian Walk)';
  if (number >= 206 && number <= 220) return 'Nchi Mpya na Mbinguni (Heaven & New Earth)';
  return 'Nyimbo za Injili';
}

/**
 * Returns canonical Wende Nyasaye (WNY) group
 */
export function getWnyCanonicalGroup(number: number): string {
  if (number >= 1 && number <= 35) return 'Pwoyo gi Lamo (Praise & Worship)';
  if (number >= 36 && number <= 70) return 'Yesu Kristo gi Ng\'wono (Jesus Christ & Grace)';
  if (number >= 71 && number <= 100) return 'Loko Chunyo gi Resruok (Repentance & Salvation)';
  if (number >= 101 && number <= 140) return 'Yie gi Wuoth (Faith & Christian Walk)';
  if (number >= 141 && number <= 170) return 'Sabato Maler (The Holy Sabbath)';
  if (number >= 171 && number <= 210) return 'Duogo mar Kristo (Second Coming)';
  if (number >= 211 && number <= 260) return 'Lemo gi Hweche (Prayer & Comfort)';
  if (number >= 261 && number <= 300) return 'Polo gi Jerusalem Manyien (Heaven & New Earth)';
  if (number >= 301 && number <= 332) return 'Gwedho gi Chokruok (Benediction & Closing)';
  return 'Wende mag Piny gi Polo';
}

/**
 * Returns canonical Ogotera kw'Omonene (OKN - Gusii) group
 */
export function getOknCanonicalGroup(number: number): string {
  if (number >= 1 && number <= 35) return 'Okotogia Nyasae (Praise & Worship)';
  if (number >= 36 && number <= 75) return 'Omonene Yesu Kristo (Jesus Christ)';
  if (number >= 76 && number <= 120) return 'Okobera n\'Okotatoka (Salvation & Repentance)';
  if (number >= 121 && number <= 165) return 'Okweyana n\'Okwegena (Faith & Consecration)';
  if (number >= 166 && number <= 195) return 'Esabato Enchenu (The Sabbath)';
  if (number >= 196 && number <= 245) return 'Okogorokera kw\'Omonene (Second Coming)';
  if (number >= 246 && number <= 300) return 'Okosaba n\'Obwanchani (Prayer & Love)';
  if (number >= 301 && number <= 340) return 'Ebaru Enyia (The New Jerusalem)';
  if (number >= 341 && number <= 370) return 'Okobereka kw\'Ekanisa (Church & Benediction)';
  return 'Ogotera kw\'Ogotogia Nyasae';
}

/**
 * Returns canonical Kinyarwanda (KIN - Indirimbo Zo Guhimbaza Imana) group
 */
export function getKinCanonicalGroup(number: number): string {
  if (number >= 1 && number <= 50) return 'Gusingiza no Kuramya Imana (Praise & Adoration)';
  if (number >= 51 && number <= 110) return 'Yesu Umukiza (Jesus the Savior)';
  if (number >= 111 && number <= 180) return 'Agakiza n\'Imbabazi (Salvation & Grace)';
  if (number >= 181 && number <= 230) return 'Umunsi w\'Isabato (The Sabbath Day)';
  if (number >= 231 && number <= 300) return 'Kugaruka kwa Yesu Kristo (Second Coming)';
  if (number >= 301 && number <= 380) return 'Gusenga no Kwizera (Prayer & Faith)';
  if (number >= 381 && number <= 440) return 'Intambara ya Gikristo (Christian Warfare)';
  if (number >= 441 && number <= 500) return 'Ijuru n\'Isi Nshya (Heaven & The New Earth)';
  return 'Indirimbo zo Guhimbaza Imana';
}

/**
 * Infers hymn category based on text content and keywords if no canonical number mapping exists
 */
export function inferCategoryFromContent(title: string, lyrics?: string): string {
  const combined = `${title} ${lyrics || ''}`.toLowerCase();

  if (combined.includes('sabbath') || combined.includes('sabato') || combined.includes('isabato') || combined.includes('seventh day')) {
    return 'The Holy Sabbath';
  }
  if (
    combined.includes('second coming') ||
    combined.includes('coming again') ||
    combined.includes('he comes') ||
    combined.includes('duogo mar kristo') ||
    combined.includes('kuja kwa yesu') ||
    combined.includes('kugaruka') ||
    combined.includes('trumpet') ||
    combined.includes('advent')
  ) {
    return 'Second Coming of Christ';
  }
  if (
    combined.includes('prayer') ||
    combined.includes('maombi') ||
    combined.includes('lemo') ||
    combined.includes('gusenga') ||
    combined.includes('pray') ||
    combined.includes('communing')
  ) {
    return 'Prayer & Devotion';
  }
  if (
    combined.includes('cross') ||
    combined.includes('msalaba') ||
    combined.includes('mutharaba') ||
    combined.includes('blood') ||
    combined.includes('calvary') ||
    combined.includes('golgotha')
  ) {
    return 'The Cross & Atonement';
  }
  if (
    combined.includes('heaven') ||
    combined.includes('mbinguni') ||
    combined.includes('polo') ||
    combined.includes('ijuru') ||
    combined.includes('new jerusalem') ||
    combined.includes('zion')
  ) {
    return 'Heaven & The New Earth';
  }
  if (
    combined.includes('praise') ||
    combined.includes('sifa') ||
    combined.includes('pwoyo') ||
    combined.includes('gusingiza') ||
    combined.includes('adore') ||
    combined.includes('worship')
  ) {
    return 'Worship & Praise';
  }
  if (
    combined.includes('faith') ||
    combined.includes('trust') ||
    combined.includes('imani') ||
    combined.includes('yie') ||
    combined.includes('kwizera') ||
    combined.includes('believe')
  ) {
    return 'Faith & Trust';
  }
  if (
    combined.includes('grace') ||
    combined.includes('salvation') ||
    combined.includes('wokovu') ||
    combined.includes('resruok') ||
    combined.includes('agakiza') ||
    combined.includes('redeemed')
  ) {
    return 'Salvation & Grace';
  }

  return 'General Hymns & Praise';
}

/**
 * Resolves the canonical, consistent category/group for ANY hymn in the catalog
 */
export function resolveHymnCategory(hymn: Hymn): string {
  // If the hymn already has a clean non-empty category that isn't generic 'All', keep it
  if (hymn.category && hymn.category.trim() && hymn.category !== 'All' && hymn.category !== 'General') {
    return hymn.category.trim();
  }

  const num = hymn.number;
  switch (hymn.collection) {
    case 'SDAH':
    case 'SDAH-EXT':
      return getSdahCanonicalGroup(num);
    case 'NZK':
      return getNzkCanonicalGroup(num);
    case 'WNY':
    case 'DHO':
      return getWnyCanonicalGroup(num);
    case 'OKN':
      return getOknCanonicalGroup(num);
    case 'KIN':
      return getKinCanonicalGroup(num);
    case 'ENG_OLD':
    case 'CIS':
      if (num >= 1 && num <= 40) return 'Adoration & Praise';
      if (num >= 41 && num <= 80) return 'Christ’s Atonement & Love';
      if (num >= 81 && num <= 130) return 'Consecration & Faith';
      if (num >= 131 && num <= 165) return 'The Holy Sabbath & Sanctuary';
      if (num >= 166 && num <= 220) return 'Advent Hope & Prophecy';
      if (num >= 221 && num <= 260) return 'Prayer & Comfort';
      if (num >= 261 && num <= 300) return 'The Better Land & Heaven';
      return 'Historic Advent Hymns';
    default: {
      const firstLine = hymn.stanzas?.[0]?.lines?.[0] || '';
      return inferCategoryFromContent(hymn.title, firstLine);
    }
  }
}
