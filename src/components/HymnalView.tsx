import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Cast,
  Bookmark,
  Check,
  Music,
  Globe,
  Volume2,
  ExternalLink,
  ChevronRight,
  Hash,
  SlidersHorizontal,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Repeat,
  Columns,
  Grid,
  Tag,
  BookOpen,
  ArrowRight,
  X,
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
} from '../lib/storage';
import { showToast } from '../lib/toast';
import { playPianoPitchTone, transposeKeyName } from '../lib/audioPiano';
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

  // Category and Quick Jump state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quickJumpNumber, setQuickJumpNumber] = useState<string>('');
  const [showKeypad, setShowKeypad] = useState<boolean>(false);

  // Split View (Side-by-Side Bilingual Reading)
  const [isSplitViewOpen, setIsSplitViewOpen] = useState<boolean>(false);
  const [splitCollection, setSplitCollection] = useState<HymnalCollection>('NZK');
  const [splitHymnId, setSplitHymnId] = useState<string>('');

  // Personal hymn notes
  const [hymnNote, setHymnNote] = useState<string>('');
  const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);

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

  // Dynamic full hymnal catalog (SDAH, SDAH-EXT, NZK, and NCA)
  const { hymns: allAvailableHymns, isLoaded: isCatalogLoaded, totalCount: totalHymnsCount } = useHymnCatalog();

  // Filter hymns for the active collection
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

  // Filtered hymns based on search and category
  const filteredHymns = useMemo(() => {
    let list = collectionHymns;
    if (selectedCategory !== 'All') {
      list = list.filter((h) => h.category === selectedCategory);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list.filter((h) => {
      if (h.number.toString().includes(q)) return true;
      if (h.title.toLowerCase().includes(q)) return true;
      if (h.category?.toLowerCase().includes(q)) return true;
      if (h.tune?.toLowerCase().includes(q) || h.author?.toLowerCase().includes(q)) return true;
      return h.stanzas.some((s) => s.lines.some((l) => l.toLowerCase().includes(q)));
    });
  }, [collectionHymns, selectedCategory, searchQuery]);

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

  // Split View companion hymn
  const splitHymn = useMemo(() => {
    if (!isSplitViewOpen || !currentHymn) return null;
    if (splitHymnId) {
      const match = allAvailableHymns.find((h) => h.id === splitHymnId);
      if (match) return match;
    }
    // Try to find cross-reference in the selected split collection
    const cr = currentHymn?.crossReferences?.find((c) => c.collection === splitCollection);
    if (cr) {
      const match = allAvailableHymns.find(
        (h) => h.collection === splitCollection && h.number === cr.number
      );
      if (match) return match;
    }
    // Match by number
    const byNum = allAvailableHymns.find(
      (h) => h.collection === splitCollection && h.number === currentHymn?.number
    );
    if (byNum) return byNum;

    return allAvailableHymns.find((h) => h.collection === splitCollection) || null;
  }, [allAvailableHymns, isSplitViewOpen, splitHymnId, splitCollection, currentHymn]);

  // Quick Jump execution
  const handleQuickJump = (numStr?: string) => {
    const raw = numStr !== undefined ? numStr : quickJumpNumber;
    const target = parseInt(raw, 10);
    if (!isNaN(target)) {
      const match = collectionHymns.find((h) => h.number === target);
      if (match) {
        handleSelectHymn(match.id);
        setQuickJumpNumber('');
        setShowKeypad(false);
      } else {
        showToast({
          title: 'Hymn Not Found',
          description: `No hymn #${target} found in ${activeCollection}.`,
          type: 'info',
        });
      }
    }
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'Go') {
      handleQuickJump();
    } else if (key === 'C') {
      setQuickJumpNumber('');
    } else if (key === 'Bksp') {
      setQuickJumpNumber((prev) => prev.slice(0, -1));
    } else {
      if (quickJumpNumber.length < 4) {
        setQuickJumpNumber((prev) => prev + key);
      }
    }
  };

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

  // Calculate transposed key name
  const effectiveKey = useMemo(() => {
    if (!currentHymn) return '';
    return transposeKeyName(currentHymn.key, transposeSemiTones);
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

  // Render lines with support for chords and antiphonal Responsive Readings (Leader / Congregation)
  const renderStanzaLines = (stanza: HymnStanza, isRightPane = false) => {
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
          <p key={lineIdx} className="my-1.5 leading-relaxed">
            {cleanText}
          </p>
        );
      }

      // Parse and render chords aligned above lyrics
      const segments = parseLyricChordSegments(line, transposeSemiTones);
      const lineHasChords = segments.some((seg) => Boolean(seg.chord));

      if (!lineHasChords) {
        return (
          <p key={lineIdx} className="my-1.5 leading-relaxed">
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
              <span className="font-serif text-base sm:text-lg leading-normal whitespace-pre-wrap">
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
      <aside className="lg:col-span-4 xl:col-span-3 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Collection Selector Tabs */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-4 gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['SDAH', 'SDAH-EXT', 'NZK', 'NCA'] as HymnalCollection[]).map((col) => (
              <button
                key={col}
                onClick={() => {
                  setActiveCollection(col);
                  setSelectedCategory('All');
                }}
                className={`py-1.5 px-1 rounded-lg transition-all text-center text-[11px] sm:text-xs truncate ${
                  activeCollection === col
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={HYMNAL_METAS[col]?.name || col}
              >
                {col === 'SDAH-EXT' ? 'EXT' : col}
              </button>
            ))}
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {HYMNAL_METAS[activeCollection]?.name || activeCollection} ({collectionHymns.length} hymns)
            </span>
          </div>
        </div>

        {/* Quick Jump by Hymn Number */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="number"
              value={quickJumpNumber}
              onChange={(e) => setQuickJumpNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickJump();
              }}
              placeholder="Jump to #..."
              className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => handleQuickJump()}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
            title="Go to hymn number"
          >
            Go
          </button>
          <button
            onClick={() => setShowKeypad((p) => !p)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showKeypad
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle On-Screen Numeric Keypad"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Numeric Keypad Panel */}
        {showKeypad && (
          <div className="p-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1.5 text-center animate-fade-in">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Go'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeypadPress(key)}
                className={`py-2 rounded-lg font-mono font-bold text-xs transition shadow-xs ${
                  key === 'Go'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : key === 'C'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 hover:bg-red-200'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {/* Quick Search Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Number, title, or lyric snippet..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        {availableCategories.length > 0 && (
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition ${
                selectedCategory === 'All'
                  ? 'bg-amber-500 text-white'
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
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Hymns List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredHymns.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hymns found matching “{searchQuery}”.
            </div>
          ) : (
            filteredHymns.map((hymn) => {
              const isSelected = hymn.id === currentHymn?.id;
              const hasNote = Boolean(getHymnNote(hymn.id));
              return (
                <button
                  key={hymn.id}
                  onClick={() => handleSelectHymn(hymn.id)}
                  className={`w-full p-3 text-left transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className={`w-9 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {hymn.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-amber-900 dark:text-amber-300'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {hymn.title}
                      </h4>
                      {hasNote && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Personal note saved" />
                      )}
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
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Column: Hymn Reader & Beam Toolbar */}
      <main className="lg:col-span-8 xl:col-span-9 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {!currentHymn ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 min-h-[500px]">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 border border-slate-200/50 dark:border-slate-700/50">
              <Music className="w-8 h-8 stroke-[1.25]" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5 font-serif">
              Select a Hymn
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mb-5 leading-relaxed">
              Choose a hymn from the directory on the left, or use the quick jump keypad to enter a hymn number directly.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeypad(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                <span>Jump to Hymn #</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Hymn Header Toolbar */}
            <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-extrabold text-sm border border-amber-500/30">
              #{currentHymn.number}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentHymn.title}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {currentHymn.collection}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentHymn.key && (
                  <span>
                    Key: <strong className="text-amber-600 dark:text-amber-400">{effectiveKey}</strong>
                  </span>
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
            {/* Side-by-Side Split View Toggle */}
            <button
              id="hymn-split-view-btn"
              onClick={() => setIsSplitViewOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                isSplitViewOpen
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Side-by-side bilingual comparison and reading"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>

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
              <div className="px-2 text-center min-w-[56px]">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {effectiveKey.split(' ')[0]}
                </span>
                {transposeSemiTones !== 0 ? (
                  <span className="text-[10px] ml-1 font-mono text-slate-400">
                    ({transposeSemiTones > 0 ? `+${transposeSemiTones}` : transposeSemiTones})
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
                  onClick={() => setTransposeSemiTones(0)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5"
                  title="Reset to original key"
                >
                  <RotateCcw className="w-3 h-3" />
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

        {/* Cross-Reference Links Banner */}
        {currentHymn.crossReferences && currentHymn.crossReferences.length > 0 && (
          <div className="px-6 py-2 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200/40 dark:border-amber-900/30 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 flex-wrap">
            <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold">Cross-Language Translations:</span>
            {currentHymn.crossReferences.map((cr, idx) => {
              const langLabel =
                cr.collection === 'NZK'
                  ? 'Swahili'
                  : cr.collection === 'NCA'
                  ? 'Gĩkũyũ'
                  : 'English';
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isSplitViewOpen) {
                      setSplitCollection(cr.collection);
                      const found = allAvailableHymns.find(
                        (h) => h.collection === cr.collection && h.number === cr.number
                      );
                      if (found) setSplitHymnId(found.id);
                    } else {
                      setActiveCollection(cr.collection);
                      const found = allAvailableHymns.find(
                        (h) => h.collection === cr.collection && h.number === cr.number
                      );
                      if (found) handleSelectHymn(found.id);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-medium transition flex items-center gap-1.5 border border-amber-300/60 dark:border-amber-800/60 shadow-xs"
                >
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                    {langLabel}
                  </span>
                  <span>
                    {cr.collection} #{cr.number} · {cr.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}

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

        {/* STANZAS DISPLAY AREA (Single or Side-by-Side Split View) */}
        {isSplitViewOpen ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Split View Toolbar / Header */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Columns className="w-4 h-4 text-amber-500" />
                <span>Side-by-Side Bilingual Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Right Column:</span>
                <div className="flex rounded-lg bg-slate-200 dark:bg-slate-700 p-0.5 text-xs font-semibold">
                  {(['NZK', 'NCA', 'SDAH'] as HymnalCollection[]).map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setSplitCollection(col);
                        setSplitHymnId('');
                      }}
                      className={`px-2 py-1 rounded-md transition ${
                        splitCollection === col
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Stanzas Grid */}
            <div className="space-y-4">
              {Array.from({
                length: Math.max(
                  currentHymn.stanzas.length,
                  splitHymn?.stanzas.length || 0
                ),
              }).map((_, idx) => {
                const leftStanza = currentHymn.stanzas[idx];
                const rightStanza = splitHymn?.stanzas?.[idx];

                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Language Stanza */}
                    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      {leftStanza ? (
                        <>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              {leftStanza.type === 'refrain' || leftStanza.type === 'chorus'
                                ? 'Refrain'
                                : `Stanza ${leftStanza.number}`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {currentHymn.collection} #{currentHymn.number}
                            </span>
                          </div>
                          <div className="font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                            {renderStanzaLines(leftStanza, false)}
                          </div>
                        </>
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400 italic">
                          No matching stanza in {currentHymn.collection}
                        </div>
                      )}
                    </div>

                    {/* Right Language Stanza */}
                    <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30">
                      {rightStanza ? (
                        <>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              {rightStanza.type === 'refrain' || rightStanza.type === 'chorus'
                                ? 'Refrain'
                                : `Stanza ${rightStanza.number}`}
                            </span>
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold">
                              {splitHymn?.collection} #{splitHymn?.number} · {splitHymn?.title}
                            </span>
                          </div>
                          <div className="font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                            {renderStanzaLines(rightStanza, true)}
                          </div>
                        </>
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400 italic">
                          {splitHymn
                            ? `No stanza ${idx + 1} in ${splitHymn.collection} #${splitHymn.number}`
                            : `No translation selected in ${splitCollection}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
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
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
};
