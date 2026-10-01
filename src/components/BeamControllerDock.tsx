import React, { useState, useEffect } from 'react';
import {
  Cast,
  ChevronLeft,
  ChevronRight,
  Square,
  EyeOff,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  Radio,
  Tv,
} from 'lucide-react';
import {
  ActiveBeamState,
  broadcastBeamState,
  openBeamSecondScreen,
  listenToBeamHeartbeat,
  getBeamProjectorUrl,
} from '../lib/beamSync';
import { BeamTheme, BeamFont } from '../types';
import { getSlideCounterInfo } from '../lib/beamSlidesHelper';

interface BeamControllerDockProps {
  beamState: ActiveBeamState;
  onUpdateBeamState: (state: ActiveBeamState) => void;
  onClose: () => void;
  onOpenModal?: () => void;
}

export const BeamControllerDock: React.FC<BeamControllerDockProps> = ({
  beamState,
  onUpdateBeamState,
  onClose,
  onOpenModal,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSlidePicker, setShowSlidePicker] = useState(false);
  const [showLaunchMenu, setShowLaunchMenu] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Monitor projector window heartbeat (pings every 2s)
  useEffect(() => {
    const unsub = listenToBeamHeartbeat((ts) => {
      setLastHeartbeat(ts);
    });
    return () => unsub();
  }, []);

  const isProjectorConnected = Date.now() - lastHeartbeat < 6000;

  const slides = beamState.slides || [];
  const currentIndex = beamState.currentIndex;
  const currentSlide = slides[currentIndex] || slides[0] || null;
  const currentSlideInfo = currentSlide ? getSlideCounterInfo(currentSlide, currentIndex, slides.length) : null;
  const displayBadge = currentSlide?.isRefrain
    ? 'Refrain'
    : currentSlide?.isOutro
    ? 'Amen'
    : currentSlide?.isIntro
    ? 'Intro'
    : currentSlideInfo?.badgeText || currentSlide?.verseTag || currentSlide?.label || `Slide ${currentIndex + 1}`;

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      const updated: ActiveBeamState = {
        ...beamState,
        currentIndex: currentIndex + 1,
        isTextCleared: false,
        updatedAt: Date.now(),
      };
      onUpdateBeamState(updated);
      broadcastBeamState(updated);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      const updated: ActiveBeamState = {
        ...beamState,
        currentIndex: currentIndex - 1,
        isTextCleared: false,
        updatedAt: Date.now(),
      };
      onUpdateBeamState(updated);
      broadcastBeamState(updated);
    }
  };

  const jumpToSlide = (index: number) => {
    const updated: ActiveBeamState = {
      ...beamState,
      currentIndex: index,
      isTextCleared: false,
      updatedAt: Date.now(),
    };
    onUpdateBeamState(updated);
    broadcastBeamState(updated);
    setShowSlidePicker(false);
  };

  const restartProjection = () => {
    const updated: ActiveBeamState = {
      ...beamState,
      currentIndex: 0,
      isBlackout: false,
      isTextCleared: false,
      updatedAt: Date.now(),
    };
    onUpdateBeamState(updated);
    broadcastBeamState(updated);
    // Also re-attempt opening/bringing second screen to front
    openBeamSecondScreen();
  };

  const toggleBlackout = () => {
    const updated: ActiveBeamState = {
      ...beamState,
      isBlackout: !beamState.isBlackout,
      updatedAt: Date.now(),
    };
    onUpdateBeamState(updated);
    broadcastBeamState(updated);
  };

  const toggleClearText = () => {
    const updated: ActiveBeamState = {
      ...beamState,
      isTextCleared: !beamState.isTextCleared,
      updatedAt: Date.now(),
    };
    onUpdateBeamState(updated);
    broadcastBeamState(updated);
  };

  const handleLaunchSecondScreen = () => {
    const res = openBeamSecondScreen();
    if (!res.success) {
      // Show launch options dropdown with direct link rather than hijacking current tab
      setShowLaunchMenu(true);
    }
  };

  const handleCopyProjectorUrl = () => {
    const url = getBeamProjectorUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    });
  };

  if (!beamState.isOpen || slides.length === 0) return null;

  // Minimized Compact Floating Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
        <div className="flex items-center gap-2 bg-slate-900/95 text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isProjectorConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
            title={isProjectorConnected ? 'Cast Screen Connected' : 'Cast Screen Window Closed / Offline'}
          />
          <span className="text-xs font-semibold max-w-[160px] truncate">
            {beamState.title || 'Beaming'}
          </span>
          <span className="text-[11px] text-amber-400 font-mono">
            {currentIndex + 1}/{slides.length}
          </span>
          <button
            onClick={restartProjection}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-300"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-300 ml-1"
            title="Expand Beam Controller Dock"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="beam-controller-dock"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-amber-500/30 backdrop-blur-lg shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Beaming Info & Cast Connection Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isProjectorConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isProjectorConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <div className="flex flex-col">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isProjectorConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isProjectorConnected ? 'Cast Connected' : 'Cast Window Closed'}
              </span>
            </div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-700 pl-3 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                {beamState.title}
              </h4>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 ${
                  currentSlide?.isRefrain ? 'italic font-serif' : ''
                }`}
              >
                {displayBadge}
              </span>
            </div>
            {currentSlide?.lines?.[0] && !currentSlide.isIntro && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-md hidden md:block">
                &ldquo;{currentSlide.lines[0]}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Center: Slide Step Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Previous Slide */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
              currentIndex === 0
                ? 'opacity-35 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Slide Indicator & Quick Slide Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSlidePicker((p) => !p)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition"
              title="Click to jump to any slide"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {currentSlideInfo?.counterText || `${currentIndex + 1} / ${slides.length}`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Quick Slide Picker Popover */}
            {showSlidePicker && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Jump to Slide
                </div>
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToSlide(idx)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition flex items-center justify-between gap-2 my-0.5 ${
                      idx === currentIndex
                        ? 'bg-amber-500 text-white font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{s.label || `Slide ${idx + 1}`}</span>
                    <span className="text-[10px] opacity-70 shrink-0">#{idx + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Next Slide */}
          <button
            onClick={nextSlide}
            disabled={currentIndex >= slides.length - 1}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
              currentIndex >= slides.length - 1
                ? 'opacity-35 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Next Slide (Right Arrow / Space)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Restart Button */}
          <button
            onClick={restartProjection}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition flex items-center gap-1"
            title="Restart Presentation from Slide 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Restart</span>
          </button>

          {/* Blackout Button */}
          <button
            onClick={toggleBlackout}
            className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              beamState.isBlackout
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Blackout Screen (B)"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {beamState.isBlackout ? 'Blackout ON' : 'Blackout'}
            </span>
          </button>

          {/* Clear Text Button */}
          <button
            onClick={toggleClearText}
            className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              beamState.isTextCleared
                ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Clear Text Lines (C)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {beamState.isTextCleared ? 'Cleared' : 'Clear'}
            </span>
          </button>
        </div>

        {/* Right: Second Screen Controls & Safe Open Fallback */}
        <div className="flex items-center gap-2 relative">
          {/* Main Launch / Re-open Button with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                const res = openBeamSecondScreen();
                if (!res.success) {
                  setShowLaunchMenu(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5 ${
                isProjectorConnected
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
              }`}
              title="Launch or Re-open Second Screen Projector Window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isProjectorConnected ? 'Bring to Front' : 'Re-open Cast Screen'}</span>
              <ChevronDown
                className="w-3 h-3 opacity-70 ml-0.5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLaunchMenu((p) => !p);
                }}
              />
            </button>

            {/* Launch Options Popover for Popup Blockers & Direct Links */}
            {showLaunchMenu && (
              <div className="absolute bottom-full mb-2 right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in text-xs space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Cast Screen Options</span>
                  <button
                    onClick={() => setShowLaunchMenu(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  If the popup window was closed or blocked by browser settings, use these options to get the presentation back on:
                </p>

                <div className="space-y-1.5 pt-1">
                  <a
                    href={getBeamProjectorUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowLaunchMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Open Projector in New Tab</span>
                  </a>

                  <button
                    onClick={() => {
                      openBeamSecondScreen();
                      setShowLaunchMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Popout Window (Second Screen)</span>
                  </button>

                  <button
                    onClick={handleCopyProjectorUrl}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition"
                  >
                    <span className="flex items-center gap-2">
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Cast URL Copied!' : 'Copy Cast URL'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">For Smart TV / TV Browser</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Minimize Dock to Corner Pill */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Minimize Controller Dock"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Stop / Close Beaming */}
          <button
            onClick={onClose}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
            title="End Beam Session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

