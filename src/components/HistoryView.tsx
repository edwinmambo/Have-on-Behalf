import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Music,
  BookOpen,
  Scroll,
  Trash2,
  Search,
  ArrowRight,
  Clock,
  ExternalLink,
  X,
  Filter,
} from 'lucide-react';
import { getHistory, removeHistoryItem, clearHistory, HistoryItem, HistoryType } from '../lib/historyStorage';
import { showToast } from '../lib/toast';

interface HistoryViewProps {
  onNavigateHymn: (hymnId: string, collection: string) => void;
  onNavigateBible: (bookId: string, chapter: number, version: string) => void;
  onNavigateEgw: (bookCode: string, chapterNumber?: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onNavigateHymn,
  onNavigateBible,
  onNavigateEgw,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => getHistory());
  const [selectedType, setSelectedType] = useState<'all' | HistoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reload history items
  const reloadHistory = () => {
    setHistoryItems(getHistory());
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeHistoryItem(id);
    reloadHistory();
    showToast({ title: 'Removed from history', type: 'info' });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your reading and viewing history?')) {
      clearHistory();
      reloadHistory();
      showToast({ title: 'Reading history cleared', type: 'info' });
    }
  };

  const handleItemClick = (item: HistoryItem) => {
    if (item.type === 'hymn' && item.metadata.hymnId) {
      onNavigateHymn(item.metadata.hymnId, item.metadata.collection || 'SDAH');
    } else if (item.type === 'bible' && item.metadata.bookId && item.metadata.chapter) {
      onNavigateBible(
        item.metadata.bookId,
        item.metadata.chapter,
        item.metadata.version || 'KJV'
      );
    } else if (item.type === 'egw' && item.metadata.bookCode) {
      onNavigateEgw(item.metadata.bookCode, item.metadata.chapterNumber);
    }
  };

  // Helper for human-readable relative time
  const formatTimeAgo = (timestamp: number) => {
    const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsedSeconds < 60) return 'Just now';
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesRef = item.reference.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(q) || false;
        const matchesSnippet = item.snippet?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesRef && !matchesSubtitle && !matchesSnippet) return false;
      }
      return true;
    });
  }, [historyItems, selectedType, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: historyItems.length,
      hymn: historyItems.filter((i) => i.type === 'hymn').length,
      bible: historyItems.filter((i) => i.type === 'bible').length,
      egw: historyItems.filter((i) => i.type === 'egw').length,
    };
  }, [historyItems]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Reading History & Recents
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quickly re-open recently viewed hymns, Bible chapters, and Ellen G. White writings.
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={handleClearAll}
            className="self-start md:self-auto px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            title="Clear all recent browsing history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedType === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/20">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedType('hymn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedType === 'hymn'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Hymns</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/20">
              {counts.hymn}
            </span>
          </button>

          <button
            onClick={() => setSelectedType('bible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedType === 'bible'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bibles</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/20">
              {counts.bible}
            </span>
          </button>

          <button
            onClick={() => setSelectedType('egw')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedType === 'egw'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>E.G. White</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/20">
              {counts.egw}
            </span>
          </button>
        </div>

        {/* Search Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recent history..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* History Items Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? 'No matching history found' : 'No recent reading history yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            {searchQuery
              ? `No recent items match "${searchQuery}". Try a different search term or clear the filter.`
              : 'As you read hymns, browse Bible chapters, and explore E.G. White writings, your recent items will automatically be listed here for quick one-click return.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const isHymn = item.type === 'hymn';
            const isBible = item.type === 'bible';
            const isEgw = item.type === 'egw';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Type Badge & Relative Time */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isHymn
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                          : isBible
                          ? 'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {isHymn && <Music className="w-3 h-3" />}
                      {isBible && <BookOpen className="w-3 h-3" />}
                      {isEgw && <Scroll className="w-3 h-3" />}
                      <span>{item.reference}</span>
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-1">
                    {item.title}
                  </h4>

                  {/* Subtitle / Excerpt */}
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                  {item.snippet && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 italic font-serif leading-relaxed opacity-90">
                      "{item.snippet}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1 group-hover:underline">
                    <span>Open & Read</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>

                  <button
                    onClick={(e) => handleRemove(e, item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
