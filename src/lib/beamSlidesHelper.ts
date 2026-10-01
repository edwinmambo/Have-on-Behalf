import { BeamSlide, Hymn, BibleVerse, EgwParagraph } from '../types';
import { stripChordsFromText } from './chordTransposer';

/**
 * Splits hymn stanzas into clean, autofitted slides for sanctuary beam displays.
 * Follows AdventistHymns.com beaming ergonomics:
 * 1. Intro slide showing Title, Hymn #, Collection, Key, Writer, Tune, Scripture Ref.
 * 2. Stanza slides with top-left "Hymn # · Title", top-right "Verse 1a" / "Refrain".
 * 3. Cleans any bracketed chord notation from lyrics.
 */
/**
 * Helper to compute display counter, badge, and progress for slides according to sanctuary standards:
 * - Start page (Intro) and End page (Amen) are automatic and NOT counted in the slide number.
 * - Stanzas determine the slide count (e.g., 3 stanzas = 3 slides).
 * - Refrains are NOT counted in the total slide number, but their progress is tracked after each stanza.
 */
export function getSlideCounterInfo(
  slide: BeamSlide,
  currentIndex: number,
  totalSlides: number
): {
  counterText: string;
  badgeText: string;
  isCounted: boolean;
  progressPercent: number;
} {
  const stepProgress = totalSlides > 1 ? Math.min(100, Math.round((currentIndex / (totalSlides - 1)) * 100)) : 100;

  if (!slide) {
    return {
      counterText: `${currentIndex + 1} / ${totalSlides}`,
      badgeText: `Slide ${currentIndex + 1}`,
      isCounted: true,
      progressPercent: stepProgress,
    };
  }

  // 1. Automatic Start Page (Intro) - not counted in slide numbers
  if (slide.isIntro) {
    return {
      counterText: 'Start',
      badgeText: 'Start Page',
      isCounted: false,
      progressPercent: 0,
    };
  }

  // 2. Automatic End Page (Amen / Outro) - not counted in slide numbers
  if (slide.isOutro) {
    return {
      counterText: 'End',
      badgeText: 'End Page (Amen)',
      isCounted: false,
      progressPercent: 100,
    };
  }

  // 3. Refrain Slide (Not counted in total slides number, but progress includes it after every stanza)
  if (slide.isRefrain) {
    const totalStanzas = slide.totalStanzas || 1;
    const assocStanza = slide.associatedStanzaNumber || 1;
    return {
      counterText: 'Refrain',
      badgeText: `Refrain · after Stanza ${assocStanza} of ${totalStanzas}`,
      isCounted: false,
      progressPercent: stepProgress,
    };
  }

  // 4. Stanza / Verse Slide - strictly counts stanzas (e.g. 3 stanzas = 3 slides)
  if (slide.stanzaNumber && slide.totalStanzas) {
    return {
      counterText: `Slide ${slide.stanzaNumber} of ${slide.totalStanzas}`,
      badgeText: `Stanza ${slide.stanzaNumber} of ${slide.totalStanzas}`,
      isCounted: true,
      progressPercent: stepProgress,
    };
  }

  // 5. Fallback for Bible or non-hymnal items
  const isCounted = true;
  return {
    counterText: `${currentIndex + 1} of ${totalSlides}`,
    badgeText: slide.verseTag || slide.label || `Slide ${currentIndex + 1}`,
    isCounted,
    progressPercent: stepProgress,
  };
}

/**
 * Splits hymn stanzas into clean, autofitted slides for sanctuary beam displays.
 * Follows AdventistHymns.com beaming ergonomics:
 * 1. Automatic Start page showing Title, Hymn #, Collection, Key, Writer, Tune, Scripture Ref.
 * 2. Stanza slides with top-left "Hymn # · Title", top-right "Verse 1", etc.
 * 3. Interleaved refrains (italicised) following each stanza.
 * 4. Automatic End page ("Amen" concluding slide).
 * 5. Slide counting: Intro, Outro, and Refrains are NOT counted in the total slide number.
 *    If a hymn has 3 stanzas, total slide count is 3.
 */
export function buildHymnBeamSlides(
  hymn: Hymn,
  options: {
    includeIntro?: boolean;
    includeOutro?: boolean;
    splitLongStanzas?: boolean;
    stanzasToInclude?: number[];
    hymnIndexInSession?: number;
    totalHymnsInSession?: number;
  } = {}
): BeamSlide[] {
  const {
    includeIntro = true,
    includeOutro = true,
    splitLongStanzas = false,
    stanzasToInclude,
    hymnIndexInSession,
    totalHymnsInSession,
  } = options;

  const slides: BeamSlide[] = [];
  const refrainStanza = hymn.stanzas.find((s) => s.type === 'refrain' || s.type === 'chorus');
  const sourceLabel = `${hymn.collection === 'SDAH' ? 'Hymn' : hymn.collection} ${hymn.number} · ${hymn.title}`;

  // 1. Automatic Title / Intro Slide
  if (includeIntro) {
    slides.push({
      label: 'Intro',
      verseTag: 'Intro',
      title: hymn.title,
      sourceBadge: sourceLabel,
      lines: [],
      isIntro: true,
      introDetails: {
        hymnNumber: hymn.number,
        collection: hymn.collection,
        title: hymn.title,
        author: hymn.author || 'Sacred Song',
        composer: hymn.composer,
        key: hymn.key || 'Standard Key',
        tune: hymn.tune,
        scriptureReference: hymn.scriptureReference,
      },
      hymnId: hymn.id,
      hymnIndexInSession,
      totalHymnsInSession,
    });
  }

  // Filter stanzas if specified
  const filteredStanzas = hymn.stanzas.filter((s) => {
    if (s.type === 'refrain' || s.type === 'chorus') return true;
    if (stanzasToInclude && stanzasToInclude.length > 0) {
      return stanzasToInclude.includes(s.number);
    }
    return true;
  });

  const verseStanzas = filteredStanzas.filter((s) => s.type === 'verse');
  const totalStanzas = verseStanzas.length > 0 ? verseStanzas.length : 1;
  let verseCounter = 0;

  const cleanLine = (l: string) => {
    let cleaned = stripChordsFromText(l);
    cleaned = cleaned.replace(/^(?:refrain|chorus|korasi|korus)\s*:\s*/i, '');
    cleaned = cleaned.replace(/^(?:refrain|chorus|korasi|korus)\s*/i, '');
    return cleaned.trim();
  };

  filteredStanzas.forEach((stanza) => {
    if (stanza.type === 'verse') {
      verseCounter++;
      // Clean bracket chords for projection and remove empty lines
      const rawLines = stanza.lines.map(cleanLine).filter((l) => l.length > 0);
      if (rawLines.length === 0) return;

      // Autofit: if splitLongStanzas is requested and stanza has 8+ lines
      const wordCount = rawLines.join(' ').split(/\s+/).length;
      if (splitLongStanzas && (rawLines.length >= 8 || wordCount > 48)) {
        const mid = Math.ceil(rawLines.length / 2);
        const firstHalf = rawLines.slice(0, mid);
        const secondHalf = rawLines.slice(mid);

        if (firstHalf.length > 0 && secondHalf.length > 0) {
          slides.push({
            label: `Verse ${stanza.number}a`,
            verseTag: `Verse ${stanza.number}a`,
            title: hymn.title,
            sourceBadge: sourceLabel,
            lines: firstHalf,
            isRefrain: false,
            stanzaNumber: stanza.number,
            totalStanzas,
            hymnId: hymn.id,
            hymnIndexInSession,
            totalHymnsInSession,
          });
          slides.push({
            label: `Verse ${stanza.number}b`,
            verseTag: `Verse ${stanza.number}b`,
            title: hymn.title,
            sourceBadge: sourceLabel,
            lines: secondHalf,
            isRefrain: false,
            stanzaNumber: stanza.number,
            totalStanzas,
            hymnId: hymn.id,
            hymnIndexInSession,
            totalHymnsInSession,
          });
        } else {
          slides.push({
            label: `Verse ${stanza.number}`,
            verseTag: `Verse ${stanza.number}`,
            title: hymn.title,
            sourceBadge: sourceLabel,
            lines: rawLines,
            isRefrain: false,
            stanzaNumber: stanza.number,
            totalStanzas,
            hymnId: hymn.id,
            hymnIndexInSession,
            totalHymnsInSession,
          });
        }
      } else {
        slides.push({
          label: `Verse ${stanza.number}`,
          verseTag: `Verse ${stanza.number}`,
          title: hymn.title,
          sourceBadge: sourceLabel,
          lines: rawLines,
          isRefrain: false,
          stanzaNumber: stanza.number,
          totalStanzas,
          hymnId: hymn.id,
          hymnIndexInSession,
          totalHymnsInSession,
        });
      }

      // Interleave Refrain after verse (if refrain exists)
      if (refrainStanza && verseCounter <= totalStanzas) {
        const cleanRefrainLines = refrainStanza.lines.map(cleanLine).filter((l) => l.length > 0);
        if (cleanRefrainLines.length > 0) {
          slides.push({
            label: 'Refrain',
            verseTag: 'Refrain',
            title: hymn.title,
            sourceBadge: sourceLabel,
            lines: cleanRefrainLines,
            isRefrain: true,
            associatedStanzaNumber: stanza.number,
            totalStanzas,
            hymnId: hymn.id,
            hymnIndexInSession,
            totalHymnsInSession,
          });
        }
      }
    } else if (stanza.type === 'refrain' && !refrainStanza) {
      const cleanLines = stanza.lines.map(cleanLine).filter((l) => l.length > 0);
      if (cleanLines.length > 0) {
        slides.push({
          label: 'Refrain',
          verseTag: 'Refrain',
          title: hymn.title,
          sourceBadge: sourceLabel,
          lines: cleanLines,
          isRefrain: true,
          associatedStanzaNumber: verseCounter || 1,
          totalStanzas,
          hymnId: hymn.id,
          hymnIndexInSession,
          totalHymnsInSession,
        });
      }
    }
  });

  // Automatic End Page (Amen / Outro)
  if (includeOutro) {
    slides.push({
      label: 'Amen',
      verseTag: 'Amen',
      title: hymn.title,
      sourceBadge: sourceLabel,
      lines: ['Amen'],
      isOutro: true,
      hymnId: hymn.id,
      hymnIndexInSession,
      totalHymnsInSession,
    });
  }

  // Stamp slide index counts for progress tracking, filtering out any empty slides
  const filteredSlides = slides.filter(
    (s) => s.isIntro || s.isOutro || (s.lines && s.lines.some((l) => l.trim().length > 0))
  );

  const totalSlides = filteredSlides.length;
  filteredSlides.forEach((s, idx) => {
    s.hymnSlideIndex = idx;
    s.totalHymnSlides = totalSlides;
  });

  return filteredSlides;
}

/**
 * Splits multiple Bible verses into readable slides.
 * If 1 verse is short, it fits 1 slide.
 * If multiple verses are chosen or a verse is long, it breaks cleanly on sentence boundaries.
 */
export function buildBibleBeamSlides(verses: BibleVerse[], version: string): BeamSlide[] {
  if (verses.length === 0) return [];

  const slides: BeamSlide[] = [];
  const book = verses[0].book;
  const chapter = verses[0].chapter;
  const startVerse = verses[0].verse;
  const endVerse = verses[verses.length - 1].verse;
  const refRange =
    startVerse === endVerse
      ? `${book} ${chapter}:${startVerse}`
      : `${book} ${chapter}:${startVerse}-${endVerse}`;

  // Group verses in chunks of 1 to 2 verses (or <= 45 words per slide)
  let currentLines: string[] = [];
  let currentWordCount = 0;
  let currentStart = verses[0].verse;
  let currentEnd = verses[0].verse;

  verses.forEach((v) => {
    const verseWords = v.text.split(/\s+/).length;
    // If verse alone is very long (> 50 words), split on sentence boundaries
    if (verseWords > 45) {
      // Flush previous
      if (currentLines.length > 0) {
        slides.push({
          label: `${book} ${chapter}:${currentStart}${currentStart !== currentEnd ? `-${currentEnd}` : ''}`,
          verseTag: `v. ${currentStart}${currentStart !== currentEnd ? `-${currentEnd}` : ''}`,
          title: `${book} ${chapter}`,
          sourceBadge: `${refRange} (${version})`,
          lines: currentLines,
        });
        currentLines = [];
        currentWordCount = 0;
      }

      const sentences = v.text.match(/[^.!?]+[.!?]+/g) || [v.text];
      sentences.forEach((sentence, sIdx) => {
        slides.push({
          label: `${book} ${chapter}:${v.verse} (${sIdx + 1}/${sentences.length})`,
          verseTag: `v. ${v.verse}`,
          title: `${book} ${chapter}`,
          sourceBadge: `${book} ${chapter}:${v.verse} (${version})`,
          lines: [`[${v.verse}] ${sentence.trim()}`],
        });
      });
      return;
    }

    if (currentWordCount + verseWords > 48 && currentLines.length > 0) {
      // Flush current slide
      slides.push({
        label: `${book} ${chapter}:${currentStart}${currentStart !== currentEnd ? `-${currentEnd}` : ''}`,
        verseTag: `v. ${currentStart}${currentStart !== currentEnd ? `-${currentEnd}` : ''}`,
        title: `${book} ${chapter}`,
        sourceBadge: `${refRange} (${version})`,
        lines: currentLines,
      });
      currentLines = [];
      currentWordCount = 0;
      currentStart = v.verse;
    }

    currentLines.push(`${v.verse}. ${v.text}`);
    currentWordCount += verseWords;
    currentEnd = v.verse;
  });

  if (currentLines.length > 0) {
    slides.push({
      label: `${book} ${chapter}:${currentStart}${currentStart !== currentEnd ? `-${currentEnd}` : ''}`,
      verseTag: `v. ${currentStart}${currentStart !== currentEnd ? `-${currentEnd}` : ''}`,
      title: `${book} ${chapter}`,
      sourceBadge: `${refRange} (${version})`,
      lines: currentLines,
    });
  }

  const total = slides.length;
  slides.forEach((s, idx) => {
    s.hymnSlideIndex = idx;
    s.totalHymnSlides = total;
  });

  return slides;
}

/**
 * Splits EGW paragraphs into presentation-ready slides on sentence boundaries.
 */
export function buildEgwBeamSlides(paragraphs: EgwParagraph[], bookTitle: string): BeamSlide[] {
  const slides: BeamSlide[] = [];

  paragraphs.forEach((p) => {
    const sentences = p.text.match(/[^.!?]+[.!?]+|\S.*$/g) || [p.text];
    let chunk: string[] = [];
    let wordCount = 0;
    let partIndex = 1;

    sentences.forEach((sentence) => {
      const clean = sentence.trim();
      if (!clean) return;
      const count = clean.split(/\s+/).length;

      if (wordCount + count > 42 && chunk.length > 0) {
        slides.push({
          label: `${p.reference} (Part ${partIndex})`,
          verseTag: `${p.reference}`,
          title: p.chapterTitle,
          sourceBadge: `${bookTitle} • ${p.reference}`,
          lines: [chunk.join(' ')],
        });
        chunk = [clean];
        wordCount = count;
        partIndex++;
      } else {
        chunk.push(clean);
        wordCount += count;
      }
    });

    if (chunk.length > 0) {
      slides.push({
        label: partIndex > 1 ? `${p.reference} (Part ${partIndex})` : p.reference,
        verseTag: p.reference,
        title: p.chapterTitle,
        sourceBadge: `${bookTitle} • ${p.reference}`,
        lines: [chunk.join(' ')],
      });
    }
  });

  const total = slides.length;
  slides.forEach((s, idx) => {
    s.hymnSlideIndex = idx;
    s.totalHymnSlides = total;
  });

  return slides;
}
