import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Box,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Database,
  Droplet,
  Factory,
  Flame,
  History,
  Info,
  Layers,
  LogOut,
  Menu,
  RotateCcw,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  User,
  UserCircle2,
  Waves,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

import * as api from './services/api';
import { Rig3DView } from './components/rig3d/Rig3DView';
import { LoginPage } from './components/auth/LoginPage';
import { CustomCursor } from './components/ui/CustomCursor';
import { WellsMonitoringPage } from './components/wells/WellsMonitoringPage';
import { CopilotDrawer } from './components/copilot/CopilotDrawer';
import { CopilotPage } from './components/copilot/CopilotPage';
import { HistoryPage } from './components/history/HistoryPage';

type Page =
  | 'Dashboard'
  | '3D Rig View'
  | 'Wells'
  | 'History'
  | 'BAGHETWIN Copilot'
  | 'CSS Optimization'
  | 'SRP Optimization'
  | 'Predictions'
  | 'Anomalies'
  | 'About Us';

const navItems: [Page, any, string?][] = [
  ['Dashboard', Activity],
  ['3D Rig View', Box, '3D'],
  ['Wells', Waves, '35'],
  ['History', History, 'Logs'],
  ['BAGHETWIN Copilot', Bot, 'AI'],
  ['CSS Optimization', Factory],
  ['SRP Optimization', CircleGauge],
  ['Predictions', BarChart3],
  ['Anomalies', AlertTriangle, 'Live'],
  ['About Us', Info]
];

const fmt = (v: any, dash = 1) =>
  typeof v === 'number' ? v.toFixed(dash) : v ?? '—';

/* =========================================================================
   MAIN APP CONTAINER
   ========================================================================= */
export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (u: any) => {
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="relative min-h-screen bg-[#080d14] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Custom High-Tech Industrial Cursor */}
      <CustomCursor />

      {user ? (
        <Layout user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

/* =========================================================================
   APPLICATION SHELL & NAVIGATION
   ========================================================================= */
function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [page, setPage] = useState<Page>('Dashboard');
  const [well, setWell] = useState('BGW-001');
  const [wellList, setWellList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .wells()
      .then((r) => {
        const list = r.data.wells || [];
        setWellList(list);
        if (list.length > 0 && !list.some((w: any) => w.well_id === well)) {
          setWell(list[0].well_id);
        }
      })
      .catch(() => {});
  }, []);

  const pageTitle =
    page === 'Dashboard'
      ? 'Operations Control Center'
      : page === '3D Rig View'
      ? '3D Oil Rig Digital Twin'
      : page === 'Wells'
      ? '35-Well Fleet Monitoring'
      : page === 'History'
      ? 'Operational History & Fleet Audit Trail'
      : page === 'BAGHETWIN Copilot'
      ? 'BAGHETWIN AI Copilot'
      : page;

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100 flex flex-col md:flex-row relative">
      {/* Sidebar Navigation */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 z-40 w-72 h-screen bg-[#0b1118] border-r border-amber-950/40 p-5 transition-transform duration-300 ease-out flex flex-col justify-between`}
      >
        <div>
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25">
              <Flame size={22} className="text-slate-950" />
            </div>
            <div>
              <div className="font-black text-xl tracking-wider text-white">
                BAGHE<span className="gradient-text">TWIN</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400">
                Heavy Oilfield Platform
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 px-3 mb-2 flex items-center justify-between">
            <span>Operations Layer</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(([label, Icon, badge]) => {
              const active = page === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setPage(label);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all btn-tactile ${
                    active
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-400/35 shadow-md shadow-amber-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    size={17}
                    className={active ? 'text-amber-400' : 'text-slate-400'}
                  />
                  <span>{label}</span>

                  {badge && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        badge === 'Live'
                          ? 'bg-amber-400/20 text-amber-300 pulse-amber'
                          : badge === 'AI'
                          ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-400/30'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card in Sidebar */}
        <div className="glass rounded-2xl p-3.5 border border-slate-700/60 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/20">
              {(user?.name || 'U')[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">
                {user?.name || 'Field Supervisor'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {user?.role || 'Operator'} · Baghewala
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-amber-950/40 bg-[#0b1118]/95 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              onClick={() => setOpen(!open)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-black text-lg md:text-xl text-white">
                {pageTitle}
              </h1>
              <p className="text-[11px] text-amber-300/70 hidden sm:block">
                Baghewala Heavy Oil Field · Rajasthan Basin · Thermal Recovery Layer
              </p>
            </div>
          </div>

          {/* Top Right Well Selector & Live Status */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" />
              <span>Fleet: <b>28 / 35</b> Operating</span>
            </div>

            {/* Well Selector */}
            <div className="relative">
              <select
                value={well}
                onChange={(e) => setWell(e.target.value)}
                className="bg-slate-900 border border-amber-500/30 text-amber-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer transition appearance-none"
              >
                {wellList.length > 0 ? (
                  wellList.map((w: any) => (
                    <option key={w.well_id} value={w.well_id}>
                      {w.well_id} {String(w.status).toLowerCase() === 'operational' ? '(Active)' : '(Awaiting)'}
                    </option>
                  ))
                ) : (
                  <option value="BGW-001">BGW-001</option>
                )}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-2.5 text-amber-400 pointer-events-none"
              />
            </div>

            <div className="h-7 w-px bg-slate-800" />

            {/* Header User Badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shadow-amber-500/20">
                {(user?.name || 'O')[0]}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.name}
                </div>
                <div className="text-[10px] text-amber-400 uppercase font-semibold">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8 max-w-[1700px] w-full mx-auto flex-1">
          {page === 'Dashboard' && (
            <Dashboard
              well={well}
              onOpen3D={() => setPage('3D Rig View')}
              onOpenWells={() => setPage('Wells')}
              onOpenHistory={() => setPage('History')}
              onOpenCopilot={() => setPage('BAGHETWIN Copilot')}
            />
          )}
          {page === '3D Rig View' && <Rig3DView wellId={well} />}
          {page === 'Wells' && (
            <WellsMonitoringPage
              onSelectWellForTwin={(id) => setWell(id)}
              onOpen3DForWell={(id) => {
                setWell(id);
                setPage('3D Rig View');
              }}
              onOpenHistoryForWell={(id) => {
                setWell(id);
                setPage('History');
              }}
            />
          )}
          {page === 'History' && (
            <HistoryPage
              selectedWell={well}
              onSelectWell={(id) => setWell(id)}
            />
          )}
          {page === 'BAGHETWIN Copilot' && <CopilotPage wellId={well} />}
          {page === 'CSS Optimization' && (
            <CSSPage well={well} onOpenHistory={() => setPage('History')} />
          )}
          {page === 'SRP Optimization' && (
            <SRPPage well={well} onOpenHistory={() => setPage('History')} />
          )}
          {page === 'Predictions' && <Predictions well={well} />}
          {page === 'Anomalies' && <AnomaliesPage well={well} />}
          {page === 'About Us' && <About />}
        </div>
      </main>

      {/* Global Floating Copilot AI Assistant */}
      <CopilotDrawer
        wellId={well}
        onOpenFullPage={() => setPage('BAGHETWIN Copilot')}
      />
    </div>
  );
}

/* =========================================================================
   OPERATIONS DASHBOARD
   ========================================================================= */
function Dashboard({
  well,
  onOpen3D,
  onOpenWells,
  onOpenHistory,
  onOpenCopilot
}: {
  well: string;
  onOpen3D?: () => void;
  onOpenWells?: () => void;
  onOpenHistory?: () => void;
  onOpenCopilot?: () => void;
}) {
  const [d, setD] = useState<any>(null);
  const [twin, setTwin] = useState<any>(null);

  useEffect(() => {
    api.dashboard(well).then((r) => setD(r.data)).catch(() => {});
  }, [well]);

  useEffect(() => {
    const loadTwin = () => {
      api.twinState().then((response) => setTwin(response.data)).catch(() => {});
    };

    loadTwin();
    const timer = window.setInterval(loadTwin, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const chart = d?.production?.trend || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Interactive Virtual Well Control Bar */}
      <LiveTwinPanel onOpen3D={onOpen3D} onOpenCopilot={onOpenCopilot} />

      {/* Headline & Fleet Status Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" />
            BAGHEWALA DIGITAL TWIN ACTIVE
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-1">
            Operations <span className="gradient-text">Control Center</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Continuous physics telemetry, predictive intelligence and automated optimization for{' '}
            <b className="text-amber-300">{well}</b>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenWells && (
            <button
              onClick={onOpenWells}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white hover:border-amber-400/50 transition flex items-center gap-2 btn-tactile"
            >
              <Waves size={15} className="text-amber-400" />
              <span>View All 35 Wells</span>
            </button>
          )}

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-2 btn-tactile"
            >
              <History size={15} className="text-amber-400" />
              <span>Audit History</span>
            </button>
          )}

          <div className="text-right text-xs text-slate-400 hidden sm:block">
            Synchronized with Twin Engine
            <div className="text-amber-300 font-bold">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Oil Production Rate"
          value={fmt(twin?.oil_bopd, 1)}
          unit="BOPD"
          icon={BarChart3}
          accent="amber"
          subtitle="Real-time lift volume"
        />
        <Metric
          label="Reservoir Temperature"
          value={fmt(twin?.temperature_c, 1)}
          unit="°C"
          icon={Thermometer}
          accent="amber"
          subtitle="Thermal steam stimulation"
        />
        <Metric
          label="Bottomhole Pressure"
          value={fmt(twin?.pressure_bar, 1)}
          unit="bar"
          icon={CircleGauge}
          accent="blue"
          subtitle="Fluid column pressure"
        />
        <Metric
          label="System Health Index"
          value={Math.round(
            100 -
              Math.max(
                (twin?.rod_floating_risk || 0) * 100,
                (twin?.pump_failure_risk || 0) * 100
              )
          )}
          unit="%"
          icon={ShieldCheck}
          accent="emerald"
          subtitle="Mechanical integrity"
        />
      </div>

      {/* Historical Trend Chart & AI Action Board */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Production & Thermal Trend Chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Production & Thermal Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cyclic Steam Stimulation response curve (BOPD vs. Reservoir Temp)
              </p>
            </div>
            {onOpenHistory ? (
              <button
                onClick={onOpenHistory}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30 flex items-center gap-1.5 transition btn-tactile"
              >
                <History size={13} />
                <span>30-Day Historical Logs →</span>
              </button>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 font-semibold border border-amber-400/20">
                7-Day Telemetry
              </span>
            )}
          </div>

          <div className="h-72 mt-4">
            {chart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} stroke="#f59e0b" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0d141e',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 12,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="oil_bopd"
                    name="Crude Oil (BOPD)"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    dot={{ fill: '#fbbf24', r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="temperature_c"
                    name="Reservoir Temp (°C)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-slate-500 text-xs">
                Synchronizing telemetry dataset...
              </div>
            )}
          </div>
        </div>

        {/* AI Action Board */}
        <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">AI Action Board</h3>
              <Sparkles size={16} className="text-amber-400" />
            </div>

            <div className="space-y-3">
              <Action
                title="Rod Floating Risk"
                value={
                  twin?.rod_floating_risk >= 0.5
                    ? 'HIGH RISK'
                    : d?.anomaly?.rod_floating_label || 'LOW RISK'
                }
                tone={twin?.rod_floating_risk >= 0.5 ? 'rose' : 'emerald'}
              />
              <Action
                title="Pump Condition"
                value={d?.anomaly?.pump_condition || 'NORMAL'}
                tone="emerald"
              />
              <Action
                title="ML Production Outlook"
                value={
                  d?.prediction?.next_day_production
                    ? `${fmt(d.prediction.next_day_production)} BOPD`
                    : '42.0 BOPD'
                }
                tone="amber"
              />
              <Action
                title="Recommended Pumping Speed"
                value="5.5 SPM @ 45 Hz"
                tone="amber"
              />
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-400/25">
            <div className="text-[10px] uppercase font-bold text-amber-400">
              BAGHETWIN Closed-Loop Twin
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Physics simulation $\rightarrow$ AI anomaly forecast $\rightarrow$ safe SRP parameter adjustment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   LIVE TWIN PANEL
   ========================================================================= */
function LiveTwinPanel({
  onOpen3D,
  onOpenCopilot
}: {
  onOpen3D?: () => void;
  onOpenCopilot?: () => void;
}) {
  const [state, setState] = useState<any>(null);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  const refresh = async () => {
    try {
      const response = await api.twinState();
      setState(response.data);
      const recommendationResponse = await api.twinRecommendation();
      setRecommendation(recommendationResponse.data);
      const predictionResponse = await api.twinPrediction();
      setPrediction(predictionResponse.data);
      setError('');
    } catch {
      setError('Could not connect to the Digital Twin engine.');
    }
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const runAction = async (action: () => Promise<any>) => {
    try {
      const response = await action();
      setState(response.data);
      setError('');
    } catch {
      setError('Twin action failed. Please try again.');
    }
  };

  const phaseButtons = ['INJECTION', 'SOAK', 'PRODUCTION'];

  return (
    <div className="glass rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-amber" />
            LIVE INDUSTRIAL DIGITAL TWIN ENGINE
          </div>

          <h3 className="text-2xl font-black text-white mt-1">
            {state?.well_id || 'BGW-001'} Virtual Heavy Oil Well
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Simulation Status:{' '}
            <b className="text-amber-300 font-bold">
              {state?.simulation_status || 'LOADING'}
            </b>{' '}
            · CSS Cycle Phase:{' '}
            <b className="text-amber-400 font-bold">
              {state?.current_phase || 'PRODUCTION'}
            </b>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpen3D && (
            <button
              onClick={onOpen3D}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Box size={15} /> 3D Rig View
            </button>
          )}

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Bot size={15} /> Ask Copilot
            </button>
          )}

          <button
            onClick={() => runAction(api.twinStart)}
            className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition"
          >
            Start
          </button>

          <button
            onClick={() => runAction(api.twinPause)}
            className="px-3.5 py-2 rounded-xl bg-amber-300 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition"
          >
            Pause
          </button>

          <button
            onClick={() => runAction(api.twinReset)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 active:scale-95 transition"
          >
            Reset
          </button>

          <button
            onClick={() => runAction(api.twinHighSpeedDisturbance)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/90 text-white font-bold text-xs hover:bg-rose-600 active:scale-95 transition"
          >
            Inject Disturbance
          </button>
        </div>
      </div>

      {/* Key State Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <Stat label="Live Production" value={`${fmt(state?.oil_bopd)} BOPD`} />
        <Stat label="Reservoir Temp" value={`${fmt(state?.temperature_c)} °C`} />
        <Stat label="Bottomhole Press." value={`${fmt(state?.pressure_bar)} bar`} />
        <Stat
          label="Rod-Floating Risk"
          value={`${Math.round((state?.rod_floating_risk || 0) * 100)}%`}
          tone={
            (state?.rod_floating_risk || 0) >= 0.5 ? 'text-rose-400' : 'text-emerald-400'
          }
        />
      </div>

      {/* High Risk Banner Alert */}
      {(state?.rod_floating_risk || 0) >= 0.5 && (
        <div className="mt-4 p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-rose-400 shrink-0" size={24} />
            <div>
              <p className="font-bold text-rose-200 text-sm">
                Severe Hydrodynamic Rod-Floating Risk Detected
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Downward viscous drag exceeds gravity pull. Bridle slackening and rod buckling imminent.
              </p>
            </div>
          </div>
          <button
            onClick={() => runAction(api.twinApplyRecommendation)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold text-xs shrink-0 hover:brightness-110 shadow-md shadow-amber-500/20 transition"
          >
            Apply Safe SRP Settings
          </button>
        </div>
      )}

      {/* Phase Selectors */}
      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 mr-1">Switch CSS Phase:</span>
        {phaseButtons.map((phase) => (
          <button
            key={phase}
            onClick={() => runAction(() => api.twinPhase(phase))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              state?.current_phase === phase
                ? 'bg-violet-400 text-slate-950 shadow-md shadow-violet-400/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-xs text-rose-400 font-semibold">{error}</p>}
    </div>
  );
}

/* =========================================================================
   GENERIC UI COMPONENTS (METRIC, ACTION, STAT, DATA TABLE)
   ========================================================================= */
function Metric({
  label,
  value,
  unit,
  icon: Icon,
  accent = 'amber',
  subtitle
}: any) {
  return (
    <div className="glass glass-card-hover rounded-2xl p-5 relative overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
          <Icon size={16} className={`text-${accent}-400`} />
        </div>
      </div>
      <div className="mt-3 text-2xl font-black text-white">
        {value}
        <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>
      </div>
      {subtitle && <div className="text-[10px] text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function Stat({ label, value, tone = 'text-white' }: any) {
  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5">
      <p className="text-[11px] text-slate-400">{label}</p>
      <b className={`block mt-1 text-base font-black ${tone}`}>{value}</b>
    </div>
  );
}

function Action({ title, value, tone }: any) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-300'
      : tone === 'rose'
      ? 'text-rose-400 font-black'
      : tone === 'amber'
      ? 'text-amber-300'
      : 'text-amber-300';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
      <span className="text-xs text-slate-400">{title}</span>
      <span className={`text-xs font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function DataTable({
  title,
  rows,
  columns,
  badgeText = 'Baghewala Historical Mirror',
  onOpenHistory
}: {
  title: string;
  rows: any[];
  columns: [string, string][];
  badgeText?: string;
  onOpenHistory?: () => void;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-slate-800">
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-sm text-white">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{rows.length} Historical Records Available</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800">
            {badgeText}
          </span>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30 flex items-center gap-1.5 transition btn-tactile"
            >
              <History size={12} />
              <span>Full Audit Trail →</span>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar">
        <table className="w-full text-xs">
          <thead className="bg-[#071320] text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              {columns.map((c) => (
                <th key={c[0]} className="text-left px-4 py-3 whitespace-nowrap">
                  {c[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition">
                {columns.map((c) => {
                  const val = r[c[1]] ?? '—';
                  const isStatus = c[1] === 'status' || c[1] === 'operating_status';
                  const isWell = c[1] === 'well_id';
                  return (
                    <td key={c[0]} className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {isStatus ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            String(val).includes('WARNING') || String(val).includes('ELEVATED')
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : String(val).includes('Current') || String(val).includes('Active') || String(val).includes('OPTIMAL')
                              ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {val}
                        </span>
                      ) : isWell ? (
                        <span className="font-bold text-amber-400">{val}</span>
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageIntro({ icon: Icon, title, text }: any) {
  return (
    <div className="mb-6 flex gap-4 items-start animate-fade-in">
      <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400/15 to-orange-500/15 border border-amber-400/20">
        <Icon className="text-amber-400" size={24} />
      </div>
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

/* =========================================================================
   CSS OPTIMIZATION PAGE
   ========================================================================= */
function CSSPage({ well, onOpenHistory }: { well: string; onOpenHistory?: () => void }) {
  const [d, setD] = useState<any>(null);
  const [opt, setOpt] = useState<any>(null);

  useEffect(() => {
    api.cssData(well).then((r) => setD(r.data)).catch(() => {});
  }, [well]);

  return (
    <div className="space-y-6">
      <PageIntro
        icon={Factory}
        title="CSS Cycle Optimization"
        text="Cyclic Steam Stimulation parameter tuning for the Baghewala field: optimize steam volume, soak hours, and reduce Steam-Oil Ratio (SOR)."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Steam Volume', d?.latest?.steam_volume_t, 'ton'],
          ['Injection Pressure', d?.latest?.injection_pressure_bar, 'bar'],
          ['Soak Time', d?.latest?.soak_hours, 'hr'],
          ['Production Cut-off', d?.latest?.production_cutoff_bopd, 'BOPD']
        ].map((x) => (
          <div className="glass rounded-2xl p-5 border border-slate-800" key={x[0]}>
            <p className="text-xs text-slate-400">{x[0]}</p>
            <p className="text-2xl font-black text-white mt-2">
              {fmt(x[1])} <span className="text-xs font-normal text-slate-400">{x[2]}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">AI CSS Recommendation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Objective: increase production mobility while conserving thermal energy and minimizing SOR.
            </p>
          </div>
          <button
            onClick={() => api.optimizeCSS(well).then((r) => setOpt(r.data))}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold text-xs btn-tactile shadow-md shadow-amber-500/20"
          >
            Compute Recommendation
          </button>
        </div>

        {opt && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {[
              ['Steam Target', opt.steam_volume_t, 'ton'],
              ['Injection Pressure', opt.injection_pressure_bar, 'bar'],
              ['Soak Duration', opt.soak_hours, 'hr'],
              ['Expected SOR', opt.expected_sor, 'ratio']
            ].map((x) => (
              <div
                key={x[0]}
                className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-4"
              >
                <p className="text-xs text-slate-400">{x[0]}</p>
                <b className="text-lg text-emerald-300 mt-1 block">
                  {fmt(x[1])} {x[2]}
                </b>
              </div>
            ))}
          </div>
        )}
      </div>

      <DataTable
        title={`CSS Cycle Historical Records (${well})`}
        rows={d?.records || []}
        onOpenHistory={onOpenHistory}
        badgeText="Baghewala Fleet History"
        columns={[
          ['Cycle', 'cycle_no'],
          ['Date', 'date'],
          ['Well ID', 'well_id'],
          ['Steam Volume (ton)', 'steam_volume_t'],
          ['Injection Pressure (bar)', 'injection_pressure_bar'],
          ['Soak Time (hr)', 'soak_hours'],
          ['Production Cut-off', 'production_cutoff_bopd'],
          ['Cum. Oil (ton)', 'cum_oil_t'],
          ['SOR', 'sor'],
          ['Cycle Status', 'status']
        ]}
      />
    </div>
  );
}

/* =========================================================================
   SRP OPTIMIZATION PAGE
   ========================================================================= */
function SRPPage({ well, onOpenHistory }: { well: string; onOpenHistory?: () => void }) {
  const [d, setD] = useState<any>(null);
  const [mlOpt, setMlOpt] = useState<any>(null);
  const [twin, setTwin] = useState<any>(null);

  useEffect(() => {
    const loadLiveSrpData = async () => {
      try {
        const [srpResponse, twinResponse] = await Promise.all([
          api.srpData(well),
          api.twinState()
        ]);
        setD(srpResponse.data);
        setTwin(twinResponse.data);
      } catch {}
    };

    loadLiveSrpData();
    const timer = window.setInterval(loadLiveSrpData, 2000);
    return () => window.clearInterval(timer);
  }, [well]);

  const items = [
    ['Live Stroke Length', 'stroke_m', 'm'],
    ['Live SPM', 'spm', 'SPM'],
    ['Live VFD Frequency', 'vfd_hz', 'Hz'],
    ['Live Pump Efficiency', 'pump_efficiency_pct', '%'],
    ['Live Rod Load', 'rod_load_kn', 'kN'],
    ['Live Rod-Floating Risk', 'rod_floating_risk', '%']
  ];

  const valueFor = (key: string) => {
    if (key === 'rod_floating_risk') {
      return `${Math.round((twin?.rod_floating_risk || 0) * 100)}`;
    }
    return twin?.[key] ?? d?.latest?.[key];
  };

  const recommendation = mlOpt?.recommendation;

  return (
    <div className="space-y-6">
      <PageIntro
        icon={CircleGauge}
        title="SRP Parameter Optimization"
        text="Real-time Sucker Rod Pump control and AI scenario optimization to prevent rod float and maximize lift efficiency."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(([label, key, unit]) => (
          <div className="glass rounded-2xl p-5 border border-slate-800" key={key}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-2xl font-black text-white mt-2">
              {fmt(valueFor(key))}
              <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Trained AI SRP Optimizer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Tests candidate speed and VFD frequencies using predicted production, energy use, and rod-floating probability.
            </p>
          </div>
          <button
            onClick={() =>
              api.twinSrpOptimization().then((response) => setMlOpt(response.data))
            }
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-400 to-blue-500 text-slate-950 font-bold text-xs btn-tactile"
          >
            Run Scenario Optimizer
          </button>
        </div>

        {recommendation && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <Stat label="Recommended SPM" value={`${recommendation.spm} SPM`} />
            <Stat label="Recommended VFD" value={`${recommendation.vfd_hz} Hz`} />
            <Stat
              label="Predicted Production"
              value={`${recommendation.predicted_oil_bopd} BOPD`}
            />
            <Stat
              label="Predicted Rod Risk"
              value={`${Math.round(recommendation.rod_risk_probability * 100)}%`}
              tone={
                recommendation.rod_risk_probability >= 0.5
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }
            />
          </div>
        )}

        {mlOpt?.explanation && (
          <p className="mt-4 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {mlOpt.explanation}
          </p>
        )}
      </div>

      <DataTable
        title={`Historical SRP Operational Telemetry (${well})`}
        rows={d?.records || []}
        onOpenHistory={onOpenHistory}
        badgeText="Baghewala Fleet History"
        columns={[
          ['Timestamp', 'timestamp'],
          ['Well ID', 'well_id'],
          ['Stroke (m)', 'stroke_m'],
          ['SPM', 'spm'],
          ['VFD (Hz)', 'vfd_hz'],
          ['Efficiency (%)', 'pump_efficiency_pct'],
          ['Rod Load (kN)', 'rod_load_kn'],
          ['Fluid Level (m)', 'fluid_level_m'],
          ['Operating Status', 'operating_status']
        ]}
      />
    </div>
  );
}

/* =========================================================================
   PREDICTIONS PAGE
   ========================================================================= */
function Predictions({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    api.predict(well).then((r) => setD(r.data)).catch(() => {});
  }, [well]);

  return (
    <div className="space-y-6">
      <PageIntro
        icon={BarChart3}
        title="Machine Learning Predictions"
        text="Explainable forecasts driven by trained production_model.pkl and thermodynamic sensitivity curves."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-400/10 text-amber-300">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Production Forecast</h3>
              <p className="text-xs text-slate-400">production_model.pkl / Local ML Service</p>
            </div>
          </div>

          <div className="mt-8 text-5xl font-black text-white">
            {fmt(d?.production?.next_day_production)}{' '}
            <span className="text-lg text-slate-400 font-normal">BOPD</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Predicted next virtual operating interval</p>

          <div className="grid grid-cols-2 gap-3 mt-7">
            <Stat label="7-Day Outlook" value={`${fmt(d?.production?.next_7_day_avg)} BOPD`} />
            <Stat
              label="Confidence Score"
              value={`${Math.round((d?.production?.confidence || 0) * 100)}%`}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-400/10 text-violet-300">
              <CircleGauge size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">SRP / CSS Operating Outlook</h3>
              <p className="text-xs text-slate-400">Closed-Loop Twin Recommendation Layer</p>
            </div>
          </div>

          <div className="space-y-3 mt-7">
            <Action
              title="Recommended SPM"
              value={`${fmt(d?.srp?.recommended_spm)} SPM`}
              tone="amber"
            />
            <Action
              title="Recommended VFD Frequency"
              value={`${fmt(d?.srp?.recommended_vfd_hz)} Hz`}
              tone="amber"
            />
            <Action
              title="Expected Rod-Float Risk After"
              value={`${Math.round((d?.srp?.rod_floating_risk_after || 0) * 100)}%`}
              tone="emerald"
            />
            <Action
              title="Expected CSS SOR"
              value={fmt(d?.css?.expected_sor)}
              tone="emerald"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ANOMALIES PAGE
   ========================================================================= */
function AnomaliesPage({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    api.anomalies(well).then((r) => setD(r.data)).catch(() => {});
  }, [well]);

  const current = d?.current || {};
  const pred = d?.predicted || {};

  return (
    <div className="space-y-6">
      <PageIntro
        icon={AlertTriangle}
        title="Anomaly & Risk Monitor"
        text="Side-by-side comparison between instantaneous field telemetry and forward-looking ML risk projections."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <AnomalyCard
          title="Instantaneous Condition"
          subtitle="Observed / Latest telemetry state"
          data={current}
        />
        <AnomalyCard
          title="Forward Risk Projection"
          subtitle="AI predictive horizon"
          data={pred}
        />
      </div>

      <div className="glass rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-white text-sm">Industrial Risk Matrix Interpretation</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The anomaly detection model evaluates five critical operational vectors: pump barrel condition, cyclic peak rod load, hydrodynamic rod-floating, prime mover thermal load, and premature production decline. Operators should apply the recommended VFD speed reduction when rod-floating risk crosses 50%.
        </p>
      </div>
    </div>
  );
}

function AnomalyCard({ title, subtitle, data }: any) {
  const fields = [
    ['Pump Condition', 'pump_condition'],
    ['Cyclic Rod Load', 'rod_load'],
    ['Rod Floating Risk', 'rod_floating'],
    ['Motor Condition', 'motor_condition'],
    ['Production Decline', 'production_decline']
  ];

  return (
    <div className="glass rounded-2xl p-6 border border-slate-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white text-base">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <AlertTriangle size={18} className="text-amber-400" />
      </div>

      <div className="mt-6 space-y-2.5">
        {fields.map((f) => {
          const val = String(data?.[f[1]] || 'NORMAL');
          const isCritical =
            val.toLowerCase().includes('high') ||
            val.toLowerCase().includes('critical') ||
            val.toLowerCase().includes('warning');

          return (
            <div
              key={f[0]}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800"
            >
              <span className="text-xs text-slate-400">{f[0]}</span>
              <b
                className={`text-xs font-bold ${
                  isCritical ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {val}
              </b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   ABOUT BAGHETWIN PAGE
   ========================================================================= */
function About() {
  return (
    <div className="space-y-6">
      <PageIntro
        icon={Info}
        title="About BAGHETWIN"
        text="Industrial Digital Twin & Heavy Oil Production Optimization Platform for Baghewala Field, Rajasthan Basin."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-6 lg:col-span-2 border border-slate-800 space-y-4">
          <h3 className="text-xl font-black text-white">
            Baghewala Well-to-Surface Industrial Intelligence
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The <b>BAGHETWIN</b> platform bridges surface lifting mechanics and subsurface reservoir thermodynamics for heavy oil operations. 
            By continuously coupling cyclic steam stimulation physics with high-fidelity sucker rod pump kinematics and explainable scikit-learn models, 
            BAGHETWIN enables field operators to optimize lift efficiency, prevent catastrophic rod-floating failures, and minimize Steam-Oil Ratio (SOR).
          </p>

          <div className="grid md:grid-cols-3 gap-3 pt-3">
            <Stat label="Frontend Architecture" value="React 19 + TypeScript + Three.js" />
            <Stat label="Backend Microservice" value="FastAPI + SQLAlchemy + Python 3.12" />
            <Stat label="Database Engine" value="PostgreSQL 16 + Resilient Fallback" />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h3 className="font-bold text-white text-base">Key Capabilities</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Unified 35-Well Fleet Monitoring
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Interactive 3D Rig Kinematics
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              CSS Thermal Cycle Optimization
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              SRP Speed & VFD Recommendation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Explainable ML Anomaly Detection
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              BAGHETWIN Copilot Industrial Assistant
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
