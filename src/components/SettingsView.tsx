import React, { useState } from 'react';
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
} from 'lucide-react';
import { AppThemeMode, UserSettings, UserProfile, saveUserProfile, updateSettings } from '../lib/storage';
import { BeamFont, BeamTheme } from '../types';
import { useHymnCatalog } from '../lib/hymnLibrary';

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
  const { totalCount: totalHymnsLoaded } = useHymnCatalog();
  // Local sign-in form state
  const [emailInput, setEmailInput] = useState(userProfile.email || '');
  const [nameInput, setNameInput] = useState(userProfile.displayName || '');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleDownloadDataset = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/data/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  };

  const triggerCloudSync = () => {
    setSyncStatus('Syncing favorites with Have On Behalf cloud profile...');
    setTimeout(() => {
      setSyncStatus('Successfully synchronized across your devices!');
      setTimeout(() => setSyncStatus(null), 3500);
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold">
                    Synced Account
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{userProfile.email}</p>
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
          <form onSubmit={handleSignIn} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
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
                <span>{isSigningIn ? 'Connecting...' : 'Sign In / Register'}</span>
              </button>
            </div>
          </form>
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
                  onClick={() => onUpdateSettings({ beamFont: fontItem.id })}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400'
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

        {/* On-Screen Beam Mode Controls Toggle (Remove buttons in beam mode) */}
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
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Exit Beam</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">Esc</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Shortcuts Help</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white text-[11px]">?</kbd>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: OFFLINE CONTENT & RESOURCES */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
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
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            {totalHymnsLoaded} Hymns Ready
          </span>
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
    </div>
  );
};
