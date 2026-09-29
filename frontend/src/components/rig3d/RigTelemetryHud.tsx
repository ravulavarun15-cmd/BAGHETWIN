import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Flame,
  Gauge,
  Maximize2,
  Minimize2,
  Move,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Zap,
  TrendingUp,
  X
} from 'lucide-react';
import { ViewMode } from '../../types/rig3d';

interface RigTelemetryHudProps {
  twinState: any;
  recommendation: any;
  viewMode: ViewMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDisturbance: () => void;
  onApplyRecommendation: () => void;
  onSetPhase: (phase: string) => void;
}

export const RigTelemetryHud: React.FC<RigTelemetryHudProps> = ({
  twinState,
  recommendation,
  viewMode,
  onStart,
  onPause,
  onReset,
  onDisturbance,
  onApplyRecommendation,
  onSetPhase
}) => {
  const isRunning = twinState?.simulation_status === 'RUNNING';
  const currentPhase = twinState?.current_phase || 'PRODUCTION';
  const rodRisk = Math.round((twinState?.rod_floating_risk || 0) * 100);
  const isHighRisk = rodRisk >= 50;

  // Dynagraph card visibility & position controls
  // Position options: 'bottom-right' (default, completely clear of rig), 'top-right', 'bottom-dock'
  const [dynagraphPos, setDynagraphPos] = useState<'bottom-right' | 'top-right' | 'bottom-dock'>('bottom-right');
  const [isDynagraphOpen, setIsDynagraphOpen] = useState(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  // Cycle position between Bottom-Right, Top-Right, and Bottom-Dock
  const cyclePosition = () => {
    setDynagraphPos((current) => {
      if (current === 'bottom-right') return 'top-right';
      if (current === 'top-right') return 'bottom-dock';
      return 'bottom-right';
    });
  };

  const getPositionClasses = () => {
    switch (dynagraphPos) {
      case 'top-right':
        return 'top-20 right-4';
      case 'bottom-dock':
        return 'bottom-20 left-4 max-w-xl';
      case 'bottom-right':
      default:
        return 'bottom-20 right-4';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10">
      {/* Top Floating Telemetry Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
        {/* Left: Well ID & State */}
        <div className="glass px-3.5 py-2 rounded-2xl flex items-center gap-2.5 border border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-black text-xs sm:text-sm text-white">
              {twinState?.well_id || 'BGW-001'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700/80" />

          <div className="text-xs text-slate-400 hidden sm:block">
            Phase:{' '}
            <span
              className={`font-bold ${
                currentPhase === 'INJECTION'
                  ? 'text-orange-400'
                  : currentPhase === 'SOAK'
                  ? 'text-violet-400'
                  : 'text-amber-300'
              }`}
            >
              {currentPhase}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700/80 hidden sm:block" />

          {/* Start / Pause / Reset buttons */}
          <div className="flex items-center gap-1">
            {isRunning ? (
              <button
                onClick={onPause}
                className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition"
                title="Pause Simulation"
              >
                <Pause size={13} />
              </button>
            ) : (
              <button
                onClick={onStart}
                className="p-1.5 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 transition"
                title="Start Simulation"
              >
                <Play size={13} />
              </button>
            )}
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Reset Well State"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Right: CSS Phase Quick-Selector & HUD Controls */}
        <div className="flex items-center gap-2">
          {/* Quick CSS Phase Buttons */}
          <div className="glass px-2 py-1 rounded-2xl hidden sm:flex items-center gap-1 border border-slate-700/60">
            {['INJECTION', 'SOAK', 'PRODUCTION'].map((phase) => (
              <button
                key={phase}
                onClick={() => onSetPhase(phase)}
                className={`px-2 py-1 rounded-xl text-[10px] font-bold transition ${
                  currentPhase === phase
                    ? phase === 'INJECTION'
                      ? 'bg-orange-500 text-white shadow-md'
                      : phase === 'SOAK'
                      ? 'bg-violet-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {phase === 'INJECTION' && <Flame size={11} className="inline mr-0.5" />}
                {phase}
              </button>
            ))}
          </div>

          {/* Toggle Dynagraph Card */}
          <button
            onClick={() => setIsDynagraphOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isDynagraphOpen
                ? 'bg-amber-500/25 border-amber-400/50 text-amber-200'
                : 'glass border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title="Toggle Sucker Rod Dynagraph"
          >
            <Activity size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Dynagraph</span>
          </button>

          {/* Minimize / Maximize All Overlays */}
          <button
            onClick={() => setIsHudCollapsed((c) => !c)}
            className="p-2 rounded-xl glass border border-slate-700/60 text-slate-400 hover:text-white transition"
            title={isHudCollapsed ? 'Show HUD Overlays' : 'Hide All HUD Overlays'}
          >
            {isHudCollapsed ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
      </div>

      {/* SUCKER ROD DYNAGRAPH PANEL - Repositioned out of the 3D rig's line of sight */}
      {isDynagraphOpen && !isHudCollapsed && (
        <div
          className={`absolute ${getPositionClasses()} pointer-events-auto w-full max-w-xs sm:max-w-sm glass p-4 rounded-2xl backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-black/80 animate-fade-in z-20`}
        >
          {/* Header with Position Switcher and Close button */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-amber-400/10 text-amber-400">
                <Activity size={13} />
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                  Sucker Rod Dynagraph
                </span>
                <span className="text-[9px] text-slate-400 block -mt-0.5">
                  Class I Reciprocating Lift
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Position Switcher Button */}
              <button
                onClick={cyclePosition}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition text-[10px] flex items-center gap-1 px-1.5"
                title={`Current: ${dynagraphPos}. Click to cycle position.`}
              >
                <Move size={11} />
                <span className="capitalize text-[9px] hidden sm:inline">{dynagraphPos.replace('-', ' ')}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsDynagraphOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Hide Dynagraph"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* 4 Key Sensor Readouts */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Surface Rod Load</div>
              <div className="font-black text-sm text-white mt-0.5">
                {(twinState?.rod_load_kn || 32).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kN</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Pump Vol. Eff.</div>
              <div className="font-black text-sm text-white mt-0.5">
                {(twinState?.pump_efficiency_pct || 78).toFixed(1)}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Crude Viscosity</div>
              <div className="font-black text-sm text-amber-300 mt-0.5">
                {(twinState?.oil_viscosity_cp || 1850).toFixed(0)} <span className="text-[10px] font-normal text-slate-400">cP</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Formation Temp</div>
              <div className="font-black text-sm text-amber-300 mt-0.5">
                {(twinState?.temperature_c || 62).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">°C</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to guarantee center 3D viewport remains 100% UNCLUTTERED */}
      <div className="flex-1" />

      {/* Bottom KPI Bar & Operational Triggers */}
      {!isHudCollapsed && (
        <div className="flex flex-wrap items-end justify-between gap-2.5 pointer-events-auto animate-fade-in-up">
          {/* Core Live Metrics */}
          <div className="flex flex-wrap gap-2">
            {/* Production */}
            <div className="glass px-3 py-1.5 rounded-2xl flex items-center gap-2.5 border border-slate-700/60 shadow-lg">
              <div className="p-1.5 rounded-xl bg-emerald-400/10 text-emerald-300">
                <TrendingUp size={15} />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Oil Rate</div>
                <div className="font-black text-xs sm:text-sm text-white">
                  {(twinState?.oil_bopd || 0).toFixed(1)}{' '}
                  <span className="text-[9px] text-slate-500 font-normal">BOPD</span>
                </div>
              </div>
            </div>

            {/* Speed */}
            <div className="glass px-3 py-1.5 rounded-2xl flex items-center gap-2.5 border border-slate-700/60 shadow-lg">
              <div className="p-1.5 rounded-xl bg-amber-400/10 text-amber-300">
                <Gauge size={15} />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Pumping Speed</div>
                <div className="font-black text-xs sm:text-sm text-white">
                  {(twinState?.spm || 5.5).toFixed(1)}{' '}
                  <span className="text-[9px] text-slate-500 font-normal">SPM</span>
                </div>
              </div>
            </div>

            {/* Rod Floating Risk Gauge */}
            <div className="glass px-3 py-1.5 rounded-2xl flex items-center gap-2.5 border border-slate-700/60 shadow-lg">
              <div
                className={`p-1.5 rounded-xl ${
                  isHighRisk
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'bg-emerald-400/10 text-emerald-300'
                }`}
              >
                {isHighRisk ? <ShieldAlert size={15} /> : <Zap size={15} />}
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Rod-Floating Risk</div>
                <div
                  className={`font-black text-xs sm:text-sm ${
                    isHighRisk ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {rodRisk}%
                </div>
              </div>
            </div>
          </div>

          {/* Disturbance & Safe Setting Triggers */}
          <div className="flex items-center gap-2">
            {isHighRisk && recommendation?.recommended_spm && (
              <button
                onClick={onApplyRecommendation}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <Zap size={13} /> Apply Safe Setting
              </button>
            )}

            <button
              onClick={onDisturbance}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 border border-slate-700/80 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-md"
              title="Inject high pump speed disturbance (8.0 SPM / 60 Hz) to test automatic digital twin risk mitigation"
            >
              <AlertTriangle size={13} /> Simulate High SPM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
