import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquarePlus,
  Check,
  Trash2,
  Download,
  Copy,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Hymn, HymnFeedbackItem } from '../types';
import {
  getFeedbackForHymn,
  saveHymnFeedback,
  deleteHymnFeedback,
  getAllHymnFeedback,
} from '../lib/storage';
import { showToast } from '../lib/toast';

interface HymnFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  hymn: Hymn | null;
}

export const HymnFeedbackModal: React.FC<HymnFeedbackModalProps> = ({
  isOpen,
  onClose,
  hymn,
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [category, setCategory] = useState<HymnFeedbackItem['category']>('typo');
  const [stanzaReference, setStanzaReference] = useState<string>('Entire Hymn');
  const [comment, setComment] = useState<string>('');
  const [testerName, setTesterName] = useState<string>('');
  const [feedbackList, setFeedbackList] = useState<HymnFeedbackItem[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (hymn && isOpen) {
      setFeedbackList(getFeedbackForHymn(hymn.id));
      setComment('');
      setCategory('typo');
      setStanzaReference('Entire Hymn');
      setActiveTab('new');
    }
  }, [hymn?.id, isOpen]);

  if (!isOpen || !hymn) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast({ title: 'Please provide feedback details', type: 'info' });
      return;
    }

    saveHymnFeedback({
      hymnId: hymn.id,
      hymnNumber: hymn.number,
      collection: hymn.collection,
      title: hymn.title,
      category,
      stanzaReference,
      comment: comment.trim(),
      testerName: testerName.trim() || undefined,
    });

    showToast({
      title: `Feedback submitted for Hymn #${hymn.number}`,
      description: 'Your testing feedback has been saved locally.',
      type: 'success',
    });

    setComment('');
    setFeedbackList(getFeedbackForHymn(hymn.id));
    setActiveTab('history');
  };

  const handleDelete = (id: string) => {
    deleteHymnFeedback(id);
    setFeedbackList(getFeedbackForHymn(hymn.id));
    showToast({ title: 'Feedback report deleted', type: 'info' });
  };

  const handleCopyAllReports = () => {
    const all = getAllHymnFeedback();
    if (all.length === 0) {
      showToast({ title: 'No feedback reports recorded yet', type: 'info' });
      return;
    }
    const formatted = all
      .map(
        (f) =>
          `[${new Date(f.createdAt).toISOString()}] [${f.collection} #${f.hymnNumber} "${f.title}"] (${f.category.toUpperCase()} - ${f.stanzaReference || 'General'})\nTester: ${f.testerName || 'Anonymous'}\nComment: ${f.comment}\n---`
      )
      .join('\n\n');

    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedAll(true);
      showToast({ title: 'All test reports copied to clipboard', type: 'success' });
      setTimeout(() => setCopiedAll(false), 2500);
    });
  };

  const categoryLabels: Record<HymnFeedbackItem['category'], string> = {
    typo: '📝 Typo / Spelling Error',
    missing_stanza: '📜 Missing or Extra Stanza',
    refrain_issue: '🔁 Refrain / Chorus Wording',
    tune_meter: '🎵 Tune Name or Meter Issue',
    key_pitch: '🎹 Key Signature / Audio Pitch',
    translation: '🌍 Translation / Cross-reference',
    general: '💡 Other Suggestion',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Provide Feedback
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  {hymn.collection} #{hymn.number}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                Report issues or suggest improvements for “{hymn.title}”
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Provide Feedback</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Recorded Feedback ({feedbackList.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category of Issue / Suggestion
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Stanza / Location Affected
                </label>
                <select
                  value={stanzaReference}
                  onChange={(e) => setStanzaReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="Entire Hymn">Entire Hymn / Title / Metadata</option>
                  {hymn.stanzas.map((st) => (
                    <option
                      key={st.number}
                      value={st.type === 'refrain' || st.type === 'chorus' ? 'Refrain' : `Stanza ${st.number}`}
                    >
                      {st.type === 'refrain' || st.type === 'chorus' ? 'Refrain / Chorus' : `Stanza ${st.number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Notes & Correction
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the error, typo, or correction needed... (e.g. Line 2 has misspelled word, verse 3 is missing, tune should be..., pitch sounds sharp, etc.)"
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tester Name or Email (Optional)
                </label>
                <input
                  type="text"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  placeholder="e.g. Bro. David, Chorister"
                  className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {feedbackList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  No feedback recorded yet for Hymn #{hymn.number}.
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {categoryLabels[item.category] || item.category} · {item.stanzaReference || 'General'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                            title="Delete this note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {item.comment}
                      </p>
                      {item.testerName && (
                        <span className="text-[10px] text-slate-400">
                          Reported by: {item.testerName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopyAllReports}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Copy all feedback reports across the entire hymnal to clipboard"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy All App Reports</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition"
                >
                  + Add Another Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
