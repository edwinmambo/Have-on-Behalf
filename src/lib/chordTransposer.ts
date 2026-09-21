/**
 * Real-time Musical Chord Transposition Engine
 * Supports major, minor, dominant 7ths, diminished, augmented, sus, add, and slash chords (e.g. D/F#, G/B).
 */

const CHROMATIC_SCALE_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_SCALE_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Key preference for sharps vs flats
const PREFERS_FLATS_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];

/**
 * Transposes a single note root (e.g. "Bb", "C#", "F") by given semitones
 */
export function transposeNote(note: string, semiTones: number, preferFlats?: boolean): string {
  if (semiTones === 0) return note;

  const cleanNote = note.trim();
  let index = CHROMATIC_SCALE_SHARPS.indexOf(cleanNote);
  if (index === -1) {
    index = CHROMATIC_SCALE_FLATS.indexOf(cleanNote);
  }
  if (index === -1) return note;

  let newIndex = (index + semiTones) % 12;
  if (newIndex < 0) newIndex += 12;

  // Decide if we output sharp or flat
  const useFlat = preferFlats ?? (cleanNote.includes('b') || cleanNote === 'F');
  return useFlat ? CHROMATIC_SCALE_FLATS[newIndex] : CHROMATIC_SCALE_SHARPS[newIndex];
}

/**
 * Transposes a chord symbol (e.g. "Bb", "Gm7", "Eb/G", "C#m7b5", "Dsus4")
 */
export function transposeChord(chord: string, semiTones: number, preferFlats?: boolean): string {
  if (semiTones === 0 || !chord.trim()) return chord;

  // Regex to match root note + accidental, chord quality, and optional slash bass note
  // e.g. "F#m7/A#" => root: F#, quality: m7, bass: A#
  const match = chord.trim().match(/^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/);
  if (!match) return chord;

  const root = match[1];
  const quality = match[2] || '';
  const slashBass = match[4];

  const transposedRoot = transposeNote(root, semiTones, preferFlats);
  const transposedBass = slashBass ? `/${transposeNote(slashBass, semiTones, preferFlats)}` : '';

  return `${transposedRoot}${quality}${transposedBass}`;
}

/**
 * Checks if a string contains bracketed chord notation (e.g. "[G] Amazing [C]grace")
 */
export function hasBracketChords(text: string): boolean {
  return /\[[A-G][b#]?[^\]]*\]/.test(text);
}

/**
 * Transposes all bracketed chords in a line of text:
 * "[Bb] On a hill far a[Eb]way" -> "[B] On a hill far a[E]way"
 */
export function transposeBracketChords(text: string, semiTones: number, preferFlats?: boolean): string {
  if (semiTones === 0) return text;
  return text.replace(/\[([A-G][b#]?[^\]]*)\]/g, (_, chord) => {
    return `[${transposeChord(chord, semiTones, preferFlats)}]`;
  });
}

/**
 * Strips bracketed chords to get raw lyric text
 */
export function stripChordsFromText(text: string): string {
  return text.replace(/\[[^\]]+\]/g, '').replace(/\s{2,}/g, ' ');
}

export interface LyricChordSegment {
  chord?: string;
  lyric: string;
}

/**
 * Parses a line containing bracketed chords into segments with chord aligned above lyric
 */
export function parseLyricChordSegments(line: string, semiTones: number = 0): LyricChordSegment[] {
  if (!hasBracketChords(line)) {
    return [{ lyric: line }];
  }

  const segments: LyricChordSegment[] = [];
  const regex = /\[([A-G][b#]?[^\]]*)\]([^\[]*)/g;
  let match: RegExpExecArray | null;

  // Catch any lyric before the first chord
  const firstBracket = line.indexOf('[');
  if (firstBracket > 0) {
    segments.push({ lyric: line.slice(0, firstBracket) });
  }

  while ((match = regex.exec(line)) !== null) {
    const rawChord = match[1];
    const lyric = match[2];
    segments.push({
      chord: transposeChord(rawChord, semiTones),
      lyric: lyric,
    });
  }

  return segments;
}
