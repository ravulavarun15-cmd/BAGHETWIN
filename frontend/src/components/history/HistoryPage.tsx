import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Download,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Activity,
  AlertTriangle,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Waves,
  Zap,
  PlusCircle,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import * as api from '../../services/api';

interface HistoryPageProps {
  selectedWell: string;
  onSelectWell: (wellId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ selectedWell, onSelectWell }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [wellFilter, setWellFilter] = useState<string>(selectedWell || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeChartTab, setActiveChartTab] = useState<'production' | 'thermo' | 'srp'>('production');
  
  // Row Expansion
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Modal for new event
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newWellId, setNewWellId] = useState(selectedWell || 'BGW-001');
  const [newCategory, setNewCategory] = useState('audit');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedWell prop when it changes
  useEffect(() => {
    if (selectedWell && wellFilter !== selectedWell && wellFilter !== 'all') {
      setWellFilter(selectedWell);
    }
  }, [selectedWell]);

  // Fetch History Events
  const loadHistoryData = async () => {
    try {
      setRefreshing(true);
      const [histRes, trendRes, summRes] = await Promise.all([
        api.getHistory({
          well_id: wellFilter,
          category: categoryFilter,
          severity: severityFilter,
          time_range: timeRange,
          search: searchTerm,
          limit: 150
        }),
        api.getHistoryTrends(wellFilter === 'all' ? (selectedWell || 'BGW-001') : wellFilter),
        api.getHistorySummary()
      ]);

      setEvents(histRes.data.events || []);
      setTrends(trendRes.data.points || []);
      setSummary(summRes.data);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, [wellFilter, categoryFilter, severityFilter, timeRange, searchTerm]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (events.length === 0) return;

    const headers = ['ID', 'Timestamp', 'Well ID', 'Category', 'Event Type', 'Severity', 'Operator', 'Message', 'Metrics'];
    const rows = events.map(e => [
      e.id,
      e.timestamp,
      e.well_id,
      e.category,
      `"${(e.event_type || '').replace(/"/g, '""')}"`,
      e.severity,
      `"${(e.operator || '').replace(/"/g, '""')}"`,
      `"${(e.message || '').replace(/"/g, '""')}"`,
      `"${JSON.stringify(e.metrics || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BAGHETWIN_history_${wellFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit manual log event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newMessage) return;

    try {
      setIsSubmitting(true);
      await api.logHistoryEvent({
        well_id: newWellId,
        category: newCategory,
        event_type: newEventTitle,
        message: newMessage,
        severity: newSeverity,
        operator: 'Field Supervisor (admin)',
        metrics: { logged_manually: true }
      });

      setIsLogModalOpen(false);
      setNewEventTitle('');
      setNewMessage('');
      loadHistoryData();
    } catch (err) {
      console.error('Failed to log event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Icon helper
  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'telemetry':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Activity size={12} />
            Telemetry
          </span>
        );
      case 'css':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame size={12} />
            CSS Cycle
          </span>
        );
      case 'srp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Cpu size={12} />
            SRP Kinematics
          </span>
        );
      case 'anomaly':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle size={12} />
            Anomaly
          </span>
        );
      case 'ai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap size={12} />
            Copilot AI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <Layers size={12} />
            Audit Log
          </span>
        );
    }
  };

  // Severity styling
  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">WARNING</span>;
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">APPLIED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass border border-slate-800/80 bg-gradient-to-r from-[#0b1118] via-[#101722] to-[#0e1622] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <History size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Operational History & Fleet Audit Trail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Baghewala Sector
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete historical production telemetry, CSS steam cycles, SRP adjustments, and AI intervention logs.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold transition flex items-center gap-2 btn-tactile shadow-sm shadow-amber-500/10"
          >
            <PlusCircle size={15} />
            <span>Log Field Event</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition flex items-center gap-2 btn-tactile"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadHistoryData}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition btn-tactile"
            title="Refresh Historical Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-amber-400' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass border border-slate-800 relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Historical Logs</div>
          <div className="text-2xl font-black text-white mt-1">
            {summary ? summary.total_records.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> Synchronized across 35 Wells
          </div>
        </div>

        <div className="p-4 rounded-xl glass border border-slate-800 relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mean Oil Recovery</div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {summary ? `${summary.avg_historical_recovery_bopd} BOPD` : '40.8 BOPD'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Heavy crude thermal response</div>
        </div>

        <div className="p-4 rounded-xl glass border border-slate-800 relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mean Steam-Oil Ratio</div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {summary ? `${summary.mean_sor} t/t` : '3.4 t/t'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">CSS Energy Efficiency Benchmark</div>
        </div>

        <div className="p-4 rounded-xl glass border border-slate-800 relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Incident Resolution</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {summary ? `${summary.incident_resolution_rate_pct}%` : '98.4%'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Fleet Operational Uptime</div>
        </div>
      </div>

      {/* Historical Trend Charts */}
      <div className="p-6 rounded-2xl glass border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-amber-400" />
              <span>Historical Telemetry Trends ({wellFilter === 'all' ? selectedWell || 'BGW-001' : wellFilter})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              30-day chronological performance curves recorded at surface and downhole sensors.
            </p>
          </div>

          {/* Chart Mode Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChartTab('production')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeChartTab === 'production'
                  ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Production & Watercut
            </button>
            <button
              onClick={() => setActiveChartTab('thermo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeChartTab === 'thermo'
                  ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Temperature & Viscosity
            </button>
            <button
              onClick={() => setActiveChartTab('srp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeChartTab === 'srp'
                  ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rod Load & SPM
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'production' ? (
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#091522', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="oil_bopd" name="Oil Rate (BOPD)" stroke="#22d3ee" fillOpacity={1} fill="url(#oilGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="watercut_pct" name="Watercut (%)" stroke="#38bdf8" fillOpacity={1} fill="url(#waterGrad)" strokeWidth={2} />
              </AreaChart>
            ) : activeChartTab === 'thermo' ? (
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#ec4899" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#091522', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="temperature_c" name="Reservoir Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="viscosity_cp" name="Oil Viscosity (cP)" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="load" stroke="#10b981" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="spm" orientation="right" stroke="#06b6d4" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#091522', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="load" type="monotone" dataKey="rod_load_kn" name="Peak Rod Load (kN)" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="spm" type="stepAfter" dataKey="spm" name="Pump Speed (SPM)" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl glass border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Well Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Well:</span>
            <select
              value={wellFilter}
              onChange={(e) => {
                setWellFilter(e.target.value);
                if (e.target.value !== 'all') onSelectWell(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All 35 Wells</option>
              {Array.from({ length: 35 }, (_, i) => {
                const code = `BGW-${String(i + 1).padStart(3, '0')}`;
                return <option key={code} value={code}>{code}</option>;
              })}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Categories</option>
              <option value="telemetry">Daily Telemetry</option>
              <option value="css">CSS Cycles</option>
              <option value="srp">SRP Kinematics</option>
              <option value="anomaly">Anomalies & Alerts</option>
              <option value="audit">Audit Log</option>
              <option value="ai">Copilot AI</option>
            </select>
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All History</option>
            </select>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Levels</option>
              <option value="NORMAL">Normal</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
              <option value="SUCCESS">Applied</option>
            </select>
          </div>
        </div>

        {/* Text Search Box */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search events, actions, metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Historical Event Table */}
      <div className="rounded-2xl glass border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="font-semibold text-slate-300">
            Chronological Audit Log ({events.length} records found)
          </div>
          <div className="text-[11px] text-slate-500">
            Click row to view complete sensor metrics & operator notes
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Well</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Event / Action</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Operator / Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <History size={32} className="mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No historical records match the active filters.</p>
                    <p className="text-xs text-slate-600 mt-1">Try resetting the category or expanding the time window.</p>
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const isExpanded = expandedRowId === evt.id;
                  const dateObj = new Date(evt.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <React.Fragment key={evt.id}>
                      <tr
                        onClick={() => setExpandedRowId(isExpanded ? null : evt.id)}
                        className={`hover:bg-slate-800/40 transition cursor-pointer ${
                          isExpanded ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-500">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-200">{formattedDate}</div>
                          <div className="text-[10px] text-slate-500">{formattedTime}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWellFilter(evt.well_id);
                              onSelectWell(evt.well_id);
                            }}
                            className="font-bold text-amber-400 hover:text-amber-300 hover:underline"
                          >
                            {evt.well_id}
                          </button>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getCategoryBadge(evt.category)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{evt.event_type}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-md">{evt.message}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getSeverityBadge(evt.severity)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {evt.operator}
                        </td>
                      </tr>

                      {/* Expanded Detail Accordion */}
                      {isExpanded && (
                        <tr className="bg-slate-950/60 border-y border-slate-800/80">
                          <td colSpan={7} className="p-4 pl-12">
                            <div className="space-y-3">
                              <div className="text-xs text-slate-300">
                                <span className="font-semibold text-amber-300">Complete Message: </span>
                                {evt.message}
                              </div>

                              {evt.metrics && Object.keys(evt.metrics).length > 0 && (
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Sensor Telemetry & Parameters:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(evt.metrics).map(([k, v]) => (
                                      <div key={k} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                                        <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}: </span>
                                        <span className="font-bold text-amber-300">{String(v)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="text-[10px] text-slate-500 flex items-center gap-4 pt-1 border-t border-slate-900">
                                <span>Record ID: <b className="text-slate-400 font-mono">{evt.id}</b></span>
                                <span>UTC Sync: <b className="text-slate-400">{evt.timestamp}</b></span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Event Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-[#0b1118] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Log Field Event</h3>
                <p className="text-[11px] text-slate-400">Record a maintenance or operational intervention.</p>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Well</label>
                <select
                  value={newWellId}
                  onChange={(e) => setNewWellId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {Array.from({ length: 35 }, (_, i) => {
                    const code = `BGW-${String(i + 1).padStart(3, '0')}`;
                    return <option key={code} value={code}>{code}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="audit">Audit Log / Operator Action</option>
                  <option value="css">CSS Steam Cycle Event</option>
                  <option value="srp">SRP Kinematics / Pump Tuning</option>
                  <option value="anomaly">Anomaly Investigation</option>
                  <option value="telemetry">Manual SCADA Calibration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Event Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Stuffing Box Gland Packing Replaced"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the actions taken, sensor readings, or operational outcomes..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Severity / Status</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="NORMAL">Normal / Routine</option>
                  <option value="SUCCESS">Success / Applied</option>
                  <option value="WARNING">Warning / Elevated Risk</option>
                  <option value="CRITICAL">Critical Incident</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 btn-tactile disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Commit Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
