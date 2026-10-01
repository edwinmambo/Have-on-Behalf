import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Cast,
  Bookmark,
  Check,
  Music,
  Volume2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  SlidersHorizontal,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Repeat,
  Grid,
  Tag,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Globe,
  Pin,
  MessageSquarePlus,
  Share2,
} from 'lucide-react';
import { Hymn, HymnStanza, HymnalCollection, BeamSlide } from '../types';
import { HYMNAL_METAS } from '../data/hymnsData';
import { useHymnCatalog } from '../lib/hymnLibrary';
import {
  isItemFavorited,
  saveFavorite,
  removeFavorite,
  getFavorites,
  getHymnNote,
  saveHymnNote,
  getPinnedHymnIds,
  isHymnPinned,
  togglePinHymn,
} from '../lib/storage';
import { HymnFeedbackModal } from './HymnFeedbackModal';
import { showToast } from '../lib/toast';
import { playPianoPitchTone, transposeKeyName, getKeySignatureInfo } from '../lib/audioPiano';
import { buildHymnBeamSlides } from '../lib/beamSlidesHelper';
import { parseLyricChordSegments, stripChordsFromText } from '../lib/chordTransposer';
import { addHistoryItem } from '../lib/historyStorage';

interface HymnalViewProps {
  onBeamHymn: (hymn: Hymn, slides: BeamSlide[]) => void;
  onOpenScripture: (ref: string) => void;
  splitStanzasOnBeam: boolean;
  initialHymnId?: string;
  initialCollection?: HymnalCollection;
}

interface HymnalCollectionInfo {
  id: HymnalCollection;
  short: string;
  language: string;
  name: string;
  dropdownLabel: string;
}

const ALL_COLLECTIONS: HymnalCollectionInfo[] = [
  { id: 'SDAH', short: 'SDAH', language: 'English', name: 'SDA Hymnal 1985', dropdownLabel: 'English – SDA Hymnal 1985 (1–695)' },
  { id: 'SDAH-EXT', short: 'EXT', language: 'English', name: 'SDAH Extended (Replica + Extra Hymns)', dropdownLabel: 'English – SDAH Extended (1–954)' },
  { id: 'ENG_OLD', short: '1941/CIS', language: 'English', name: 'English Old Edition', dropdownLabel: 'English – Old Edition (1941 & Christ in Song)' },
  { id: 'NZK', short: 'NZK', language: 'Kiswahili', name: 'Nyimbo Za Kristo', dropdownLabel: 'Kiswahili – Nyimbo Za Kristo (1–220)' },
  { id: 'NCA', short: 'NCA', language: 'Gĩkũyũ', name: 'Nyĩmbo Cia Agendi (Rĩerũ)', dropdownLabel: 'Gĩkũyũ – Nyĩmbo Cia Agendi [New 1–299]' },
  { id: 'NCA-OLD', short: 'Rĩkũrũ', language: 'Gĩkũyũ', name: 'Nyĩmbo Cia Agendi (Rĩkũrũ)', dropdownLabel: 'Gĩkũyũ – Nyĩmbo Cia Agendi [Old 1–149]' },
  { id: 'WNY', short: 'WNY', language: 'Dholuo', name: 'Wende Nyasaye', dropdownLabel: 'Dholuo – Wende Nyasaye (1–332)' },
  { id: 'OKN', short: 'OKN', language: 'Ekegusii', name: "Ogotera kw'Omonene", dropdownLabel: "Ekegusii – Ogotera kw'Omonene (1–370)" },
  { id: 'KAL', short: 'KAL', language: 'Kalenjin', name: 'Tienwogik che Kilosune Jehobah', dropdownLabel: 'Kalenjin – Tienwogik che Kilosune (1–315)' },
  { id: 'LUG', short: 'LUG', language: 'Luganda', name: 'Enyimba za Kristo', dropdownLabel: 'Luganda – Enyimba za Kristo (1–275)' },
  { id: 'LOZ', short: 'LOZ', language: 'Silozi', name: 'Kelesite mwa Lipina', dropdownLabel: 'Silozi – Kelesite mwa Lipina (1–300)' },
  { id: 'NAN', short: 'NAN', language: 'Kinande', name: 'Esyo Nyimbo sya Kristo', dropdownLabel: 'Kinande – Esyo Nyimbo sya Kristo (1–280)' },
  { id: 'TON', short: 'TON', language: 'Chitonga', name: 'Kristu mu Nyimbo', dropdownLabel: 'Chitonga – Kristu mu Nyimbo (1–320)' },
  { id: 'RUN', short: 'RUN', language: 'Runyankore', name: "Ebyeshongoro by'Okuhimbisa Ruhanga", dropdownLabel: "Runyankore-Rukiga – Ebyeshongoro (1–300)" },
  { id: 'LUO_UG', short: 'LUO-UG', language: 'Luo Uganda', name: 'Buk Wer', dropdownLabel: 'Luo Uganda – Buk Wer (1–280)' },
  { id: 'KMN', short: 'KMN', language: 'Chichewa', name: 'Khristu Mu Nyimbo', dropdownLabel: 'Chichewa – Khristu Mu Nyimbo (1–350)' },
  { id: 'ICB', short: 'ICB', language: 'Icibemba', name: 'Kristu Mu Nyimbo', dropdownLabel: 'Icibemba – Kristu Mu Nyimbo (1–311)' },
];

export const HymnalView: React.FC<HymnalViewProps> = ({
  onBeamHymn,
  onOpenScripture,
  splitStanzasOnBeam,
  initialHymnId,
  initialCollection,
}) => {
  const [activeCollection, setActiveCollection] = useState<HymnalCollection>(initialCollection || 'SDAH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHymnId, setSelectedHymnId] = useState<string | null>(initialHymnId || null);
  const [isPlayingPitch, setIsPlayingPitch] = useState(false);
  const [transposeSemiTones, setTransposeSemiTones] = useState<number>(0);
  const [showChords, setShowChords] = useState<boolean>(false);
  const [repeatRefrain, setRepeatRefrain] = useState<boolean>(false);

  // Category and Translations state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isTranslationsOpen, setIsTranslationsOpen] = useState<boolean>(false);
  const [showCrossSearchModal, setShowCrossSearchModal] = useState<boolean>(false);

  // Scroll ref for stanzas container
  const stanzasContainerRef = React.useRef<HTMLDivElement>(null);

  // Personal hymn notes
  const [hymnNote, setHymnNote] = useState<string>('');
  const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);

  // Pinned Hymns & Tester Feedback State
  const [pinnedHymnIds, setPinnedHymnIds] = useState<string[]>(() => getPinnedHymnIds());
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePinnedChange = () => {
      setPinnedHymnIds(getPinnedHymnIds());
    };
    window.addEventListener('haveonbehalf_pinned_changed', handlePinnedChange);
    return () => window.removeEventListener('haveonbehalf_pinned_changed', handlePinnedChange);
  }, []);

  const handleTogglePin = (id: string) => {
    const isNowPinned = togglePinHymn(id);
    setPinnedHymnIds(getPinnedHymnIds());
    showToast({
      title: isNowPinned ? 'Pinned to Top of Hymnal' : 'Unpinned Hymn',
      description: isNowPinned
        ? 'This favourite hymn is pinned and will show first in the directory.'
        : 'Hymn returned to standard numerical ordering.',
      type: isNowPinned ? 'success' : 'info',
    });
  };

  // Sync initial props if changed from outside (e.g. navigation from History)
  useEffect(() => {
    if (initialCollection && initialCollection !== activeCollection) {
      setActiveCollection(initialCollection);
    }
  }, [initialCollection]);

  useEffect(() => {
    if (initialHymnId && initialHymnId !== selectedHymnId) {
      handleSelectHymn(initialHymnId);
    }
  }, [initialHymnId]);

  // Load saved note on hymn change
  const handleSelectHymn = (id: string) => {
    setSelectedHymnId(id);
    setTransposeSemiTones(0);
    setHymnNote(getHymnNote(id));
    setIsNoteSaved(false);
  };

  // Dynamic full hymnal catalog
  const { hymns: allAvailableHymns, isLoaded: isCatalogLoaded, totalCount: totalHymnsCount } = useHymnCatalog();

  // Filter hymns for the active collection directly from the catalog
  const collectionHymns = useMemo(() => {
    return allAvailableHymns.filter((h) => h.collection === activeCollection);
  }, [allAvailableHymns, activeCollection]);

  // Extract categories for active collection
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    collectionHymns.forEach((h) => {
      if (h.category) cats.add(h.category);
    });
    return Array.from(cats).sort();
  }, [collectionHymns]);

  // Filtered hymns based on search, category, with pinned favourite hymns displayed FIRST
  const filteredHymns = useMemo(() => {
    let list = collectionHymns;
    if (selectedCategory !== 'All') {
      list = list.filter((h) => h.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((h) => {
        if (h.number.toString().includes(q)) return true;
        if (h.title.toLowerCase().includes(q)) return true;
        if (h.category?.toLowerCase().includes(q)) return true;
        if (h.tune?.toLowerCase().includes(q) || h.author?.toLowerCase().includes(q)) return true;
        return h.stanzas.some((s) => s.lines.some((l) => l.toLowerCase().includes(q)));
      });
    }

    const pinnedSet = new Set(pinnedHymnIds);
    return [...list].sort((a, b) => {
      const aPinned = pinnedSet.has(a.id);
      const bPinned = pinnedSet.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.number - b.number;
    });
  }, [collectionHymns, selectedCategory, searchQuery, pinnedHymnIds]);

  // Cross-collection matches when searching
  const crossCollectionMatches = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return allAvailableHymns.filter((h) => {
      if (h.collection === activeCollection) return false;
      if (h.number.toString() === q) return true;
      if (h.title.toLowerCase().includes(q)) return true;
      if (h.tune?.toLowerCase().includes(q) || h.author?.toLowerCase().includes(q)) return true;
      return h.stanzas.some((s) => s.lines.some((l) => l.toLowerCase().includes(q)));
    });
  }, [allAvailableHymns, activeCollection, searchQuery]);

  // Currently selected hymn (null if user has not yet opened a hymn)
  const currentHymn = useMemo(() => {
    if (!selectedHymnId) return null;
    return (
      collectionHymns.find((h) => h.id === selectedHymnId) ||
      allAvailableHymns.find((h) => h.id === selectedHymnId) ||
      null
    );
  }, [collectionHymns, selectedHymnId, allAvailableHymns]);

  // Track recently viewed hymn in reading history
  useEffect(() => {
    if (currentHymn && currentHymn.id) {
      addHistoryItem({
        type: 'hymn',
        title: currentHymn.title,
        subtitle: `${currentHymn.author || 'Sacred Hymn'}${currentHymn.key ? ` • Key of ${currentHymn.key}` : ''}`,
        reference: `${currentHymn.collection} #${currentHymn.number}`,
        snippet: currentHymn.stanzas?.[0]?.lines?.[0] || undefined,
        metadata: {
          hymnId: currentHymn.id,
          collection: currentHymn.collection,
          hymnNumber: currentHymn.number,
        },
      });
    }
  }, [currentHymn?.id]);

  // Index of current hymn in active collection for Next / Previous navigation
  const currentIndex = useMemo(() => {
    if (!currentHymn) return -1;
    return collectionHymns.findIndex((h) => h.id === currentHymn.id);
  }, [collectionHymns, currentHymn]);

  const prevHymn = currentIndex > 0 ? collectionHymns[currentIndex - 1] : null;
  const nextHymn =
    currentIndex >= 0 && currentIndex < collectionHymns.length - 1
      ? collectionHymns[currentIndex + 1]
      : null;

  // Keyboard navigation for Previous / Next hymn (Left/Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevHymn) {
        e.preventDefault();
        handleSelectHymn(prevHymn.id);
      } else if (e.key === 'ArrowRight' && nextHymn) {
        e.preventDefault();
        handleSelectHymn(nextHymn.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevHymn, nextHymn]);

  // Scroll stanzas container to top when changing hymns
  useEffect(() => {
    if (stanzasContainerRef.current) {
      stanzasContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentHymn?.id]);

  // Touch swipe support for smooth mobile/tablet Before / Next navigation
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && nextHymn) {
        handleSelectHymn(nextHymn.id);
      } else if (deltaX > 0 && prevHymn) {
        handleSelectHymn(prevHymn.id);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Total count of parallel hymns / translations
  const totalParallelCount = useMemo(() => {
    if (!currentHymn) return 0;
    let count = currentHymn.crossReferences?.length || 0;
    if (currentHymn.oldBookNumber) count++;
    if (currentHymn.newBookNumber) count++;
    return count;
  }, [currentHymn]);

  // Check if current hymn has chords available
  const hasChordsAvailable = useMemo(() => {
    if (!currentHymn) return false;
    if (currentHymn.hasChords) return true;
    return currentHymn.stanzas.some((s) =>
      s.lines.some((l) => /\[[A-G][b#]?(?:m|maj|min|dim|aug|sus\d*|\d+)?(?:\/[A-G][b#]?)?\]/.test(l))
    );
  }, [currentHymn]);

  // Check if current hymn has a refrain / chorus
  const refrainStanza = useMemo(() => {
    return currentHymn?.stanzas.find((s) => s.type === 'refrain' || s.type === 'chorus') || null;
  }, [currentHymn]);

  // Load note for current hymn on mount/change
  useEffect(() => {
    if (currentHymn?.id) {
      setHymnNote(getHymnNote(currentHymn.id));
    }
  }, [currentHymn?.id]);

  // Calculate transposed key name & active key signature
  const effectiveKey = useMemo(() => {
    if (!currentHymn) return '';
    return transposeKeyName(currentHymn.key, transposeSemiTones);
  }, [currentHymn?.key, transposeSemiTones]);

  const keySigInfo = useMemo(() => {
    return getKeySignatureInfo(currentHymn?.key, transposeSemiTones);
  }, [currentHymn?.key, transposeSemiTones]);

  // Reactive key for immediate favorite toggle feedback
  const [favoriteRefreshKey, setFavoriteRefreshKey] = useState(0);

  const isFavorited = useMemo(() => {
    if (!currentHymn) return false;
    return isItemFavorited('hymn', `${currentHymn.collection} #${currentHymn.number}`);
  }, [currentHymn, favoriteRefreshKey]);

  const handleToggleFavorite = () => {
    if (!currentHymn) return;
    const ref = `${currentHymn.collection} #${currentHymn.number}`;
    if (isFavorited) {
      const favs = getFavorites();
      const existing = favs.find((f) => f.type === 'hymn' && f.reference === ref);
      if (existing) removeFavorite(existing.id);
      setFavoriteRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('haveonbehalf_favorite_changed'));
      showToast({
        title: 'Removed from Bookmarks',
        description: `${currentHymn.collection} #${currentHymn.number} • ${currentHymn.title}`,
        type: 'remove',
      });
    } else {
      saveFavorite({
        type: 'hymn',
        title: currentHymn.title,
        reference: ref,
        snippet: currentHymn.stanzas[0]?.lines.slice(0, 2).map(stripChordsFromText).join(' ') || '',
        metadata: {
          collection: currentHymn.collection,
          number: currentHymn.number,
        },
      });
      setFavoriteRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('haveonbehalf_favorite_changed'));
      showToast({
        title: 'Saved to Bookmarks',
        description: `${currentHymn.collection} #${currentHymn.number} • ${currentHymn.title}`,
        type: 'favorite',
      });
    }
  };

  // Play natural piano pitch tone with transposition offset
  const handlePlayPianoPitch = async () => {
    if (!currentHymn) return;
    setIsPlayingPitch(true);
    await playPianoPitchTone(currentHymn.key, transposeSemiTones, 2.5);
    setIsPlayingPitch(false);
  };

  // Save personal hymn note locally
  const handleSaveNote = () => {
    if (!currentHymn) return;
    saveHymnNote(currentHymn.id, hymnNote);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2200);
    showToast({
      title: 'Hymn Note Saved',
      description: `Private note saved for ${currentHymn.collection} #${currentHymn.number}`,
      type: 'info',
    });
  };

  // Launch Beam projection with AdventistHymns-style clean layout
  const handleBeamCurrentHymn = () => {
    if (!currentHymn) return;
    const slides = buildHymnBeamSlides(currentHymn, {
      includeIntro: true,
      splitLongStanzas: splitStanzasOnBeam,
    });

    if (transposeSemiTones !== 0 && slides[0]?.isIntro && slides[0].introDetails) {
      slides[0].introDetails.key = `${effectiveKey} (${transposeSemiTones > 0 ? '+' : ''}${transposeSemiTones} st)`;
    }

    onBeamHymn(currentHymn, slides);
  };

  // Share hymn title and collection details via Web Share API or Clipboard
  const handleShareHymn = async () => {
    if (!currentHymn) return;
    const shareTitle = `${currentHymn.collection} #${currentHymn.number} · ${currentHymn.title}`;
    const authorLine = currentHymn.author ? `Words by: ${currentHymn.author}` : '';
    const tuneLine = currentHymn.tune ? `Tune: ${currentHymn.tune}` : '';
    const keyLine = currentHymn.key ? `Key of ${currentHymn.key}` : '';
    const firstLine = currentHymn.stanzas?.[0]?.lines?.[0]
      ? `"${stripChordsFromText(currentHymn.stanzas[0].lines[0])}"`
      : '';
    const details = [authorLine, tuneLine, keyLine, firstLine].filter(Boolean).join(' • ');
    const shareText = `${shareTitle}${details ? `\n${details}` : ''}\nShared from Have On Behalf Hymnal`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast({ title: 'Hymn shared successfully', type: 'success' });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User closed native share sheet
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareTitle}\n${details}\n${shareUrl}`);
        showToast({
          title: 'Hymn Details Copied to Clipboard',
          description: `${shareTitle} is ready to paste and share.`,
          type: 'success',
        });
      }
    } catch {
      showToast({ title: 'Unable to share hymn', type: 'info' });
    }
  };

  // Render lines with support for chords and antiphonal Responsive Readings (Leader / Congregation)
  const renderStanzaLines = (stanza: HymnStanza, isRightPane = false) => {
    const isRefrain = stanza.type === 'refrain' || stanza.type === 'chorus';
    return stanza.lines.map((line, lineIdx) => {
      const cleanText = stripChordsFromText(line)
        .replace(/^(?:refrain|chorus|korasi|korus)\s*:\s*/i, '')
        .trim();
      if (!cleanText) return null;

      // Antiphonal Responsive Reading Styling (Leader / Congregation)
      if (cleanText.startsWith('[Leader]') || cleanText.startsWith('Leader:')) {
        const textWithoutTag = cleanText.replace(/^\[Leader\]\s*|^Leader:\s*/i, '');
        return (
          <div key={lineIdx} className="my-2.5 text-amber-600 dark:text-amber-400 font-semibold text-sm sm:text-base leading-relaxed">
            <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded mr-2 inline-block">
              Leader
            </span>
            {textWithoutTag}
          </div>
        );
      }
      if (cleanText.startsWith('[Congregation]') || cleanText.startsWith('Congregation:')) {
        const textWithoutTag = cleanText.replace(/^\[Congregation\]\s*|^Congregation:\s*/i, '');
        return (
          <div key={lineIdx} className="my-2.5 pl-3 sm:pl-4 border-l-2 border-amber-500 font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed">
            <span className="text-[10px] font-mono font-bold uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded mr-2 inline-block text-slate-700 dark:text-slate-300">
              Congregation
            </span>
            {textWithoutTag}
          </div>
        );
      }

      // Standard hymn text without chords
      if (!showChords || !hasChordsAvailable || isRightPane) {
        return (
          <p key={lineIdx} className={`my-1.5 leading-relaxed ${isRefrain ? 'italic font-medium' : ''}`}>
            {cleanText}
          </p>
        );
      }

      // Parse and render chords aligned above lyrics
      const segments = parseLyricChordSegments(line, transposeSemiTones);
      const lineHasChords = segments.some((seg) => Boolean(seg.chord));

      if (!lineHasChords) {
        return (
          <p key={lineIdx} className={`my-1.5 leading-relaxed ${isRefrain ? 'italic font-medium' : ''}`}>
            {cleanText}
          </p>
        );
      }

      return (
        <div
          key={lineIdx}
          className="flex flex-wrap items-end gap-x-0.5 my-2.5 leading-none select-text"
        >
          {segments.map((seg, segIdx) => (
            <span key={segIdx} className="inline-flex flex-col justify-end">
              <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 select-all leading-none mb-1 min-h-[14px]">
                {seg.chord || '\u00A0'}
              </span>
              <span className={`font-serif text-base sm:text-lg leading-normal whitespace-pre-wrap ${isRefrain ? 'italic font-medium' : ''}`}>
                {seg.lyric || '\u00A0'}
              </span>
            </span>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] min-h-[600px]">
      {/* Left Column: Hymnal Navigator & Quick Search List */}
      <aside
        className={`lg:col-span-4 xl:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden ${
          currentHymn ? 'hidden lg:flex flex-col' : 'flex flex-col'
        }`}
      >
        {/* Persistent Filter Bar: Dropdown + Scrollable Hymnal Bar + Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 space-y-2.5">
          {/* Language-First Dropdown Selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-amber-500">
              <Globe className="w-4 h-4 text-amber-500 shrink-0" />
              <select
                value={activeCollection}
                onChange={(e) => {
                  setActiveCollection(e.target.value as HymnalCollection);
                  setSelectedCategory('All');
                }}
                className="w-full text-xs font-semibold bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                title="Select Hymnal Collection by Language"
              >
                {ALL_COLLECTIONS.map((c) => {
                  const meta = HYMNAL_METAS[c.id];
                  return (
                    <option key={c.id} value={c.id}>
                      {c.dropdownLabel} ({meta?.count || 0})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Horizontally Scrollable Hymnal Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            {ALL_COLLECTIONS.map((col) => {
              const meta = HYMNAL_METAS[col.id];
              const count = meta?.count || 0;
              const isSelected = activeCollection === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    setActiveCollection(col.id);
                    setSelectedCategory('All');
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-bold scale-[1.02]'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700'
                  }`}
                  title={`${col.dropdownLabel} • ${count} hymns`}
                >
                  <span>{col.language.split(' ')[0]}</span>
                  <span
                    className={`text-[9px] px-1 rounded-sm font-mono ${
                      isSelected
                        ? 'bg-black/15 text-slate-950 font-bold'
                        : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {col.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Collection Info Banner */}
          <div className="flex items-center justify-between text-[11px] px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-amber-700 dark:text-amber-400 truncate">
                {HYMNAL_METAS[activeCollection]?.name || activeCollection}
              </span>
            </div>
            <span className="shrink-0 text-slate-500 dark:text-slate-400 text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {collectionHymns.length} hymns
            </span>
          </div>

          {/* Persistent Search Bar */}
          <div className="relative pt-0.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hymn #, title keywords, or lyrics..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Categories / Hymn Groups Bar */}
        {availableCategories.length > 0 && (
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-1 shrink-0">
              <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <select
                id="hymn-group-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shrink-0 cursor-pointer shadow-2xs max-w-[150px] truncate"
                title="Filter by Hymn Group / Topic"
              >
                <option value="All">All Groups ({collectionHymns.length})</option>
                {availableCategories.map((cat) => {
                  const count = collectionHymns.filter((h) => h.category === cat).length;
                  return (
                    <option key={`opt-${cat}`} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:border-slate-700 shrink-0 mx-0.5" />

            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition ${
                selectedCategory === 'All'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All ({collectionHymns.length})
            </button>
            {availableCategories.map((cat) => {
              const count = collectionHymns.filter((h) => h.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Hymns List */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredHymns.length === 0 && crossCollectionMatches.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hymns found matching “{searchQuery}”.
              </div>
            ) : (
              <>
                {filteredHymns.map((hymn) => {
                  const isSelected = hymn.id === currentHymn?.id;
                  const hasNote = Boolean(getHymnNote(hymn.id));
                  const isPinned = pinnedHymnIds.includes(hymn.id);
                  return (
                    <div
                      key={hymn.id}
                      id={`hymn-row-${hymn.id}`}
                      onClick={() => handleSelectHymn(hymn.id)}
                      className={`group w-full p-2.5 sm:p-3 text-left transition-colors flex items-start gap-2.5 sm:gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span
                        className={`w-9 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : isPinned
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {hymn.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4
                              className={`text-xs font-semibold truncate ${
                                isSelected
                                  ? 'text-amber-900 dark:text-amber-300'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {hymn.title}
                            </h4>
                            {isPinned && (
                              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold shrink-0">
                                <Pin className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                <span>PINNED</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {hasNote && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Personal note saved" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(hymn.id);
                              }}
                              className={`p-1 rounded-md transition ${
                                isPinned
                                  ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                                  : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-500'
                              }`}
                              title={isPinned ? 'Unpin favourite hymn' : 'Pin favourite to top of list'}
                            >
                              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {hymn.category && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium truncate max-w-[110px]">
                              {hymn.category}
                            </span>
                          )}
                          <p className="text-[11px] text-slate-400 truncate">
                            {hymn.stanzas[0]?.lines[0] ? stripChordsFromText(hymn.stanzas[0].lines[0]) : hymn.tune || 'Worship Hymn'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Compact Cross-Hymnal Button (Takes minimal space! Click opens modal) */}
          {crossCollectionMatches.length > 0 && (
            <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-amber-500/5">
              <button
                onClick={() => setShowCrossSearchModal(true)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                title="View hymns matching your search in other languages"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Matches in other languages</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono text-[10px] font-bold shrink-0">
                  {crossCollectionMatches.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Right Column: Hymn Reader & Beam Toolbar */}
      <main
        className={`lg:col-span-8 xl:col-span-9 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden ${
          currentHymn ? 'flex flex-col' : 'hidden lg:flex flex-col'
        }`}
      >
        {!currentHymn ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 min-h-[500px]">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 border border-slate-200/50 dark:border-slate-700/50">
              <Music className="w-8 h-8 stroke-[1.25]" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5 font-serif">
              Select a Hymn
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mb-3 leading-relaxed">
              Choose a hymn from the directory on the left, or search by hymn title, number, or lyric keywords above.
            </p>
          </div>
        ) : (
          <>
            {/* Hymn Header Toolbar */}
            <header className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {/* Mobile Back Button: Back to Catalog */}
                <button
                  onClick={() => setSelectedHymnId(null)}
                  className="lg:hidden px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 border border-slate-200 dark:border-slate-700"
                  title="Back to Hymns Directory"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-500" />
                  <span>Hymns</span>
                </button>

                <span className="w-11 h-9 sm:w-12 sm:h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-extrabold text-sm border border-amber-500/30 shrink-0">
                  #{currentHymn.number}
                </span>

                {/* Header Before / Next Hymn Navigation */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={!prevHymn}
                    onClick={() => prevHymn && handleSelectHymn(prevHymn.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer shadow-2xs font-semibold text-xs"
                    title={prevHymn ? `Before: #${prevHymn.number} ${prevHymn.title} (← Key)` : 'Beginning of collection'}
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-500" />
                    <span>Before</span>
                  </button>
                  <button
                    disabled={!nextHymn}
                    onClick={() => nextHymn && handleSelectHymn(nextHymn.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer shadow-2xs font-semibold text-xs"
                    title={nextHymn ? `Next: #${nextHymn.number} ${nextHymn.title} (→ Key)` : 'End of collection'}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {currentHymn.title}
                    </h2>
                    <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {currentHymn.collection}
                    </span>
                    {currentHymn.category && (
                      <button
                        onClick={() => setSelectedCategory(currentHymn.category!)}
                        className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer font-semibold shadow-2xs"
                        title={`Filter all hymns in group: ${currentHymn.category}`}
                      >
                        <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>{currentHymn.category}</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                    {currentHymn.key && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>
                          Key: <strong className="text-amber-600 dark:text-amber-400">{effectiveKey}</strong>
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-mono font-semibold"
                          title={`Key Signature: ${keySigInfo.accidentalsSummary}`}
                        >
                          Key Sig: <strong>{keySigInfo.symbol}</strong> ({keySigInfo.accidentalsSummary})
                        </span>
                      </div>
                    )}
                    {currentHymn.tune && <span>Tune: <strong>{currentHymn.tune}</strong></span>}
                    {currentHymn.author && (
                      <span className="hidden sm:inline">Author: {currentHymn.author}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action & Transpose Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
            {/* INTERACTIVE PITCH-TRANSPOSE CONTROL */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 text-xs shadow-xs">
              <span className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Transpose
              </span>
              <button
                id="transpose-down-btn"
                onClick={() => setTransposeSemiTones((prev) => prev - 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                title="Transpose down 1 semitone (b)"
              >
                -
              </button>
              <div className="px-2 text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {effectiveKey.split(' ')[0]}
                  </span>
                  <span
                    className="text-[10px] px-1 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold"
                    title={`Key Signature: ${keySigInfo.accidentalsSummary}`}
                  >
                    {keySigInfo.symbol}
                  </span>
                </div>
                {transposeSemiTones !== 0 ? (
                  <span className="text-[10px] font-mono text-slate-400">
                    ({transposeSemiTones > 0 ? `+${transposeSemiTones}` : transposeSemiTones} st)
                  </span>
                ) : null}
              </div>
              <button
                id="transpose-up-btn"
                onClick={() => setTransposeSemiTones((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                title="Transpose up 1 semitone (#)"
              >
                +
              </button>
              {transposeSemiTones !== 0 && (
                <button
                  id="reset-transpose-btn"
                  onClick={() => setTransposeSemiTones(0)}
                  className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 rounded-md transition ml-1 cursor-pointer"
                  title={`Reset to original key (${currentHymn?.key || 'Original'})`}
                >
                  <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold">Reset</span>
                </button>
              )}
            </div>

            {/* Toggle Chords Visibility */}
            <button
              id="toggle-chords-btn"
              disabled={!hasChordsAvailable}
              onClick={() => setShowChords((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                !hasChordsAvailable
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/30'
                  : showChords
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={
                !hasChordsAvailable
                  ? 'No chords available for this hymn'
                  : 'Toggle chords above lyrics'
              }
            >
              <Music className="w-3.5 h-3.5" />
              <span>
                {!hasChordsAvailable ? 'Chords N/A' : showChords ? 'Chords ON' : 'Chords OFF'}
              </span>
            </button>

            {/* Repeat Refrain Toggle */}
            {refrainStanza && (
              <button
                id="toggle-repeat-refrain-btn"
                onClick={() => setRepeatRefrain((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                  repeatRefrain
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-400 dark:border-amber-700 shadow-xs font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Repeat Refrain after every stanza in view"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {repeatRefrain ? 'Refrain: Repeating' : 'Repeat Refrain'}
                </span>
              </button>
            )}

            {/* ONE Button for Translations & Parallel Hymns (Zero page clutter) */}
            {totalParallelCount > 0 && (
              <button
                onClick={() => setIsTranslationsOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="View Parallel Translations in other languages and hymnals"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>Translations</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                  {totalParallelCount}
                </span>
              </button>
            )}

            {/* Acoustic Piano Pitch Button */}
            <button
              id="hymn-pitch-tone-btn"
              onClick={handlePlayPianoPitch}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                isPlayingPitch
                  ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={`Play piano acoustic tone for ${effectiveKey}`}
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline font-semibold">Pitch</span>
            </button>

            {/* Personal Hymn Notes Drawer Toggle */}
            <button
              id="hymn-notes-btn"
              onClick={() => setIsNotesDrawerOpen((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs font-medium transition relative ${
                isNotesDrawerOpen || hymnNote.trim()
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Personal Private Notes for this Hymn"
            >
              <FileText className="w-4 h-4" />
              {hymnNote.trim() && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Pin Favourite to Top */}
            <button
              onClick={() => handleTogglePin(currentHymn.id)}
              className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                pinnedHymnIds.includes(currentHymn.id)
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={pinnedHymnIds.includes(currentHymn.id) ? 'Unpin favourite from top of list' : 'Pin favourite hymn to top of list'}
            >
              <Pin className={`w-4 h-4 ${pinnedHymnIds.includes(currentHymn.id) ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span className="hidden xl:inline font-semibold">
                {pinnedHymnIds.includes(currentHymn.id) ? 'Pinned' : 'Pin'}
              </span>
            </button>

            {/* Favorite / Bookmark */}
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                isFavorited
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Save to Favorites"
            >
              {isFavorited ? (
                <Check className="w-4 h-4 text-amber-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Provide Feedback Button */}
            <button
              id="hymn-feedback-btn"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="p-2 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Provide Feedback on this hymn (report issues or suggest improvements)"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Share Hymn Button */}
            <button
              id="hymn-share-btn"
              onClick={handleShareHymn}
              className="p-2 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Share hymn details via Web Share or copy to clipboard"
            >
              <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* CAST / BEAM BUTTON */}
            <button
              id="beam-hymn-button"
              onClick={handleBeamCurrentHymn}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition flex items-center gap-2 hover:shadow-lg active:scale-98"
              title="Launch Beam Projector Mode (AdventistHymns presentation)"
            >
              <Cast className="w-4 h-4" />
              <span>Beam Hymn</span>
            </button>
          </div>
        </header>

        {/* Scripture Reference Link */}
        {currentHymn.scriptureReference && (
          <div className="px-6 py-1.5 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Scriptural Theme:</span>
            <button
              onClick={() => onOpenScripture(currentHymn.scriptureReference!)}
              className="font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              {currentHymn.scriptureReference}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* PERSONAL HYMN NOTES EXPANDABLE DRAWER */}
        {isNotesDrawerOpen && (
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/40 animate-fade-in">
            <div className="max-w-3xl mx-auto space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Private Notes for {currentHymn.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isNoteSaved && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Note Saved!
                    </span>
                  )}
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
              <textarea
                value={hymnNote}
                onChange={(e) => setHymnNote(e.target.value)}
                placeholder="Add private notes for this hymn (e.g. chorister cues, verses to sing, modulation notes, service thoughts)... Stored locally on this device."
                rows={3}
                className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* STANZAS DISPLAY AREA WITH BEFORE / NEXT NAVIGATION */}
        <div
          id="hymnal-reading-scroll-container"
          ref={stanzasContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6"
        >
          <div className="w-full max-w-4xl xl:max-w-5xl mx-auto space-y-6">
            {currentHymn.stanzas.map((stanza, idx) => {
              const isRefrain = stanza.type === 'refrain' || stanza.type === 'chorus';
              const nextStanza = currentHymn.stanzas[idx + 1];
              const shouldRenderRepeatRefrain =
                repeatRefrain &&
                refrainStanza &&
                !isRefrain &&
                (!nextStanza || (nextStanza.type !== 'refrain' && nextStanza.type !== 'chorus'));

              return (
                <React.Fragment key={idx}>
                  <div
                    className={`p-5 rounded-2xl transition-all ${
                      isRefrain
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500 dark:border-amber-400 my-4 pl-6'
                        : 'bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="mb-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isRefrain
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {isRefrain ? 'Refrain' : `Stanza ${stanza.number}`}
                      </span>
                    </div>

                    <div
                      className={`font-serif text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 ${
                        isRefrain ? 'font-medium italic text-amber-950 dark:text-amber-100' : ''
                      }`}
                    >
                      {renderStanzaLines(stanza, false)}
                    </div>
                  </div>

                  {shouldRenderRepeatRefrain && (
                    <div className="p-5 rounded-2xl transition-all bg-amber-50/50 dark:bg-amber-950/15 border-l-4 border-amber-400 dark:border-amber-500 my-4 pl-6">
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Refrain (Repeated)
                        </span>
                      </div>
                      <div className="font-serif text-base sm:text-lg leading-relaxed font-medium italic text-amber-950 dark:text-amber-100">
                        {renderStanzaLines(refrainStanza, false)}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Provide Feedback Card for the Current Hymn */}
            <div className="mt-8 mb-4 p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Report an Issue or Suggest an Improvement
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Spotted a typo, missing stanza, wrong tune name, or audio pitch error for #{currentHymn.number}? Let us know!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="hymn-footer-share-btn"
                  onClick={handleShareHymn}
                  className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 hover:bg-amber-100/50 dark:hover:bg-amber-950/50 text-slate-800 dark:text-slate-200 font-semibold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                  title="Share this hymn"
                >
                  <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Share Hymn</span>
                </button>
                <button
                  id="hymn-footer-provide-feedback-btn"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                  title="Provide Feedback on this hymn"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Provide Feedback</span>
                </button>
              </div>
            </div>

            {/* Bottom Navigation Card: Before and Next Hymn */}
            <div className="pt-8 pb-12 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {prevHymn ? (
                <button
                  onClick={() => handleSelectHymn(prevHymn.id)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-left shadow-2xs group flex-1 max-w-sm"
                  title={`Go to Previous Hymn: #${prevHymn.number} ${prevHymn.title}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 group-hover:bg-black/15 flex items-center justify-center shrink-0">
                    <ChevronLeft className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-inherit" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                      Before · #{prevHymn.number}
                    </span>
                    <span className="text-xs sm:text-sm font-bold truncate block">
                      {prevHymn.title}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex-1 hidden sm:block" />
              )}

              <div className="text-center px-2 py-1 text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 self-center">
                #{currentHymn.number} ({currentIndex + 1} of {collectionHymns.length})
              </div>

              {nextHymn ? (
                <button
                  onClick={() => handleSelectHymn(nextHymn.id)}
                  className="flex items-center justify-end gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-right shadow-2xs group flex-1 max-w-sm"
                  title={`Go to Next Hymn: #${nextHymn.number} ${nextHymn.title}`}
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                      Next · #{nextHymn.number}
                    </span>
                    <span className="text-xs sm:text-sm font-bold truncate block">
                      {nextHymn.title}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 group-hover:bg-black/15 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-inherit" />
                  </div>
                </button>
              ) : (
                <div className="flex-1 hidden sm:block" />
              )}
            </div>
          </div>
        </div>

        {/* ONE DIALOG MODAL FOR PARALLEL HYMNS & TRANSLATIONS (Zero page clutter) */}
        {isTranslationsOpen && currentHymn && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsTranslationsOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Parallel Hymns & Translations
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                      Translations for “{currentHymn.title}” ({currentHymn.collection} #{currentHymn.number})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTranslationsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentHymn.oldBookNumber && (
                  <button
                    onClick={() => {
                      setActiveCollection('NCA-OLD');
                      setSelectedCategory('All');
                      handleSelectHymn(`nca-old-${currentHymn.oldBookNumber}`);
                      setIsTranslationsOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs flex items-center justify-between group transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          NCA-OLD #{currentHymn.oldBookNumber}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Gĩkũyũ (Ibuku Rĩkũrũ)
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Hymn #{currentHymn.oldBookNumber}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition" />
                  </button>
                )}

                {currentHymn.newBookNumber && (
                  <button
                    onClick={() => {
                      setActiveCollection('NCA');
                      setSelectedCategory('All');
                      handleSelectHymn(`nca-${currentHymn.newBookNumber}`);
                      setIsTranslationsOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs flex items-center justify-between group transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          NCA #{currentHymn.newBookNumber}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Gĩkũyũ (Ibuku Rĩerũ)
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Hymn #{currentHymn.newBookNumber}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition" />
                  </button>
                )}

                {currentHymn.crossReferences?.map((cr, idx) => {
                  const meta = HYMNAL_METAS[cr.collection];
                  const targetHymn = allAvailableHymns.find(
                    (h) => h.collection === cr.collection && h.number === cr.number
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCollection(cr.collection);
                        setSelectedCategory('All');
                        if (targetHymn) {
                          handleSelectHymn(targetHymn.id);
                        } else {
                          handleSelectHymn(`${cr.collection.toLowerCase()}-${cr.number}`);
                        }
                        setIsTranslationsOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs flex items-center justify-between group transition cursor-pointer pt-2.5"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                            {cr.collection} #{cr.number}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {meta?.language || cr.collection}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                            ({meta?.name || cr.collection})
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium truncate mt-1">
                          {cr.title}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition shrink-0" />
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                Click any translation above to open it directly
              </div>
            </div>
          </div>
        )}

        {/* CROSS HYMNAL SEARCH MODAL */}
        {showCrossSearchModal && crossCollectionMatches.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowCrossSearchModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh] animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Matches in other Hymnals
                    </h3>
                    <p className="text-xs text-slate-400">
                      Found {crossCollectionMatches.length} hymns matching “{searchQuery}”
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCrossSearchModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                {crossCollectionMatches.map((hymn) => {
                  const meta = HYMNAL_METAS[hymn.collection];
                  return (
                    <button
                      key={`cross_modal_${hymn.id}`}
                      onClick={() => {
                        setActiveCollection(hymn.collection);
                        setSelectedCategory('All');
                        handleSelectHymn(hymn.id);
                        setShowCrossSearchModal(false);
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs flex items-center justify-between group transition cursor-pointer"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                            {hymn.collection} #{hymn.number}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {meta?.language || hymn.collection}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                          {hymn.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {hymn.stanzas[0]?.lines[0] ? stripChordsFromText(hymn.stanzas[0].lines[0]) : hymn.tune || ''}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Tester Feedback Modal */}
      <HymnFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        hymn={currentHymn}
      />
    </div>
  );
};
