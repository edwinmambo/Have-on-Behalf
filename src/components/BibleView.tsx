import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Cast,
  Bookmark,
  Check,
  SplitSquareVertical,
  ChevronDown,
  Search,
  Globe,
  Share2,
  Copy,
  Sparkles,
  Layers,
  X,
  Type,
  ArrowRight,
  Maximize2,
  CornerDownLeft,
} from 'lucide-react';
import { BibleVersionId, BibleVerse, BeamSlide } from '../types';
import { BIBLE_VERSIONS, BIBLE_BOOKS_CATALOG, BIBLE_TEXTS_STORE } from '../data/biblesData';
import { isItemFavorited, saveFavorite, getFavorites, removeFavorite } from '../lib/storage';
import { parseScriptureQuery, ParsedScriptureRef } from '../lib/bibleParser';
import { showToast } from '../lib/toast';
import { resolveChapterVerses, fetchRealBibleChapter } from '../lib/bibleStorage';
import {
  getLocalizedBookName,
  getLocalizedBookAbbr,
  getLocalizedCategory,
  getLocalizedTestament,
  getCanonicalEnglishBook,
  matchBookSearch,
} from '../lib/bibleLocalization';
import { addHistoryItem } from '../lib/historyStorage';

interface BibleViewProps {
  onBeamVerse: (ref: string, text: string, version: string) => void;
  onBeamMultipleVerses?: (verses: BibleVerse[], version: string) => void;
  redLetterEnabled: boolean;
  onToggleRedLetter: () => void;
  initialBook?: string;
  initialChapter?: number;
  initialVersion?: BibleVersionId;
  readerFontSizePx?: number;
  readerLineHeight?: number;
}

export const BibleView: React.FC<BibleViewProps> = ({
  onBeamVerse,
  onBeamMultipleVerses,
  redLetterEnabled,
  onToggleRedLetter,
  initialBook,
  initialChapter,
  initialVersion,
  readerFontSizePx,
  readerLineHeight,
}) => {
  const [selectedBook, setSelectedBook] = useState<string>(initialBook || 'John');
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter || 1);
  const [primaryVersion, setPrimaryVersion] = useState<BibleVersionId>(initialVersion || 'KJV');
  const [secondaryVersion, setSecondaryVersion] = useState<BibleVersionId | null>(null);
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);
  const [activeTestament, setActiveTestament] = useState<'ALL' | 'OT' | 'NT'>('NT');
  const [bookSearch, setBookSearch] = useState('');

  // Synchronize initial navigation props if provided from outside (e.g. from History)
  useEffect(() => {
    if (initialBook && initialBook !== selectedBook) {
      setSelectedBook(initialBook);
    }
  }, [initialBook]);

  useEffect(() => {
    if (initialChapter && initialChapter !== selectedChapter) {
      setSelectedChapter(initialChapter);
    }
  }, [initialChapter]);

  useEffect(() => {
    if (initialVersion && initialVersion !== primaryVersion) {
      setPrimaryVersion(initialVersion);
    }
  }, [initialVersion]);

  // Reader typography preferences
  const [readerFontFamily, setReaderFontFamily] = useState<'serif' | 'lora' | 'cinzel' | 'sans' | 'mono'>('serif');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');

  // Scripture reference search (e.g. "John 1: 1-14", "Psalm 23: 1-6")
  const [referenceQuery, setReferenceQuery] = useState('');
  const [referenceError, setReferenceError] = useState<string | null>(null);

  // Multi-verse selection state
  const [selectedVerseNumbers, setSelectedVerseNumbers] = useState<number[]>([]);
  const lastSelectedVerseRef = useRef<number | null>(null);
  const isRefSearchNavigating = useRef(false);
  const pendingVersesToSelect = useRef<number[]>([]);

  // Dynamic verses loaded asynchronously from open scripture API if chapter not in bundled store
  const [dynamicVerses, setDynamicVerses] = useState<BibleVerse[] | null>(null);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);

  // Reactive state for favorites to force immediate re-render on toggle
  const [favoritesRefreshKey, setFavoritesRefreshKey] = useState(0);

  // Chapter chunk filter for large books (e.g. Psalms 150, Isaiah 66)
  const [chapterChunkFilter, setChapterChunkFilter] = useState<'all' | number>('all');

  const currentChapterKey = `${selectedBook} ${selectedChapter}`;

  // Auto-scroll active chapter button into view when selected
  useEffect(() => {
    const el = document.getElementById(`chapter-btn-${selectedChapter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedChapter, selectedBook]);

  // Reset chapter chunk filter when book changes
  useEffect(() => {
    setChapterChunkFilter('all');
  }, [selectedBook]);

  // Preserve autoselection when navigating via passage search (e.g. John 1: 1-14)
  useEffect(() => {
    if (isRefSearchNavigating.current) {
      isRefSearchNavigating.current = false;
      if (pendingVersesToSelect.current.length > 0) {
        setSelectedVerseNumbers(pendingVersesToSelect.current);
        lastSelectedVerseRef.current = pendingVersesToSelect.current[pendingVersesToSelect.current.length - 1];
        pendingVersesToSelect.current = [];
      }
      return;
    }
    setSelectedVerseNumbers([]);
    lastSelectedVerseRef.current = null;
  }, [selectedBook, selectedChapter]);

  // Listen for global favorite changes
  useEffect(() => {
    const handleFavChange = () => setFavoritesRefreshKey((k) => k + 1);
    window.addEventListener('haveonbehalf_favorite_changed', handleFavChange);
    return () => window.removeEventListener('haveonbehalf_favorite_changed', handleFavChange);
  }, []);

  // Sorted versions: Available versions have priority and are listed first
  const sortedVersions = useMemo(() => {
    return [...BIBLE_VERSIONS].sort((a, b) => {
      const aAvail = a.isAvailable !== false;
      const bAvail = b.isAvailable !== false;
      if (aAvail === bAvail) return 0;
      return aAvail ? -1 : 1;
    });
  }, []);

  // Filter books catalog with multi-language search awareness
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS_CATALOG.filter((b) => {
      if (activeTestament !== 'ALL' && b.testament !== activeTestament) return false;
      if (bookSearch.trim() && !matchBookSearch(b.name, bookSearch, primaryVersion)) {
        return false;
      }
      return true;
    });
  }, [activeTestament, bookSearch, primaryVersion]);

  const selectedBookMeta = useMemo(() => {
    return BIBLE_BOOKS_CATALOG.find((b) => b.name === selectedBook) || BIBLE_BOOKS_CATALOG[0];
  }, [selectedBook]);

  // Asynchronously fetch authentic verses if current chapter is not in local bundled store
  useEffect(() => {
    let isCancelled = false;
    const resolved = resolveChapterVerses(primaryVersion, selectedBook, selectedChapter);
    if (resolved && resolved.length > 0) {
      setDynamicVerses(null);
      setIsLoadingVerses(false);
      return;
    }

    setIsLoadingVerses(true);
    fetchRealBibleChapter(primaryVersion, selectedBook, selectedChapter)
      .then((verses) => {
        if (isCancelled) return;
        if (verses && verses.length > 0) {
          setDynamicVerses(verses);
        } else {
          setDynamicVerses(null);
        }
      })
      .catch((err) => {
        console.warn('Could not load online scripture chapter:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingVerses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [primaryVersion, selectedBook, selectedChapter]);

  // Primary verses for current book & chapter
  const primaryVerses: BibleVerse[] = useMemo(() => {
    if (dynamicVerses && dynamicVerses.length > 0) {
      return dynamicVerses;
    }

    const resolved = resolveChapterVerses(primaryVersion, selectedBook, selectedChapter);
    if (resolved && resolved.length > 0) {
      return resolved;
    }

    const store = BIBLE_TEXTS_STORE[primaryVersion] || BIBLE_TEXTS_STORE.KJV;
    if (store[currentChapterKey]) {
      return store[currentChapterKey];
    }

    // Default canonical initial verse while loading or if offline
    return [
      {
        book: selectedBook,
        chapter: selectedChapter,
        verse: 1,
        text: `In the beginning was the Word, and the Word was with God, and the Word was God. (${selectedBook} ${selectedChapter})`,
        isRedLetter: false,
      },
    ];
  }, [dynamicVerses, primaryVersion, currentChapterKey, selectedBook, selectedChapter]);

  // Track recently viewed Bible chapter in reading history
  useEffect(() => {
    if (primaryVerses && primaryVerses.length > 0) {
      const localizedName = getLocalizedBookName(selectedBook, primaryVersion);
      const firstVerseText = primaryVerses[0]?.text || '';
      addHistoryItem({
        type: 'bible',
        title: `${localizedName} ${selectedChapter} (${primaryVersion})`,
        subtitle: `${primaryVerses.length} verses • Holy Bible`,
        reference: `${localizedName} ${selectedChapter}`,
        snippet: firstVerseText ? `v1: ${firstVerseText.substring(0, 120)}...` : undefined,
        metadata: {
          bookId: selectedBook,
          bookName: localizedName,
          chapter: selectedChapter,
          version: primaryVersion,
        },
      });
    }
  }, [selectedBook, selectedChapter, primaryVersion, primaryVerses.length]);

  // Secondary verses for parallel split view
  const secondaryVerses: BibleVerse[] = useMemo(() => {
    if (!secondaryVersion) return [];
    const resolved = resolveChapterVerses(secondaryVersion, selectedBook, selectedChapter);
    if (resolved && resolved.length > 0) {
      return resolved;
    }
    const store = BIBLE_TEXTS_STORE[secondaryVersion] || BIBLE_TEXTS_STORE.SUV;
    return store[currentChapterKey] || primaryVerses;
  }, [secondaryVersion, currentChapterKey, selectedBook, selectedChapter, primaryVerses]);

  // Handle Scripture Reference Search like "John 1: 1-14"
  const handleExecuteReferenceSearch = (queryString: string) => {
    if (!queryString.trim()) return;
    setReferenceError(null);

    const parsed = parseScriptureQuery(queryString);
    if (!parsed) {
      setReferenceError('Could not parse passage. Try: "John 1: 1-14" or "Psalm 23:1-6"');
      showToast({
        title: 'Reference format error',
        description: 'Please use format like "John 1: 1-14" or "Psalm 23: 1-6"',
        type: 'info',
      });
      return;
    }

    if (parsed.verses.length > 0) {
      isRefSearchNavigating.current = true;
      pendingVersesToSelect.current = parsed.verses;
    }

    // Set book and chapter
    setSelectedBook(parsed.book);
    setSelectedChapter(parsed.chapter);

    // If verse range is specified, autoselect the verses!
    if (parsed.verses.length > 0) {
      setSelectedVerseNumbers(parsed.verses);
      lastSelectedVerseRef.current = parsed.verses[parsed.verses.length - 1];

      // Smooth scroll to the first verse in range
      setTimeout(() => {
        const targetElement = document.getElementById(`verse-${parsed.verses[0]}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);

      showToast({
        title: `Selected ${parsed.book} ${parsed.chapter}:${parsed.verses[0]}${
          parsed.verses.length > 1 ? `-${parsed.verses[parsed.verses.length - 1]}` : ''
        }`,
        description: `Autoselected ${parsed.verses.length} verse${parsed.verses.length > 1 ? 's' : ''} in ${primaryVersion}`,
        type: 'info',
      });
    } else {
      setSelectedVerseNumbers([]);
      showToast({
        title: `Navigated to ${parsed.book} ${parsed.chapter}`,
        type: 'info',
      });
    }

    setReferenceQuery('');
  };

  // Handle selecting verses with click or Shift+click range
  const handleVerseClick = (verseNum: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedVerseRef.current !== null) {
      // Range selection
      const start = Math.min(lastSelectedVerseRef.current, verseNum);
      const end = Math.max(lastSelectedVerseRef.current, verseNum);
      const range = primaryVerses
        .map((v) => v.verse)
        .filter((v) => v >= start && v <= end);

      setSelectedVerseNumbers(Array.from(new Set([...selectedVerseNumbers, ...range])));
    } else if (event.metaKey || event.ctrlKey) {
      // Toggle individual
      if (selectedVerseNumbers.includes(verseNum)) {
        setSelectedVerseNumbers(selectedVerseNumbers.filter((n) => n !== verseNum));
      } else {
        setSelectedVerseNumbers([...selectedVerseNumbers, verseNum]);
      }
      lastSelectedVerseRef.current = verseNum;
    } else {
      // Normal click: if clicking an already selected verse when only 1 is selected, unselect; else select only this one
      if (selectedVerseNumbers.length === 1 && selectedVerseNumbers[0] === verseNum) {
        setSelectedVerseNumbers([]);
        lastSelectedVerseRef.current = null;
      } else {
        setSelectedVerseNumbers([verseNum]);
        lastSelectedVerseRef.current = verseNum;
      }
    }
  };

  // Keyboard navigation for Escape (deselect) and Shift + arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc key deselects selected verses
      if (e.key === 'Escape') {
        if (selectedVerseNumbers.length > 0) {
          e.preventDefault();
          setSelectedVerseNumbers([]);
          lastSelectedVerseRef.current = null;
          showToast({
            title: 'Deselected Verses',
            description: 'Cleared selection (Esc)',
            type: 'info',
          });
          return;
        }
      }

      if (!e.shiftKey) return;
      if (selectedVerseNumbers.length === 0) return;

      const minSelected = Math.min(...selectedVerseNumbers);
      const maxSelected = Math.max(...selectedVerseNumbers);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = primaryVerses.find((v) => v.verse > maxSelected);
        if (next) {
          setSelectedVerseNumbers((prev) => [...prev, next.verse]);
          lastSelectedVerseRef.current = next.verse;
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = primaryVerses
          .slice()
          .reverse()
          .find((v) => v.verse < minSelected);
        if (prev) {
          setSelectedVerseNumbers((p) => [...p, prev.verse]);
          lastSelectedVerseRef.current = prev.verse;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVerseNumbers, primaryVerses]);

  // Selected verses objects sorted by verse number
  const selectedVersesList = useMemo(() => {
    return primaryVerses
      .filter((v) => selectedVerseNumbers.includes(v.verse))
      .sort((a, b) => a.verse - b.verse);
  }, [primaryVerses, selectedVerseNumbers]);

  const copyVerseToClipboard = (verse: BibleVerse) => {
    const locBook = getLocalizedBookName(verse.book, primaryVersion);
    const text = `"${verse.text}" — ${locBook} ${verse.chapter}:${verse.verse} (${primaryVersion})`;
    navigator.clipboard?.writeText(text);
    setCopiedVerse(`${verse.chapter}:${verse.verse}`);
    showToast({
      title: 'Copied to Clipboard',
      description: `${locBook} ${verse.chapter}:${verse.verse} (${primaryVersion})`,
      type: 'copied',
    });
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const copyAllSelectedVerses = () => {
    if (selectedVersesList.length === 0) return;
    const locBook = getLocalizedBookName(selectedBook, primaryVersion);
    const text =
      selectedVersesList.map((v) => `${v.verse}. ${v.text}`).join('\n\n') +
      `\n— ${locBook} ${selectedChapter}:${selectedVersesList[0].verse}-${
        selectedVersesList[selectedVersesList.length - 1].verse
      } (${primaryVersion})`;
    navigator.clipboard?.writeText(text);
    setCopiedVerse('all');
    showToast({
      title: `Copied ${selectedVersesList.length} Verses`,
      description: `${locBook} ${selectedChapter}:${selectedVersesList[0].verse}-${
        selectedVersesList[selectedVersesList.length - 1].verse
      } (${primaryVersion})`,
      type: 'copied',
    });
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  // Toggle favorite with reactive instant update & toast notification
  const handleToggleFavoriteVerse = (verse: BibleVerse) => {
    const locBook = getLocalizedBookName(verse.book, primaryVersion);
    const ref = `${verse.book} ${verse.chapter}:${verse.verse} [${primaryVersion}]`;
    const isCurrentlyFav = isItemFavorited('verse', ref);

    if (isCurrentlyFav) {
      const allFavs = getFavorites();
      const match = allFavs.find((f) => f.type === 'verse' && f.reference === ref);
      if (match) {
        removeFavorite(match.id);
      }
      setFavoritesRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('haveonbehalf_favorite_changed'));
      showToast({
        title: 'Removed from Bookmarks',
        description: `${locBook} ${verse.chapter}:${verse.verse}`,
        type: 'remove',
      });
    } else {
      saveFavorite({
        type: 'verse',
        title: `${locBook} ${verse.chapter}:${verse.verse}`,
        reference: ref,
        snippet: verse.text,
        metadata: {
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          version: primaryVersion,
        },
      });
      setFavoritesRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('haveonbehalf_favorite_changed'));
      showToast({
        title: 'Saved to Bookmarks',
        description: `${locBook} ${verse.chapter}:${verse.verse} (${primaryVersion})`,
        type: 'favorite',
      });
    }
  };

  const handleBeamSelected = () => {
    if (selectedVersesList.length === 0) return;
    const locBook = getLocalizedBookName(selectedBook, primaryVersion);
    if (onBeamMultipleVerses) {
      onBeamMultipleVerses(selectedVersesList, primaryVersion);
    } else {
      const minV = selectedVersesList[0].verse;
      const maxV = selectedVersesList[selectedVersesList.length - 1].verse;
      const ref = `${locBook} ${selectedChapter}:${minV === maxV ? minV : `${minV}-${maxV}`}`;
      const combinedText = selectedVersesList.map((v) => `[${v.verse}] ${v.text}`).join(' ');
      onBeamVerse(ref, combinedText, primaryVersion);
    }
  };

  // Font family class resolver
  const fontClass = useMemo(() => {
    switch (readerFontFamily) {
      case 'lora':
        return 'font-serif [font-family:"Lora",serif]';
      case 'cinzel':
        return '[font-family:"Cinzel",serif]';
      case 'sans':
        return 'font-sans [font-family:"Plus_Jakarta_Sans",sans-serif]';
      case 'mono':
        return 'font-mono [font-family:"JetBrains_Mono",monospace]';
      case 'serif':
      default:
        return 'font-serif [font-family:"EB_Garamond",serif]';
    }
  }, [readerFontFamily]);

  // Font size class resolver
  const sizeClass = useMemo(() => {
    switch (readerFontSize) {
      case 'sm':
        return 'text-sm leading-relaxed';
      case 'base':
        return 'text-base leading-relaxed';
      case 'xl':
        return 'text-xl leading-loose';
      case 'lg':
      default:
        return 'text-lg leading-relaxed';
    }
  }, [readerFontSize]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] min-h-[600px] relative">
      {/* Left Column: Book & Chapter Navigator */}
      <aside className="lg:col-span-4 xl:col-span-3 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Testament Filters */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'OT', 'NT'] as const).map((testament) => (
              <button
                key={testament}
                onClick={() => setActiveTestament(testament)}
                className={`py-1.5 px-1 rounded-lg transition-all text-center truncate ${
                  activeTestament === testament
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={getLocalizedTestament(testament, primaryVersion)}
              >
                {getLocalizedTestament(testament, primaryVersion)}
              </button>
            ))}
          </div>

          <div className="mt-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder={
                primaryVersion === 'SUV'
                  ? 'Tafuta kitabu (mfano: Mwanzo, Zaburi)...'
                  : primaryVersion === 'GIK'
                  ? 'Caria ibuku (Kĩambĩrĩria, Thaburi)...'
                  : 'Search book (e.g. Genesis, Psalms)...'
              }
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Books List with Dynamic Multi-Language Localization */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 min-h-[140px]">
          {filteredBooks.map((book) => {
            const isSelected = book.name === selectedBook;
            const localizedName = getLocalizedBookName(book.name, primaryVersion);
            const localizedAbbr = getLocalizedBookAbbr(book.name, primaryVersion);
            const localizedCat = getLocalizedCategory(book.category, primaryVersion);

            return (
              <button
                key={book.name}
                onClick={() => {
                  setSelectedBook(book.name);
                  setSelectedChapter(1);
                }}
                className={`w-full p-2.5 px-3 text-left transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-8 h-6 rounded flex items-center justify-center font-mono font-bold text-[10.5px] shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {localizedAbbr}
                  </span>
                  <div className="min-w-0 truncate">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isSelected
                          ? 'text-amber-900 dark:text-amber-300 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {localizedName}
                      {localizedName !== book.name && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                          ({book.name})
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">{localizedCat}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                  {book.chaptersCount} {primaryVersion === 'SUV' ? 'sura' : primaryVersion === 'GIK' ? 'icunjĩ' : 'ch'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Responsive Chapter Grid Selector: Expanded for longer books */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
              {getLocalizedBookName(selectedBook, primaryVersion)} ({selectedBookMeta.chaptersCount}{' '}
              {primaryVersion === 'SUV' ? 'Sura' : primaryVersion === 'GIK' ? 'Icunjĩ' : 'Chapters'})
            </span>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              {primaryVersion === 'SUV'
                ? `Sura ${selectedChapter} inasomwa`
                : primaryVersion === 'GIK'
                ? `Gĩcunjĩ ${selectedChapter}`
                : `Ch. ${selectedChapter} active`}
            </span>
          </div>

          {/* Quick chapter range chunks for large books (e.g. Psalms 150, Isaiah 66, Genesis 50) */}
          {selectedBookMeta.chaptersCount > 30 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1.5 mb-1.5 text-[10px]">
              <button
                onClick={() => setChapterChunkFilter('all')}
                className={`px-2 py-0.5 rounded-md font-mono transition whitespace-nowrap ${
                  chapterChunkFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({selectedBookMeta.chaptersCount})
              </button>
              {Array.from(
                { length: Math.ceil(selectedBookMeta.chaptersCount / 25) },
                (_, idx) => {
                  const start = idx * 25 + 1;
                  const end = Math.min((idx + 1) * 25, selectedBookMeta.chaptersCount);
                  return (
                    <button
                      key={idx}
                      onClick={() => setChapterChunkFilter(idx)}
                      className={`px-2 py-0.5 rounded-md font-mono transition whitespace-nowrap ${
                        chapterChunkFilter === idx
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {start}-{end}
                    </button>
                  );
                }
              )}
            </div>
          )}

          {/* Dynamic responsive container that accommodates all chapters */}
          <div
            className={`grid grid-cols-6 sm:grid-cols-7 gap-1 overflow-y-auto pr-1 transition-all ${
              selectedBookMeta.chaptersCount <= 12
                ? 'max-h-24'
                : selectedBookMeta.chaptersCount <= 28
                ? 'max-h-44'
                : selectedBookMeta.chaptersCount <= 50
                ? 'max-h-56 sm:max-h-64'
                : 'max-h-72 sm:max-h-80 md:max-h-88'
            }`}
          >
            {Array.from({ length: selectedBookMeta.chaptersCount }, (_, i) => i + 1)
              .filter((ch) => {
                if (chapterChunkFilter === 'all') return true;
                const start = chapterChunkFilter * 25 + 1;
                const end = Math.min((chapterChunkFilter + 1) * 25, selectedBookMeta.chaptersCount);
                return ch >= start && ch <= end;
              })
              .map((ch) => (
                <button
                  key={ch}
                  id={`chapter-btn-${ch}`}
                  onClick={() => setSelectedChapter(ch)}
                  className={`h-7.5 rounded-lg font-mono text-xs font-semibold transition flex items-center justify-center ${
                    selectedChapter === ch
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400/40'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70'
                  }`}
                  title={`${getLocalizedBookName(selectedBook, primaryVersion)} ${ch}`}
                >
                  {ch}
                </button>
              ))}
          </div>
        </div>
      </aside>

      {/* Right Column: Bible Reading & Multi-Select Casting Pane */}
      <main className="lg:col-span-8 xl:col-span-9 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden relative">
        {/* Top Header & Scripture Reference Search Bar */}
        <header className="px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {getLocalizedBookName(selectedBook, primaryVersion)} {selectedChapter}
                  </h2>
                  {getLocalizedBookName(selectedBook, primaryVersion) !== selectedBook && (
                    <span className="text-xs text-slate-400 font-normal">
                      ({selectedBook} {selectedChapter})
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold font-mono">
                    {primaryVersion}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {BIBLE_VERSIONS.find((v) => v.id === primaryVersion)?.name}
                </p>
              </div>
            </div>

            {/* Controls Toolbar: Fonts, Red Letter, Parallel, Versions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Font Selector */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
                {(
                  [
                    { id: 'serif', label: 'Garamond' },
                    { id: 'lora', label: 'Lora' },
                    { id: 'cinzel', label: 'Cinzel' },
                    { id: 'sans', label: 'Sans' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setReaderFontFamily(f.id)}
                    className={`px-2 py-1 rounded-lg font-medium transition ${
                      readerFontFamily === f.id
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Font Size Changer */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() =>
                    setReaderFontSize((prev) =>
                      prev === 'xl' ? 'lg' : prev === 'lg' ? 'base' : 'sm'
                    )
                  }
                  className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Smaller font"
                >
                  A-
                </button>
                <button
                  onClick={() =>
                    setReaderFontSize((prev) =>
                      prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'xl'
                    )
                  }
                  className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Larger font"
                >
                  A+
                </button>
              </div>

              {/* Red Letter Toggle */}
              <button
                onClick={onToggleRedLetter}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                  redLetterEnabled
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/60'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
                title="Highlight Words of Jesus Christ in Red"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Red Text</span>
              </button>

              {/* Versions Selector: Available versions have priority; unavailable are greyed out */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold gap-0.5">
                {/* Available Translations First */}
                {sortedVersions
                  .filter((v) => v.isAvailable !== false)
                  .map((v) => {
                    const isSelected = primaryVersion === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setPrimaryVersion(v.id as BibleVersionId)}
                        className={`px-2.5 py-1 rounded-lg transition relative flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-700/50'
                        }`}
                        title={`${v.name} (${v.language}) - Available Offline`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{v.id}</span>
                      </button>
                    );
                  })}

                {/* Subtle divider between available and unavailable versions */}
                <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

                {/* Unavailable Versions (Greyed Out / Custom Import Required) */}
                {sortedVersions
                  .filter((v) => v.isAvailable === false)
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        showToast({
                          title: `${v.name} (${v.id}) Offline`,
                          description:
                            'This translation is not in the offline bundle. Available versions: KJV, SUV (Swahili), GIK (Gĩkũyũ)',
                          type: 'info',
                        });
                      }}
                      className="px-1.5 py-1 rounded-lg text-[11px] font-medium opacity-40 text-slate-400 dark:text-slate-500 cursor-not-allowed hover:opacity-60 transition"
                      title={`${v.name} (${v.id}) - Unavailable offline`}
                    >
                      {v.id}
                    </button>
                  ))}
              </div>

              {/* Parallel Comparison Toggle */}
              <button
                onClick={() => {
                  if (secondaryVersion) {
                    setSecondaryVersion(null);
                  } else {
                    setSecondaryVersion(primaryVersion === 'KJV' ? 'SUV' : 'KJV');
                  }
                }}
                className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                  secondaryVersion
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
                title="Compare with second version side-by-side"
              >
                <SplitSquareVertical className="w-4 h-4" />
                <span className="hidden sm:inline">Parallel</span>
              </button>
            </div>
          </div>

          {/* SCRIPTURE RANGE SEARCH BAR (John 1: 1-14 autoselect feature) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={referenceQuery}
                onChange={(e) => setReferenceQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleExecuteReferenceSearch(referenceQuery);
                  }
                }}
                placeholder='Search passage (e.g. "John 1: 1-14", "Psalm 23: 1-6", "Rom 8: 28-39")...'
                className="w-full pl-9 pr-20 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
              />
              <button
                onClick={() => handleExecuteReferenceSearch(referenceQuery)}
                className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <span>Go</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Passage Suggestion Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
              <span className="text-slate-400 shrink-0">Quick:</span>
              {[
                'John 1: 1-14',
                'John 14: 1-6',
                'Psalm 23: 1-6',
                'Exodus 20: 8-11',
                'Romans 8: 28-39',
                'Rev 14: 6-12',
              ].map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleExecuteReferenceSearch(pill)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 font-medium whitespace-nowrap transition"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Secondary Version Selector when Parallel is active */}
        {secondaryVersion && (
          <div className="px-6 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-indigo-900 dark:text-indigo-300 mr-1">
                Parallel:
              </span>
              {/* Available parallel versions */}
              {sortedVersions
                .filter((v) => v.isAvailable !== false)
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSecondaryVersion(v.id as BibleVersionId)}
                    className={`px-2 py-0.5 rounded-md font-medium transition flex items-center gap-1 text-[11px] ${
                      secondaryVersion === v.id
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40'
                    }`}
                    title={`${v.name} (${v.language}) - Available`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{v.id}</span>
                  </button>
                ))}

              <div className="w-px h-3.5 bg-indigo-200 dark:bg-indigo-800 mx-0.5" />

              {/* Unavailable parallel versions */}
              {sortedVersions
                .filter((v) => v.isAvailable === false)
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      showToast({
                        title: `${v.name} (${v.id}) Offline`,
                        description:
                          'This translation is not available offline. Available versions: KJV, SUV (Swahili), GIK (Gĩkũyũ)',
                        type: 'info',
                      });
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium opacity-40 text-slate-400 dark:text-slate-500 cursor-not-allowed hover:opacity-60"
                    title={`${v.name} (${v.id}) - Unavailable offline`}
                  >
                    {v.id}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setSecondaryVersion(null)}
              className="text-slate-400 hover:text-slate-600 text-xs shrink-0 ml-2"
            >
              Close Parallel
            </button>
          </div>
        )}

        {/* FLOATING MULTI-SELECT ACTION BAR */}
        {selectedVerseNumbers.length > 0 && (
          <div className="px-6 py-2.5 bg-amber-500 text-white shadow-md flex items-center justify-between gap-3 text-xs animate-fade-in sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {selectedVersesList.length === 1
                  ? `${getLocalizedBookName(selectedBook, primaryVersion)} ${selectedChapter}:${selectedVersesList[0].verse}`
                  : `${getLocalizedBookName(selectedBook, primaryVersion)} ${selectedChapter}:${selectedVersesList[0].verse}-${
                      selectedVersesList[selectedVersesList.length - 1].verse
                    } (${selectedVersesList.length} verses selected)`}
              </span>
              <span className="opacity-80 font-mono">[{primaryVersion}]</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAllSelectedVerses}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1 transition"
                title="Copy selected verses"
              >
                {copiedVerse === 'all' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>

              <button
                id="beam-selected-verses-btn"
                onClick={handleBeamSelected}
                className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 hover:bg-amber-50 font-bold shadow-xs flex items-center gap-1.5 transition active:scale-98"
                title="Beam selected verses into presentation slides"
              >
                <Cast className="w-4 h-4 text-amber-600" />
                <span>Beam Verses ({selectedVersesList.length})</span>
              </button>

              <button
                onClick={() => setSelectedVerseNumbers([])}
                className="p-1 hover:bg-amber-600 rounded-md transition"
                title="Clear selection (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Verses Reading Pane: Left-Aligned Without Center Justification */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isLoadingVerses && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs mb-3 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>Fetching authentic scripture text for {selectedBook} {selectedChapter}...</span>
            </div>
          )}

          <div className="w-full text-left space-y-1.5">
            {primaryVerses.map((verse, idx) => {
              const secVerse = secondaryVerses[idx];
              const verseRef = `${verse.book} ${verse.chapter}:${verse.verse} [${primaryVersion}]`;
              const isFav = isItemFavorited('verse', verseRef);
              const isSelected = selectedVerseNumbers.includes(verse.verse);

              return (
                <div
                  id={`verse-${verse.verse}`}
                  key={verse.verse}
                  onClick={(e) => handleVerseClick(verse.verse, e)}
                  className={`group py-2.5 px-3 sm:px-4 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-400 dark:border-amber-600 border-l-4'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 text-left">
                    {/* Far-Left Verse Number & Reading Body */}
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-1 text-left">
                      {/* Flush Far-Left Number Gutter */}
                      <span className="shrink-0 min-w-[1.5rem] sm:min-w-[2rem] text-left font-mono text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 select-none pt-0.5">
                        {verse.verse}
                      </span>

                      {/* Verse Text (Left-aligned, never centered) */}
                      <div
                        className={`flex-1 text-left select-text ${fontClass} ${sizeClass}`}
                        style={{
                          fontSize: readerFontSizePx ? `${readerFontSizePx}px` : undefined,
                          lineHeight: readerLineHeight ? `${readerLineHeight}` : undefined,
                        }}
                      >
                        {secondaryVersion ? (
                          /* Parallel 2-Column Side-by-Side (Both Left-Aligned) */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="text-left">
                              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                {primaryVersion}
                              </span>
                              <span
                                className={
                                  redLetterEnabled && verse.isRedLetter
                                    ? 'text-red-700 dark:text-rose-400 font-medium'
                                    : 'text-slate-800 dark:text-slate-200'
                                }
                              >
                                {verse.text}
                              </span>
                            </div>

                            <div className="text-left border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
                              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                                {secondaryVersion}
                              </span>
                              <span className="text-slate-600 dark:text-slate-300">
                                {secVerse ? secVerse.text : verse.text}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Standard Single Column (Flush Far-Left) */
                          <p className="text-left m-0 leading-relaxed">
                            <span
                              className={
                                redLetterEnabled && verse.isRedLetter
                                  ? 'text-red-700 dark:text-rose-400 font-medium'
                                  : 'text-slate-800 dark:text-slate-200'
                              }
                            >
                              {verse.text}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Action Icons (Copy, Responsive Bookmark Feedback, Beam) */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-1 shrink-0 pt-0.5"
                    >
                      <button
                        onClick={() => copyVerseToClipboard(verse)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition active:scale-95"
                        title="Copy verse reference"
                      >
                        {copiedVerse === `${verse.chapter}:${verse.verse}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* FAVORITE BUTTON WITH IMMEDIATE REACTIVE FEEDBACK */}
                      <button
                        onClick={() => handleToggleFavoriteVerse(verse)}
                        className={`p-1.5 rounded-lg text-xs transition active:scale-90 ${
                          isFav
                            ? 'bg-amber-500 text-white shadow-xs font-bold scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-700'
                        }`}
                        title={isFav ? 'Remove from bookmarks' : 'Add to bookmarks'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : ''}`} />
                      </button>

                      <button
                        onClick={() => {
                          onBeamVerse(
                            `${verse.book} ${verse.chapter}:${verse.verse}`,
                            verse.text,
                            primaryVersion
                          );
                        }}
                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs transition active:scale-95"
                        title="Beam this verse to projector"
                      >
                        <Cast className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
