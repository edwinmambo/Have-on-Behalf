import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Music,
  Scroll,
  Bookmark,
  Search,
  Cast,
  Moon,
  Sun,
  Settings,
  Calendar,
  Layers,
  ChevronDown,
  Eye,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  History,
  Play,
  Pause,
} from 'lucide-react';
import { Hymn, BibleVerse, EgwParagraph, BeamSlide, MainTab, WorshipPlanSession } from './types';
import { HymnalView } from './components/HymnalView';
import { BibleView } from './components/BibleView';
import { EgwView } from './components/EgwView';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { PlanView } from './components/PlanView';
import { SettingsView } from './components/SettingsView';
import { BeamModal } from './components/BeamModal';
import { BeamProjectorScreen } from './components/BeamProjectorScreen';
import { BeamControllerDock } from './components/BeamControllerDock';
import { ScriptureModal } from './components/ScriptureModal';
import { UniversalSearchModal } from './components/UniversalSearchModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastContainer } from './components/ToastContainer';
import {
  ActiveBeamState,
  getStoredBeamState,
  clearStoredBeamState,
  broadcastBeamState,
  listenToBeamUpdates,
  openBeamSecondScreen,
  listenToSyncRequests,
  getBeamProjectorUrl,
} from './lib/beamSync';
import { showToast } from './lib/toast';
import { addHistoryItem } from './lib/historyStorage';
import {
  getSettings,
  updateSettings,
  getUserProfile,
  saveUserProfile,
  getWorshipPlans,
  saveWorshipPlan,
  deleteWorshipPlan,
  UserSettings,
  UserProfile,
  AppThemeMode,
  AccentTheme,
} from './lib/storage';
import { buildBibleBeamSlides, buildEgwBeamSlides } from './lib/beamSlidesHelper';

const getAccentClasses = (accent: AccentTheme = 'sapphire') => {
  switch (accent) {
    case 'emerald':
      return {
        activeTab: 'text-emerald-600 dark:text-emerald-400',
        activeBadge: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
        buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        accentIcon: 'text-emerald-500',
        sliderAccent: 'accent-emerald-600',
        dot: 'bg-emerald-500',
      };
    case 'gold':
      return {
        activeTab: 'text-amber-700 dark:text-amber-300',
        activeBadge: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
        buttonPrimary: 'bg-amber-700 hover:bg-amber-800 text-white',
        accentText: 'text-amber-700 dark:text-amber-300',
        accentIcon: 'text-amber-600',
        sliderAccent: 'accent-amber-600',
        dot: 'bg-amber-500',
      };
    case 'amethyst':
      return {
        activeTab: 'text-purple-600 dark:text-purple-400',
        activeBadge: 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300',
        buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
        accentText: 'text-purple-600 dark:text-purple-400',
        accentIcon: 'text-purple-500',
        sliderAccent: 'accent-purple-600',
        dot: 'bg-purple-500',
      };
    case 'crimson':
      return {
        activeTab: 'text-rose-600 dark:text-rose-400',
        activeBadge: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300',
        buttonPrimary: 'bg-rose-600 hover:bg-rose-700 text-white',
        accentText: 'text-rose-600 dark:text-rose-400',
        accentIcon: 'text-rose-500',
        sliderAccent: 'accent-rose-600',
        dot: 'bg-rose-500',
      };
    case 'sapphire':
    default:
      return {
        activeTab: 'text-blue-600 dark:text-blue-400',
        activeBadge: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        accentText: 'text-blue-600 dark:text-blue-400',
        accentIcon: 'text-blue-500',
        sliderAccent: 'accent-blue-600',
        dot: 'bg-blue-500',
      };
  }
};

export default function App() {
  const [projectorHash, setProjectorHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    const handleHashChange = () => {
      setProjectorHash(typeof window !== 'undefined' ? window.location.hash : '');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isProjectorMode =
    typeof window !== 'undefined' &&
    (window.location.search.includes('beam=projector') ||
      window.location.hash === '#beam-projector' ||
      projectorHash === '#beam-projector');

  if (isProjectorMode) {
    return <BeamProjectorScreen />;
  }

  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const accentClasses = getAccentClasses(settings.accentTheme || 'sapphire');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getUserProfile());
  const [worshipPlans, setWorshipPlans] = useState<WorshipPlanSession[]>(() => getWorshipPlans());
  const [activeTab, setActiveTab] = useState<MainTab>('hymnals');
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);

  // Background Beam projection state (synced with second screen)
  const [activeBeam, setActiveBeam] = useState<ActiveBeamState | null>(() => getStoredBeamState());

  useEffect(() => {
    const unsubscribe = listenToBeamUpdates((state) => {
      setActiveBeam(state);
    });
    const unsubSyncReq = listenToSyncRequests(() => {
      const current = getStoredBeamState();
      if (current && current.isOpen) {
        broadcastBeamState(current);
      }
    });
    return () => {
      unsubscribe();
      unsubSyncReq();
    };
  }, []);

  // States for deep navigation from History or Search
  const [initialHymnState, setInitialHymnState] = useState<{ id: string; collection?: any } | null>(null);
  const [initialBibleState, setInitialBibleState] = useState<{ bookId: string; chapter: number; version?: any } | null>(null);
  const [initialEgwState, setInitialEgwState] = useState<{ bookCode: string; chapterNumber?: number } | null>(null);

  // Resolved dark mode boolean from settings & OS
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const cur = getSettings();
    if (cur.appTheme === 'dark') return true;
    if (cur.appTheme === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Modal states
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [scriptureModalRef, setScriptureModalRef] = useState<string | null>(null);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState<boolean>(false);

  // Beam presentation state
  const [beamData, setBeamData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    sourceBadge: string;
    slides: BeamSlide[];
    initialIndex?: number;
    isSessionBeam?: boolean;
    sessionTitle?: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    sourceBadge: '',
    slides: [],
    initialIndex: 0,
    isSessionBeam: false,
  });

  // Apply dark mode to document HTML element
  useEffect(() => {
    if (settings.appTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (settings.appTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      // System mode
      const isSystemDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setIsDarkMode(isSystemDark);
    }
  }, [settings.appTheme]);

  // Apply dynamic accent theme attribute to body & root for buttons, outlines and highlights
  useEffect(() => {
    const accent = settings.accentTheme || 'sapphire';
    document.body.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
  }, [settings.accentTheme]);

  // Play / Auto-scroll feature for Reading Mode (Bible, EGW, Hymn passages)
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(1.0);

  const toggleAutoScroll = () => {
    setIsAutoScrolling((prev) => !prev);
  };

  // Stop auto-scroll when exiting reading mode or switching tabs
  useEffect(() => {
    if (!isReadingMode) {
      setIsAutoScrolling(false);
    }
  }, [isReadingMode, activeTab]);

  useEffect(() => {
    if (!isReadingMode || !isAutoScrolling) return;

    let animId: number;
    let lastTime = performance.now();
    let accumulated = 0;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Base speed: 30 pixels per second for 1x
      const pxPerSec = 30 * autoScrollSpeed;
      accumulated += pxPerSec * delta;

      const intPx = Math.floor(accumulated);
      if (intPx >= 1) {
        accumulated -= intPx;

        const bibleEl = document.getElementById('bible-reading-scroll-container');
        const egwEl = document.getElementById('egw-reading-scroll-container');
        const hymnalEl = document.getElementById('hymnal-reading-scroll-container');

        let target: HTMLElement | null = null;
        if (activeTab === 'bibles' && bibleEl) target = bibleEl;
        else if (activeTab === 'egw' && egwEl) target = egwEl;
        else if (activeTab === 'hymnals' && hymnalEl) target = hymnalEl;
        else if (bibleEl && bibleEl.scrollHeight > bibleEl.clientHeight) target = bibleEl;
        else if (egwEl && egwEl.scrollHeight > egwEl.clientHeight) target = egwEl;
        else if (hymnalEl && hymnalEl.scrollHeight > hymnalEl.clientHeight) target = hymnalEl;

        if (target) {
          target.scrollTop += intPx;
          if (target.scrollTop + target.clientHeight >= target.scrollHeight - 3) {
            setIsAutoScrolling(false);
            showToast({ title: 'Reached end of passage', type: 'info' });
            return;
          }
        } else {
          window.scrollBy(0, intPx);
          if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
            setIsAutoScrolling(false);
            showToast({ title: 'Reached end of passage', type: 'info' });
            return;
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isReadingMode, isAutoScrolling, autoScrollSpeed, activeTab]);

  // Global keyboard shortcuts (Cmd+K for search, Esc to exit reading mode, Space to toggle auto-scroll)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isReadingMode) {
        setIsReadingMode(false);
        setIsAutoScrolling(false);
      } else if (e.key === ' ' && isReadingMode) {
        const target = e.target as HTMLElement | null;
        const isInput =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          setIsAutoScrolling((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode]);

  // Apply Zoom Level to document root (browser-style zoom)
  useEffect(() => {
    const zoomLevel = settings.appZoom || 100;
    (document.documentElement.style as any).zoom = `${zoomLevel}%`;
    document.documentElement.style.setProperty('--app-zoom-level', `${zoomLevel}%`);
  }, [settings.appZoom]);

  // Global Zoom keyboard shortcuts: Ctrl/Cmd + Plus, Ctrl/Cmd + Minus, Ctrl/Cmd + 0
  useEffect(() => {
    const handleZoomKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is in an active text input or textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === 'Add')) {
        e.preventDefault();
        const currentZoom = settings.appZoom || 100;
        const newZoom = Math.min(175, currentZoom + 5);
        handleUpdateSettings({ appZoom: newZoom });
        showToast({ title: `Zoom: ${newZoom}%`, type: 'info', duration: 1200 });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_' || e.key === 'Subtract')) {
        e.preventDefault();
        const currentZoom = settings.appZoom || 100;
        const newZoom = Math.max(75, currentZoom - 5);
        handleUpdateSettings({ appZoom: newZoom });
        showToast({ title: `Zoom: ${newZoom}%`, type: 'info', duration: 1200 });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '0' || e.key === 'Digit0')) {
        e.preventDefault();
        handleUpdateSettings({ appZoom: 100 });
        showToast({ title: 'Zoom Reset: 100%', type: 'info', duration: 1200 });
      }
    };

    window.addEventListener('keydown', handleZoomKeyDown);
    return () => window.removeEventListener('keydown', handleZoomKeyDown);
  }, [settings.appZoom]);

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = updateSettings(partial);
    setSettings(updated);
  };

  const handleToggleThemeMode = (mode: AppThemeMode) => {
    handleUpdateSettings({ appTheme: mode });
  };

  const handleQuickToggleTheme = () => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    handleToggleThemeMode(nextMode);
  };

  const handleToggleRedLetter = () => {
    handleUpdateSettings({ redLetterEnabled: !settings.redLetterEnabled });
  };

  // Plan Session Management
  const handleSavePlanSession = (session: WorshipPlanSession) => {
    saveWorshipPlan(session);
    setWorshipPlans(getWorshipPlans());
  };

  const handleDeletePlanSession = (id: string) => {
    deleteWorshipPlan(id);
    setWorshipPlans(getWorshipPlans());
  };

  // Helper to activate second screen beam
  const activateBeamSession = (
    title: string,
    subtitle: string,
    sourceBadge: string,
    slides: BeamSlide[],
    sessionTitle?: string
  ) => {
    const s = getSettings();
    const beamState: ActiveBeamState = {
      isOpen: true,
      title,
      subtitle,
      sourceBadge,
      slides,
      currentIndex: 0,
      theme: s.beamTheme || 'ah-sanctuary',
      font: s.beamFont || 'lora',
      fontScale: 1.0,
      isBlackout: false,
      isTextCleared: false,
      sessionTitle,
      updatedAt: Date.now(),
    };
    setActiveBeam(beamState);
    broadcastBeamState(beamState);
    openBeamSecondScreen();
    showToast({
      title: 'Projecting to Cast Screen',
      description: `Projecting "${title}". Your current screen remains active to search for any extra items.`,
      type: 'info',
    });
  };

  // Launch Beam for single hymn
  const handleBeamHymn = (hymn: Hymn, slides: BeamSlide[]) => {
    const title = `${hymn.collection} #${hymn.number} · ${hymn.title}`;
    const subtitle = `${hymn.author || 'Sacred Hymn'}${hymn.key ? ` • Key of ${hymn.key}` : ''}`;
    const sourceBadge = `${hymn.collection} #${hymn.number}`;
    setBeamData({
      isOpen: false,
      title,
      subtitle,
      sourceBadge,
      slides,
      initialIndex: 0,
      isSessionBeam: false,
    });
    addHistoryItem({
      type: 'hymn',
      title: hymn.title,
      subtitle: `${hymn.author || 'Sacred Hymn'}${hymn.key ? ` • Key of ${hymn.key}` : ''}`,
      reference: `${hymn.collection} #${hymn.number}`,
      snippet: hymn.stanzas?.[0]?.lines?.[0] || undefined,
      actionType: 'beam',
      metadata: {
        hymnId: hymn.id,
        collection: hymn.collection,
        hymnNumber: hymn.number,
      },
    });
    activateBeamSession(title, subtitle, sourceBadge, slides);
  };

  // Launch Beam for pre-planned session (back-to-back lyrics)
  const handleBeamSession = (session: WorshipPlanSession, allSlides: BeamSlide[]) => {
    const title = session.title;
    const subtitle = `${session.items.length} Hymns • Vespers & Song Service`;
    const sourceBadge = 'Session Program';
    setBeamData({
      isOpen: false,
      title,
      subtitle,
      sourceBadge,
      slides: allSlides,
      initialIndex: 0,
      isSessionBeam: true,
      sessionTitle: session.title,
    });
    activateBeamSession(title, subtitle, sourceBadge, allSlides, session.title);
  };

  // Launch Beam for Bible verse
  const handleBeamVerse = (reference: string, text: string, version: string) => {
    const slides: BeamSlide[] = [
      {
        label: 'Scripture',
        title: reference,
        sourceBadge: version,
        lines: [text],
      },
    ];
    setBeamData({
      isOpen: false,
      title: reference,
      subtitle: `Holy Bible (${version})`,
      sourceBadge: version,
      slides,
      initialIndex: 0,
      isSessionBeam: false,
    });
    activateBeamSession(reference, `Holy Bible (${version})`, version, slides);
  };

  // Launch Beam for multiple selected Bible verses
  const handleBeamMultipleVerses = (verses: BibleVerse[], version: string) => {
    if (verses.length === 0) return;
    const slides = buildBibleBeamSlides(verses, version);
    const minV = verses[0].verse;
    const maxV = verses[verses.length - 1].verse;
    const rangeRef = `${verses[0].book} ${verses[0].chapter}:${minV === maxV ? minV : `${minV}-${maxV}`}`;
    const subtitle = `Holy Bible (${version}) • ${verses.length} verses`;
    setBeamData({
      isOpen: false,
      title: rangeRef,
      subtitle,
      sourceBadge: version,
      slides,
      initialIndex: 0,
      isSessionBeam: false,
    });
    activateBeamSession(rangeRef, subtitle, version, slides);
  };

  // Launch Beam for single EGW paragraph
  const handleBeamEgwParagraph = (p: EgwParagraph) => {
    const slides: BeamSlide[] = [
      {
        label: p.reference,
        title: p.chapterTitle,
        sourceBadge: p.reference,
        lines: [p.text],
      },
    ];
    setBeamData({
      isOpen: false,
      title: p.chapterTitle,
      subtitle: `Ellen G. White • Page ${p.page}`,
      sourceBadge: p.reference,
      slides,
      initialIndex: 0,
      isSessionBeam: false,
    });
    activateBeamSession(p.chapterTitle, `Ellen G. White • Page ${p.page}`, p.reference, slides);
  };

  // Launch Beam for multiple selected EGW paragraphs
  const handleBeamMultipleParagraphs = (paragraphs: EgwParagraph[], bookTitle: string) => {
    if (paragraphs.length === 0) return;
    const slides = buildEgwBeamSlides(paragraphs, bookTitle);
    const subtitle = `Ellen G. White • ${paragraphs.length} paragraphs`;
    setBeamData({
      isOpen: false,
      title: bookTitle,
      subtitle,
      sourceBadge: paragraphs[0].reference,
      slides,
      initialIndex: 0,
      isSessionBeam: false,
    });
    activateBeamSession(bookTitle, subtitle, paragraphs[0].reference, slides);
  };

  const tabLabels: Record<MainTab, string> = {
    hymnals: 'Hymnals (SDAH/NZK/NCA)',
    bibles: 'Bibles (Multi-Version)',
    egw: 'E.G. White Writings',
    saved: 'Saved / Bookmarks',
    history: 'Reading & Viewing History',
    plan: 'Plan Mode (Vespers)',
    settings: 'Settings & Sync',
  };

  const isSecondaryTabActive =
    activeTab === 'saved' || activeTab === 'history' || activeTab === 'plan' || activeTab === 'settings';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Main Navigation Bar with Responsive Dropdown & Reading Mode */}
      <header
        id="main-app-header"
        className={`sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 transition-all duration-300 shadow-xs ${
          isReadingMode ? 'py-2' : 'py-2 sm:py-2.5'
        }`}
      >
        {isReadingMode ? (
          /* Reading Mode Header with Typography Sliders */
          <div className={`${settings.fullWidthLayout !== false ? 'w-full max-w-none px-1 sm:px-2' : 'max-w-7xl mx-auto'} flex flex-wrap items-center justify-between gap-3 animate-fade-in`}>
            {/* Left Status & Title */}
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Reading Mode • <span className="text-amber-600 dark:text-amber-400">{tabLabels[activeTab]}</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden xl:inline">(Press Esc to exit)</span>
            </div>

            {/* Middle: Typography Sliders & Play/Auto-scroll Controls */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              {/* Font Size & Line Spacing */}
              <div className="flex items-center gap-2.5 sm:gap-4 bg-slate-100/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
                {/* Font Size Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Size:
                  </span>
                  <input
                    id="reading-font-size-slider"
                    type="range"
                    min="14"
                    max="32"
                    step="1"
                    value={settings.readerFontSizePx || 18}
                    onChange={(e) => handleUpdateSettings({ readerFontSizePx: Number(e.target.value) })}
                    className={`w-16 sm:w-20 ${accentClasses.sliderAccent} cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none`}
                    title="Adjust reader font size"
                  />
                  <span className={`text-[11px] font-mono font-bold ${accentClasses.accentText} min-w-[2rem]`}>
                    {settings.readerFontSizePx || 18}px
                  </span>
                </div>

                <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700" />

                {/* Line Spacing Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Spacing:
                  </span>
                  <input
                    id="reading-line-spacing-slider"
                    type="range"
                    min="1.3"
                    max="2.4"
                    step="0.05"
                    value={settings.readerLineHeight || 1.75}
                    onChange={(e) => handleUpdateSettings({ readerLineHeight: Number(e.target.value) })}
                    className={`w-16 sm:w-20 ${accentClasses.sliderAccent} cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none`}
                    title="Adjust reader line spacing"
                  />
                  <span className={`text-[11px] font-mono font-bold ${accentClasses.accentText} min-w-[2rem]`}>
                    {(settings.readerLineHeight || 1.75).toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Play / Auto-scroll and Speed Controls */}
              <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
                <button
                  id="reading-autoscroll-toggle"
                  onClick={toggleAutoScroll}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-98 cursor-pointer ${
                    isAutoScrolling
                      ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  title={isAutoScrolling ? 'Pause Auto-Scroll (Space)' : 'Play Auto-Scroll (Space)'}
                >
                  {isAutoScrolling ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isAutoScrolling ? 'Pause' : 'Play Auto-scroll'}</span>
                </button>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 pl-1.5 border-l border-slate-300 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Speed:
                  </span>
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAutoScrollSpeed(spd)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                        autoScrollSpeed === spd
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={`Scroll Speed ${spd}x`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Exit Reading Mode */}
            <div className="flex items-center gap-2">
              <button
                id="reading-mode-toggle"
                onClick={() => setIsReadingMode(false)}
                className={`px-3 py-1 rounded-xl ${accentClasses.buttonPrimary} text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-98`}
                title="Exit Reading Mode (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Reading Mode</span>
              </button>
            </div>
          </div>
        ) : (
          /* Flexible Flexbox Header: Brand & Primary Actions Always Visible */
          <div className={`${settings.fullWidthLayout !== false ? 'w-full max-w-none px-1 sm:px-2' : 'max-w-7xl mx-auto'} flex items-center justify-between gap-2 sm:gap-4 w-full`}>
            {/* 1. BRAND IDENTITY: Brand Name & Logo Always Visible */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <img
                src="/icon.svg"
                alt="Have On Behalf Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md shrink-0 object-cover"
              />
              <div className="flex flex-col min-w-0">
                <h1 className="text-xs xs:text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap leading-tight">
                  Have On Behalf
                </h1>
                <p className="text-[10px] text-slate-400 hidden xl:block leading-none mt-0.5">
                  SDA Hymnals • Bibles • E.G. White
                </p>
              </div>
            </div>

            {/* 2. PRIMARY NAVIGATION & COMPACT SECONDARY DROPDOWN MENU */}
            <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
              {/* Primary Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-xl text-xs font-semibold">
                <button
                  id="nav-tab-hymnals"
                  onClick={() => setActiveTab('hymnals')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'hymnals'
                      ? `bg-white dark:bg-slate-900 ${accentClasses.activeTab} shadow-xs font-bold`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Hymnals (SDAH, NZK, NCA)"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Hymnals</span>
                </button>

                <button
                  id="nav-tab-bibles"
                  onClick={() => setActiveTab('bibles')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'bibles'
                      ? `bg-white dark:bg-slate-900 ${accentClasses.activeTab} shadow-xs font-bold`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Holy Bibles (Multi-Version)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Bibles</span>
                </button>

                <button
                  id="nav-tab-egw"
                  onClick={() => setActiveTab('egw')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'egw'
                      ? `bg-white dark:bg-slate-900 ${accentClasses.activeTab} shadow-xs font-bold`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Ellen G. White Writings"
                >
                  <Scroll className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">E.G. White</span>
                  <span className="sm:hidden hidden xs:inline">EGW</span>
                </button>
              </div>

              {/* Compact Icon-Based Dropdown Menu for Secondary Items (Saved, Plan, Settings) */}
              <div className="relative">
                <button
                  id="nav-secondary-dropdown-toggle"
                  onClick={() => setIsSecondaryMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSecondaryTabActive
                      ? `${accentClasses.activeBadge} font-bold shadow-xs`
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="More menus: Saved, Plan Mode, Settings"
                  aria-expanded={isSecondaryMenuOpen}
                  aria-haspopup="true"
                >
                  <MoreHorizontal className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${accentClasses.accentIcon}`} />
                  <span className="hidden md:inline">
                    {activeTab === 'saved'
                      ? 'Saved'
                      : activeTab === 'history'
                      ? 'History'
                      : activeTab === 'plan'
                      ? 'Plan'
                      : activeTab === 'settings'
                      ? 'Settings'
                      : 'More'}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isSecondaryMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Accessible Secondary Dropdown Card */}
                {isSecondaryMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsSecondaryMenuOpen(false)}
                    />
                    <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-52 py-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-40 animate-fade-in text-xs">
                      {/* Mobile quick list for primary tabs if on extra narrow devices */}
                      <div className="xs:hidden px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        Main Views
                      </div>
                      <div className="xs:hidden space-y-0.5 px-1 pb-1">
                        <button
                          onClick={() => {
                            setActiveTab('hymnals');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                            activeTab === 'hymnals'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Music className={`w-3.5 h-3.5 ${accentClasses.accentIcon}`} />
                            <span>Hymnals</span>
                          </div>
                          {activeTab === 'hymnals' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('bibles');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                            activeTab === 'bibles'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className={`w-3.5 h-3.5 ${accentClasses.accentIcon}`} />
                            <span>Bibles</span>
                          </div>
                          {activeTab === 'bibles' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('egw');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                            activeTab === 'egw'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Scroll className={`w-3.5 h-3.5 ${accentClasses.accentIcon}`} />
                            <span>E.G. White</span>
                          </div>
                          {activeTab === 'egw' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>
                      </div>

                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Secondary Modules
                      </div>
                      <div className="space-y-0.5 px-1">
                        <button
                          id="nav-tab-saved"
                          onClick={() => {
                            setActiveTab('saved');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl transition-colors ${
                            activeTab === 'saved'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Bookmark className={`w-4 h-4 ${accentClasses.accentIcon}`} />
                            <span>Saved Bookmarks</span>
                          </div>
                          {activeTab === 'saved' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>

                        <button
                          id="nav-tab-history"
                          onClick={() => {
                            setActiveTab('history');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl transition-colors ${
                            activeTab === 'history'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <History className={`w-4 h-4 ${accentClasses.accentIcon}`} />
                            <span>Reading History</span>
                          </div>
                          {activeTab === 'history' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>

                        <button
                          id="nav-tab-plan"
                          onClick={() => {
                            setActiveTab('plan');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl transition-colors ${
                            activeTab === 'plan'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar className={`w-4 h-4 ${accentClasses.accentIcon}`} />
                            <span>Worship Plan Mode</span>
                          </div>
                          {activeTab === 'plan' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>

                        <button
                          id="nav-tab-settings"
                          onClick={() => {
                            setActiveTab('settings');
                            setIsSecondaryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl transition-colors ${
                            activeTab === 'settings'
                              ? `${accentClasses.activeBadge} font-bold`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Settings className={`w-4 h-4 ${accentClasses.accentIcon}`} />
                            <span>Settings & Sync</span>
                          </div>
                          {activeTab === 'settings' && <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />}
                        </button>

                        <a
                          id="nav-tab-projector"
                          href={getBeamProjectorUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setIsSecondaryMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-2.5">
                            <Cast className={`w-4 h-4 text-amber-500`} />
                            <span>Cast Screen (New Window)</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Live</span>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* 3. PRIMARY ACTIONS: Always visible, shrink-0 */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* SUBTLE READING MODE BUTTON */}
              <button
                id="reading-mode-toggle"
                onClick={() => setIsReadingMode(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                title="Expand content area for distraction-free Reading Mode"
              >
                <Maximize2 className={`w-3.5 h-3.5 ${accentClasses.accentText}`} />
                <span className="hidden md:inline">Reading Mode</span>
              </button>

              {/* Quick Universal Search Trigger */}
              <button
                id="global-search-trigger"
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition shadow-xs flex items-center gap-1.5"
                title="Quick Search Hymnals, Bible texts, EGW (Cmd+K)"
              >
                <Search className={`w-3.5 h-3.5 ${accentClasses.accentIcon}`} />
                <span className="hidden xl:inline">Quick Search</span>
                <kbd className="hidden lg:inline-block text-[10px] font-mono px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* Light / Dark Mode Toggle */}
              <button
                id="dark-mode-toggle"
                onClick={handleQuickToggleTheme}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 transition shrink-0"
                title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Tabbed Content Area */}
      <main
        className={`flex-1 w-full mx-auto transition-all duration-300 ${
          settings.fullWidthLayout !== false ? 'max-w-none' : 'max-w-7xl'
        } ${
          isReadingMode ? 'p-2 sm:p-4' : 'p-3 sm:p-5 lg:p-6'
        }`}
      >
        {activeTab === 'hymnals' && (
          <HymnalView
            onBeamHymn={handleBeamHymn}
            onOpenScripture={(ref) => setScriptureModalRef(ref)}
            splitStanzasOnBeam={settings.splitStanzasOnBeam}
            initialHymnId={initialHymnState?.id}
            initialCollection={initialHymnState?.collection}
          />
        )}

        {activeTab === 'bibles' && (
          <BibleView
            onBeamVerse={handleBeamVerse}
            onBeamMultipleVerses={handleBeamMultipleVerses}
            redLetterEnabled={settings.redLetterEnabled}
            onToggleRedLetter={handleToggleRedLetter}
            initialBook={initialBibleState?.bookId}
            initialChapter={initialBibleState?.chapter}
            initialVersion={initialBibleState?.version}
            readerFontSizePx={settings.readerFontSizePx || 18}
            readerLineHeight={settings.readerLineHeight || 1.75}
          />
        )}

        {activeTab === 'egw' && (
          <EgwView
            onOpenScripture={(ref) => setScriptureModalRef(ref)}
            onBeamParagraph={handleBeamEgwParagraph}
            onBeamMultipleParagraphs={handleBeamMultipleParagraphs}
            initialBookCode={initialEgwState?.bookCode}
            initialChapterNumber={initialEgwState?.chapterNumber}
            readerFontSizePx={settings.readerFontSizePx || 18}
            readerLineHeight={settings.readerLineHeight || 1.75}
          />
        )}

        {activeTab === 'saved' && (
          <FavoritesView
            onOpenScripture={(ref) => setScriptureModalRef(ref)}
            onBeamItem={(title, ref, text) => {
              setBeamData({
                isOpen: true,
                title,
                subtitle: ref,
                sourceBadge: 'Saved Favorite',
                slides: [
                  {
                    label: ref,
                    title,
                    sourceBadge: 'Bookmark',
                    lines: [text],
                  },
                ],
                initialIndex: 0,
                isSessionBeam: false,
              });
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            onNavigateHymn={(hymnId, collection) => {
              setInitialHymnState({ id: hymnId, collection: collection as any });
              setActiveTab('hymnals');
            }}
            onNavigateBible={(bookId, chapter, version) => {
              setInitialBibleState({ bookId, chapter, version: version as any });
              setActiveTab('bibles');
            }}
            onNavigateEgw={(bookCode, chapterNumber) => {
              setInitialEgwState({ bookCode, chapterNumber });
              setActiveTab('egw');
            }}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            plans={worshipPlans}
            onSavePlan={handleSavePlanSession}
            onDeletePlan={handleDeletePlanSession}
            onBeamSession={handleBeamSession}
            splitStanzasOnBeam={settings.splitStanzasOnBeam}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            userProfile={userProfile}
            onUpdateUserProfile={(up) => {
              setUserProfile(up);
              saveUserProfile(up);
            }}
            isDarkMode={isDarkMode}
            onToggleThemeMode={handleToggleThemeMode}
          />
        )}
      </main>

      {/* Universal Search Modal (Cmd+K) */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectHymn={(hymn) => {
          setActiveTab('hymnals');
          setIsSearchOpen(false);
        }}
        onSelectScripture={(ref: string) => {
          setScriptureModalRef(ref);
          setIsSearchOpen(false);
        }}
        onSelectEgw={(egw) => {
          setActiveTab('egw');
          setIsSearchOpen(false);
        }}
        onBeamHymn={handleBeamHymn}
      />

      {/* Scripture Reference Modal (for verse references in Hymns & EGW) */}
      {scriptureModalRef && (
        <ScriptureModal
          isOpen={Boolean(scriptureModalRef)}
          reference={scriptureModalRef}
          onClose={() => setScriptureModalRef(null)}
          onBeamVerse={(ref, text, version) => {
            setScriptureModalRef(null);
            handleBeamVerse(ref, text, version);
          }}
          redLetterEnabled={settings.redLetterEnabled}
        />
      )}

      {/* Persistent Second-Screen Beam Controller Dock */}
      {activeBeam && activeBeam.isOpen && (
        <BeamControllerDock
          beamState={activeBeam}
          onUpdateBeamState={(updated) => {
            setActiveBeam(updated);
            broadcastBeamState(updated);
          }}
          onClose={() => {
            const closed: ActiveBeamState = {
              ...activeBeam,
              isOpen: false,
              updatedAt: Date.now(),
            };
            setActiveBeam(closed);
            broadcastBeamState(closed);
          }}
        />
      )}

      {/* AdventistHymns-Inspired Beam Modal Projector (for in-tab presentation) */}
      <BeamModal
        isOpen={beamData.isOpen}
        onClose={() => setBeamData((prev) => ({ ...prev, isOpen: false }))}
        title={beamData.title}
        subtitle={beamData.subtitle}
        sourceBadge={beamData.sourceBadge}
        slides={beamData.slides}
        initialSlideIndex={beamData.initialIndex}
        isSessionBeam={beamData.isSessionBeam}
        sessionTitle={beamData.sessionTitle}
        initialFont={settings.beamFont}
        initialTheme={settings.beamTheme}
      />

      {/* Floating Auto-Scroll Mini Dock in Reading Mode */}
      {isReadingMode && (
        <div className="fixed bottom-5 right-5 z-40 animate-fade-in flex items-center gap-2 bg-slate-900/95 dark:bg-black/95 text-white px-3 py-1.5 rounded-2xl shadow-2xl border border-white/15 backdrop-blur-md text-xs select-none">
          <button
            onClick={toggleAutoScroll}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isAutoScrolling ? 'bg-amber-500 text-white animate-pulse' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isAutoScrolling ? 'Pause Auto-Scroll (Space)' : 'Play Auto-Scroll (Space)'}
          >
            {isAutoScrolling ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isAutoScrolling ? 'Scrolling' : 'Play Scroll'}</span>
          </button>

          <span className="text-white/20">|</span>

          {/* Speed Stepper */}
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setAutoScrollSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  autoScrollSpeed === spd
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={`Speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Global Toast Feedback Container (for Favorites, Copies, Searches) */}
      <ToastContainer />
    </div>
  );
}
