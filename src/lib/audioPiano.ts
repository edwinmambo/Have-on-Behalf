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

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Plays an acoustic piano tone with natural envelope (strike transient, fundamental, and upper harmonics)
 */
export function playPianoPitchTone(
  keyName?: string,
  transposeSemiTones: number = 0,
  durationSec: number = 2.4
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const fundamentalFreq = getFrequencyForKey(keyName, transposeSemiTones);
      const now = ctx.currentTime;

      // Master output gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.4, now + 0.02); // quick hammer strike
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
      masterGain.connect(ctx.destination);

      // Acoustic Piano Harmonics (Fundamental, 2nd, 3rd, 4th, 5th partials)
      const harmonics = [
        { mult: 1, gain: 0.65 },
        { mult: 2, gain: 0.25 },
        { mult: 3, gain: 0.12 },
        { mult: 4, gain: 0.06 },
        { mult: 5, gain: 0.03 },
      ];

      harmonics.forEach(({ mult, gain: harmonicGainRatio }) => {
        const osc = ctx.createOscillator();
        const hGain = ctx.createGain();

        osc.type = mult === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(fundamentalFreq * mult, now);

        hGain.gain.setValueAtTime(harmonicGainRatio, now);
        // High harmonics decay faster like real felt hammers on steel strings
        const decayTime = durationSec / Math.sqrt(mult);
        hGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

        osc.connect(hGain);
        hGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + durationSec + 0.1);
      });

      // Hammer strike body noise pulse (gentle wood/felt thud)
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      setTimeout(() => {
        resolve();
      }, durationSec * 1000);
    } catch (e) {
      console.warn('Audio play failed or permission denied:', e);
      resolve();
    }
  });
}
