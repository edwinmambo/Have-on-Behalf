import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Maximize,
  Minimize,
  EyeOff,
  Square,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  Music,
  ArrowLeft,
  Type,
  Sun,
  Moon,
  Clock,
  Sunrise,
  Sunset,
  X,
  ScrollText,
} from 'lucide-react';
import {
  ActiveBeamState,
  getStoredBeamState,
  listenToBeamUpdates,
  broadcastBeamState,
  broadcastBeamHeartbeat,
  requestBeamStateSync,
} from '../lib/beamSync';
import { BeamTheme, BeamFont, Hymn } from '../types';
import { getSlideCounterInfo, buildHymnBeamSlides } from '../lib/beamSlidesHelper';
import { HYMNS_DATA } from '../data/hymnsData';
import { getSettings, getRecentBeams } from '../lib/storage';

function getInitialBeamState(): ActiveBeamState {
  const s = getSettings();
  const stored = getStoredBeamState();
  if (stored && stored.slides && stored.slides.length > 0) {
    return {
      ...stored,
      font: s.beamFont || stored.font || 'lora',
      theme: s.beamTheme || stored.theme || 'ah-sanctuary',
      isBlackout: false,
      isTextCleared: false,
      currentIndex:
        typeof stored.currentIndex === 'number' &&
        stored.currentIndex >= 0 &&
        stored.currentIndex < stored.slides.length
          ? stored.currentIndex
          : 0,
    };
  }

  const recents = getRecentBeams();
  if (recents.length > 0 && recents[0].slides && recents[0].slides.length > 0) {
    const r = recents[0];
    const s = getSettings();
    const state: ActiveBeamState = {
      isOpen: true,
      title: r.title,
      subtitle: r.subtitle,
      sourceBadge: r.sourceBadge,
      slides: r.slides,
      currentIndex: 0,
      theme: r.theme || s.beamTheme || 'ah-sanctuary',
      font: r.font || s.beamFont || 'lora',
      fontScale: 1.0,
      isBlackout: false,
      isTextCleared: false,
      updatedAt: Date.now(),
    };
    broadcastBeamState(state);
    return state;
  }

  // Guaranteed default sanctuary hymn presentation: SDAH #1 "Praise to the Lord, the Almighty"
  const defaultHymn = HYMNS_DATA[0];
  const slides = buildHymnBeamSlides(defaultHymn, {
    includeIntro: true,
    includeOutro: true,
  });
  const state: ActiveBeamState = {
    isOpen: true,
    title: `${defaultHymn.collection} #${defaultHymn.number} · ${defaultHymn.title}`,
    subtitle: `${defaultHymn.author || 'Sacred Song'}${defaultHymn.key ? ` • Key of ${defaultHymn.key}` : ''}`,
    sourceBadge: `${defaultHymn.collection} #${defaultHymn.number}`,
    slides,
    currentIndex: 0,
    theme: s.beamTheme || 'ah-sanctuary',
    font: s.beamFont || 'lora',
    fontScale: 1.0,
    isBlackout: false,
    isTextCleared: false,
    updatedAt: Date.now(),
  };
  broadcastBeamState(state);
  return state;
}

export const BeamProjectorScreen: React.FC = () => {
  const [beamState, setBeamState] = useState<ActiveBeamState>(() => getInitialBeamState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHud, setShowHud] = useState(false);
  const [showSlidePicker, setShowSlidePicker] = useState(false);
  const [showHymnPicker, setShowHymnPicker] = useState(false);
  const [hymnSearch, setHymnSearch] = useState('');
  const [isContinuousFlow, setIsContinuousFlow] = useState(false);
  const hudTimeoutRef = useRef<number | null>(null);
  const continuousActiveRef = useRef<HTMLDivElement | null>(null);

  // 1. Periodically broadcast heartbeat every 2 seconds
  useEffect(() => {
    broadcastBeamHeartbeat();
    const interval = window.setInterval(() => {
      broadcastBeamHeartbeat();
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  // 2. Request initial state sync from main controller window on mount
  useEffect(() => {
    requestBeamStateSync();
  }, []);

  // 3. Listen to direct settings updates over BroadcastChannel for immediate font persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('haveonbehalf_beam_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'BEAM_SETTINGS_UPDATE' && event.data.payload) {
          const s = getSettings();
          setActiveSettings(s);
          if (event.data.payload.beamFont) {
            setBeamState((prev) => ({
              ...prev,
              font: event.data.payload.beamFont,
              updatedAt: Date.now(),
            }));
          }
        }
      };
    } catch {
      // ignore
    }
    return () => {
      if (bc) bc.close();
    };
  }, []);

  const slides = beamState.slides || [];
  const currentIndex =
    typeof beamState.currentIndex === 'number' &&
    beamState.currentIndex >= 0 &&
    beamState.currentIndex < slides.length
      ? beamState.currentIndex
      : 0;

  // 3. Smoothly scroll active stanza into view in Continuous Flow mode
  useEffect(() => {
    if (isContinuousFlow && continuousActiveRef.current) {
      continuousActiveRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isContinuousFlow]);

  // Subscribe to real-time sync from main window
  useEffect(() => {
    const unsubscribe = listenToBeamUpdates((newState) => {
      if (newState && newState.slides && newState.slides.length > 0) {
        setBeamState(newState);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update document title for projector window
  useEffect(() => {
    if (beamState?.title) {
      document.title = `${beamState.title} - Cast Screen`;
    } else {
      document.title = 'Cast Screen - Have On Behalf';
    }
  }, [beamState?.title]);

  const [activeSettings, setActiveSettings] = useState(() => getSettings());

  useEffect(() => {
    const handleStorage = () => setActiveSettings(getSettings());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('haveonbehalf_settings_changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('haveonbehalf_settings_changed', handleStorage);
    };
  }, []);

  const currentSlide = slides[currentIndex] || slides[0] || null;
  const isBlackout = beamState.isBlackout ?? false;
  const isTextCleared = beamState.isTextCleared ?? false;
  const theme: BeamTheme = beamState.theme || activeSettings.beamTheme || 'ah-sanctuary';
  const font: BeamFont = activeSettings.beamFont || beamState.font || 'lora';
  const fontScale = beamState.fontScale ?? 1.0;

  // Auto-hide HUD on idle mouse
  const triggerHud = useCallback(() => {
    setShowHud(true);
    if (hudTimeoutRef.current) {
      window.clearTimeout(hudTimeoutRef.current);
    }
    hudTimeoutRef.current = window.setTimeout(() => {
      setShowHud(false);
      setShowSlidePicker(false);
    }, 4000);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => triggerHud();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hudTimeoutRef.current) window.clearTimeout(hudTimeoutRef.current);
    };
  }, [triggerHud]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    if (currentIndex < slides.length - 1) {
      const updated: ActiveBeamState = {
        ...beamState,
        currentIndex: currentIndex + 1,
        isTextCleared: false,
        updatedAt: Date.now(),
      };
      setBeamState(updated);
      broadcastBeamState(updated);
    }
  }, [beamState, currentIndex, slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    if (currentIndex > 0) {
      const updated: ActiveBeamState = {
        ...beamState,
        currentIndex: currentIndex - 1,
        isTextCleared: false,
        updatedAt: Date.now(),
      };
      setBeamState(updated);
      broadcastBeamState(updated);
    }
  }, [beamState, currentIndex, slides.length]);

  const jumpToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        const updated: ActiveBeamState = {
          ...beamState,
          currentIndex: index,
          isTextCleared: false,
          updatedAt: Date.now(),
        };
        setBeamState(updated);
        broadcastBeamState(updated);
        setShowSlidePicker(false);
      }
    },
    [beamState, slides.length]
  );

  const toggleBlackout = useCallback(() => {
    const updated: ActiveBeamState = {
      ...beamState,
      isBlackout: !beamState.isBlackout,
      updatedAt: Date.now(),
    };
    setBeamState(updated);
    broadcastBeamState(updated);
  }, [beamState]);

  const toggleClearText = useCallback(() => {
    const updated: ActiveBeamState = {
      ...beamState,
      isTextCleared: !beamState.isTextCleared,
      updatedAt: Date.now(),
    };
    setBeamState(updated);
    broadcastBeamState(updated);
  }, [beamState]);

  const cycleTheme = useCallback(() => {
    const themes: BeamTheme[] = [
      'ah-sanctuary',
      'sanctuary-blue',
      'obsidian-dark',
      'holy-gold',
      'cathedral-light',
      'auto-time',
    ];
    const currentIdx = themes.indexOf(theme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    const updated: ActiveBeamState = {
      ...beamState,
      theme: nextTheme,
      updatedAt: Date.now(),
    };
    setBeamState(updated);
    broadcastBeamState(updated);
  }, [beamState, theme]);

  const setScale = useCallback(
    (delta: number) => {
      const newScale = Math.min(1.6, Math.max(0.7, Number((fontScale + delta).toFixed(2))));
      const updated: ActiveBeamState = {
        ...beamState,
        fontScale: newScale,
        updatedAt: Date.now(),
      };
      setBeamState(updated);
      broadcastBeamState(updated);
    },
    [beamState, fontScale]
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleExit = () => {
    if (window.location.hash === '#beam-projector') {
      window.location.hash = '';
    } else if (window.opener) {
      window.close();
    } else if (window.location.search.includes('beam=projector')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('beam');
      window.location.href = url.pathname + (url.search ? url.search : '') + url.hash;
    } else {
      window.location.hash = '';
    }
  };

  const handleSelectHymn = (hymn: Hymn) => {
    const newSlides = buildHymnBeamSlides(hymn, {
      includeIntro: true,
      includeOutro: true,
    });
    const s = getSettings();
    const updated: ActiveBeamState = {
      isOpen: true,
      title: `${hymn.collection} #${hymn.number} · ${hymn.title}`,
      subtitle: `${hymn.author || 'Sacred Song'}${hymn.key ? ` • Key of ${hymn.key}` : ''}`,
      sourceBadge: `${hymn.collection} #${hymn.number}`,
      slides: newSlides,
      currentIndex: 0,
      theme: beamState.theme || s.beamTheme || 'ah-sanctuary',
      font: beamState.font || s.beamFont || 'lora',
      fontScale: beamState.fontScale || 1.0,
      isBlackout: false,
      isTextCleared: false,
      updatedAt: Date.now(),
    };
    setBeamState(updated);
    broadcastBeamState(updated);
    setShowHymnPicker(false);
  };

  // Keyboard navigation when screen has focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          toggleBlackout();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          toggleClearText();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          cycleTheme();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          setShowHymnPicker((prev) => !prev);
          break;
        case 'Escape':
          if (showHymnPicker) {
            setShowHymnPicker(false);
          } else if (showSlidePicker) {
            setShowSlidePicker(false);
          } else {
            handleExit();
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          setScale(0.08);
          break;
        case '-':
        case '_':
          e.preventDefault();
          setScale(-0.08);
          break;
        default:
          if (/^[1-9]$/.test(e.key)) {
            const num = parseInt(e.key, 10);
            const targetIdx = slides.findIndex(
              (s) =>
                s.stanzaNumber === num ||
                s.label.toLowerCase().includes(`verse ${num}`) ||
                s.label.toLowerCase().includes(`v${num}`)
            );
            if (targetIdx !== -1) {
              jumpToSlide(targetIdx);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nextSlide,
    prevSlide,
    toggleBlackout,
    toggleClearText,
    cycleTheme,
    setScale,
    showHymnPicker,
    showSlidePicker,
    slides,
    jumpToSlide,
  ]);

  // Dynamic theme background classes
  const themeBgClasses: Record<BeamTheme, string> = useMemo(
    () => ({
      'ah-sanctuary': 'beam-bg-ah-sanctuary text-amber-50',
      'sanctuary-blue': 'beam-bg-sanctuary-blue text-amber-100',
      'obsidian-dark': 'beam-bg-obsidian-dark text-slate-100',
      'holy-gold': 'beam-bg-holy-gold text-amber-100',
      'cathedral-light': 'beam-bg-cathedral-light text-slate-950',
      'auto-time': 'bg-gradient-to-b from-slate-950 via-zinc-950 to-black text-slate-100',
    }),
    []
  );

  const isLight = theme === 'cathedral-light';
  const fontClass = `beam-font-${font}`;

  const displayTopLeft = currentSlide?.sourceBadge || beamState.sourceBadge || beamState.title;
  const currentSlideInfo = getSlideCounterInfo(currentSlide || slides[0], currentIndex, slides.length);
  const displayTopRight = currentSlide?.isRefrain
    ? 'Refrain'
    : currentSlide?.isOutro
    ? 'Amen'
    : currentSlide?.isIntro
    ? 'Intro'
    : currentSlide?.verseTag || currentSlideInfo.badgeText;

  // Filtered hymns for quick picker
  const filteredHymns = useMemo(() => {
    if (!hymnSearch.trim()) return HYMNS_DATA.slice(0, 24);
    const q = hymnSearch.toLowerCase().trim();
    return HYMNS_DATA.filter(
      (h) =>
        h.number.toString().includes(q) ||
        h.title.toLowerCase().includes(q) ||
        (h.tune && h.tune.toLowerCase().includes(q))
    ).slice(0, 24);
  }, [hymnSearch]);

  return (
    <div
      id="beam-second-screen-viewport"
      className={`fixed inset-0 z-50 flex flex-col justify-between select-none transition-colors duration-500 overflow-hidden ${
        isBlackout ? 'bg-black text-transparent' : themeBgClasses[theme] || 'bg-black text-white'
      }`}
      onMouseEnter={() => triggerHud()}
      onClick={(e) => {
        // If clicking background (not buttons), advance or retreat slide
        if (showHymnPicker || showSlidePicker) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > rect.width * 0.55) {
          nextSlide();
        } else if (clickX < rect.width * 0.45) {
          prevSlide();
        }
      }}
    >
      {/* 1. TOP HEADER (AdventistHymns Clean Sanctuary Header) */}
      <header
        className={`w-full px-6 sm:px-12 pt-5 sm:pt-8 flex items-center justify-between text-xs sm:text-sm font-sans tracking-wide transition-opacity duration-300 z-20 ${
          isBlackout ? 'opacity-0' : isLight ? 'text-slate-600' : 'text-slate-300/80'
        }`}
      >
        <div className="font-semibold text-xs sm:text-sm flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHymnPicker(true);
            }}
            className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
            title="Click to Switch Hymn (H)"
          >
            <span>{displayTopLeft}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 font-semibold text-xs sm:text-sm">
          <span
            className={
              currentSlide?.isRefrain ? 'italic text-amber-300 font-serif font-bold' : ''
            }
          >
            {displayTopRight}
          </span>

          {/* Quick Exit to Main App */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExit();
            }}
            className={`p-1.5 rounded-full transition opacity-40 hover:opacity-100 ${
              isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-white'
            }`}
            title="Return to Main App (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER STAGE */}
      <main
        className={`flex-1 flex flex-col items-center justify-center px-6 sm:px-16 text-center transition-all duration-300 relative ${
          isBlackout || isTextCleared ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-5xl mx-auto w-full">
          {/* SPECIAL OUTRO / AMEN SLIDE */}
          {currentSlide?.isOutro ? (
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase border ${
                    isLight
                      ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                      : 'bg-white/10 text-amber-300 border-white/15'
                  }`}
                >
                  {currentSlide.sourceBadge || 'Hymn Concluded'}
                </span>
              </div>
              <h1
                className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight font-serif italic ${
                  isLight ? 'text-slate-900 beam-lyric-shadow-light' : 'text-white beam-lyric-shadow'
                }`}
                style={{ transform: `scale(${fontScale})` }}
              >
                Amen
              </h1>
              <p
                className={`text-base sm:text-lg font-serif ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {currentSlide.title || beamState.title}
              </p>
            </div>
          ) : currentSlide?.isIntro ? (
            /* SPECIAL INTRO / TITLE SLIDE */
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-3">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase border ${
                    isLight
                      ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                      : 'bg-white/10 text-amber-300 border-white/15'
                  }`}
                >
                  {currentSlide.introDetails?.collection || currentSlide.sourceBadge || 'Hymn'}{' '}
                  {currentSlide.introDetails?.hymnNumber
                    ? `#${currentSlide.introDetails.hymnNumber}`
                    : ''}
                </span>
                {currentSlide.introDetails?.key && (
                  <span
                    className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${
                      isLight
                        ? 'bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    Key: {currentSlide.introDetails.key}
                  </span>
                )}
              </div>

              <h1
                className={`text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight ${fontClass} ${
                  isLight ? 'text-slate-900 beam-lyric-shadow-light' : 'text-white beam-lyric-shadow'
                }`}
                style={{ transform: `scale(${fontScale})` }}
              >
                {currentSlide.introDetails?.title || currentSlide.title || beamState.title}
              </h1>

              <div
                className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-sans max-w-xl mx-auto ${
                  isLight ? 'text-slate-600' : 'text-slate-300/80'
                }`}
              >
                {currentSlide.introDetails?.tune && (
                  <span>
                    Tune:{' '}
                    <strong className="font-semibold text-amber-400">
                      {currentSlide.introDetails.tune}
                    </strong>
                  </span>
                )}
                {(currentSlide.introDetails?.author || beamState.subtitle) && (
                  <span>Words: {currentSlide.introDetails?.author || beamState.subtitle}</span>
                )}
                {currentSlide.introDetails?.scriptureReference && (
                  <span>Scripture: {currentSlide.introDetails.scriptureReference}</span>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD SLIDE LYRICS OR SCRIPTURE (SINGLE SLIDE OR CONTINUOUS FLOW) */
            isContinuousFlow ? (
              <div
                data-continuous-flow="true"
                className="max-w-4xl mx-auto space-y-8 py-10 px-4 sm:px-6 max-h-[82vh] overflow-y-auto no-scrollbar scrollbar-none select-none scroll-smooth continuous-flow-container"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
                }}
              >
                {slides.map((s, idx) => {
                  const isActive = idx === currentIndex;
                  if (s.isIntro || s.isOutro) return null;
                  return (
                    <div
                      key={idx}
                      ref={isActive ? continuousActiveRef : null}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (idx !== currentIndex) {
                          const updated: ActiveBeamState = {
                            ...beamState,
                            currentIndex: idx,
                            isTextCleared: false,
                            updatedAt: Date.now(),
                          };
                          setBeamState(updated);
                          broadcastBeamState(updated);
                        }
                      }}
                      className={`cursor-pointer transition-all duration-500 rounded-3xl p-6 sm:p-8 ${
                        isActive
                          ? isLight
                            ? 'bg-amber-500/15 border-2 border-amber-500/60 text-slate-950 scale-[1.01] shadow-md ring-1 ring-amber-400/40'
                            : 'bg-white/12 border-2 border-amber-400/70 text-white scale-[1.01] shadow-2xl backdrop-blur-xs ring-1 ring-amber-300/30'
                          : isLight
                          ? 'opacity-40 hover:opacity-75 text-slate-800'
                          : 'opacity-30 hover:opacity-65 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                          {s.isRefrain ? 'Refrain' : s.verseTag || s.label || `Stanza ${idx}`}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-600 dark:text-amber-300 font-bold animate-pulse">
                            Active Stanza
                          </span>
                        )}
                      </div>
                      <div
                        className={`space-y-2.5 leading-relaxed ${fontClass} ${
                          s.isRefrain ? 'italic font-serif font-medium' : ''
                        }`}
                        style={{
                          fontSize: `clamp(1.5rem, ${2.2 * fontScale}vw + 0.8rem, 3.2rem)`,
                          lineHeight: 1.38,
                        }}
                      >
                        {s.lines && s.lines.length > 0 ? (
                          s.lines.map((line, lIdx) => (
                            <p key={lIdx} className="tracking-wide">
                              {line}
                            </p>
                          ))
                        ) : (
                          <p>{s.title || s.label}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`space-y-4 sm:space-y-6 leading-relaxed transition-all duration-300 ${fontClass} ${
                  currentSlide?.isRefrain ? 'italic font-serif font-medium' : ''
                } ${isLight ? 'text-slate-950 beam-lyric-shadow-light' : 'text-white beam-lyric-shadow'}`}
                style={{
                  fontSize: `clamp(2rem, ${3.2 * fontScale}vw + 1rem, 4.5rem)`,
                  lineHeight: 1.38,
                }}
              >
                {currentSlide?.lines && currentSlide.lines.length > 0 ? (
                  currentSlide.lines.map((line, idx) => (
                    <p key={idx} className="tracking-wide my-2 sm:my-3">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="tracking-wide text-2xl sm:text-4xl font-bold">
                    {currentSlide?.title || currentSlide?.label || beamState.title}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </main>

      {/* REASSURING BLACKOUT & CLEAR TEXT OVERLAYS */}
      {isBlackout && (
        <div
          onClick={toggleBlackout}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/95 cursor-pointer"
        >
          <div className="text-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 animate-pulse">
            Screen is Blacked Out · Click anywhere or press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono font-bold">B</kbd>{' '}
            to restore
          </div>
        </div>
      )}
      {!isBlackout && isTextCleared && (
        <div
          onClick={toggleClearText}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 animate-pulse cursor-pointer"
        >
          Lyrics Cleared · Click anywhere or press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono font-bold">C</kbd>{' '}
          to restore
        </div>
      )}

      {/* 3. VERY SUBTLE BOTTOM PROGRESS BAR */}
      <footer className="w-full pb-0 relative z-20">
        <div className="w-full bg-white/[0.04] dark:bg-white/[0.03] h-[1.5px] overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isLight ? 'bg-amber-600/30' : 'bg-amber-400/30'
            }`}
            style={{
              width: `${currentSlideInfo.progressPercent}%`,
            }}
          />
        </div>
      </footer>

      {/* 4. DISCREET FLOATING HUD (Shows on hover or mouse movement) */}
      <div
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-xs text-white shadow-2xl transition-opacity duration-300 ${
          showHud || showSlidePicker || showHymnPicker
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slide Counter / Jump button */}
        <button
          onClick={() => setShowSlidePicker((prev) => !prev)}
          className="text-[11px] text-amber-400 font-mono font-bold hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10"
          title="Click to jump to any slide"
        >
          <Layers className="w-3 h-3" />
          <span>{currentSlideInfo.counterText}</span>
        </button>

        <span className="text-white/20">|</span>

        {/* Previous Slide */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className={`p-1 rounded hover:bg-white/10 ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-300'
          }`}
          title="Previous Slide (Left Arrow)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Next Slide */}
        <button
          onClick={nextSlide}
          disabled={currentIndex >= slides.length - 1}
          className={`p-1 rounded hover:bg-white/10 ${
            currentIndex >= slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-300'
          }`}
          title="Next Slide (Right Arrow / Space)"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <span className="text-white/20">|</span>

        {/* Quick Hymn Picker Button */}
        <button
          onClick={() => setShowHymnPicker(true)}
          className="p-1 rounded hover:bg-white/10 text-slate-300"
          title="Quick Switch Hymn (H)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Continuous Flow Lyrics Toggle */}
        <button
          onClick={() => setIsContinuousFlow((prev) => !prev)}
          className={`p-1 rounded hover:bg-white/10 ${
            isContinuousFlow ? 'text-amber-400 bg-white/15' : 'text-slate-300'
          }`}
          title={isContinuousFlow ? 'Continuous Lyrics Flow Active (S) - Click for Single Slide' : 'Switch to Continuous Lyrics Flow (S)'}
        >
          <ScrollText className="w-3.5 h-3.5" />
        </button>

        {/* Blackout */}
        <button
          onClick={toggleBlackout}
          className={`p-1 rounded hover:bg-white/10 ${
            isBlackout ? 'text-amber-400 bg-white/10' : 'text-slate-300'
          }`}
          title="Toggle Blackout (B)"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        {/* Clear Text */}
        <button
          onClick={toggleClearText}
          className={`p-1 rounded hover:bg-white/10 ${
            isTextCleared ? 'text-amber-400 bg-white/10' : 'text-slate-300'
          }`}
          title="Toggle Clear Text (C)"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1 rounded hover:bg-white/10 text-slate-300"
          title="Fullscreen (F)"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* Return to Main App */}
        <button
          onClick={handleExit}
          className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
          title="Return to Main App (Esc)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* QUICK SLIDE PICKER POPOVER */}
      {showSlidePicker && (
        <div
          className="fixed bottom-14 right-4 z-50 w-64 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 text-white animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider flex items-center justify-between">
            <span>Slides</span>
            <span className="text-[10px] text-amber-400">{slides.length} total</span>
          </div>
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => jumpToSlide(idx)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition flex items-center justify-between gap-2 my-0.5 ${
                idx === currentIndex
                  ? 'bg-amber-500 text-white font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="truncate">{s.label || `Slide ${idx + 1}`}</span>
              <span className="text-[10px] opacity-70 shrink-0">#{idx + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* QUICK HYMN SWITCHER MODAL */}
      {showHymnPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowHymnPicker(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Cast Another Hymn</h3>
              </div>
              <button
                onClick={() => setShowHymnPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hymnSearch}
                onChange={(e) => setHymnSearch(e.target.value)}
                placeholder="Search hymn #, title, or words..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-72">
              {filteredHymns.map((hymn) => (
                <button
                  key={hymn.id}
                  onClick={() => handleSelectHymn(hymn)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs text-white group-hover:text-amber-400 truncate">
                      {hymn.number}. {hymn.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {hymn.collection} {hymn.tune ? `· Tune: ${hymn.tune}` : ''}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                    {hymn.stanzas.filter((s) => s.type === 'verse').length} stanzas
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
