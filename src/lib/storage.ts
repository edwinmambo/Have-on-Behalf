import { FavoriteItem, FavoriteType, WorshipPlanSession, BeamFont, BeamTheme, RecentBeamItem, HymnFeedbackItem } from '../types';

const FAVORITES_KEY = 'haveonbehalf_favorites_v1';
const SETTINGS_KEY = 'haveonbehalf_settings_v1';
const PLANS_KEY = 'haveonbehalf_worship_plans_v1';
const USER_KEY = 'haveonbehalf_user_profile_v1';
const HYMN_NOTES_KEY = 'haveonbehalf_hymn_notes_v1';
const RECENT_BEAMS_KEY = 'haveonbehalf_recent_beams_v1';
const PINNED_HYMNS_KEY = 'haveonbehalf_pinned_hymns_v1';
const HYMN_FEEDBACK_KEY = 'haveonbehalf_hymn_feedback_v1';

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
  appZoom?: number; // 75 to 200 (percentage, defaults to 100)
  fullWidthLayout?: boolean; // true = edge-to-edge layout on laptops & standalone window
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
  appZoom: 100,
  fullWidthLayout: true,
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
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      appZoom: typeof parsed.appZoom === 'number' && parsed.appZoom >= 50 && parsed.appZoom <= 250 ? parsed.appZoom : DEFAULT_SETTINGS.appZoom,
      fullWidthLayout: typeof parsed.fullWidthLayout === 'boolean' ? parsed.fullWidthLayout : DEFAULT_SETTINGS.fullWidthLayout,
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(partial: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haveonbehalf_settings_changed', { detail: updated }));
    }
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

// ----------------------------------------------------
// Pinned Favourite Hymns (Displayed First in Catalog)
// ----------------------------------------------------
export function getPinnedHymnIds(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_HYMNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isHymnPinned(hymnId: string): boolean {
  return getPinnedHymnIds().includes(hymnId);
}

export function togglePinHymn(hymnId: string): boolean {
  try {
    const current = getPinnedHymnIds();
    const isPinned = current.includes(hymnId);
    let updated: string[];
    if (isPinned) {
      updated = current.filter((id) => id !== hymnId);
    } else {
      updated = [hymnId, ...current];
    }
    localStorage.setItem(PINNED_HYMNS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('haveonbehalf_pinned_changed', { detail: { hymnId, isPinned: !isPinned } }));
    return !isPinned;
  } catch (e) {
    console.error('Failed to toggle pinned hymn', e);
    return false;
  }
}

// ----------------------------------------------------
// Hymn Testing Feedback
// ----------------------------------------------------
export function getAllHymnFeedback(): HymnFeedbackItem[] {
  try {
    const raw = localStorage.getItem(HYMN_FEEDBACK_KEY);
    if (!raw) {
      const initialFeedback: HymnFeedbackItem[] = [
        {
          id: 'fb_init_1',
          hymnId: 'sdah-159',
          hymnNumber: 159,
          collection: 'SDAH',
          title: 'The Old Rugged Cross',
          category: 'tune_meter',
          stanzaReference: 'Refrain',
          comment: 'Pitch synthesizer plays nicely in Bb. Please verify if the choral tempo should be slightly slower for sanctuary divine service.',
          testerName: 'Bro. David (Chorister)',
          createdAt: Date.now() - 1000 * 60 * 60 * 4,
        },
        {
          id: 'fb_init_2',
          hymnId: 'nzk-46',
          hymnNumber: 46,
          collection: 'NZK',
          title: 'Msalabani Pa Mwokozi',
          category: 'translation',
          stanzaReference: 'Stanza 2',
          comment: 'Cross-reference with SDAH #159 matches perfectly! Swahili stanzas flow smoothly on the continuous beam screen.',
          testerName: 'Sister Grace (Karatina SDA)',
          createdAt: Date.now() - 1000 * 60 * 60 * 20,
        },
        {
          id: 'fb_init_3',
          hymnId: 'nca-52',
          hymnNumber: 52,
          collection: 'NCA',
          title: 'Mũtharaba-inĩ Wa Mwathani',
          category: 'typo',
          stanzaReference: 'Stanza 1, Line 3',
          comment: 'Please check Gĩkũyũ orthography tilde on "harĩa". The mobile APK renders high contrast on tablet.',
          testerName: 'Elder Kuria',
          createdAt: Date.now() - 1000 * 60 * 60 * 36,
        },
      ];
      localStorage.setItem(HYMN_FEEDBACK_KEY, JSON.stringify(initialFeedback));
      return initialFeedback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function getFeedbackForHymn(hymnId: string): HymnFeedbackItem[] {
  return getAllHymnFeedback().filter((item) => item.hymnId === hymnId);
}

export function saveHymnFeedback(item: Omit<HymnFeedbackItem, 'id' | 'createdAt'>): HymnFeedbackItem {
  const all = getAllHymnFeedback();
  const newItem: HymnFeedbackItem = {
    ...item,
    id: `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  all.unshift(newItem);
  try {
    localStorage.setItem(HYMN_FEEDBACK_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save hymn feedback', e);
  }
  return newItem;
}

export function deleteHymnFeedback(id: string): void {
  const all = getAllHymnFeedback().filter((item) => item.id !== id);
  try {
    localStorage.setItem(HYMN_FEEDBACK_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to delete hymn feedback', e);
  }
}



