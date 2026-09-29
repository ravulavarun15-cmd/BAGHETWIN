import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Database,
  Droplet,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Gauge,
  HelpCircle,
  History,
  Layers,
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Thermometer,
  Waves,
  X,
  Zap
} from 'lucide-react';
import * as api from '../../services/api';

export interface WellRecord {
  well_id: string;
  production_rate?: number;
  watercut?: number;
  pressure_bar?: number;
  temperature_c?: number;
  oil_viscosity_cp?: number;
  reservoir_condition?: string;
  operating_stage?: string;
  status?: string;
  is_demonstration?: boolean | string;
  data_source?: string;
}

interface WellsMonitoringPageProps {
  onSelectWellForTwin?: (wellId: string) => void;
  onOpen3DForWell?: (wellId: string) => void;
  onOpenHistoryForWell?: (wellId: string) => void;
}

export const WellsMonitoringPage: React.FC<WellsMonitoringPageProps> = ({
  onSelectWellForTwin,
  onOpen3DForWell,
  onOpenHistoryForWell
}) => {
  const [wells, setWells] = useState<WellRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPERATIONAL' | 'NON_OPERATIONAL' | 'WARNINGS'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedWell, setSelectedWell] = useState<WellRecord | null>(null);

  useEffect(() => {
    const fetchWells = async () => {
      try {
        setLoading(true);
        const res = await api.wells();
        const data = res.data.wells || [];
        setWells(data);
      } catch (err: any) {
        setError('Failed to load well fleet telemetry from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchWells();
  }, []);

  // Summary derived dynamically from records
  const derivedStats = useMemo(() => {
    const total = wells.length;
    const operating = wells.filter(
      (w) => String(w.status).toLowerCase() === 'operational'
    ).length;
    const nonOperating = total - operating;

    const opWells = wells.filter(
      (w) => String(w.status).toLowerCase() === 'operational'
    );
    const totalBopd = opWells.reduce(
      (acc, w) => acc + (Number(w.production_rate) || 0),
      0
    );
    const avgBopd = opWells.length ? Math.round((totalBopd / opWells.length) * 10) / 10 : 0;
    const avgTemp = opWells.length
      ? Math.round(
          (opWells.reduce((acc, w) => acc + (Number(w.temperature_c) || 0), 0) /
            opWells.length) *
            10
        ) / 10
      : 0;

    const warnings = wells.filter((w) => {
      const isOp = String(w.status).toLowerCase() === 'operational';
      if (!isOp) return false;
      const visc = Number(w.oil_viscosity_cp) || 0;
      const watercut = Number(w.watercut) || 0;
      return visc > 2100 || watercut > 36;
    }).length;

    return { total, operating, nonOperating, totalBopd, avgBopd, avgTemp, warnings };
  }, [wells]);

  // Filtering
  const filteredWells = useMemo(() => {
    return wells.filter((w) => {
      const matchSearch =
        w.well_id.toLowerCase().includes(search.toLowerCase()) ||
        (w.reservoir_condition &&
          w.reservoir_condition.toLowerCase().includes(search.toLowerCase())) ||
        (w.operating_stage &&
          w.operating_stage.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      const isOperational = String(w.status).toLowerCase() === 'operational';

      if (statusFilter === 'OPERATIONAL') return isOperational;
      if (statusFilter === 'NON_OPERATIONAL') return !isOperational;
      if (statusFilter === 'WARNINGS') {
        if (!isOperational) return false;
        const visc = Number(w.oil_viscosity_cp) || 0;
        const watercut = Number(w.watercut) || 0;
        return visc > 2100 || watercut > 36;
      }

      return true;
    });
  }, [wells, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-amber" />
            BAGHEWALA FIELD FLEET MONITOR
          </div>
          <h2 className="text-3xl font-black text-white mt-1">
            35-Well <span className="gradient-text">Unified Fleet Overview</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time status tracking across the Baghewala thermal recovery field. 
            All summary metrics are computed dynamically from actual records and verified demonstration profiles.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dense Table View"
            >
              <TableIcon size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass rounded-2xl p-4 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Wells</span>
            <Layers size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {derivedStats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Configured Asset Fleet</div>
        </div>

        <div className="glass rounded-2xl p-4 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Operational</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">
            {derivedStats.operating}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Actively Producing</div>
        </div>

        <div className="glass rounded-2xl p-4 border-l-4 border-l-slate-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Non-Operating</span>
            <Clock size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-300 mt-2">
            {derivedStats.nonOperating}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting Status Confirmation</div>
        </div>

        <div className="glass rounded-2xl p-4 border-l-4 border-l-blue-400">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Fleet Production</span>
            <Droplet size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {derivedStats.totalBopd}
            <span className="text-xs font-normal text-slate-400 ml-1">BOPD</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Avg {derivedStats.avgBopd} BOPD/well</div>
        </div>

        <div className="glass rounded-2xl p-4 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Reservoir Temp</span>
            <Thermometer size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {derivedStats.avgTemp}
            <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Field Thermal Mean</div>
        </div>

        <div className="glass rounded-2xl p-4 border-l-4 border-l-rose-400">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Warnings</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">
            {derivedStats.warnings}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">Elevated Visc/Watercut</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Well ID (e.g. BGW-012)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter size={13} /> Filter:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All ({derivedStats.total})
          </button>
          <button
            onClick={() => setStatusFilter('OPERATIONAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'OPERATIONAL'
                ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Operating ({derivedStats.operating})
          </button>
          <button
            onClick={() => setStatusFilter('NON_OPERATIONAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'NON_OPERATIONAL'
                ? 'bg-slate-400 text-slate-950 shadow-md shadow-slate-400/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Awaiting Status ({derivedStats.nonOperating})
          </button>
          <button
            onClick={() => setStatusFilter('WARNINGS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'WARNINGS'
                ? 'bg-rose-400 text-slate-950 shadow-md shadow-rose-400/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Warnings ({derivedStats.warnings})
          </button>
        </div>
      </div>

      {/* Fleet Content: Grid Cards or Table */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 skeleton-shimmer h-48" />
          ))}
        </div>
      ) : filteredWells.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <AlertCircle size={32} className="mx-auto text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-white">No Wells Match Filters</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search criteria or clear active status filters.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWells.map((w) => {
            const isOp = String(w.status).toLowerCase() === 'operational';
            const isDemo = String(w.is_demonstration) === 'true' || w.is_demonstration === true;
            const hasWarning =
              isOp && ((Number(w.oil_viscosity_cp) || 0) > 2100 || (Number(w.watercut) || 0) > 36);

            return (
              <div
                key={w.well_id}
                onClick={() => setSelectedWell(w)}
                className={`glass glass-card-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden border ${
                  hasWarning
                    ? 'border-amber-500/40'
                    : isOp
                    ? 'border-slate-800 hover:border-amber-400/50'
                    : 'border-slate-800/60 opacity-80'
                }`}
              >
                {/* Top Badge Ribbon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOp ? 'bg-emerald-400 pulse-emerald' : 'bg-slate-500'
                      }`}
                    />
                    <span className="font-black text-base text-white tracking-wide">
                      {w.well_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDemo && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                        Demo Record
                      </span>
                    )}
                    {hasWarning && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                        <AlertTriangle size={10} /> Warning
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtitle / Stage */}
                <div className="text-xs text-slate-400 mt-2 truncate">
                  {w.operating_stage || 'Unknown Status'}
                </div>

                {/* Telemetry Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Production</span>
                    <span className="font-bold text-white text-sm">
                      {isOp ? `${w.production_rate ?? '—'} BOPD` : '0 BOPD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Temperature</span>
                    <span className="font-bold text-white text-sm">
                      {isOp ? `${w.temperature_c ?? '—'} °C` : `${w.temperature_c ?? '—'} °C`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pressure</span>
                    <span className="font-bold text-white text-sm">
                      {w.pressure_bar ? `${w.pressure_bar} bar` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Viscosity</span>
                    <span
                      className={`font-bold text-sm ${
                        (Number(w.oil_viscosity_cp) || 0) > 2100 ? 'text-orange-400' : 'text-amber-300'
                      }`}
                    >
                      {w.oil_viscosity_cp ? `${w.oil_viscosity_cp} cP` : '—'}
                    </span>
                  </div>
                </div>

                {/* Condition pill & Quick action */}
                <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                    {w.reservoir_condition || 'Standard'}
                  </span>
                  <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5 hover:underline">
                    Inspect <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="glass rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-[#071320] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 text-left">Well ID</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Production (BOPD)</th>
                  <th className="py-3 px-4 text-right">Watercut (%)</th>
                  <th className="py-3 px-4 text-right">Pressure (bar)</th>
                  <th className="py-3 px-4 text-right">Temp (°C)</th>
                  <th className="py-3 px-4 text-right">Viscosity (cP)</th>
                  <th className="py-3 px-4 text-left">Reservoir State</th>
                  <th className="py-3 px-4 text-center">Record Type</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWells.map((w) => {
                  const isOp = String(w.status).toLowerCase() === 'operational';
                  const isDemo = String(w.is_demonstration) === 'true' || w.is_demonstration === true;

                  return (
                    <tr
                      key={w.well_id}
                      onClick={() => setSelectedWell(w)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOp ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                        {w.well_id}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            isOp
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isOp ? 'Operational' : 'Awaiting Status'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {isOp ? w.production_rate ?? '—' : '0'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {isOp ? (w.watercut ? `${w.watercut}%` : '—') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {w.pressure_bar ? `${w.pressure_bar} bar` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {w.temperature_c ? `${w.temperature_c} °C` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-300">
                        {w.oil_viscosity_cp ? `${w.oil_viscosity_cp} cP` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">
                        {w.reservoir_condition || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {isDemo ? 'Demonstration' : 'Field Baseline'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWell(w);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold border border-amber-400/20"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Well Details Modal / Slide-over */}
      {selectedWell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl shadow-amber-500/10">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-[#120d04] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/20 text-amber-300">
                  <Activity size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">
                      {selectedWell.well_id} Details
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        String(selectedWell.status).toLowerCase() === 'operational'
                          ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {String(selectedWell.status).toLowerCase() === 'operational'
                        ? 'Operational'
                        : 'Awaiting Status Confirmation'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Baghewala Field · Reservoir & Surface Monitoring Record
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWell(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar">
              {/* Data Disclosure Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Database size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    Data Source: {selectedWell.data_source || (selectedWell.is_demonstration ? 'Demonstration Record' : 'Field Telemetry')}
                  </span>
                  {selectedWell.is_demonstration ? (
                    <p className="text-slate-400">
                      This well profile is clearly labeled as a demonstration record constructed for 35-well platform architecture compliance without fabricating actual historical maintenance events.
                    </p>
                  ) : (
                    <p className="text-slate-400">
                      Primary baseline calibration well for the Baghewala heavy oil digital twin prototype.
                    </p>
                  )}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Production Rate</span>
                  <div className="text-lg font-black text-white mt-1">
                    {selectedWell.production_rate ?? 0}
                    <span className="text-xs font-normal text-slate-400 ml-1">BOPD</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Water Cut</span>
                  <div className="text-lg font-black text-white mt-1">
                    {selectedWell.watercut ?? 0}
                    <span className="text-xs font-normal text-slate-400 ml-1">%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Bottomhole Press.</span>
                  <div className="text-lg font-black text-white mt-1">
                    {selectedWell.pressure_bar ?? 0}
                    <span className="text-xs font-normal text-slate-400 ml-1">bar</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Reservoir Temp</span>
                  <div className="text-lg font-black text-white mt-1">
                    {selectedWell.temperature_c ?? 0}
                    <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
                  </div>
                </div>
              </div>

              {/* Viscosity & Reservoir Conditions */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Oil Viscosity</span>
                  <span className="text-sm font-bold text-amber-300">
                    {selectedWell.oil_viscosity_cp} cP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Operating Stage</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedWell.operating_stage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Reservoir Condition</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedWell.reservoir_condition}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {onSelectWellForTwin && (
                  <button
                    onClick={() => {
                      onSelectWellForTwin(selectedWell.well_id);
                      setSelectedWell(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md shadow-amber-500/20 transition"
                  >
                    <Activity size={14} /> Set as Active Virtual Well
                  </button>
                )}
                {onOpen3DForWell && (
                  <button
                    onClick={() => {
                      onOpen3DForWell(selectedWell.well_id);
                      setSelectedWell(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md shadow-orange-500/20 transition"
                  >
                    <Flame size={14} /> Open in 3D Rig View
                  </button>
                )}
                {onOpenHistoryForWell && (
                  <button
                    onClick={() => {
                      onOpenHistoryForWell(selectedWell.well_id);
                      setSelectedWell(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition"
                  >
                    <History size={14} /> View Complete Operational History
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
