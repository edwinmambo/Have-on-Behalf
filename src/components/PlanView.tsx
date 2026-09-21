import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Play,
  Trash2,
  Edit2,
  Cast,
  Music,
  ArrowUp,
  ArrowDown,
  Volume2,
  Check,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen,
  Info,
} from 'lucide-react';
import { WorshipPlanSession, WorshipPlanItem, Hymn, BeamSlide } from '../types';
import { useHymnCatalog } from '../lib/hymnLibrary';
import { playPianoPitchTone, transposeKeyName } from '../lib/audioPiano';
import { buildHymnBeamSlides } from '../lib/beamSlidesHelper';

interface PlanViewProps {
  plans: WorshipPlanSession[];
  onSavePlan: (session: WorshipPlanSession) => void;
  onDeletePlan: (id: string) => void;
  onBeamSession: (session: WorshipPlanSession, allSlides: BeamSlide[]) => void;
  splitStanzasOnBeam: boolean;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plans,
  onSavePlan,
  onDeletePlan,
  onBeamSession,
  splitStanzasOnBeam,
}) => {
  const { hymns: allHymns } = useHymnCatalog();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isAddingHymn, setIsAddingHymn] = useState(false);
  const [hymnSearch, setHymnSearch] = useState('');
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);

  // New session modal / form
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLeader, setNewLeader] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleCreateNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSession: WorshipPlanSession = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      date: newDate,
      leaderName: newLeader.trim() || 'Chorister Ministry',
      description: 'Congregational worship service and song sequence.',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSavePlan(newSession);
    setSelectedPlanId(newSession.id);
    setIsCreatingNew(false);
    setNewTitle('');
    setNewLeader('');
  };

  const handleAddHymnToPlan = (hymn: Hymn) => {
    if (!currentPlan) return;

    const newItem: WorshipPlanItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      hymnId: hymn.id,
      collection: hymn.collection,
      number: hymn.number,
      title: hymn.title,
      key: hymn.key,
      transposedKey: hymn.key,
      transposeSemiTones: 0,
      notes: '',
    };

    const updatedSession: WorshipPlanSession = {
      ...currentPlan,
      items: [...currentPlan.items, newItem],
    };

    onSavePlan(updatedSession);
    setIsAddingHymn(false);
    setHymnSearch('');
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentPlan) return;
    const updatedItems = currentPlan.items.filter((i) => i.id !== itemId);
    onSavePlan({ ...currentPlan, items: updatedItems });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (!currentPlan) return;
    const newItems = [...currentPlan.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    onSavePlan({ ...currentPlan, items: newItems });
  };

  const handleTransposeItem = (itemId: string, deltaSemiTones: number) => {
    if (!currentPlan) return;
    const updatedItems = currentPlan.items.map((item) => {
      if (item.id === itemId) {
        const nextSemi = (item.transposeSemiTones || 0) + deltaSemiTones;
        const newTransposedKey = transposeKeyName(item.key, nextSemi);
        return {
          ...item,
          transposeSemiTones: nextSemi,
          transposedKey: newTransposedKey,
        };
      }
      return item;
    });

    onSavePlan({ ...currentPlan, items: updatedItems });
  };

  const handlePlayItemPitch = async (item: WorshipPlanItem) => {
    setPlayingItemId(item.id);
    await playPianoPitchTone(item.key, item.transposeSemiTones || 0, 2.5);
    setPlayingItemId(null);
  };

  // Compile entire session into seamless back-to-back beam slides
  const handleLaunchSessionBeam = () => {
    if (!currentPlan || currentPlan.items.length === 0) return;

    const allSessionSlides: BeamSlide[] = [];
    const totalHymns = currentPlan.items.length;

    currentPlan.items.forEach((item, itemIdx) => {
      const hymn = allHymns.find((h) => h.id === item.hymnId);
      if (!hymn) return;

      const hymnSlides = buildHymnBeamSlides(hymn, {
        includeIntro: true,
        splitLongStanzas: splitStanzasOnBeam,
        stanzasToInclude: item.stanzasToSing,
        hymnIndexInSession: itemIdx,
        totalHymnsInSession: totalHymns,
      });

      // Update slide metadata with transposed key if present
      if (item.transposedKey && (item.transposeSemiTones ?? 0) !== 0) {
        const st = item.transposeSemiTones ?? 0;
        hymnSlides.forEach((s) => {
          if (s.isIntro && s.introDetails) {
            s.introDetails.key = `${item.transposedKey} (Transposed ${st > 0 ? '+' : ''}${st})`;
          }
        });
      }

      allSessionSlides.push(...hymnSlides);
    });

    if (allSessionSlides.length > 0) {
      onBeamSession(currentPlan, allSessionSlides);
    }
  };

  // Hymn search filtering for adding to session
  const filteredSearchHymns = hymnSearch.trim()
    ? allHymns.filter((h) => {
        const q = hymnSearch.toLowerCase().trim();
        return (
          h.number.toString().includes(q) ||
          h.title.toLowerCase().includes(q) ||
          h.collection.toLowerCase().includes(q)
        );
      }).slice(0, 10)
    : allHymns.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Worship Session Planner
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
              Chorister Mode
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pre-plan song sequences for Friday Vespers, Divine Service, or Song Services and beam all lyrics back-to-back with custom keys and dual progress tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>New Session</span>
          </button>

          {currentPlan && currentPlan.items.length > 0 && (
            <button
              onClick={handleLaunchSessionBeam}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-98"
              title="Beam entire session lyrics back-to-back on projector"
            >
              <Cast className="w-4 h-4" />
              <span>Beam Full Session ({currentPlan.items.length} Hymns)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Sessions Sidebar, Right Active Session Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Saved Sessions */}
        <aside className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Saved Worship Sessions
          </h2>

          <div className="space-y-1.5">
            {plans.map((p) => {
              const isSelected = p.id === selectedPlanId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 ring-1 ring-amber-400/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <h3
                      className={`text-xs font-bold truncate ${
                        isSelected
                          ? 'text-amber-900 dark:text-amber-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{p.date}</span>
                      <span>•</span>
                      <span>{p.items.length} hymns</span>
                    </div>
                  </div>

                  {plans.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlan(p.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg text-xs"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Active Plan Details & Hymn Sequence */}
        <main className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          {currentPlan ? (
            <>
              {/* Session Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {currentPlan.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Date: {currentPlan.date}</span>
                    <span>•</span>
                    <span>Leader: {currentPlan.leaderName || 'Song Leader'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingHymn(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Hymn</span>
                  </button>
                </div>
              </div>

              {/* Hymn Sequence List */}
              {currentPlan.items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Music className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No hymns in this session yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Add hymns from the SDAH, Nyimbo Za Kristo, or Nyĩmbo Cia Agendi to curate your congregation song service.
                  </p>
                  <button
                    onClick={() => setIsAddingHymn(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:bg-amber-600 transition"
                  >
                    Choose First Hymn
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentPlan.items.map((item, idx) => {
                    const isPlaying = playingItemId === item.id;
                    const effectiveKey = item.transposedKey || item.key || 'D Major';

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-amber-400/50"
                      >
                        {/* Order & Hymn Info */}
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                                {item.collection} #{item.number}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span>
                                Key:{' '}
                                <strong className="text-amber-600 dark:text-amber-400">
                                  {effectiveKey}
                                </strong>
                                {item.transposeSemiTones !== 0 && (
                                  <span className="ml-1 text-[10px] text-amber-500 font-mono">
                                    ({item.transposeSemiTones! > 0 ? '+' : ''}
                                    {item.transposeSemiTones} st)
                                  </span>
                                )}
                              </span>
                              {item.notes && <span className="italic">“{item.notes}”</span>}
                            </div>
                          </div>
                        </div>

                        {/* Transpose & Pitch Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Transpose Controls */}
                          <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-0.5 text-xs font-mono">
                            <button
                              onClick={() => handleTransposeItem(item.id, -1)}
                              className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                              title="Transpose down 1 semitone"
                            >
                              -1
                            </button>
                            <span className="px-1.5 font-bold text-slate-700 dark:text-slate-200">
                              {effectiveKey.split(' ')[0]}
                            </span>
                            <button
                              onClick={() => handleTransposeItem(item.id, 1)}
                              className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                              title="Transpose up 1 semitone"
                            >
                              +1
                            </button>
                          </div>

                          {/* Play Transposed Piano Pitch Tone */}
                          <button
                            onClick={() => handlePlayItemPitch(item)}
                            className={`p-2 rounded-xl border text-xs transition flex items-center gap-1 ${
                              isPlaying
                                ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                            }`}
                            title={`Play piano tone for ${effectiveKey}`}
                          >
                            <Volume2 className="w-4 h-4 text-amber-500" />
                            <span className="hidden md:inline font-semibold">Pitch</span>
                          </button>

                          {/* Reordering */}
                          <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-2">
                            <button
                              onClick={() => handleMoveItem(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                              title="Move hymn earlier"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveItem(idx, 'down')}
                              disabled={idx === currentPlan.items.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                              title="Move hymn later"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 ml-1"
                              title="Remove from session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select or create a worship plan to get started.
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD HYMN TO SESSION */}
      {isAddingHymn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Hymn to {currentPlan?.title}
              </h3>
              <button
                onClick={() => setIsAddingHymn(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search hymn number, title or lyrics (SDAH, NZK, NCA)..."
                value={hymnSearch}
                onChange={(e) => setHymnSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSearchHymns.map((hymn) => (
                <button
                  key={hymn.id}
                  onClick={() => handleAddHymnToPlan(hymn)}
                  className="w-full p-3 text-left hover:bg-amber-50/60 dark:hover:bg-slate-800 flex items-center justify-between gap-3 transition rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                      #{hymn.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {hymn.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {hymn.collection} • Key of {hymn.key || 'C'}
                      </p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW SESSION */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateNewSession}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Worship Session
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Friday Vespers — 'Walking with Jesus'"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chorister / Leader
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bro. David"
                  value={newLeader}
                  onChange={(e) => setNewLeader(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs"
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
