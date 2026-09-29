import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  CircleGauge,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Upload,
  Zap,
  Wrench,
  Activity
} from 'lucide-react';
import {
  RigComponentId,
  ViewMode,
  RigAnimationState,
  RigVisibilityOptions,
  ComponentStatus
} from '../../types/rig3d';
import { RigCanvas } from './RigCanvas';
import { RigInfoPanel } from './RigInfoPanel';
import { RigTelemetryHud } from './RigTelemetryHud';
import { BlenderAssetBridge } from './BlenderAssetBridge';
import * as api from '../../services/api';

interface Rig3DViewProps {
  wellId?: string;
}

export const Rig3DView: React.FC<Rig3DViewProps> = ({ wellId = 'BGW-001' }) => {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('operational');
  const [selectedComponent, setSelectedComponent] = useState<RigComponentId | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<RigComponentId | null>(null);

  // Digital Twin Live State
  const [twinState, setTwinState] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Mechanical Animation State
  const [animationState, setAnimationState] = useState<RigAnimationState>({
    isPlaying: true,
    speedMultiplier: 1.0,
    syncWithLiveSpm: true,
    crankAngle: 0,
    strokeFraction: 0.5
  });

  // Visibility options
  const [visibility, setVisibility] = useState<RigVisibilityOptions>({
    showSurface: true,
    showSubsurface: true,
    showGeology: true,
    showSteamPath: true,
    showFluidFlow: true,
    showLabels: true,
    wireframe: false
  });

  // UI Drawer / Panel collapsed state (collapsed by default to maximize 3D viewport)
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

  // Blender Asset Bridge
  const assetBridge = useMemo(() => new BlenderAssetBridge(), []);
  const [assetStatus, setAssetStatus] = useState<string>('Procedural Digital Twin');

  // Poll live digital twin state
  const fetchLiveTwin = async () => {
    try {
      const [stRes, recRes, predRes] = await Promise.all([
        api.twinState(),
        api.twinRecommendation(),
        api.twinPrediction()
      ]);
      setTwinState(stRes.data);
      setRecommendation(recRes.data);
      setPrediction(predRes.data);
      setIsDemoMode(false);
    } catch {
      // Fallback demo state if backend connection fails
      setIsDemoMode(true);
      if (!twinState) {
        setTwinState({
          well_id: wellId,
          simulation_status: 'RUNNING',
          current_phase: 'PRODUCTION',
          spm: 5.5,
          stroke_m: 2.8,
          vfd_hz: 45.0,
          pump_efficiency_pct: 78.0,
          rod_load_kn: 32.5,
          fluid_level_m: 940.0,
          oil_bopd: 42.0,
          temperature_c: 62.0,
          pressure_bar: 18.0,
          oil_viscosity_cp: 1850.0,
          energy_kwh: 120.0,
          rod_floating_risk: 0.22,
          pump_failure_risk: 0.15
        });
      }
    }
  };

  useEffect(() => {
    fetchLiveTwin();
    const interval = setInterval(fetchLiveTwin, 2000);
    return () => clearInterval(interval);
  }, [wellId]);

  // Compute component statuses driven by live telemetry
  const componentStatuses = useMemo<Partial<Record<RigComponentId, ComponentStatus>>>(() => {
    const statuses: Partial<Record<RigComponentId, ComponentStatus>> = {};
    if (!twinState) return statuses;

    const rodRisk = twinState.rod_floating_risk || 0;
    const pumpRisk = twinState.pump_failure_risk || 0;
    const vfdHz = twinState.vfd_hz || 45;
    const phase = twinState.current_phase || 'PRODUCTION';

    // Rod string & lifting assembly status
    if (rodRisk >= 0.5) {
      statuses.sucker_rod_string = 'CRITICAL';
      statuses.horsehead = 'CRITICAL';
      statuses.walking_beam = 'WARNING';
    } else if (rodRisk >= 0.35) {
      statuses.sucker_rod_string = 'WARNING';
      statuses.horsehead = 'WARNING';
    } else {
      statuses.sucker_rod_string = 'NORMAL';
      statuses.horsehead = 'NORMAL';
    }

    // Downhole pump status
    if (pumpRisk >= 0.5 || (twinState.pump_efficiency_pct || 78) < 60) {
      statuses.downhole_pump_barrel = 'CRITICAL';
      statuses.pump_plunger = 'CRITICAL';
    } else {
      statuses.downhole_pump_barrel = 'NORMAL';
      statuses.pump_plunger = 'NORMAL';
    }

    // Electrical prime mover & VFD
    if (vfdHz > 55.0) {
      statuses.vfd_cabinet = 'WARNING';
      statuses.electric_motor = 'WARNING';
    } else {
      statuses.vfd_cabinet = 'NORMAL';
      statuses.electric_motor = 'NORMAL';
    }

    // Steam injection pathway
    if (phase === 'INJECTION') {
      statuses.steam_injection_line = 'WARNING'; // Active heating
      statuses.perforation_zone = 'WARNING';
    }

    return statuses;
  }, [twinState]);

  // Handlers for Digital Twin actions
  const handleStart = async () => {
    try {
      const res = await api.twinStart();
      setTwinState(res.data);
    } catch {}
  };

  const handlePause = async () => {
    try {
      const res = await api.twinPause();
      setTwinState(res.data);
    } catch {}
  };

  const handleReset = async () => {
    try {
      const res = await api.twinReset();
      setTwinState(res.data);
    } catch {}
  };

  const handleDisturbance = async () => {
    try {
      const res = await api.twinHighSpeedDisturbance();
      setTwinState(res.data);
      fetchLiveTwin();
    } catch {}
  };

  const handleApplyRecommendation = async () => {
    try {
      const res = await api.twinApplyRecommendation();
      setTwinState(res.data);
      fetchLiveTwin();
    } catch {}
  };

  const handleSetPhase = async (phase: string) => {
    try {
      const res = await api.twinPhase(phase);
      setTwinState(res.data);
    } catch {}
  };

  // Custom Blender GLTF file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        setAssetStatus(`Loading Blender Asset: ${file.name}...`);
        const result = await assetBridge.loadCustomModel(buffer);
        if (result.success) {
          setAssetStatus(`Active Blender Asset: ${file.name} (${result.mappedComponents.length} mapped parts)`);
        } else {
          setAssetStatus('Blender load failed. Using procedural model.');
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[680px] w-full rounded-3xl overflow-hidden glass border border-slate-800/80">
      {/* Top Navigation & Controls Toolbar */}
      <div className="h-16 px-6 bg-[#071524]/90 border-b border-slate-800/80 flex items-center justify-between gap-4 flex-shrink-0 z-20">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => {
                setViewMode('surface');
                setVisibility((v) => ({ ...v, showSurface: true, showSubsurface: false, showGeology: false }));
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'surface'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CircleGauge size={14} /> Surface View
            </button>

            <button
              onClick={() => {
                setViewMode('subsurface');
                setVisibility((v) => ({ ...v, showSurface: false, showSubsurface: true, showGeology: true }));
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'subsurface'
                  ? 'bg-violet-400 text-slate-950 shadow-md shadow-violet-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={14} /> Subsurface View
            </button>

            <button
              onClick={() => {
                setViewMode('operational');
                setVisibility((v) => ({ ...v, showSurface: true, showSubsurface: true, showGeology: true }));
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'operational'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={14} /> Operational View
            </button>
          </div>

          {/* Demonstration Mode indicator if backend paused */}
          {isDemoMode && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-400/10 border border-amber-400/20 text-amber-300">
              Demo Simulation Active
            </span>
          )}
        </div>

        {/* Center: Animation Controls */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() =>
                setAnimationState((s) => ({ ...s, isPlaying: !s.isPlaying }))
              }
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                animationState.isPlaying
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {animationState.isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {animationState.isPlaying ? 'Reciprocating' : 'Paused'}
            </button>

            <button
              onClick={() =>
                setAnimationState((s) => ({ ...s, crankAngle: 0 }))
              }
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Stroke Position to TDC"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Speed:</span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={animationState.speedMultiplier}
              onChange={(e) =>
                setAnimationState((s) => ({
                  ...s,
                  speedMultiplier: parseFloat(e.target.value)
                }))
              }
              className="w-20 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-amber-300 w-8">
              {animationState.speedMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Right: Visibility Toggles & Blender Override */}
        <div className="flex items-center gap-2">
          {/* Wireframe toggle */}
          <button
            onClick={() =>
              setVisibility((v) => ({ ...v, wireframe: !v.wireframe }))
            }
            className={`p-2 rounded-xl text-xs font-semibold border transition ${
              visibility.wireframe
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Wireframe Skeleton"
          >
            <Box size={16} />
          </button>

          {/* Subsurface Geology toggle */}
          <button
            onClick={() =>
              setVisibility((v) => ({ ...v, showGeology: !v.showGeology }))
            }
            className={`p-2 rounded-xl text-xs font-semibold border transition ${
              visibility.showGeology
                ? 'bg-violet-400/20 border-violet-400/40 text-violet-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Subsurface Strata"
          >
            <Layers size={16} />
          </button>

          {/* Custom Blender Asset loader */}
          <label className="p-2 rounded-xl text-xs font-semibold border bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 cursor-pointer transition flex items-center gap-1.5" title="Load custom Blender .glb / .gltf model asset">
            <Upload size={16} />
            <span className="hidden sm:inline text-[11px]">Blender GLTF</span>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Info Panel toggle */}
          <button
            onClick={() => setIsInfoPanelOpen((o) => !o)}
            className={`p-2 rounded-xl text-xs font-semibold border transition ${
              visibility.wireframe // or inspect panel
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isInfoPanelOpen ? 'Hide Component Inspector' : 'Show Component Inspector'}
          >
            {isInfoPanelOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas & Side Inspector Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* 3D WebGL Canvas Viewport */}
        <div className="flex-1 relative h-full w-full bg-[#080d14]">
          <RigCanvas
            viewMode={viewMode}
            selectedComponent={selectedComponent}
            onSelectComponent={(id) => {
              setSelectedComponent(id);
              if (id) setIsInfoPanelOpen(true);
            }}
            onHoverComponent={(id) => setHoveredComponent(id)}
            animationState={animationState}
            onUpdateCrankAngle={(angle) =>
              setAnimationState((s) => ({ ...s, crankAngle: angle }))
            }
            visibility={visibility}
            componentStatuses={componentStatuses}
            liveSpm={twinState?.spm ?? 5.5}
            liveStrokeM={twinState?.stroke_m ?? 2.8}
            isCssInjecting={twinState?.current_phase === 'INJECTION'}
          />

          {/* Telemetry Heads-Up Display (HUD) */}
          <RigTelemetryHud
            twinState={twinState}
            recommendation={recommendation}
            viewMode={viewMode}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onDisturbance={handleDisturbance}
            onApplyRecommendation={handleApplyRecommendation}
            onSetPhase={handleSetPhase}
          />

          {/* Hover Tooltip Overlay */}
          {hoveredComponent && !selectedComponent && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl glass pointer-events-none text-xs text-white z-20 flex items-center gap-2 border border-amber-400/30 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Click to inspect: <b className="text-amber-300">{hoveredComponent.replace(/_/g, ' ').toUpperCase()}</b></span>
            </div>
          )}

          {/* Asset Architecture Badge */}
          <div className="absolute top-18 right-4 pointer-events-none z-10 hidden md:block">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400">
              <span className="text-amber-300 font-semibold">Engine:</span> {assetStatus}
            </div>
          </div>
        </div>

        {/* Right Inspection Panel */}
        {isInfoPanelOpen && (
          <div className="w-80 md:w-96 h-full flex-shrink-0 z-20 transition-all duration-300">
            <RigInfoPanel
              selectedId={selectedComponent}
              onSelect={(id) => setSelectedComponent(id)}
              twinState={twinState}
              recommendation={recommendation}
              componentStatuses={componentStatuses}
              onApplyRecommendation={handleApplyRecommendation}
            />
          </div>
        )}
      </div>
    </div>
  );
};
