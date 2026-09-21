import React, { useEffect, useState } from 'react';
import { X, Cast, Bookmark, Check, BookOpen, Globe } from 'lucide-react';
import { BibleVersionId } from '../types';
import { BIBLE_TEXTS_STORE, BIBLE_VERSIONS } from '../data/biblesData';
import { isItemFavorited, saveFavorite } from '../lib/storage';

interface ScriptureModalProps {
  reference: string; // e.g. "John 3:16", "Matthew 11:28", "John 14:1-3"
  isOpen: boolean;
  onClose: () => void;
  onBeamVerse?: (reference: string, text: string, version: string) => void;
  redLetterEnabled?: boolean;
}

export const ScriptureModal: React.FC<ScriptureModalProps> = ({
  reference,
  isOpen,
  onClose,
  onBeamVerse,
  redLetterEnabled = true,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<BibleVersionId>('KJV');
  const [isSaved, setIsSaved] = useState(false);

  // Parse reference to find matching verses in store
  // e.g. "John 3:16" -> book: "John", chapter: 3, verse: 16
  const parseRef = (refStr: string) => {
    const clean = refStr.trim();
    // Matches like "John 14:1", "John 14:1-3", "Matthew 11:28", "Psalm 23:1"
    const match = clean.match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);
    if (!match) return { book: clean, chapter: 1, verseStart: 1, verseEnd: 1 };
    return {
      book: match[1].trim(),
      chapter: parseInt(match[2], 10),
      verseStart: match[3] ? parseInt(match[3], 10) : undefined,
      verseEnd: match[4] ? parseInt(match[4], 10) : undefined,
    };
  };

  const parsed = parseRef(reference);
  const chapterKey = `${parsed.book} ${parsed.chapter}`;

  // Find verses from store
  const versionStore = BIBLE_TEXTS_STORE[selectedVersion] || BIBLE_TEXTS_STORE.KJV;
  const chapterVerses = versionStore[chapterKey] || [];

  // Filter specific verse if requested
  const relevantVerses = parsed.verseStart
    ? chapterVerses.filter((v) => {
        if (parsed.verseEnd) {
          return v.verse >= parsed.verseStart! && v.verse <= parsed.verseEnd!;
        }
        return v.verse === parsed.verseStart;
      })
    : chapterVerses;

  // Fallback if exact chapter isn't in our offline sample store
  const displayVerses = relevantVerses.length > 0 ? relevantVerses : [
    {
      book: parsed.book,
      chapter: parsed.chapter,
      verse: parsed.verseStart || 1,
      text: `“For the word of God is quick, and powerful, and sharper than any twoedged sword...” Scripture passage: ${reference} (${selectedVersion}). Tap 'Full Bible' to browse all chapters.`,
      isRedLetter: false,
    },
  ];

  const fullText = displayVerses.map((v) => `${v.verse}. ${v.text}`).join(' ');

  useEffect(() => {
    setIsSaved(isItemFavorited('verse', reference));
  }, [reference, isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleFavorite = () => {
    saveFavorite({
      type: 'verse',
      title: `${reference} (${selectedVersion})`,
      reference: `${reference} [${selectedVersion}]`,
      snippet: fullText.slice(0, 140),
    });
    setIsSaved(true);
  };

  return (
    <div
      id="scripture-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        id="scripture-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {reference}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {selectedVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clickable Scripture lookup from EGW citation (Esc to close)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                isSaved
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Bookmark this verse"
            >
              {isSaved ? <Check className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {onBeamVerse && (
              <button
                onClick={() => {
                  onBeamVerse(reference, fullText, selectedVersion);
                  onClose();
                }}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition flex items-center gap-1.5"
                title="Beam this verse to church projector"
              >
                <Cast className="w-4 h-4" />
                <span className="hidden sm:inline">Beam</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Translation Switcher Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          <span className="text-slate-500 dark:text-slate-400 mr-1 shrink-0">Version:</span>
          {BIBLE_VERSIONS.map((ver) => (
            <button
              key={ver.id}
              onClick={() => setSelectedVersion(ver.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
                selectedVersion === ver.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {ver.id}
            </button>
          ))}
        </div>

        {/* Verse Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="rounded-xl p-5 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div className="space-y-3 font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200">
              {displayVerses.map((v) => (
                <p key={v.verse} className="flex items-start gap-2.5">
                  <sup className="text-xs font-sans font-bold text-amber-600 dark:text-amber-400 pt-1 shrink-0">
                    {v.verse}
                  </sup>
                  <span
                    className={
                      redLetterEnabled && v.isRedLetter
                        ? 'text-red-700 dark:text-rose-400 font-medium'
                        : ''
                    }
                  >
                    {v.text}
                  </span>
                </p>
              ))}
            </div>
          </div>

          {redLetterEnabled && displayVerses.some((v) => v.isRedLetter) && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-rose-400 italic">
              <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-rose-400 inline-block" />
              Words of Jesus in red
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
          <span>Press <strong>Esc</strong> key to exit</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
