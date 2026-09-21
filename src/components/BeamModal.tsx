import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Type,
  EyeOff,
  Square,
  Sparkles,
  HelpCircle,
  Keyboard,
  Sliders,
  Layers,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  History,
  RotateCcw,
} from 'lucide-react';
import { BeamSlide, BeamTheme, BeamFont, RecentBeamItem } from '../types';
import { getSettings, getRecentBeams, addRecentBeam, clearRecentBeams } from '../lib/storage';

interface BeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  sourceBadge: string;
  slides: BeamSlide[];
  initialSlideIndex?: number;
  initialTheme?: BeamTheme;
  initialFont?: BeamFont;
  isSessionBeam?: boolean;
  sessionTitle?: string;
}

export const BeamModal: React.FC<BeamModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  sourceBadge,
  slides,
  initialSlideIndex = 0,
  initialTheme = 'ah-sanctuary',
  initialFont = 'lora',
  isSessionBeam = false,
  sessionTitle,
}) => {
  const [activeSlides, setActiveSlides] = useState<BeamSlide[]>(slides);
  const [activeTitle, setActiveTitle] = useState(title);
  const [activeSubtitle, setActiveSubtitle] = useState(subtitle);
  const [activeBadge, setActiveBadge] = useState(sourceBadge);
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isTextCleared, setIsTextCleared] = useState(false);
  const [theme, setTheme] = useState<BeamTheme>(initialTheme);
  const [font, setFont] = useState<BeamFont>(initialFont);
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  const [showRecentsDrawer, setShowRecentsDrawer] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentBeamItem[]>(() => getRecentBeams());
  const [showControls, setShowControls] = useState(() => getSettings().showBeamControls ?? false);

  // Sync settings and save to recents when opened
  useEffect(() => {
    if (isOpen) {
      const s = getSettings();
      setActiveSlides(slides);
      setActiveTitle(title);
      setActiveSubtitle(subtitle);
      setActiveBadge(sourceBadge);
      setCurrentIndex(initialSlideIndex);
      setIsBlackout(false);
      setIsTextCleared(false);
      setShowControls(s.showBeamControls ?? false);
      setTheme(initialTheme || s.beamTheme || 'ah-sanctuary');
      setFont(initialFont || s.beamFont || 'lora');
      setShowRecentsDrawer(false);

      if (slides.length > 0) {
        addRecentBeam({
          id: `beam_${title}_${sourceBadge}`.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          title: title || slides[0]?.title || 'Projection',
          subtitle: subtitle || '',
          sourceBadge: sourceBadge || slides[0]?.sourceBadge || '',
          slideCount: slides.length,
          slides,
          theme: initialTheme,
          font: initialFont,
        });
        setRecentItems(getRecentBeams());
      }
    }
  }, [isOpen, slides, title, subtitle, sourceBadge, initialSlideIndex, initialTheme, initialFont]);

  // Dynamic Time-of-Day theme computation for 'auto-time'
  const timeOfDayInfo = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        label: 'Morning Dawn',
        icon: Sunrise,
        bgClass: 'bg-gradient-to-b from-amber-950/90 via-slate-900 to-black text-amber-100',
        isLight: false,
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        label: 'Afternoon Azure',
        icon: Sun,
        bgClass: 'bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 text-sky-100',
        isLight: false,
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        label: 'Evening Twilight',
        icon: Sunset,
        bgClass: 'bg-gradient-to-b from-indigo-950 via-purple-950/70 to-black text-amber-100',
        isLight: false,
      };
    } else {
      return {
        label: 'Midnight Obsidian',
        icon: Moon,
        bgClass: 'bg-gradient-to-b from-slate-950 via-zinc-950 to-black text-slate-100',
        isLight: false,
      };
    }
  }, []);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0] || {
    label: 'Slide',
    title: activeTitle,
    sourceBadge: activeBadge,
    lines: ['No text loaded'],
  };

  const nextSlide = useCallback(() => {
    if (currentIndex < activeSlides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsTextCleared(false);
    }
  }, [currentIndex, activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsTextCleared(false);
    }
  }, [currentIndex]);

  // Auto-scroll session scrollbar to keep active slide card in view
  useEffect(() => {
    if (isSessionBeam || activeSlides.length > 1) {
      const activeEl = document.getElementById(`beam-session-slide-${currentIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, isSessionBeam, activeSlides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const cycleTheme = () => {
    const themes: BeamTheme[] = [
      'ah-sanctuary',
      'sanctuary-blue',
      'obsidian-dark',
      'holy-gold',
      'cathedral-light',
      'auto-time',
    ];
    setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
  };

  const cycleFont = () => {
    const fonts: BeamFont[] = ['lora', 'playfair', 'cinzel', 'garamond', 'sans', 'mono'];
    setFont((prev) => fonts[(fonts.indexOf(prev) + 1) % fonts.length]);
  };

  const handleSelectRecent = (item: RecentBeamItem) => {
    setActiveSlides(item.slides);
    setActiveTitle(item.title);
    setActiveSubtitle(item.subtitle);
    setActiveBadge(item.sourceBadge);
    setCurrentIndex(0);
    setIsTextCleared(false);
    setIsBlackout(false);
    if (item.theme) setTheme(item.theme);
    if (item.font) setFont(item.font);
    setShowRecentsDrawer(false);
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          setIsBlackout((prev) => !prev);
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setIsTextCleared((prev) => !prev);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          cycleTheme();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setFontScale((s) => Math.min(1.4, s + 0.08));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setFontScale((s) => Math.max(0.75, s - 0.08));
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsModal((prev) => !prev);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setShowFloatingControls((prev) => !prev);
          break;
        case 'Escape':
          if (showShortcutsModal) {
            setShowShortcutsModal(false);
          } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        default:
          if (/^[1-9]$/.test(e.key)) {
            const num = parseInt(e.key, 10);
            const targetIdx = activeSlides.findIndex(
              (s) =>
                s.label.toLowerCase().includes(`verse ${num}`) ||
                s.label.toLowerCase().includes(`v${num}`) ||
                s.label.toLowerCase().includes(`v. ${num}`)
            );
            if (targetIdx !== -1) {
              setCurrentIndex(targetIdx);
              setIsTextCleared(false);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose, activeSlides, showShortcutsModal]);

  // Primary slide progress percentage (clean bar at bottom)
  const slideProgressPercent = activeSlides.length > 0
    ? Math.min(100, Math.max(0, ((currentIndex + 1) / activeSlides.length) * 100))
    : 0;

  // Secondary progress percentage alone for Session Beam (subtle, thinner, without wordings)
  const sessionItemProgressPercent = useMemo(() => {
    if (!isSessionBeam || activeSlides.length <= 1) return slideProgressPercent;
    const distinctKeys: string[] = [];
    for (const s of activeSlides) {
      const key = s.sourceBadge || s.title || s.hymnId || '';
      if (key && !distinctKeys.includes(key)) {
        distinctKeys.push(key);
      }
    }
    if (distinctKeys.length <= 1) return slideProgressPercent;
    const currentKey = currentSlide.sourceBadge || currentSlide.title || currentSlide.hymnId || '';
    const currentItemIndex = distinctKeys.indexOf(currentKey);
    const itemIdx = currentItemIndex >= 0 ? currentItemIndex : 0;
    return Math.min(100, Math.max(0, ((itemIdx + 1) / distinctKeys.length) * 100));
  }, [isSessionBeam, activeSlides, currentSlide, slideProgressPercent]);

  if (!isOpen) return null;

  // Background style classes
  const themeBgClasses: Record<BeamTheme, string> = {
    'ah-sanctuary': 'beam-bg-ah-sanctuary text-amber-50',
    'sanctuary-blue': 'beam-bg-sanctuary-blue text-amber-100',
    'obsidian-dark': 'beam-bg-obsidian-dark text-slate-100',
    'holy-gold': 'beam-bg-holy-gold text-amber-100',
    'cathedral-light': 'beam-bg-cathedral-light text-slate-950',
    'auto-time': timeOfDayInfo.bgClass,
  };

  const fontClass = `beam-font-${font}`;
  const isLight = theme === 'cathedral-light';
  const TimeIcon = timeOfDayInfo.icon;

  // Format the top left title (e.g. "Hymn 159 · The Old Rugged Cross")
  const displayTopLeft = currentSlide.sourceBadge || activeBadge;
  // Format the top right verse tag (e.g. "Verse 2a")
  const displayTopRight = currentSlide.verseTag || currentSlide.label;

  return (
    <div
      id="beam-projector-view"
      className={`fixed inset-0 z-50 flex flex-col justify-between select-none transition-colors duration-500 overflow-hidden ${
        isBlackout ? 'bg-black text-transparent' : themeBgClasses[theme]
      }`}
    >
      {/* 1. TOP HEADER (AdventistHymns Minimal Layout: Top-Left Hymn Title, Top-Right Verse Tag) */}
      <header
        className={`w-full px-8 sm:px-12 pt-6 sm:pt-8 flex items-center justify-between text-xs sm:text-sm font-sans tracking-wide transition-opacity duration-300 z-20 ${
          isBlackout ? 'opacity-0' : isLight ? 'text-slate-600' : 'text-slate-400/90'
        }`}
      >
        {/* Top Left: e.g. "Hymn 159 · The Old Rugged Cross" */}
        <div className="font-medium tracking-normal text-xs sm:text-sm flex items-center gap-2">
          <span>{displayTopLeft}</span>
        </div>

        {/* Top Right: e.g. "Verse 2a" or "Refrain" or "Intro" */}
        <div className="flex items-center gap-4">
          <span className="font-semibold text-xs sm:text-sm">{displayTopRight}</span>

          {/* Discreet Exit Button on hover or touch */}
          <button
            onClick={onClose}
            className={`p-1 rounded-full opacity-40 hover:opacity-100 transition ${
              isLight ? 'hover:bg-slate-200 text-slate-800' : 'hover:bg-white/10 text-white'
            }`}
            title="Exit Beaming (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER STAGE (Pure High-Legibility Lyrics) */}
      <main
        className={`flex-1 flex flex-col items-center justify-center px-6 sm:px-16 text-center transition-all duration-300 ${
          isBlackout || isTextCleared ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
        }`}
        onClick={(e) => {
          // Click left half to go prev, right half to go next
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.55) {
            nextSlide();
          } else if (clickX < rect.width * 0.45) {
            prevSlide();
          }
        }}
      >
        <div className="max-w-5xl mx-auto w-full">
          {/* SPECIAL INTRO SLIDE (Only on initial hymn load) */}
          {currentSlide.isIntro && currentSlide.introDetails ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase border ${
                    isLight
                      ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                      : 'bg-white/10 text-amber-300 border-white/15'
                  }`}
                >
                  {currentSlide.introDetails.collection} #{currentSlide.introDetails.hymnNumber}
                </span>
                {currentSlide.introDetails.key && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-black/30 text-slate-300 border-white/10'
                    }`}
                  >
                    Key of {currentSlide.introDetails.key}
                  </span>
                )}
              </div>

              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight ${fontClass} ${
                  isLight ? 'text-slate-900 beam-lyric-shadow-light' : 'text-white beam-lyric-shadow'
                }`}
                style={{
                  fontSize: `clamp(2.4rem, ${4.2 * fontScale}vw + 1.2rem, 5.2rem)`,
                  lineHeight: 1.18,
                }}
              >
                {currentSlide.introDetails.title}
              </h1>

              <div
                className={`pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm border-t ${
                  isLight
                    ? 'border-slate-300/60 text-slate-600'
                    : 'border-white/10 text-slate-300/80'
                }`}
              >
                {currentSlide.introDetails.author && (
                  <span>
                    Writer: <strong className="font-semibold">{currentSlide.introDetails.author}</strong>
                  </span>
                )}
                {currentSlide.introDetails.tune && (
                  <span>
                    Tune: <strong className="font-semibold">{currentSlide.introDetails.tune}</strong>
                  </span>
                )}
                {currentSlide.introDetails.scriptureReference && (
                  <span>
                    Scripture: <strong className="font-semibold">{currentSlide.introDetails.scriptureReference}</strong>
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD LYRIC DISPLAY: Exactly styled as image.png */
            <div className="space-y-3">
              <div
                className={`font-semibold tracking-tight transition-all duration-200 ${fontClass} ${
                  currentSlide.isRefrain || currentSlide.label.toLowerCase().includes('refrain') || currentSlide.label.toLowerCase().includes('chorus')
                    ? 'italic font-serif'
                    : ''
                } ${
                  isLight ? 'text-slate-950 beam-lyric-shadow-light' : 'text-white beam-lyric-shadow'
                }`}
                style={{
                  fontSize: `clamp(2.2rem, ${3.4 * fontScale}vw + 1.2rem, 4.8rem)`,
                  lineHeight: 1.36,
                }}
              >
                {currentSlide.lines.map((line, idx) => (
                  <div key={idx} className="my-2.5 sm:my-3">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM FOOTER WITH CLEAN PROGRESS BAR (Slide progress with numbers/percentages hidden, and secondary progress bar alone for Session Beam) */}
      <footer className="w-full relative z-20 pb-0">
        {/* If user enabled on-screen controls in Settings, render floating toolbar */}
        {showControls ? (
          <div className="w-full px-6 pb-4 flex items-end justify-between pointer-events-none">
            {/* Bottom Left: Minimalist dark circular '?' button for shortcuts */}
            <button
              id="beam-shortcuts-btn"
              onClick={() => setShowShortcutsModal(true)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition pointer-events-auto shadow-md ${
                isLight
                  ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  : 'bg-black/60 text-slate-400 hover:text-white hover:bg-black/90 border border-white/10'
              }`}
              title="Keyboard Shortcuts (?)"
            >
              ?
            </button>

            {/* Mini tool palette */}
            <div className="pointer-events-auto flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl shadow-xl border animate-fade-in ${
                  isLight ? 'bg-white/95 border-slate-200' : 'bg-black/80 border-white/10 backdrop-blur-md'
                }`}
              >
                <button
                  onClick={() => setIsBlackout((p) => !p)}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    isBlackout ? 'bg-red-600 text-white' : 'hover:bg-white/10 text-slate-300'
                  }`}
                  title="Blackout (B)"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsTextCleared((p) => !p)}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    isTextCleared ? 'bg-amber-600 text-white' : 'hover:bg-white/10 text-slate-300'
                  }`}
                  title="Clear Text (C)"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>

                {/* Font Scaling Buttons (A- / A+) */}
                <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-white/10 text-slate-300">
                  <button
                    onClick={() => setFontScale((s) => Math.max(0.7, Number((s - 0.08).toFixed(2))))}
                    className="px-1.5 py-0.5 rounded hover:bg-white/20 text-[11px] font-bold"
                    title="Smaller Text (-)"
                  >
                    A-
                  </button>
                  <span className="text-[10px] font-mono opacity-80 min-w-[28px] text-center">
                    {Math.round(fontScale * 100)}%
                  </span>
                  <button
                    onClick={() => setFontScale((s) => Math.min(1.45, Number((s + 0.08).toFixed(2))))}
                    className="px-1.5 py-0.5 rounded hover:bg-white/20 text-[11px] font-bold"
                    title="Larger Text (+)"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={cycleTheme}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 flex items-center gap-1"
                  title={`Theme: ${theme === 'auto-time' ? `Auto (${timeOfDayInfo.label})` : theme} (T)`}
                >
                  {theme === 'auto-time' ? (
                    <TimeIcon className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
                <button
                  onClick={cycleFont}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
                  title="Font"
                >
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {/* Recent Presentations List */}
                <button
                  onClick={() => setShowRecentsDrawer((p) => !p)}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    showRecentsDrawer ? 'bg-amber-600 text-white' : 'hover:bg-white/10 text-slate-300'
                  }`}
                  title="Recent Presentations History"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Bottom Right: Discreet 'hoh' (Have On Behalf) watermark */}
            <div className="select-none opacity-25 hover:opacity-50 transition font-serif font-bold text-base tracking-tight pointer-events-none">
              hoh
            </div>
          </div>
        ) : (
          <div className="w-full px-6 pb-2 flex items-end justify-between pointer-events-none">
            {/* Minimalist reveal control on hover/touch */}
            <div className="pointer-events-auto opacity-30 hover:opacity-100 transition flex items-center gap-1.5">
              <button
                onClick={() => setShowRecentsDrawer((p) => !p)}
                className="p-1.5 rounded-full bg-black/60 text-slate-400 hover:text-white border border-white/10"
                title="Recent Presentations History"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-black/60 text-slate-400 hover:text-white border border-white/10"
                title="Shortcuts (?)"
              >
                ?
              </button>
            </div>

            {/* Subtle watermark */}
            <div className="select-none opacity-20 transition font-serif font-bold text-xs tracking-tight pointer-events-none">
              hoh
            </div>
          </div>
        )}

        {/* PROGRESS BARS AT BOTTOM (Numbers and percentages hidden; subtle and thin) */}
        <div
          className={`w-full transition-opacity duration-300 ${
            isBlackout ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Secondary progress bar alone for Session Beam (thinner, subtle, no wordings) */}
          {isSessionBeam && (
            <div
              className={`w-full h-[1px] sm:h-[1.5px] ${
                isLight ? 'bg-slate-300/40' : 'bg-white/10'
              } overflow-hidden`}
              title="Overall Session Progress"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  isLight ? 'bg-amber-600/50' : 'bg-amber-400/40'
                }`}
                style={{ width: `${sessionItemProgressPercent}%` }}
              />
            </div>
          )}

          {/* Primary progress bar at the bottom (slide 4 of 9 and xx% hidden) */}
          <div
            className={`w-full h-[1.5px] sm:h-[2px] ${
              isLight ? 'bg-slate-300/60' : 'bg-white/15'
            } overflow-hidden`}
            title="Slide Progress"
          >
            <div
              className={`h-full transition-all duration-300 ${
                isLight ? 'bg-amber-600' : 'bg-amber-400'
              }`}
              style={{ width: `${slideProgressPercent}%` }}
            />
          </div>
        </div>
      </footer>

      {/* RECENT PRESENTATIONS DRAWER / MODAL */}
      {showRecentsDrawer && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRecentsDrawer(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Recent Projections</h3>
              </div>
              <div className="flex items-center gap-2">
                {recentItems.length > 0 && (
                  <button
                    onClick={() => {
                      clearRecentBeams();
                      setRecentItems([]);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-800 transition"
                  >
                    Clear History
                  </button>
                )}
                <button
                  onClick={() => setShowRecentsDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Select any previously projected hymn or scripture to immediately switch presentation slides:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800">
              {recentItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No previous projections in this session.
                </div>
              ) : (
                recentItems.map((item) => {
                  const isCurrent =
                    item.title === activeTitle && item.sourceBadge === activeBadge;
                  return (
                    <button
                      key={item.id + item.timestamp}
                      onClick={() => handleSelectRecent(item)}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {item.sourceBadge}
                          </span>
                          <span className="text-xs font-semibold truncate text-white">
                            {item.title}
                          </span>
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300">
                          {item.slideCount} slides
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. KEYBOARD SHORTCUTS MODAL (Opened via '?' or button) */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Presentation Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Next Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  Space / →
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Previous Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  ← / Bksp
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Blackout Screen</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  B
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Clear Text</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  C
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Cycle Theme</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  T
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Fullscreen</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  F
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Font Scaling</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  + / -
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span>Jump to Stanza</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] font-bold text-amber-300">
                  1 - 9
                </kbd>
              </div>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400">
                Press <kbd className="font-mono text-white bg-slate-800 px-1.5 py-0.5 rounded">Esc</kbd> anytime to exit presentation.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
