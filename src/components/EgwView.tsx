import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll,
  BookOpen,
  Bookmark,
  Check,
  Cast,
  Search,
  ExternalLink,
  Tag,
  Copy,
  SlidersHorizontal,
  X,
  Layers,
} from 'lucide-react';
import { EgwBook, EgwParagraph, BeamSlide } from '../types';
import { EGW_BOOKS, EGW_PARAGRAPHS } from '../data/egwData';
import { isItemFavorited, saveFavorite, removeFavorite, getFavorites } from '../lib/storage';
import { showToast } from '../lib/toast';
import { addHistoryItem } from '../lib/historyStorage';

interface EgwViewProps {
  onOpenScripture: (reference: string) => void;
  onBeamParagraph: (paragraph: EgwParagraph) => void;
  onBeamMultipleParagraphs?: (paragraphs: EgwParagraph[], bookTitle: string) => void;
  initialBookCode?: string;
  initialChapterNumber?: number;
  readerFontSizePx?: number;
  readerLineHeight?: number;
}

export const EgwView: React.FC<EgwViewProps> = ({
  onOpenScripture,
  onBeamParagraph,
  onBeamMultipleParagraphs,
  initialBookCode,
  initialChapterNumber,
  readerFontSizePx,
  readerLineHeight,
}) => {
  const [selectedBookCode, setSelectedBookCode] = useState<string>(initialBookCode || 'MOH');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteRefreshKey, setFavoriteRefreshKey] = useState(0);

  // Synchronize initial book code if passed from history navigation
  useEffect(() => {
    if (initialBookCode && initialBookCode !== selectedBookCode) {
      setSelectedBookCode(initialBookCode);
    }
  }, [initialBookCode]);

  // Multi-paragraph selection state
  const [selectedParagraphIds, setSelectedParagraphIds] = useState<string[]>([]);
  const lastSelectedIdRef = useRef<string | null>(null);

  const selectedBook = useMemo(() => {
    return EGW_BOOKS.find((b) => b.code === selectedBookCode) || EGW_BOOKS[0];
  }, [selectedBookCode]);

  // Clear multi-select when switching books
  useEffect(() => {
    setSelectedParagraphIds([]);
    lastSelectedIdRef.current = null;
  }, [selectedBookCode]);

  // Filter paragraphs by book and optional search query
  const bookParagraphs = useMemo(() => {
    return EGW_PARAGRAPHS.filter((p) => p.bookCode === selectedBookCode);
  }, [selectedBookCode]);

  // Track recently viewed EGW book in reading history
  useEffect(() => {
    if (selectedBook && bookParagraphs.length > 0) {
      addHistoryItem({
        type: 'egw',
        title: `${selectedBook.title} (${selectedBook.code})`,
        subtitle: `${bookParagraphs.length} paragraphs • Spirit of Prophecy`,
        reference: selectedBook.code,
        snippet: bookParagraphs[0]?.text ? `${bookParagraphs[0].text.substring(0, 120)}...` : undefined,
        metadata: {
          bookCode: selectedBook.code,
          bookTitle: selectedBook.title,
        },
      });
    }
  }, [selectedBookCode, bookParagraphs.length]);

  const filteredParagraphs = useMemo(() => {
    if (!searchQuery.trim()) return bookParagraphs;
    const q = searchQuery.toLowerCase().trim();
    return bookParagraphs.filter(
      (p) =>
        p.reference.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q) ||
        p.chapterTitle.toLowerCase().includes(q) ||
        p.scriptureReferences.some((s) => s.toLowerCase().includes(q))
    );
  }, [bookParagraphs, searchQuery]);

  // Handle paragraph selection with click or Shift+click
  const handleParagraphClick = (pId: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIdRef.current !== null) {
      const pIdx1 = filteredParagraphs.findIndex((p) => p.id === lastSelectedIdRef.current);
      const pIdx2 = filteredParagraphs.findIndex((p) => p.id === pId);
      if (pIdx1 !== -1 && pIdx2 !== -1) {
        const start = Math.min(pIdx1, pIdx2);
        const end = Math.max(pIdx1, pIdx2);
        const range = filteredParagraphs.slice(start, end + 1).map((p) => p.id);
        setSelectedParagraphIds(Array.from(new Set([...selectedParagraphIds, ...range])));
        return;
      }
    }

    if (event.metaKey || event.ctrlKey) {
      if (selectedParagraphIds.includes(pId)) {
        setSelectedParagraphIds(selectedParagraphIds.filter((id) => id !== pId));
      } else {
        setSelectedParagraphIds([...selectedParagraphIds, pId]);
      }
      lastSelectedIdRef.current = pId;
    } else {
      if (selectedParagraphIds.length === 1 && selectedParagraphIds[0] === pId) {
        setSelectedParagraphIds([]);
        lastSelectedIdRef.current = null;
      } else {
        setSelectedParagraphIds([pId]);
        lastSelectedIdRef.current = pId;
      }
    }
  };

  // Keyboard navigation for Shift + arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      if (selectedParagraphIds.length === 0) return;

      const indices = selectedParagraphIds
        .map((id) => filteredParagraphs.findIndex((p) => p.id === id))
        .filter((idx) => idx !== -1);

      if (indices.length === 0) return;
      const minIdx = Math.min(...indices);
      const maxIdx = Math.max(...indices);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (maxIdx + 1 < filteredParagraphs.length) {
          const next = filteredParagraphs[maxIdx + 1];
          setSelectedParagraphIds((prev) => [...prev, next.id]);
          lastSelectedIdRef.current = next.id;
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (minIdx - 1 >= 0) {
          const prevP = filteredParagraphs[minIdx - 1];
          setSelectedParagraphIds((prev) => [...prev, prevP.id]);
          lastSelectedIdRef.current = prevP.id;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedParagraphIds, filteredParagraphs]);

  // Selected paragraphs list
  const selectedParagraphsList = useMemo(() => {
    return filteredParagraphs.filter((p) => selectedParagraphIds.includes(p.id));
  }, [filteredParagraphs, selectedParagraphIds]);

  const handleFavoriteParagraph = (p: EgwParagraph) => {
    const isFav = isItemFavorited('egw_paragraph', p.reference);
    if (isFav) {
      const allFavs = getFavorites();
      const existing = allFavs.find((f) => f.type === 'egw_paragraph' && f.reference === p.reference);
      if (existing) removeFavorite(existing.id);
      setFavoriteRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('haveonbehalf_favorite_changed'));
      showToast({
        title: 'Removed from Bookmarks',
        description: `${selectedBook.shortTitle} • ${p.reference}`,
        type: 'remove',
      });
    } else {
      saveFavorite({
        type: 'egw_paragraph',
        title: `${selectedBook.shortTitle} — ${p.chapterTitle}`,
        reference: p.reference,
        snippet: p.text.slice(0, 150) + '...',
        metadata: {
          bookCode: p.bookCode,
          page: p.page,
          paragraphNumber: p.paragraphNumber,
        },
      });
      setFavoriteRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('haveonbehalf_favorite_changed'));
      showToast({
        title: 'Saved to Bookmarks',
        description: `${selectedBook.shortTitle} • ${p.reference}`,
        type: 'favorite',
      });
    }
  };

  const copyCitation = (p: EgwParagraph) => {
    const quote = `"${p.text}" — Ellen G. White, ${selectedBook.title}, p. ${p.page}, par. ${p.paragraphNumber} (${p.reference})`;
    navigator.clipboard?.writeText(quote);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast({
      title: 'Citation Copied',
      description: `${selectedBook.shortTitle} (${p.reference}) copied to clipboard`,
      type: 'info',
    });
  };

  const copyAllSelected = () => {
    if (selectedParagraphsList.length === 0) return;
    const text = selectedParagraphsList
      .map((p) => `"${p.text}"\n— Ellen G. White, ${selectedBook.title} (${p.reference})`)
      .join('\n\n');
    navigator.clipboard?.writeText(text);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
    showToast({
      title: 'Selection Copied',
      description: `${selectedParagraphsList.length} paragraphs copied to clipboard`,
      type: 'info',
    });
  };

  const handleBeamSelected = () => {
    if (selectedParagraphsList.length === 0) return;
    if (onBeamMultipleParagraphs) {
      onBeamMultipleParagraphs(selectedParagraphsList, selectedBook.title);
    } else {
      onBeamParagraph(selectedParagraphsList[0]);
    }
  };

  // Helper to render text with clickable Scripture references
  const renderParagraphWithScriptureLinks = (p: EgwParagraph) => {
    if (!p.scriptureReferences || p.scriptureReferences.length === 0) {
      return <span>{p.text}</span>;
    }

    return (
      <>
        <span>{p.text}</span>
        <div className="mt-3 flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-amber-500" />
            Scripture References:
          </span>
          {p.scriptureReferences.map((ref, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onOpenScripture(ref);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition group"
              title={`Read ${ref} in multi-translation modal (Esc to close)`}
            >
              <span>{ref}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] min-h-[600px] relative">
      {/* Left Column: EGW Books Catalog */}
      <aside className="lg:col-span-4 xl:col-span-3 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Book Selector Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              <Scroll className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Spirit of Prophecy
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ellen G. White Writings
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference (e.g. MOH 17) or text..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Books List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {EGW_BOOKS.map((book) => {
            const isSelected = book.code === selectedBookCode;
            return (
              <button
                key={book.code}
                onClick={() => setSelectedBookCode(book.code)}
                className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span
                  className={`w-9 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {book.code}
                </span>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isSelected
                        ? 'text-amber-900 dark:text-amber-300'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {book.publicationYear} • {book.totalChapters} Chapters
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Column: EGW Reader & Multi-Select Casting */}
      <main className="lg:col-span-8 xl:col-span-9 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden relative">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedBook.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold font-mono">
                  {selectedBook.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click paragraphs to multi-select (Shift + click or Shift + ↑/↓ to range-select)
              </p>
            </div>
          </div>

          <div className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {filteredParagraphs.length} paragraphs
          </div>
        </header>

        {/* FLOATING MULTI-SELECT ACTION BAR */}
        {selectedParagraphIds.length > 0 && (
          <div className="px-6 py-2.5 bg-amber-500 text-white shadow-md flex items-center justify-between gap-3 text-xs animate-fade-in sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {selectedParagraphsList.length === 1
                  ? selectedParagraphsList[0].reference
                  : `${selectedParagraphsList[0].reference} – ${selectedParagraphsList[selectedParagraphsList.length - 1].reference} (${selectedParagraphsList.length} paragraphs)`}
              </span>
              <span className="opacity-80 font-mono">[{selectedBook.shortTitle}]</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAllSelected}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1 transition"
                title="Copy selected texts"
              >
                {copiedId === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>

              <button
                id="beam-selected-egw-btn"
                onClick={handleBeamSelected}
                className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 hover:bg-amber-50 font-bold shadow-xs flex items-center gap-1.5 transition active:scale-98"
                title="Beam selected paragraphs into presentation slides"
              >
                <Cast className="w-4 h-4 text-amber-600" />
                <span>Beam Paragraphs ({selectedParagraphsList.length})</span>
              </button>

              <button
                onClick={() => setSelectedParagraphIds([])}
                className="p-1 hover:bg-amber-600 rounded-md transition"
                title="Clear selection (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Paragraphs Reader */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {filteredParagraphs.map((p) => {
              const isFav = isItemFavorited('egw_paragraph', p.reference);
              const isSelected = selectedParagraphIds.includes(p.id);

              return (
                <article
                  key={p.id}
                  onClick={(e) => handleParagraphClick(p.id, e)}
                  className={`p-5 sm:p-6 rounded-2xl cursor-pointer transition-all border group ${
                    isSelected
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/40'
                      : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Paragraph Header with Official Citation */}
                  <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono font-bold text-xs">
                        {p.reference}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                        Chapter {p.chapterNumber}: {p.chapterTitle}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <button
                        onClick={() => copyCitation(p)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs transition"
                        title="Copy official citation"
                      >
                        {copiedId === p.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleFavoriteParagraph(p)}
                        className={`p-1.5 rounded-lg text-xs transition ${
                          isFav
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Save to Favorites"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onBeamParagraph(p)}
                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs transition"
                        title="Beam this quotation to projector"
                      >
                        <Cast className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Paragraph Text with clickable Scripture references */}
                  <div
                    className="font-serif text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 select-text"
                    style={{
                      fontSize: readerFontSizePx ? `${readerFontSizePx}px` : undefined,
                      lineHeight: readerLineHeight ? `${readerLineHeight}` : undefined,
                    }}
                  >
                    {renderParagraphWithScriptureLinks(p)}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
