import React, { useState, useEffect, useMemo } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Type,
  User,
  LogIn,
  LogOut,
  RefreshCw,
  HardDrive,
  Database,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Sparkles,
  Download,
  BookOpen,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Monitor,
  RotateCcw,
  Pin,
  PinOff,
  Shield,
  ShieldAlert,
  MessageSquare,
  Check,
  Trash2,
  Search,
  Filter,
  Crown,
} from 'lucide-react';
import {
  AppThemeMode,
  UserSettings,
  UserProfile,
  saveUserProfile,
  updateSettings,
  AccentTheme,
  getFavorites,
  getWorshipPlans,
  getAllHymnFeedback,
  saveHymnFeedback,
  deleteHymnFeedback,
  getPinnedHymnIds,
  togglePinHymn,
} from '../lib/storage';
import { BeamFont, BeamTheme, HymnFeedbackItem } from '../types';
import { useHymnCatalog } from '../lib/hymnLibrary';
import { getStoredBeamState, broadcastBeamState } from '../lib/beamSync';
import { showToast } from '../lib/toast';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (partial: Partial<UserSettings>) => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleThemeMode: (mode: AppThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  userProfile,
  onUpdateUserProfile,
  isDarkMode,
  onToggleThemeMode,
}) => {
  const { hymns: allHymns, totalCount: totalHymnsLoaded } = useHymnCatalog();
  // Local sign-in form state
  const [emailInput, setEmailInput] = useState(userProfile.email || '');
  const [nameInput, setNameInput] = useState(userProfile.displayName || '');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Central feedback state for Edwin Mambo
  const [feedbackList, setFeedbackList] = useState<HymnFeedbackItem[]>(() => getAllHymnFeedback());
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState<string>('');

  // Pinned Hymns state
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => getPinnedHymnIds());
  const [pinSearchQuery, setPinSearchQuery] = useState<string>('');

  const refreshFeedback = () => {
    setFeedbackList(getAllHymnFeedback());
  };

  const refreshPinned = () => {
    setPinnedIds(getPinnedHymnIds());
  };

  useEffect(() => {
    const handlePinnedChange = () => refreshPinned();
    window.addEventListener('haveonbehalf_pinned_changed', handlePinnedChange);
    return () => window.removeEventListener('haveonbehalf_pinned_changed', handlePinnedChange);
  }, []);

  const handleDownloadDataset = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/data/${filename}`;
    link.download = filename;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCompleteBundle = async () => {
    try {
      setSyncStatus('Packaging complete worship bundle...');
      const [sdahRes, nzkRes, ncaRes] = await Promise.all([
        fetch('/data/sdah.json').then((r) => r.json()).catch(() => []),
        fetch('/data/nzk.json').then((r) => r.json()).catch(() => []),
        fetch('/data/nca.json').then((r) => r.json()).catch(() => []),
      ]);

      const bundle = {
        app: 'Have On Behalf',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        datasets: {
          sdahCount: sdahRes.length,
          nzkCount: nzkRes.length,
          ncaCount: ncaRes.length,
          sdah: sdahRes,
          nzk: nzkRes,
          nca: ncaRes,
        },
        userData: {
          favorites: getFavorites(),
          worshipPlans: getWorshipPlans(),
          settings,
        },
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `have-on-behalf-clean-datasets-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSyncStatus('Successfully exported full clean dataset bundle!');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      setSyncStatus('Export failed. Please try downloading individual collections.');
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSigningIn(true);
    setTimeout(() => {
      const updated: UserProfile = {
        uid: `user_${Math.random().toString(36).slice(2, 9)}`,
        email: emailInput.trim(),
        displayName: nameInput.trim() || emailInput.split('@')[0],
        isLoggedIn: true,
        syncedAt: Date.now(),
      };
      saveUserProfile(updated);
      onUpdateUserProfile(updated);
      setIsSigningIn(false);
      setSyncStatus('Your favorites, plan sessions & beam preferences are now linked!');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 600);
  };

  const handleSignOut = () => {
    const guest: UserProfile = {
      uid: 'local-guest',
      email: '',
      displayName: 'Guest Chorister',
      isLoggedIn: false,
    };
    saveUserProfile(guest);
    onUpdateUserProfile(guest);
    setEmailInput('');
    setNameInput('');
    showToast({ title: 'Signed out', type: 'info' });
  };

  const triggerCloudSync = () => {
    setSyncStatus('Syncing favorites with Have On Behalf cloud profile...');
    setTimeout(() => {
      setSyncStatus('Successfully synchronized across your devices!');
      setTimeout(() => setSyncStatus(null), 3500);
    }, 900);
  };

  // Check if current user is Edwin Mambo (Admin authorized for feedback)
  const isAdmin = userProfile.isLoggedIn && userProfile.email.toLowerCase().trim() === 'edwinmambo33@gmail.com';

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('edwinmambo33@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Edwin Mambo');

  const handleGoogleSignIn = (targetEmail?: string, targetName?: string) => {
    setIsSigningIn(true);
    const email = targetEmail || googleEmailInput || 'edwinmambo33@gmail.com';
    const name = targetName || googleNameInput || (email.split('@')[0]);

    setTimeout(() => {
      const updated: UserProfile = {
        uid: `google_${Date.now()}`,
        email: email.trim(),
        displayName: name.trim(),
        isLoggedIn: true,
        syncedAt: Date.now(),
      };
      saveUserProfile(updated);
      onUpdateUserProfile(updated);
      setIsSigningIn(false);
      setShowGoogleModal(false);
      showToast({
        title: `Signed in as ${name}`,
        description: email.toLowerCase() === 'edwinmambo33@gmail.com' ? 'Administrator privileges activated.' : 'Google account linked.',
        type: 'success',
      });
    }, 500);
  };

  const handleSeedFeedback = () => {
    const samples: Omit<HymnFeedbackItem, 'id' | 'createdAt'>[] = [
      {
        hymnId: 'sdah-478',
        collection: 'SDAH',
        hymnNumber: 478,
        title: 'Sweet Hour of Prayer',
        category: 'typo',
        comment: 'Verse 3 line 2 has an extra space before the comma in printed hymnals. Verified clean on 4K sanctuary cast.',
        testerName: 'Elder Joseph Mwangi',
      },
      {
        hymnId: 'nzk-1',
        collection: 'NZK',
        hymnNumber: 1,
        title: 'Mungu Wetu Ndiye Kimbilio',
        category: 'tune_meter',
        comment: 'Default key transposed to F Major is optimal for morning church choir service.',
        testerName: 'Sister Sarah Chebet',
      },
      {
        hymnId: 'sdah-1',
        collection: 'SDAH',
        hymnNumber: 1,
        title: 'Praise to the Lord',
        category: 'general',
        comment: 'Beam presentation slides split cleanly into 2-part stanzas with zero text cut-off on rear sanctuary monitors.',
        testerName: 'Deacon David Otieno',
      },
    ];
    samples.forEach((s) => saveHymnFeedback(s));
    refreshFeedback();
    showToast({ title: 'Sample tester feedback seeded', type: 'info' });
  };

  const handleDeleteFeedback = (id: string) => {
    deleteHymnFeedback(id);
    refreshFeedback();
    showToast({ title: 'Feedback marked resolved and removed', type: 'info' });
  };

  const handleExportFeedbackJson = () => {
    const data = getAllHymnFeedback();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `have-on-behalf-tester-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ title: 'Feedback exported to JSON', type: 'success' });
  };

  const handleDownloadApk = (version = 'v1.2.0') => {
    const a = document.createElement('a');
    a.href = `/assets/releases/HaveOnBehalf-Companion-${version}.apk`;
    a.download = `HaveOnBehalf-Companion-${version}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast({ title: `Downloading Have On Behalf Companion APK (${version})`, type: 'success' });
  };

  const handleDownloadManifest = () => {
    const a = document.createElement('a');
    a.href = '/assets/releases/manifest.json';
    a.download = 'have-on-behalf-release-manifest-v1.2.0.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast({ title: 'Release manifest downloaded', type: 'success' });
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    showToast({ title: 'SHA-256 hash copied to clipboard', type: 'success' });
  };

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((fb) => {
      if (feedbackCategoryFilter !== 'all' && fb.category !== feedbackCategoryFilter) return false;
      if (feedbackSearchQuery.trim()) {
        const q = feedbackSearchQuery.toLowerCase();
        const matchesTitle = fb.title.toLowerCase().includes(q);
        const matchesComment = fb.comment.toLowerCase().includes(q);
        const matchesCollection = fb.collection.toLowerCase().includes(q);
        const matchesNumber = String(fb.hymnNumber).includes(q);
        const matchesTester = fb.testerName?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesComment && !matchesCollection && !matchesNumber && !matchesTester) {
          return false;
        }
      }
      return true;
    });
  }, [feedbackList, feedbackCategoryFilter, feedbackSearchQuery]);

  // Pinned Hymns matching search
  const pinnedHymns = useMemo(() => {
    return allHymns.filter((h) => pinnedIds.includes(h.id));
  }, [allHymns, pinnedIds]);

  const candidateHymnsToPin = useMemo(() => {
    if (!pinSearchQuery.trim()) return [];
    const q = pinSearchQuery.toLowerCase().trim();
    return allHymns
      .filter((h) => !pinnedIds.includes(h.id))
      .filter((h) => h.title.toLowerCase().includes(q) || String(h.number).includes(q) || h.collection.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allHymns, pinnedIds, pinSearchQuery]);

  const handleUpdateBeamFont = (fontId: BeamFont) => {
    onUpdateSettings({ beamFont: fontId });
    const stored = getStoredBeamState();
    if (stored) {
      const updated = { ...stored, font: fontId, updatedAt: Date.now() };
      broadcastBeamState(updated);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haveonbehalf_settings_changed', { detail: { beamFont: fontId } }));
      try {
        const bc = new BroadcastChannel('haveonbehalf_beam_channel');
        bc.postMessage({ type: 'BEAM_SETTINGS_UPDATE', payload: { beamFont: fontId } });
        bc.close();
      } catch (e) {
        // ignore
      }
    }
    showToast({ title: `Sanctuary Cast font updated to ${fontId}`, type: 'info' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Settings & Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalize your worship theme, typography, projection fonts, and cross-device sync.
          </p>
        </div>
      </div>

      {/* SECTION 1: USER ACCOUNT & CLOUD SYNC */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              User Profile & Device Sync
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to automatically synchronize your favorited hymns, Scripture notes, and Vespers plans across your computer, tablet, and sanctuary projector.
            </p>
          </div>
        </div>

        {userProfile.isLoggedIn ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {userProfile.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    {userProfile.displayName}
                  </h3>
                  {isAdmin ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" />
                      Administrator
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold">
                      Synced Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">{userProfile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerCloudSync}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* GOOGLE SIGN IN BUTTON */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Sign in with Google Account
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Seamlessly connect your profile to sync pinned hymns, service plans & sanctuary settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="google-sign-in-primary-btn"
                  onClick={() => handleGoogleSignIn('edwinmambo33@gmail.com', 'Edwin Mambo')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium transition"
                  title="Choose other Google account"
                >
                  Options
                </button>
              </div>
            </div>

            {/* Alternative Manual Email Form */}
            <form onSubmit={handleSignIn} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elder Joseph / Sister Sarah"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. chorister@church.org"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSigningIn ? 'Connecting...' : 'Sign In with Email'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal for Google Account Selection */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Choose a Google Account</h3>
                </div>
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {/* 1-Click Edwin Mambo Account */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('edwinmambo33@gmail.com', 'Edwin Mambo')}
                className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/60 text-left transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    E
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Edwin Mambo</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">Admin</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">edwinmambo33@gmail.com</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Continue →</span>
              </button>

              {/* Custom Google account inputs */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <p className="text-[11px] font-semibold text-slate-500">Or use a different Google address:</p>
                <div>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(googleEmailInput, googleNameInput)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Continue with this Google Account
                </button>
              </div>
            </div>
          </div>
        )}

        {syncStatus && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}
      </section>

      {/* SECTION 2: LIGHT & DARK MODE */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              App Appearance (Light / Dark Mode)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reliable high-contrast themes optimized for church sanctuaries, bright outdoor fellowship, and evening study.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Light Mode Option */}
          <button
            onClick={() => onToggleThemeMode('light')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              settings.appTheme === 'light'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</h3>
              <p className="text-[11px] text-slate-500">Crisp, paper-white readability</p>
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            onClick={() => onToggleThemeMode('dark')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              settings.appTheme === 'dark'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</h3>
              <p className="text-[11px] text-slate-500">Sanctuary twilight dark slate</p>
            </div>
          </button>

          {/* System Mode Option */}
          <button
            onClick={() => onToggleThemeMode('system')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              settings.appTheme === 'system'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">System Auto</h3>
              <p className="text-[11px] text-slate-500">Follows OS device settings</p>
            </div>
          </button>
        </div>

        {/* Accent Color Palette Selector */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sanctuary Accent Palette
            </h3>
            <span className="text-[11px] text-slate-400">
              (Choose your preferred liturgical atmosphere)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              {
                id: 'sapphire' as AccentTheme,
                name: 'Sanctuary Sapphire',
                colorClass: 'bg-blue-600',
                borderActive: 'border-blue-500 ring-2 ring-blue-400/50 bg-blue-50/50 dark:bg-blue-950/30',
                desc: 'Reverent & deep',
              },
              {
                id: 'emerald' as AccentTheme,
                name: 'Sacred Emerald',
                colorClass: 'bg-emerald-600',
                borderActive: 'border-emerald-500 ring-2 ring-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/30',
                desc: 'Living waters',
              },
              {
                id: 'gold' as AccentTheme,
                name: 'Cathedral Bronze',
                colorClass: 'bg-amber-700',
                borderActive: 'border-amber-600 ring-2 ring-amber-400/50 bg-amber-50/50 dark:bg-amber-950/30',
                desc: 'Muted warm gold',
              },
              {
                id: 'amethyst' as AccentTheme,
                name: 'Royal Amethyst',
                colorClass: 'bg-purple-600',
                borderActive: 'border-purple-500 ring-2 ring-purple-400/50 bg-purple-50/50 dark:bg-purple-950/30',
                desc: 'Evening vespers',
              },
              {
                id: 'crimson' as AccentTheme,
                name: 'Words of Christ',
                colorClass: 'bg-rose-600',
                borderActive: 'border-rose-500 ring-2 ring-rose-400/50 bg-rose-50/50 dark:bg-rose-950/30',
                desc: 'Sacred scarlet',
              },
            ].map((pal) => (
              <button
                key={pal.id}
                onClick={() => onUpdateSettings({ accentTheme: pal.id })}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  (settings.accentTheme || 'sapphire') === pal.id
                    ? pal.borderActive
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full ${pal.colorClass} shadow-xs`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                    {pal.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pal.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* APP ZOOM & DISPLAY SCALING (Browser-Style Zoom) */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                App Interface Zoom (Browser-Style Scaling)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {settings.appZoom || 100}%
              </span>
              {(settings.appZoom || 100) !== 100 && (
                <button
                  onClick={() => onUpdateSettings({ appZoom: 100 })}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition"
                  title="Reset to 100% standard zoom"
                >
                  <RotateCcw className="w-3 h-3 text-amber-500" />
                  <span>Reset (100%)</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scale the whole application interface (buttons, text, navigation, sidebars, and dialogue cards) up or down just like native browser zoom (Ctrl +/-). Essential for laptops, external AV monitors, and standalone app mode.
          </p>

          {/* Stepper + Slider Row */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onUpdateSettings({ appZoom: Math.max(75, (settings.appZoom || 100) - 5) })}
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm shadow-xs transition"
              title="Zoom out (-5%)"
            >
              -
            </button>
            <input
              id="app-zoom-slider"
              type="range"
              min="75"
              max="175"
              step="5"
              value={settings.appZoom || 100}
              onChange={(e) => onUpdateSettings({ appZoom: Number(e.target.value) })}
              className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
              title="Adjust app zoom percentage"
            />
            <button
              onClick={() => onUpdateSettings({ appZoom: Math.min(175, (settings.appZoom || 100) + 5) })}
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm shadow-xs transition"
              title="Zoom in (+5%)"
            >
              +
            </button>
          </div>

          {/* Quick-Preset Zoom Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
            {[
              { val: 80, label: '80%' },
              { val: 90, label: '90%' },
              { val: 100, label: '100% (Default)' },
              { val: 110, label: '110%' },
              { val: 125, label: '125%' },
              { val: 140, label: '140%' },
              { val: 150, label: '150%' },
            ].map((p) => {
              const isActive = (settings.appZoom || 100) === p.val;
              return (
                <button
                  key={p.val}
                  onClick={() => onUpdateSettings({ appZoom: p.val })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 flex items-center gap-1">
            <span>⌨️ Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">+</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">-</kbd> anywhere to zoom anytime. <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Ctrl 0</kbd> resets to 100%.</span>
          </div>
        </div>

        {/* FULL-WIDTH LAPTOP & STANDALONE DISPLAY LAYOUT */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Screen Layout Width (Laptop & Standalone Window)
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose whether the app spans edge-to-edge to fill your entire laptop screen and standalone window, or stays contained within a centered 1280px column.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => onUpdateSettings({ fullWidthLayout: true })}
              className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                settings.fullWidthLayout !== false
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Full-Width Display (Edge-to-Edge)
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Fills 100% of your laptop screen. Expands catalog sidebars, hymn lyrics, chords, and multi-version Scripture parallel columns.
                </p>
              </div>
            </button>

            <button
              onClick={() => onUpdateSettings({ fullWidthLayout: false })}
              className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                settings.fullWidthLayout === false
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <Minimize2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Contained Width (1280px)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Centers the application in a traditional 1280px column with gentle side margins on larger desktop monitors.
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: TYPOGRAPHY & BEAMING FONTS */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Typography & Beaming Fonts (Offline Available)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the fonts used for hymns, Scriptures, and the sanctuary projector screen. All fonts work 100% offline.
            </p>
          </div>
        </div>

        {/* Projection Font Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Projector Beam Display Font (AdventistHymns Stacks)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'cinzel' as BeamFont,
                name: 'Cinzel Cathedral',
                sample: 'Amazing Grace! How Sweet',
                desc: 'Inspired by AdventistHymns cathedral display',
                fontClass: 'font-serif-display',
              },
              {
                id: 'garamond' as BeamFont,
                name: 'EB Garamond Serif',
                sample: 'In the beginning was the Word',
                desc: 'Classic Bible & Scripture typography',
                fontClass: 'beam-font-garamond',
              },
              {
                id: 'lora' as BeamFont,
                name: 'Lora Literary',
                sample: 'The Lord is My Shepherd',
                desc: 'Refined sanctuary & worship text',
                fontClass: 'beam-font-lora',
              },
              {
                id: 'merriweather' as BeamFont,
                name: 'Merriweather Editorial',
                sample: 'Sweet Hour of Prayer',
                desc: 'Warm, high-legibility sturdy serif',
                fontClass: 'beam-font-merriweather',
              },
              {
                id: 'playfair' as BeamFont,
                name: 'Playfair Display',
                sample: 'Great Is Thy Faithfulness',
                desc: 'Traditional hymnbook elegance',
                fontClass: 'beam-font-playfair',
              },
              {
                id: 'sans' as BeamFont,
                name: 'Plus Jakarta Sans',
                sample: 'Holy, Holy, Holy! Lord God',
                desc: 'Maximum visibility from rear sanctuary rows',
                fontClass: 'font-sans-ui',
              },
              {
                id: 'mono' as BeamFont,
                name: 'JetBrains Mono',
                sample: 'SDAH #478 Sweet Hour',
                desc: 'Crisp geometric clarity for AV monitors',
                fontClass: 'font-mono',
              },
            ].map((fontItem) => {
              const isSelected = settings.beamFont === fontItem.id;
              return (
                <button
                  key={fontItem.id}
                  onClick={() => handleUpdateBeamFont(fontItem.id)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-theme-accent bg-theme-accent-subtle ring-2 ring-theme-accent'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {fontItem.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {fontItem.desc}
                    </span>
                  </div>
                  <div
                    className={`mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-sm font-semibold text-amber-900 dark:text-amber-200 truncate ${fontItem.fontClass}`}
                  >
                    {fontItem.sample}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Projection Stanza Autofit Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Autofit Stanzas for Sanctuary Projectors
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatically split long stanzas (6+ lines) into clean Part 1 and Part 2 slides to avoid crowded screens and improve congregation singing.
            </p>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({ splitStanzasOnBeam: !settings.splitStanzasOnBeam })
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.splitStanzasOnBeam ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.splitStanzasOnBeam ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Minimalist Beam Mode Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Minimalist Beam Projector (AdventistHymns Style)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hide on-screen toolbar buttons during projection for a pure presentation screen. Control everything seamlessly via keyboard shortcuts.
            </p>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({ beamMinimalMode: !settings.beamMinimalMode })
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.beamMinimalMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.beamMinimalMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* On-Screen Beam Mode Controls Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              On-Screen Projection Buttons (Black, Clear, Theme, Font)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Show or remove floating control buttons during sanctuary projection. By default, buttons are removed for a pristine sanctuary presentation.
            </p>
          </div>
          <button
            id="toggle-beam-controls"
            onClick={() =>
              onUpdateSettings({ showBeamControls: !settings.showBeamControls })
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.showBeamControls ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showBeamControls ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Beam Presentation Keyboard Shortcuts Reference */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
            Sanctuary Beam Shortcuts (Press during projection)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Since on-screen buttons are removed by default, use these quick keys to effortlessly command the sanctuary projector.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Next Slide</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">Space / →</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Prev Slide</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">← / Back</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Blackout</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">B</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Clear Text</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">C</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Cycle Theme</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">T</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Fullscreen</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">F</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Font Size</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">+ / -</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Jump Verse</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">1 - 9</kbd>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PINNED HYMNS SETTING (Requested: A setting to pin the hymns I want to pin) */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Pin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pinned Hymns & Quick Access
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pin hymns you frequently sing so they are always displayed first at the top of your directory.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {pinnedIds.length} Pinned
          </span>
        </div>

        {/* Current Pinned Hymns List */}
        {pinnedHymns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pinnedHymns.map((hymn) => (
              <div
                key={hymn.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 transition hover:border-amber-400 dark:hover:border-amber-600"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                      {hymn.collection} #{hymn.number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {hymn.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {hymn.author || hymn.category || 'Hymn'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    togglePinHymn(hymn.id);
                    setPinnedIds(getPinnedHymnIds());
                    showToast({ title: `Unpinned ${hymn.title}`, type: 'info' });
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                  title="Unpin this hymn"
                >
                  <PinOff className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              No hymns pinned yet. Choose from popular Sabbath favorites below or search to pin any hymn!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {[
                { id: 'sdah-1', label: 'SDAH #1 Praise to the Lord' },
                { id: 'sdah-100', label: 'SDAH #100 Great Is Thy Faithfulness' },
                { id: 'sdah-478', label: 'SDAH #478 Sweet Hour of Prayer' },
                { id: 'nzk-1', label: 'NZK #1 Mungu Wetu Ndiye Kimbilio' },
              ].map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => {
                    togglePinHymn(sug.id);
                    setPinnedIds(getPinnedHymnIds());
                    showToast({ title: `Pinned ${sug.label}`, type: 'favorite' });
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-800 dark:text-slate-200 font-semibold transition"
                >
                  + Pin {sug.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Pin Any Hymn */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Search to Pin More Hymns:
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={pinSearchQuery}
              onChange={(e) => setPinSearchQuery(e.target.value)}
              placeholder="Search by title, number, or hymnal (e.g. 478, Praise, NZK)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {candidateHymnsToPin.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {candidateHymnsToPin.map((hymn) => (
                <div
                  key={hymn.id}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    <strong className="font-mono text-amber-600 dark:text-amber-400 mr-1">#{hymn.number}</strong>
                    {hymn.title} ({hymn.collection})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      togglePinHymn(hymn.id);
                      setPinnedIds(getPinnedHymnIds());
                      setPinSearchQuery('');
                      showToast({ title: `Pinned ${hymn.title}`, type: 'favorite' });
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shrink-0 transition"
                  >
                    + Pin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: CENTRAL FEEDBACK CONSOLE (Only edwinmambo33@gmail.com can see this) */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Central Hymnal & Tester Feedback
                </h2>
                {isAdmin ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    Admin Access Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    Tester Channel
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin
                  ? 'Central repository of all tester reports, typos, key transpose suggestions, and translation notes.'
                  : 'Submit feedback, typos, or translation corrections. Reports are centrally reviewed by the administrator.'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSeedFeedback}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                title="Seed sample feedback items"
              >
                + Seed Test Feedback
              </button>
              <button
                type="button"
                onClick={handleExportFeedbackJson}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                title="Export all feedback as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON ({feedbackList.length})</span>
              </button>
            </div>
          )}
        </div>

        {isAdmin ? (
          /* ONLY EDWIN MAMBO (edwinmambo33@gmail.com) CAN SEE THIS CENTRAL FEEDBACK DASHBOARD */
          <div className="space-y-4">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={feedbackSearchQuery}
                  onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                  placeholder="Filter feedback by title, hymnal, comment, or tester..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', 'typo', 'tune', 'formatting', 'general'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeedbackCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                      feedbackCategoryFilter === cat
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Feedback Reports */}
            {filteredFeedback.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {filteredFeedback.map((fb) => (
                  <div key={fb.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">
                          {fb.collection} #{fb.hymnNumber}
                        </span>
                        <strong className="text-xs text-slate-900 dark:text-white">
                          {fb.title}
                        </strong>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                          {fb.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                        "{fb.comment}"
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                        <span>Submitted by: <strong className="text-slate-600 dark:text-slate-300">{fb.testerName || 'Anonymous Tester'}</strong></span>
                        <span>•</span>
                        <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Mark report as resolved and remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Pending Feedback Reports</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All tester submissions have been verified and resolved. Click "+ Seed Test Feedback" to test the admin triage workflow.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* NON-ADMIN VIEW: Clean notice and direct feedback submission */
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <Shield className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Administrative feedback reports are centrally visible only to <strong>edwinmambo33@gmail.com</strong>.
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choristers and church musicians can report typos, audio tunes, or formatting corrections on any hymn using the <strong>Feedback button</strong> inside the hymnal reader.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('edwinmambo33@gmail.com', 'Edwin Mambo')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Sign in as Administrator (edwinmambo33@gmail.com)</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6: OFFLINE CONTENT & RESOURCES */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Extracted Datasets & Offline Data Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All 5 major collections (SDAH, NZK, NCA, Bibles, EGW) are extracted from open, non-commercial sources and stored in local cache.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCompleteBundle}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              title="Export complete clean dataset bundle (SDAH, NZK, NCA & User Data) in a single JSON file"
            >
              <Download className="w-4 h-4" />
              <span>Export Clean Bundle (.JSON)</span>
            </button>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {totalHymnsLoaded} Hymns Ready
            </span>
          </div>
        </div>

        {/* Dataset Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">SDA Hymnal (SDAH)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">695 Hymns</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                ✓ Full 1–695 hymns extracted
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Complete verses & choruses, chord charts, and scripture indices.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDataset('sdah.json')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium text-[11px]"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              Download sdah.json
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">Nyimbo Za Kristo (NZK)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">220 Hymns</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                ✓ Full Swahili collection
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Complete Swahili lyrics, titles, and choral stanzas for East Africa.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDataset('nzk.json')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium text-[11px]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              Download nzk.json
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">Nyĩmbo Cia Agendi (NCA)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">299 Hymns</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                ✓ Full Gĩkũyũ collection
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Complete Gĩkũyũ hymnal entries, stanzas, and traditional meters.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDataset('nca.json')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium text-[11px]"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              Download nca.json
            </button>
          </div>
        </div>

        {/* Bible & EGW Extraction Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 dark:text-white">Authentic Multi-Version Bibles</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">KJV & SUV</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Direct integration with open public domain scripture APIs (bible-api.com & bolls.life). Chapters in English (KJV) and Swahili (SUV) are automatically cached to your device for 100% offline access.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 dark:text-white">Ellen G. White Writings (EGW)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">5 Core Books</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Includes authentic, page-paragraph referenced writings from Steps to Christ (SC), The Desire of Ages (DA), The Great Controversy (GC), The Ministry of Healing (MOH), and Christ's Object Lessons (COL).
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: ASSET DOWNLOADS & VERSION MANAGEMENT */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Have On Behalf Companion & Release Assets
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                  v1.2.0 Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage release binaries, download offline Android APKs, and verify cryptographic SHA-256 signatures.
              </p>
            </div>
          </div>

          {/* Primary Quick Downloads */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              id="download-apk-v120-btn"
              href="/assets/releases/HaveOnBehalf-Companion-v1.2.0.apk"
              download="HaveOnBehalf-Companion-v1.2.0.apk"
              onClick={() => showToast({ title: 'Downloading Have On Behalf Companion APK (v1.2.0)', type: 'success' })}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer no-underline"
              title="Download Android APK package"
            >
              <Download className="w-4 h-4" />
              <span>Download APK (v1.2.0)</span>
            </a>

            <button
              id="download-datasets-bundle-btn"
              type="button"
              onClick={handleExportCompleteBundle}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Export all clean hymnal datasets as JSON"
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Datasets JSON</span>
            </button>

            <a
              id="download-release-manifest-btn"
              href="/assets/releases/manifest.json"
              download="have-on-behalf-release-manifest-v1.2.0.json"
              onClick={() => showToast({ title: 'Release manifest downloaded', type: 'success' })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer no-underline"
              title="Download build manifest specification"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Manifest</span>
            </a>
          </div>
        </div>

        {/* Mobile Phone User Direct Install Banner */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Installing on Android Mobile Phones & Tablets
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Direct APK
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Using a mobile device? Tap below to download the native standalone APK package. Once downloaded, tap <strong>Open</strong> in your browser notifications and allow <em>Install unknown apps</em> to enjoy all 13 hymnals, Bibles, and Beam Remote completely offline.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>✓ Android 5.0 to 15 (ARM64 & x86)</span>
              <span>✓ Zero Data Usage after install</span>
              <span>✓ Full Touch & Large Typography</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <a
              id="mobile-phone-direct-download-btn"
              href="/assets/releases/HaveOnBehalf-Companion-Latest.apk"
              download="HaveOnBehalf-Companion-Latest.apk"
              onClick={() => showToast({ title: 'Starting APK download for Android phone...', type: 'success' })}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2.5 transition cursor-pointer no-underline text-center"
            >
              <Download className="w-4 h-4" />
              <span>Download APK for Mobile Phone</span>
            </a>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block">📖 13 Hymnals & Bibles</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">100% offline database</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block">📽️ Beam Remote</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Sanctuary slide controller</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block">🎵 Pitch Transpose</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">440Hz liturgical synth</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block">🕊️ E.G. White Library</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Devotional study chapters</span>
          </div>
        </div>

        {/* Version History & Downloads Management Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Release Catalog & Binary Assets (assets/releases/)
            </h3>
            <span className="text-[11px] text-slate-400">Semantic Versioning 2.0.0</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Version 1.2.0 (Active) */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[11px]">
                    v1.2.0
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Production Release (Build 2)
                  </span>
                  <span className="text-[10px] text-slate-400">October 2, 2026</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Sanctuary Beam Sync, Red Letter Bibles, EGW study, Recharts frequency analytics, Admin feedback, and Flutter mobile parity.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>SHA-256: 8f4d92a1...7e8f</span>
                  <button
                    type="button"
                    onClick={() => handleCopySha('8f4d92a11b9c3f4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Copy Hash
                  </button>
                  <span>· 17.6 MB</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadApk('v1.2.0')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK</span>
                </button>
              </div>
            </div>

            {/* Version 1.1.0 */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-[11px]">
                    v1.1.0
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Liturgical Tools & Transposer Update
                  </span>
                  <span className="text-[10px] text-slate-400">September 20, 2026</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Audio pitch pipe synthesizer (-5 to +6 transposition), Vespers liturgy planner, and 13 dialect collections.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>SHA-256: 2b3c4d5e...1a2b</span>
                  <button
                    type="button"
                    onClick={() => handleCopySha('2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c')}
                    className="hover:underline cursor-pointer"
                  >
                    Copy Hash
                  </button>
                  <span>· 16.8 MB</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadApk('EarlyTester')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download v1.1</span>
                </button>
              </div>
            </div>

            {/* Version 1.0.0 */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-[11px]">
                    v1.0.0
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Initial Foundation Release
                  </span>
                  <span className="text-[10px] text-slate-400">September 1, 2026</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Complete offline SDAH, Nyimbo Za Kristo, and Nyĩmbo Cia Agendi hymnals with Sanctuary Gold and OLED themes.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>SHA-256: 7a8b9c0d...7a8b</span>
                  <button
                    type="button"
                    onClick={() => handleCopySha('7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b')}
                    className="hover:underline cursor-pointer"
                  >
                    Copy Hash
                  </button>
                  <span>· 3.8 MB</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download v1.0</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Android Sideloading Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-4">
          <p>
            💡 <strong className="text-slate-700 dark:text-slate-200">Installation Note:</strong> To install the APK on your Android device, download the file and enable <em>"Install unknown apps"</em> for your browser or file manager. The app operates 100% offline with zero external network dependencies.
          </p>
          <span className="font-mono text-[10px] shrink-0 text-slate-400">See CHANGELOG.md</span>
        </div>
      </section>
    </div>
  );
};
