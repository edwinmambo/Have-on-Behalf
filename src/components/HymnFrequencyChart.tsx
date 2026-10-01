import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Music,
  Calendar,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  Flame,
} from 'lucide-react';
import {
  HymnFrequencyPoint,
  HymnMonthlyTrendPoint,
  MonthlyAggregateTimelinePoint,
  LiturgicalSeason,
  getHymnFrequencyData,
  getHymnMonthlyTrendsData,
  getMonthlyTimelineData,
} from '../lib/historyStorage';

interface HymnFrequencyChartProps {
  onNavigateHymn: (hymnId: string, collection: string) => void;
  isDarkMode?: boolean;
}

// Liturgical collection color theme
const COLLECTION_COLORS: Record<string, { fill: string; darkFill: string; label: string }> = {
  SDAH: { fill: '#d97706', darkFill: '#f59e0b', label: 'SDAH (English)' }, // Amber
  NZK: { fill: '#059669', darkFill: '#10b981', label: 'NZK (Swahili)' }, // Emerald
  NCA: { fill: '#4f46e5', darkFill: '#6366f1', label: 'NCA (Gĩkũyũ)' }, // Indigo
  DEFAULT: { fill: '#ca8a04', darkFill: '#eab308', label: 'Other Hymnal' },
};

// Liturgical season tags configuration
const SEASON_CONFIG: Record<
  LiturgicalSeason,
  { label: string; icon: string; color: string; darkColor: string }
> = {
  'Easter / Cross': { label: 'Easter & Cross', icon: '✝️', color: '#b91c1c', darkColor: '#f87171' },
  Communion: { label: 'Communion & Footwashing', icon: '🍷', color: '#7c3aed', darkColor: '#a78bfa' },
  'Camp Meeting': { label: 'Camp Meeting Revival', icon: '⛺', color: '#047857', darkColor: '#34d399' },
  'Thanksgiving & Harvest': { label: 'Harvest & Ingathering', icon: '🌾', color: '#c2410c', darkColor: '#fb923c' },
  'Sabbath Praise': { label: 'Sabbath Sacred Hours', icon: '🕊️', color: '#b45309', darkColor: '#fbbf24' },
  'Advent & Hope': { label: 'Advent & Blessed Hope', icon: '⭐', color: '#1d4ed8', darkColor: '#60a5fa' },
  General: { label: 'General Liturgy', icon: '📖', color: '#475569', darkColor: '#94a3b8' },
};

export const HymnFrequencyChart: React.FC<HymnFrequencyChartProps> = ({
  onNavigateHymn,
  isDarkMode = false,
}) => {
  // Primary View Mode: 'frequency' (Volume / Most Sung) vs 'trends' (Monthly Growth vs Decline)
  const [chartMode, setChartMode] = useState<'frequency' | 'trends'>('trends');

  // Frequency timeframe filter
  const [timeframe, setTimeframe] = useState<'all' | '30days' | '7days'>('all');

  // Trends sub-view: 'growth-decline' (Diverging bar chart) vs 'timeline' (6-month aggregate trajectory)
  const [trendsSubView, setTrendsSubView] = useState<'growth-decline' | 'timeline'>('growth-decline');

  // Liturgical season filter for trends
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 1. Data for Frequency View
  const frequencyData: HymnFrequencyPoint[] = useMemo(() => {
    return getHymnFrequencyData(timeframe);
  }, [timeframe]);

  // 2. Data for Trends View (Growth vs Decline)
  const allTrendsData: HymnMonthlyTrendPoint[] = useMemo(() => {
    return getHymnMonthlyTrendsData();
  }, []);

  const filteredTrendsData = useMemo(() => {
    if (selectedSeason === 'all') return allTrendsData;
    return allTrendsData.filter((item) => item.seasonTag === selectedSeason);
  }, [allTrendsData, selectedSeason]);

  // 3. Data for Monthly Timeline View
  const timelineData: MonthlyAggregateTimelinePoint[] = useMemo(() => {
    return getMonthlyTimelineData();
  }, []);

  // Summary Metrics
  const totalViewsInTimeframe = useMemo(() => {
    return frequencyData.reduce((sum, item) => sum + item.count, 0);
  }, [frequencyData]);

  const topHymn = frequencyData[0] || null;

  const topGrowingHymn = useMemo(() => {
    const sorted = [...allTrendsData].sort((a, b) => b.growthDelta - a.growthDelta);
    return sorted[0] || null;
  }, [allTrendsData]);

  const topDecliningHymn = useMemo(() => {
    const sorted = [...allTrendsData].sort((a, b) => a.growthDelta - b.growthDelta);
    return sorted[0]?.growthDelta < 0 ? sorted[0] : null;
  }, [allTrendsData]);

  const netMonthlyMomentum = useMemo(() => {
    return allTrendsData.reduce((acc, curr) => acc + curr.growthDelta, 0);
  }, [allTrendsData]);

  const handleBarClick = (hymnId: string, collection: string) => {
    if (hymnId) {
      onNavigateHymn(hymnId, collection || 'SDAH');
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5 transition-all">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            {chartMode === 'trends' ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <BarChart3 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {chartMode === 'trends'
                  ? 'Liturgical Hymn Trends & Seasonal Momentum'
                  : 'Hymn Singing & Viewing Frequency'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {chartMode === 'trends'
                ? 'Visualizing monthly usage growth vs decline across seasons (Easter, Camp Meeting, Communion, Harvest).'
                : 'Tracking your most frequently viewed, sung, and projected sanctuary songs over time.'}
            </p>
          </div>
        </div>

        {/* Primary View Toggle: Frequency vs Trends */}
        <div className="flex items-center gap-1.5 self-start lg:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setChartMode('frequency')}
            className={`flex-1 sm:flex-initial min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              chartMode === 'frequency'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Most Sung</span>
          </button>

          <button
            onClick={() => setChartMode('trends')}
            className={`flex-1 sm:flex-initial min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              chartMode === 'trends'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Monthly Trends</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              Growth vs Decline
            </span>
          </button>
        </div>
      </div>

      {/* Sub-controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        {chartMode === 'frequency' ? (
          /* Timeframe buttons for Frequency */
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold self-start">
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] ${
                timeframe === '7days'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] ${
                timeframe === '30days'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] ${
                timeframe === 'all'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        ) : (
          /* Sub-views and Season filter for Trends */
          <div className="flex flex-wrap items-center gap-2 w-full justify-between">
            {/* Trends sub-view segmented control */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTrendsSubView('growth-decline')}
                className={`px-3 py-1.5 rounded-lg transition min-h-[36px] flex items-center gap-1.5 ${
                  trendsSubView === 'growth-decline'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Hymn Growth vs Decline (Δ)</span>
              </button>
              <button
                onClick={() => setTrendsSubView('timeline')}
                className={`px-3 py-1.5 rounded-lg transition min-h-[36px] flex items-center gap-1.5 ${
                  trendsSubView === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>6-Month Liturgical Trajectory</span>
              </button>
            </div>

            {/* Liturgical Season Dropdown Filter */}
            {trendsSubView === 'growth-decline' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  Season Filter:
                </span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[36px] text-xs cursor-pointer"
                >
                  <option value="all">All Seasons & Liturgies</option>
                  <option value="Easter / Cross">✝️ Easter & Passion</option>
                  <option value="Communion">🍷 Communion & Footwashing</option>
                  <option value="Camp Meeting">⛺ Camp Meeting & Revival</option>
                  <option value="Thanksgiving & Harvest">🌾 Harvest & Gratitude</option>
                  <option value="Sabbath Praise">🕊️ Sabbath Sacred Hours</option>
                  <option value="Advent & Hope">⭐ Advent & Second Coming</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Insight Strip */}
      {chartMode === 'trends' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Top Surging Hymn
            </span>
            <div className="mt-1">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {topGrowingHymn?.title || 'None'}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 text-[11px]">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span>+{topGrowingHymn?.growthDelta || 0} plays this month</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15">
                  +{topGrowingHymn?.growthPercentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Seasonal Shift / Decline
            </span>
            <div className="mt-1">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {topDecliningHymn ? topDecliningHymn.title : 'Stable Circulation'}
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold mt-0.5 text-[11px]">
                {topDecliningHymn ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                    <span>{topDecliningHymn.growthDelta} plays post-season</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/15">
                      {topDecliningHymn.growthPercentage}%
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">No significant dips</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Congregational Momentum
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${netMonthlyMomentum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {netMonthlyMomentum >= 0 ? `+${netMonthlyMomentum}` : netMonthlyMomentum}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                net monthly change
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Liturgical Focus
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {topGrowingHymn ? topGrowingHymn.seasonTag : 'Camp Meeting & Revival'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Frequency View KPIs */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Total Hymn Views / Sings
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                {totalViewsInTimeframe}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Top Ranked Hymn
              </span>
              {topHymn ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {topHymn.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                    {topHymn.shortLabel}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">None yet</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Active Collections
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block">
                SDAH (English) · NZK (Swahili) · NCA (Gĩkũyũ)
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Recharts Area */}
      <div className="w-full">
        {chartMode === 'trends' ? (
          trendsSubView === 'growth-decline' ? (
            /* Diverging Bar Chart: Monthly Usage Growth vs Decline */
            filteredTrendsData.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Usage Growth (+) vs Decline (-) per Hymn
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                      Growing
                    </span>
                    <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                      Declining
                    </span>
                  </div>
                </div>

                <div className="w-full h-72 sm:h-80 md:h-84">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredTrendsData}
                      margin={{ top: 20, right: 15, left: -10, bottom: 35 }}
                      onClick={(state: any) => {
                        if (state && state.activePayload && state.activePayload.length > 0) {
                          const item = state.activePayload[0].payload as HymnMonthlyTrendPoint;
                          handleBarClick(item.hymnId, item.collection);
                        }
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                      />
                      <ReferenceLine y={0} stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeWidth={1.5} />
                      <XAxis
                        dataKey="shortLabel"
                        tickLine={false}
                        axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
                        tick={{
                          fontSize: 10,
                          fill: isDarkMode ? '#94a3b8' : '#64748b',
                          fontWeight: 600,
                        }}
                        dy={8}
                        interval={0}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: isDarkMode ? '#94a3b8' : '#64748b',
                        }}
                        dx={-4}
                      />
                      <Tooltip
                        cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload as HymnMonthlyTrendPoint;
                            const isPositive = data.growthDelta >= 0;
                            return (
                              <div className="p-3 bg-slate-900/95 dark:bg-black/95 text-white rounded-xl shadow-xl border border-white/10 text-xs space-y-2 backdrop-blur-md max-w-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10">
                                    {data.reference}
                                  </span>
                                  <span className="text-[10px] font-semibold text-amber-400">
                                    {data.seasonTag}
                                  </span>
                                </div>
                                <p className="font-bold text-white text-sm leading-tight">{data.title}</p>

                                <div className="space-y-1 pt-1.5 border-t border-white/10 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-300">This Month:</span>
                                    <span className="font-bold font-mono">{data.currentMonthCount} plays</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-300">Prior Month:</span>
                                    <span className="font-bold font-mono">{data.previousMonthCount} plays</span>
                                  </div>
                                  <div className="flex items-center justify-between pt-1 border-t border-white/10 font-bold">
                                    <span className="text-slate-300">Net Growth:</span>
                                    <span className={`font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {isPositive ? `+${data.growthDelta}` : data.growthDelta} ({isPositive ? `+${data.growthPercentage}` : `${data.growthPercentage}`}%)
                                    </span>
                                  </div>
                                </div>

                                <p className="text-[10px] text-amber-300/80 italic pt-0.5 flex items-center gap-1">
                                  <span>Tap bar to view lyrics</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="growthDelta"
                        radius={[4, 4, 4, 4]}
                        animationDuration={800}
                        className="cursor-pointer"
                      >
                        {filteredTrendsData.map((entry, index) => {
                          const isPositive = entry.growthDelta >= 0;
                          const fill = isPositive
                            ? (isDarkMode ? '#34d399' : '#10b981')
                            : (isDarkMode ? '#fb7171' : '#f43f5e');
                          const isHovered = hoveredBarIndex === index;
                          return (
                            <Cell
                              key={`cell-trend-${entry.hymnId}-${index}`}
                              fill={fill}
                              opacity={hoveredBarIndex === null || isHovered ? 1 : 0.65}
                              onMouseEnter={() => setHoveredBarIndex(index)}
                              onMouseLeave={() => setHoveredBarIndex(null)}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                <Music className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No Trends Recorded for {selectedSeason}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try switching the season filter to "All Seasons" to view overall growth and decline momentum.
                </p>
              </div>
            )
          ) : (
            /* 6-Month Liturgical Trajectory Bar Chart */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  6-Month Aggregate Singing Volume & Liturgical Seasons
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Liturgical Calendar Cycle
                </span>
              </div>

              <div className="w-full h-72 sm:h-80 md:h-84">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timelineData}
                    margin={{ top: 20, right: 15, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                    />
                    <XAxis
                      dataKey="monthName"
                      tickLine={false}
                      axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
                      tick={{
                        fontSize: 12,
                        fill: isDarkMode ? '#94a3b8' : '#64748b',
                        fontWeight: 700,
                      }}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 11,
                        fill: isDarkMode ? '#94a3b8' : '#64748b',
                      }}
                      dx={-4}
                    />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload as MonthlyAggregateTimelinePoint;
                          const isGrowing = data.growthDelta >= 0;
                          return (
                            <div className="p-3 bg-slate-900/95 dark:bg-black/95 text-white rounded-xl shadow-xl border border-white/10 text-xs space-y-1.5 backdrop-blur-md max-w-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-amber-400 text-sm">{data.monthName}</span>
                                <span className="text-[10px] font-semibold text-slate-300">
                                  {data.primarySeason}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                                <span className="text-slate-300">Total Hymn Sings:</span>
                                <span className="font-bold font-mono text-white text-sm">
                                  {data.totalSings}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Monthly Growth:</span>
                                <span className={`font-mono font-bold ${isGrowing ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isGrowing ? `+${data.growthDelta}` : data.growthDelta} ({isGrowing ? `+${data.growthRate}` : `${data.growthRate}`}%)
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="totalSings"
                      radius={[6, 6, 0, 0]}
                      animationDuration={800}
                    >
                      {timelineData.map((entry, index) => {
                        const isLatest = index === timelineData.length - 1;
                        const fill = isLatest
                          ? (isDarkMode ? '#fbbf24' : '#f59e0b')
                          : (isDarkMode ? '#3b82f6' : '#2563eb');
                        return (
                          <Cell
                            key={`cell-month-${entry.monthKey}`}
                            fill={fill}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        ) : (
          /* Volume / Most Sung Hymns Bar Chart */
          frequencyData.length > 0 ? (
            <div className="space-y-3">
              <div className="w-full h-72 sm:h-80 md:h-84">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={frequencyData}
                    margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        const item = state.activePayload[0].payload as HymnFrequencyPoint;
                        handleBarClick(item.hymnId, item.collection);
                      }
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                    />
                    <XAxis
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
                      tick={{
                        fontSize: 10,
                        fill: isDarkMode ? '#94a3b8' : '#64748b',
                        fontWeight: 600,
                      }}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 11,
                        fill: isDarkMode ? '#94a3b8' : '#64748b',
                      }}
                      dx={-4}
                    />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload as HymnFrequencyPoint;
                          const colConfig =
                            COLLECTION_COLORS[data.collection.toUpperCase()] ||
                            COLLECTION_COLORS.DEFAULT;
                          return (
                            <div className="p-3 bg-slate-900/95 dark:bg-black/95 text-white rounded-xl shadow-xl border border-white/10 text-xs space-y-1.5 backdrop-blur-md max-w-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${colConfig.darkFill}33`,
                                    color: colConfig.darkFill,
                                  }}
                                >
                                  {data.reference}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {data.collection}
                                </span>
                              </div>
                              <p className="font-bold text-white text-sm leading-tight">{data.title}</p>
                              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                                <span className="text-slate-300">Total Views / Sings:</span>
                                <span className="font-bold font-mono text-amber-400 text-sm">
                                  {data.count}×
                                </span>
                              </div>
                              <p className="text-[10px] text-amber-300/80 italic pt-0.5 flex items-center gap-1">
                                <span>Tap bar to jump to hymn</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      animationDuration={800}
                      className="cursor-pointer"
                    >
                      {frequencyData.map((entry, index) => {
                        const colConfig =
                          COLLECTION_COLORS[entry.collection.toUpperCase()] ||
                          COLLECTION_COLORS.DEFAULT;
                        const fill = isDarkMode ? colConfig.darkFill : colConfig.fill;
                        const isHovered = hoveredBarIndex === index;
                        return (
                          <Cell
                            key={`cell-${entry.hymnId}-${index}`}
                            fill={fill}
                            opacity={hoveredBarIndex === null || isHovered ? 1 : 0.65}
                            onMouseEnter={() => setHoveredBarIndex(index)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="py-12 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
              <Music className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Hymn Activity Recorded
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Open hymns from the catalog or cast on the Sanctuary Beam to see frequency bars populate here.
              </p>
            </div>
          )
        )}
      </div>

      {/* Responsive Footer Legend & Guidance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-400 font-medium">Hymnals:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">SDAH (English)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">NZK (Swahili)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">NCA (Gĩkũyũ)</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          💡 Tap any bar or surge indicator to directly launch that hymn
        </p>
      </div>
    </section>
  );
};
