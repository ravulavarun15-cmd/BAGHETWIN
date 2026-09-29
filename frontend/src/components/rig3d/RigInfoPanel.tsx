import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Layers,
  ShieldAlert,
  Sparkles,
  Wrench,
  X
} from 'lucide-react';
import { RigComponentId, ComponentStatus } from '../../types/rig3d';
import { RIG_COMPONENTS_CATALOG } from './RigComponentsCatalog';

interface RigInfoPanelProps {
  selectedId: RigComponentId | null;
  onSelect: (id: RigComponentId | null) => void;
  twinState: any;
  recommendation: any;
  componentStatuses: Partial<Record<RigComponentId, ComponentStatus>>;
  onApplyRecommendation?: () => void;
}

export const RigInfoPanel: React.FC<RigInfoPanelProps> = ({
  selectedId,
  onSelect,
  twinState,
  recommendation,
  componentStatuses,
  onApplyRecommendation
}) => {
  const metadata = selectedId ? RIG_COMPONENTS_CATALOG[selectedId] : null;
  const status = selectedId ? componentStatuses[selectedId] || 'NORMAL' : 'NORMAL';

  // Get live value for this component if bound
  const getLiveTelemetry = () => {
    if (!metadata?.telemetryBinding || !twinState) return null;
    const { primaryValueKey, unit, label } = metadata.telemetryBinding;
    if (!primaryValueKey) return null;

    let val = twinState[primaryValueKey];
    if (primaryValueKey === 'rod_floating_risk') {
      val = Math.round((val || 0) * 100);
    } else if (typeof val === 'number') {
      val = val.toFixed(1);
    }

    return { label, value: val ?? '—', unit };
  };

  const liveTel = getLiveTelemetry();

  const getStatusBadge = (s: ComponentStatus) => {
    switch (s) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <ShieldAlert size={14} /> CRITICAL ALERT
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <AlertTriangle size={14} /> WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 size={14} /> NORMAL
          </span>
        );
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'surface':
        return 'text-amber-300 bg-amber-400/10 border-amber-400/20';
      case 'subsurface':
        return 'text-violet-300 bg-violet-400/10 border-violet-400/20';
      case 'mechanical':
        return 'text-amber-300 bg-amber-400/10 border-amber-400/20';
      case 'electrical':
        return 'text-blue-300 bg-blue-400/10 border-blue-400/20';
      case 'hydraulic':
        return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20';
      case 'geological':
        return 'text-orange-300 bg-orange-400/10 border-orange-400/20';
      default:
        return 'text-slate-300 bg-slate-700/30 border-slate-600/30';
    }
  };

  if (!metadata) {
    // Quick-pick catalog when no component is selected
    const surfaceList: RigComponentId[] = [
      'horsehead',
      'walking_beam',
      'samson_post',
      'crank_counterweight',
      'gearbox',
      'electric_motor',
      'vfd_cabinet',
      'wellhead',
      'stuffing_box',
      'flowline'
    ];

    const subsurfaceList: RigComponentId[] = [
      'production_casing',
      'production_tubing',
      'sucker_rod_string',
      'downhole_pump_barrel',
      'pump_plunger',
      'standing_valve',
      'traveling_valve',
      'reservoir_sand',
      'steam_injection_line',
      'geological_caprock'
    ];

    return (
      <div className="h-full flex flex-col p-5 bg-[#0b1118]/95 backdrop-blur-xl border-l border-slate-800/80 overflow-y-auto">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-300/20">
            <Cpu className="text-amber-300" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Component Inspector</h3>
            <p className="text-[11px] text-slate-500">Click in 3D or select from list</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-amber-300/10">
          <p className="text-xs font-semibold text-amber-200">Interactive Digital Twin</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Rotate and zoom the 3D rig to inspect engineering kinematics, telemetry bindings, and AI operating status.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">
              Surface Equipment
            </div>
            <div className="space-y-1.5">
              {surfaceList.map((id) => {
                const comp = RIG_COMPONENTS_CATALOG[id];
                const s = componentStatuses[id] || 'NORMAL';
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 transition group text-left"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                        {comp.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">{comp.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s === 'CRITICAL'
                            ? 'bg-rose-400'
                            : s === 'WARNING'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">
              Subsurface & Reservoir
            </div>
            <div className="space-y-1.5">
              {subsurfaceList.map((id) => {
                const comp = RIG_COMPONENTS_CATALOG[id];
                const s = componentStatuses[id] || 'NORMAL';
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 transition group text-left"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 truncate">
                        {comp.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">{comp.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s === 'CRITICAL'
                            ? 'bg-rose-400'
                            : s === 'WARNING'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Selected Component View
  const isHighRisk = (selectedId === 'sucker_rod_string' || selectedId === 'horsehead' || selectedId === 'walking_beam') &&
    (twinState?.rod_floating_risk || 0) >= 0.5;

  return (
    <div className="h-full flex flex-col p-5 bg-[#081725]/95 backdrop-blur-xl border-l border-slate-800/80 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(
                metadata.category
              )}`}
            >
              {metadata.category}
            </span>
            {getStatusBadge(status)}
          </div>
          <h3 className="font-black text-lg text-white mt-1.5">{metadata.name}</h3>
        </div>

        <button
          onClick={() => onSelect(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Inspector"
        >
          <X size={18} />
        </button>
      </div>

      {/* Live Telemetry KPI if bound */}
      {liveTel && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-400/10 border border-amber-300/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
              Live Telemetry
            </span>
            <div className="text-xs text-slate-300 mt-0.5">{liveTel.label}</div>
          </div>
          <div className="text-2xl font-black text-white">
            {liveTel.value} <span className="text-xs font-normal text-amber-300">{liveTel.unit}</span>
          </div>
        </div>
      )}

      {/* AI Risk Alert & Recommendation */}
      {isHighRisk && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
            <AlertTriangle size={16} /> High Rod-Floating Stress Detected
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Viscous drag on rod downstroke is exceeding safe limits. Plunger buoyancy may cause rod buckling.
          </p>
          {recommendation?.action && (
            <div className="mt-3 pt-3 border-t border-rose-500/20">
              <span className="text-[10px] uppercase font-bold text-amber-300">AI Recommendation</span>
              <p className="text-xs font-semibold text-white mt-0.5">{recommendation.action}</p>
              {onApplyRecommendation && (
                <button
                  onClick={onApplyRecommendation}
                  className="mt-2.5 w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md shadow-amber-500/20 transition"
                >
                  Apply Safe SPM ({recommendation.recommended_spm} SPM)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Description & Function */}
      <div className="mt-5 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
            System Description
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{metadata.description}</p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
            Mechanical Function
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{metadata.function}</p>
        </div>

        {/* Technical Specifications */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
            <Wrench size={13} /> Engineering Specifications
          </div>
          <div className="space-y-2">
            {Object.entries(metadata.specifications).map(([key, val]) => (
              <div
                key={key}
                className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs"
              >
                <div className="text-[11px] text-slate-400">{key}</div>
                <div className="font-semibold text-slate-200 mt-0.5">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
