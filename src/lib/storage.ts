import { FavoriteItem, FavoriteType, WorshipPlanSession, BeamFont, BeamTheme, RecentBeamItem } from '../types';

const FAVORITES_KEY = 'haveonbehalf_favorites_v1';
const SETTINGS_KEY = 'haveonbehalf_settings_v1';
const PLANS_KEY = 'haveonbehalf_worship_plans_v1';
const USER_KEY = 'haveonbehalf_user_profile_v1';
const HYMN_NOTES_KEY = 'haveonbehalf_hymn_notes_v1';
const RECENT_BEAMS_KEY = 'haveonbehalf_recent_beams_v1';

export type AppThemeMode = 'system' | 'light' | 'dark';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  syncedAt?: number;
}

export type AccentTheme = 'sapphire' | 'emerald' | 'gold' | 'amethyst' | 'crimson';

export interface UserSettings {
  appTheme: AppThemeMode;
  accentTheme?: AccentTheme;
  redLetterEnabled: boolean;
  selectedBibleVersion: string;
  selectedHymnal: string;
  beamTheme: BeamTheme;
  beamFont: BeamFont;
  readerFont: 'serif' | 'sans';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  offlineDownloaded: boolean;
  splitStanzasOnBeam: boolean;
  beamMinimalMode: boolean; // Clean AdventistHymns presentation without on-screen buttons
  showBeamControls: boolean; // Show or hide on-screen buttons (Black, Clear, Theme, Font)
  showChordsInHymnal: boolean; // Display chords above lyrics
  readerFontSizePx?: number; // 14 to 28 px for reading mode
  readerLineHeight?: number; // 1.2 to 2.4 line spacing for reading mode
}

const DEFAULT_SETTINGS: UserSettings = {
  appTheme: 'dark',
  accentTheme: 'sapphire',
  redLetterEnabled: true,
  selectedBibleVersion: 'KJV',
  selectedHymnal: 'SDAH',
  beamTheme: 'sanctuary-blue',
  beamFont: 'cinzel',
  readerFont: 'serif',
  fontSize: 'md',
  offlineDownloaded: true,
  splitStanzasOnBeam: true,
  beamMinimalMode: true,
  showBeamControls: false,
  showChordsInHymnal: true,
  readerFontSizePx: 18,
  readerLineHeight: 1.75,
};

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

export function saveFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt'>): FavoriteItem {
  const favorites = getFavorites();
  const existing = favorites.find(
    (f) => f.type === item.type && f.reference === item.reference
  );

  if (existing) {
    return existing;
  }

  const newItem: FavoriteItem = {
    ...item,
    id: `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };

  favorites.unshift(newItem);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorite', e);
  }
  return newItem;
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter((f) => f.id !== id);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to remove favorite', e);
  }
}

export function isItemFavorited(type: FavoriteType, reference: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.type === type && f.reference === reference);
}

export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(partial: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
  return updated;
}

// ----------------------------------------------------
// Worship Plan Sessions Persistence (Vespers & Services)
// ----------------------------------------------------
export function getWorshipPlans(): WorshipPlanSession[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) {
      // Seed an initial rich sample Vespers plan
      const defaultPlan: WorshipPlanSession = {
        id: 'plan-vespers-welcome',
        title: 'Friday Vespers — "Songs of the Heart"',
        date: new Date().toISOString().slice(0, 10),
        leaderName: 'Chorister Ministry',
        description: 'Vespers song service opening Sabbath sacred hours with songs of adoration and prayer.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [
          {
            id: 'item-1',
            hymnId: 'sdah-478',
            collection: 'SDAH',
            number: 478,
            title: 'Sweet Hour of Prayer',
            key: 'D Major',
            notes: 'Opening prayer song. Begin softly, Verse 1 and 3.',
            stanzasToSing: [1, 3],
            transposedKey: 'D Major',
            transposeSemiTones: 0,
          },
          {
            id: 'item-2',
            hymnId: 'sdah-1',
            collection: 'SDAH',
            number: 1,
            title: 'Praise to the Lord',
            key: 'G Major',
            notes: 'Congregational praise hymn; all verses.',
            transposedKey: 'G Major',
            transposeSemiTones: 0,
          },
          {
            id: 'item-3',
            hymnId: 'nzk-88',
            collection: 'NZK',
            number: 88,
            title: 'Saa Heri ya Maombi',
            key: 'D Major',
            notes: 'Swahili fellowship response.',
            transposedKey: 'Eb Major',
            transposeSemiTones: 1,
          },
          {
            id: 'item-4',
            hymnId: 'sdah-100',
            collection: 'SDAH',
            number: 100,
            title: 'Great Is Thy Faithfulness',
            key: 'Eb Major',
            notes: 'Closing consecration hymn.',
            transposedKey: 'Eb Major',
            transposeSemiTones: 0,
          },
        ],
      };
      localStorage.setItem(PLANS_KEY, JSON.stringify([defaultPlan]));
      return [defaultPlan];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load worship plans', e);
    return [];
  }
}

export function saveWorshipPlan(session: WorshipPlanSession): void {
  const plans = getWorshipPlans();
  const existingIdx = plans.findIndex((p) => p.id === session.id);
  if (existingIdx !== -1) {
    plans[existingIdx] = { ...session, updatedAt: Date.now() };
  } else {
    plans.unshift({ ...session, createdAt: Date.now(), updatedAt: Date.now() });
  }
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save worship plan', e);
  }
}

export function deleteWorshipPlan(id: string): void {
  const plans = getWorshipPlans().filter((p) => p.id !== id);
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to delete worship plan', e);
  }
}

// ----------------------------------------------------
// User Account Profile & Cross-Device Cloud Sync Simulation
// ----------------------------------------------------
export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    uid: 'local-guest',
    email: '',
    displayName: 'Guest Chorister',
    isLoggedIn: false,
  };
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

// ----------------------------------------------------
// Private Personal Hymn Notes (Chorister & Devotional)
// ----------------------------------------------------
export function getAllHymnNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(HYMN_NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getHymnNote(hymnId: string): string {
  const notes = getAllHymnNotes();
  return notes[hymnId] || '';
}

export function saveHymnNote(hymnId: string, note: string): void {
  const notes = getAllHymnNotes();
  if (note.trim()) {
    notes[hymnId] = note;
  } else {
    delete notes[hymnId];
  }
  try {
    localStorage.setItem(HYMN_NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save hymn note', e);
  }
}

// ----------------------------------------------------
// Recent Projected Items (Beam History for Quick Recall)
// ----------------------------------------------------
export function getRecentBeams(): RecentBeamItem[] {
  try {
    const raw = localStorage.getItem(RECENT_BEAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addRecentBeam(item: Omit<RecentBeamItem, 'timestamp'>): void {
  try {
    const recents = getRecentBeams().filter((r) => r.id !== item.id);
    const newEntry: RecentBeamItem = {
      ...item,
      timestamp: Date.now(),
    };
    recents.unshift(newEntry);
    // Keep max 20 recent presentations
    const trimmed = recents.slice(0, 20);
    localStorage.setItem(RECENT_BEAMS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save recent beam item', e);
  }
}

export function clearRecentBeams(): void {
  try {
    localStorage.removeItem(RECENT_BEAMS_KEY);
  } catch (e) {}
}



