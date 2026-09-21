import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Music,
  BookOpen,
  Scroll,
  Cast,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { BIBLE_TEXTS_STORE } from '../data/biblesData';
import { EGW_PARAGRAPHS } from '../data/egwData';
import { Hymn, BibleVerse, EgwParagraph, BeamSlide } from '../types';
import { useHymnCatalog } from '../lib/hymnLibrary';

interface SearchResultItem {
  id: string;
  category: 'hymnal' | 'bible' | 'egw';
  title: string;
  subtitle: string;
  snippet: string;
  rawItem: Hymn | BibleVerse | EgwParagraph;
}

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHymn: (hymn: Hymn) => void;
  onSelectScripture: (ref: string) => void;
  onSelectEgw: (paragraph: EgwParagraph) => void;
  onBeamHymn: (hymn: Hymn, slides: BeamSlide[]) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectHymn,
  onSelectScripture,
  onSelectEgw,
  onBeamHymn,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'hymnal' | 'bible' | 'egw'>('ALL');
  const { hymns: allHymns } = useHymnCatalog();

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // 1. Search Hymns
    if (activeCategory === 'ALL' || activeCategory === 'hymnal') {
      allHymns.forEach((h) => {
        const matchesNumber = h.number.toString().includes(q);
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchingStanza = h.stanzas.find((s) =>
          s.lines.some((l) => l.toLowerCase().includes(q))
        );

        if (matchesNumber || matchesTitle || matchingStanza) {
          results.push({
            id: `hymn_${h.id}`,
            category: 'hymnal',
            title: `${h.collection} #${h.number} — ${h.title}`,
            subtitle: `${h.author || 'Sacred Hymn'} • Key of ${h.key || 'G'}`,
            snippet:
              matchingStanza?.lines.slice(0, 2).join(' ') ||
              h.stanzas[0]?.lines.slice(0, 2).join(' ') ||
              '',
            rawItem: h,
          });
        }
      });
    }

    // 2. Search Bible Verses
    if (activeCategory === 'ALL' || activeCategory === 'bible') {
      // Search across KJV, SUV and GIK stores
      const versionsToSearch = ['KJV', 'SUV', 'GIK'] as const;
      versionsToSearch.forEach((ver) => {
        const store = BIBLE_TEXTS_STORE[ver] || {};
        Object.keys(store).forEach((chapterKey) => {
          store[chapterKey].forEach((verse) => {
            const fullRef = `${verse.book} ${verse.chapter}:${verse.verse}`;
            if (
              fullRef.toLowerCase().includes(q) ||
              verse.text.toLowerCase().includes(q)
            ) {
              results.push({
                id: `bible_${ver}_${fullRef}`,
                category: 'bible',
                title: `${fullRef} (${ver})`,
                subtitle: `Holy Bible • ${verse.book}`,
                snippet: verse.text,
                rawItem: verse,
              });
            }
          });
        });
      });
    }

    // 3. Search EGW Writings
    if (activeCategory === 'ALL' || activeCategory === 'egw') {
      EGW_PARAGRAPHS.forEach((p) => {
        const matchesRef = p.reference.toLowerCase().includes(q);
        const matchesText = p.text.toLowerCase().includes(q);
        const matchesChapter = p.chapterTitle.toLowerCase().includes(q);

        if (matchesRef || matchesText || matchesChapter) {
          results.push({
            id: `egw_${p.id}`,
            category: 'egw',
            title: `${p.reference} — ${p.chapterTitle}`,
            subtitle: `Ellen G. White • Page ${p.page}`,
            snippet: p.text.slice(0, 140) + '...',
            rawItem: p,
          });
        }
      });
    }

    return results.slice(0, 30);
  }, [query, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      id="universal-search-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="universal-search-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Field */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick search hymns, Bible text, EGW (e.g. 'sweet hour', 'John 14', 'MOH 17')..."
            className="w-full text-sm sm:text-base bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 mr-1 shrink-0">Filter:</span>
          {(
            [
              { id: 'ALL', label: 'All Library' },
              { id: 'hymnal', label: 'Hymnals (SDAH/NZK/NCA)' },
              { id: 'bible', label: 'Bible Verses' },
              { id: 'egw', label: 'E.G. White' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-60" />
              Type at least 2 characters to search across SDAH, NZK, NCA, multi-version Bibles, and Spirit of Prophecy paragraphs.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found for “{query}”.
            </div>
          ) : (
            searchResults.map((item) => {
              const icon =
                item.category === 'hymnal' ? (
                  <Music className="w-4 h-4 text-amber-500" />
                ) : item.category === 'bible' ? (
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Scroll className="w-4 h-4 text-indigo-500" />
                );

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.category === 'hymnal') {
                      onSelectHymn(item.rawItem as Hymn);
                    } else if (item.category === 'bible') {
                      const v = item.rawItem as BibleVerse;
                      onSelectScripture(`${v.book} ${v.chapter}:${v.verse}`);
                    } else if (item.category === 'egw') {
                      onSelectEgw(item.rawItem as EgwParagraph);
                    }
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 font-serif">
                        {item.snippet}
                      </p>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 pt-1">
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
