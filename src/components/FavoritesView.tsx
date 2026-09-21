import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Trash2,
  Cast,
  ExternalLink,
  Music,
  BookOpen,
  Scroll,
  Download,
  Share2,
} from 'lucide-react';
import { FavoriteItem, FavoriteType } from '../types';
import { getFavorites, removeFavorite } from '../lib/storage';

interface FavoritesViewProps {
  onOpenScripture: (ref: string) => void;
  onBeamItem: (title: string, reference: string, text: string) => void;
  onNavigateHymn?: (collection: string, number: number) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onOpenScripture,
  onBeamItem,
  onNavigateHymn,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filterType, setFilterType] = useState<FavoriteType | 'ALL'>('ALL');

  const loadFavs = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    loadFavs();
  }, []);

  const handleRemove = (id: string) => {
    removeFavorite(id);
    loadFavs();
  };

  const filtered = favorites.filter((f) => {
    if (filterType === 'ALL') return true;
    return f.type === filterType;
  });

  const exportFavoritesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(favorites, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `berean_favorites_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Saved Favorites & Bookmarks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Offline local persistence for worship songs, scripture verses, and Ellen White quotations
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={exportFavoritesJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(
          [
            { id: 'ALL', label: `All Items (${favorites.length})` },
            {
              id: 'hymn',
              label: `Hymns (${favorites.filter((f) => f.type === 'hymn').length})`,
            },
            {
              id: 'verse',
              label: `Scriptures (${favorites.filter((f) => f.type === 'verse').length})`,
            },
            {
              id: 'egw_paragraph',
              label: `EGW Quotations (${favorites.filter((f) => f.type === 'egw_paragraph').length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
              filterType === tab.id
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Favorites List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No saved favorites yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Tap the bookmark icon on any hymn, Bible verse, or Spirit of Prophecy paragraph to save it for offline study.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const icon =
              item.type === 'hymn' ? (
                <Music className="w-4 h-4 text-amber-500" />
              ) : item.type === 'verse' ? (
                <BookOpen className="w-4 h-4 text-emerald-500" />
              ) : (
                <Scroll className="w-4 h-4 text-indigo-500" />
              );

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-amber-400/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          {item.reference}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Remove favorite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-serif text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mt-2">
                    “{item.snippet}”
                  </p>
                </div>

                {/* Card Action footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.type === 'verse' && (
                      <button
                        onClick={() => onOpenScripture(item.reference.split('[')[0].trim())}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Read</span>
                      </button>
                    )}

                    <button
                      onClick={() => onBeamItem(item.title, item.reference, item.snippet)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-1 text-[11px] shadow-xs"
                      title="Beam this text to church projector"
                    >
                      <Cast className="w-3 h-3" />
                      <span>Beam</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
