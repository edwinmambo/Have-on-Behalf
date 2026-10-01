/**
 * Web Audio Piano Synthesizer for Authentic Pitch Tones and Transposition
 * Uses multi-harmonic additive synthesis with natural hammer attack and acoustic decay.
 */

// Note to standard MIDI pitch
const NOTE_BASE_MAP: Record<string, number> = {
  C: 60,
  'C#': 61,
  Db: 61,
  D: 62,
  'D#': 63,
  Eb: 63,
  E: 64,
  F: 65,
  'F#': 66,
  Gb: 66,
  G: 67,
  'G#': 68,
  Ab: 68,
  A: 69, // 440 Hz
  'A#': 70,
  Bb: 70,
  B: 71,
};

export const COMMON_KEYS = [
  'C Major',
  'Db Major',
  'D Major',
  'Eb Major',
  'E Major',
  'F Major',
  'F# Major',
  'G Major',
  'Ab Major',
  'A Major',
  'Bb Major',
  'B Major',
];

/**
 * Parse key string (e.g. "D Major", "Eb", "F") to pitch frequency
 */
export function getFrequencyForKey(keyName?: string, transposeOffsetSemiTones: number = 0): number {
  if (!keyName) return 440; // Default A4
  const match = keyName.trim().match(/^([A-G][b#]?)/i);
  if (!match) return 440;

  const root = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  const midiBase = NOTE_BASE_MAP[root] || 60;
  const targetMidi = midiBase + transposeOffsetSemiTones;

  // Convert MIDI note number to Hz: f = 440 * 2^((d - 69)/12)
  return 440 * Math.pow(2, (targetMidi - 69) / 12);
}

/**
 * Transpose a key name by semi-tones
 */
export function transposeKeyName(originalKey: string | undefined, semiTones: number): string {
  if (!originalKey) return 'Standard Key';
  if (semiTones === 0) return originalKey;

  const match = originalKey.trim().match(/^([A-G][b#]?)(.*)/i);
  if (!match) return originalKey;

  const root = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  const suffix = match[2] || '';

  const scale = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  let currentIdx = scale.indexOf(root);
  if (currentIdx === -1) {
    // try sharp equivalents
    const sharpScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    currentIdx = sharpScale.indexOf(root);
  }
  if (currentIdx === -1) return originalKey;

  let newIdx = (currentIdx + semiTones) % 12;
  if (newIdx < 0) newIdx += 12;

  return `${scale[newIdx]}${suffix}`;
}

export interface KeySignatureInfo {
  keyName: string;
  root: string;
  isMinor: boolean;
  type: 'sharps' | 'flats' | 'natural';
  count: number;
  symbol: string; // e.g. "3♭", "2♯", "♮"
  accidentalsSummary: string; // e.g. "3 Flats (B♭, E♭, A♭)"
  accidentalsList: string[]; // e.g. ["B♭", "E♭", "A♭"]
}

const SHARPS_ORDER = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'];
const FLATS_ORDER = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'];

const MAJOR_KEY_SIGNATURES: Record<string, { type: 'sharps' | 'flats' | 'natural'; count: number }> = {
  C: { type: 'natural', count: 0 },
  G: { type: 'sharps', count: 1 },
  D: { type: 'sharps', count: 2 },
  A: { type: 'sharps', count: 3 },
  E: { type: 'sharps', count: 4 },
  B: { type: 'sharps', count: 5 },
  'F#': { type: 'sharps', count: 6 },
  'C#': { type: 'sharps', count: 7 },
  F: { type: 'flats', count: 1 },
  Bb: { type: 'flats', count: 2 },
  Eb: { type: 'flats', count: 3 },
  Ab: { type: 'flats', count: 4 },
  Db: { type: 'flats', count: 5 },
  Gb: { type: 'flats', count: 6 },
  Cb: { type: 'flats', count: 7 },
};

const MINOR_KEY_SIGNATURES: Record<string, { type: 'sharps' | 'flats' | 'natural'; count: number }> = {
  A: { type: 'natural', count: 0 },
  E: { type: 'sharps', count: 1 },
  B: { type: 'sharps', count: 2 },
  'F#': { type: 'sharps', count: 3 },
  'C#': { type: 'sharps', count: 4 },
  'G#': { type: 'sharps', count: 5 },
  'D#': { type: 'sharps', count: 6 },
  D: { type: 'flats', count: 1 },
  G: { type: 'flats', count: 2 },
  C: { type: 'flats', count: 3 },
  F: { type: 'flats', count: 4 },
  Bb: { type: 'flats', count: 5 },
  Eb: { type: 'flats', count: 6 },
  Ab: { type: 'flats', count: 7 },
};

export function getKeySignatureInfo(keyName?: string, transposeOffsetSemiTones: number = 0): KeySignatureInfo {
  const effective = transposeKeyName(keyName, transposeOffsetSemiTones);
  if (!keyName || !keyName.trim()) {
    return {
      keyName: 'C Major',
      root: 'C',
      isMinor: false,
      type: 'natural',
      count: 0,
      symbol: '♮',
      accidentalsSummary: 'Natural (0 ♯/♭)',
      accidentalsList: [],
    };
  }

  const match = effective.trim().match(/^([A-G][b#]?)(.*)/i);
  if (!match) {
    return {
      keyName: effective,
      root: 'C',
      isMinor: false,
      type: 'natural',
      count: 0,
      symbol: '♮',
      accidentalsSummary: 'Natural (0 ♯/♭)',
      accidentalsList: [],
    };
  }

  let root = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  const rest = match[2].trim().toLowerCase();
  const isMinor = rest.includes('m') && !rest.includes('maj');

  const sigMap = isMinor ? MINOR_KEY_SIGNATURES : MAJOR_KEY_SIGNATURES;
  let info = sigMap[root];

  // Handle enharmonic roots if not directly matched
  if (!info) {
    const enharmonics: Record<string, string> = {
      'A#': 'Bb',
      'D#': 'Eb',
      'G#': 'Ab',
      Gb: 'F#',
      Db: 'C#',
    };
    const alt = enharmonics[root];
    if (alt && sigMap[alt]) {
      info = sigMap[alt];
      root = alt;
    }
  }

  if (!info || info.count === 0) {
    return {
      keyName: effective,
      root,
      isMinor,
      type: 'natural',
      count: 0,
      symbol: '♮',
      accidentalsSummary: 'Natural (no ♯/♭)',
      accidentalsList: [],
    };
  }

  const list =
    info.type === 'sharps'
      ? SHARPS_ORDER.slice(0, info.count)
      : FLATS_ORDER.slice(0, info.count);

  const symbol = info.type === 'sharps' ? `${info.count}♯` : `${info.count}♭`;
  const typeLabel = info.type === 'sharps' ? (info.count === 1 ? 'Sharp' : 'Sharps') : (info.count === 1 ? 'Flat' : 'Flats');
  const accidentalsSummary = `${info.count} ${typeLabel} (${list.join(', ')})`;

  return {
    keyName: effective,
    root,
    isMinor,
    type: info.type,
    count: info.count,
    symbol,
    accidentalsSummary,
    accidentalsList: list,
  };
}

let sharedAudioCtx: AudioContext | null = null;

async function getAudioContext(): Promise<AudioContext> {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    await sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Plays an acoustic piano tone with natural envelope (strike transient, fundamental, and upper harmonics)
 */
export async function playPianoPitchTone(
  keyName?: string,
  transposeSemiTones: number = 0,
  durationSec: number = 2.4
): Promise<void> {
  try {
    const ctx = await getAudioContext();
    const fundamentalFreq = getFrequencyForKey(keyName, transposeSemiTones);
    const now = ctx.currentTime;

    // Master output gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.45, now + 0.02); // quick hammer strike
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    masterGain.connect(ctx.destination);

    // Acoustic Piano Harmonics (Fundamental, 2nd, 3rd, 4th, 5th partials)
    const harmonics = [
      { mult: 1, gain: 0.7 },
      { mult: 2, gain: 0.28 },
      { mult: 3, gain: 0.14 },
      { mult: 4, gain: 0.07 },
      { mult: 5, gain: 0.03 },
    ];

    harmonics.forEach(({ mult, gain: harmonicGainRatio }) => {
      const osc = ctx.createOscillator();
      const hGain = ctx.createGain();

      osc.type = mult === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(fundamentalFreq * mult, now);

      hGain.gain.setValueAtTime(harmonicGainRatio, now);
      const decayTime = durationSec / Math.sqrt(mult);
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

      osc.connect(hGain);
      hGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + durationSec + 0.1);
    });

    // Felt hammer transient
    const bufferSize = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, now);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    return new Promise((resolve) => {
      setTimeout(resolve, durationSec * 1000);
    });
  } catch (e) {
    console.warn('Audio play failed or permission denied:', e);
  }
}
