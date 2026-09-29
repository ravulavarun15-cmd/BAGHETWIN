export type RigComponentId =
  // Surface Components
  | 'pump_jack_base'
  | 'samson_post'
  | 'walking_beam'
  | 'horsehead'
  | 'pitman_arm'
  | 'crank_counterweight'
  | 'gearbox'
  | 'electric_motor'
  | 'vfd_cabinet'
  | 'wellhead'
  | 'stuffing_box'
  | 'flowline'
  | 'bridle_cable'
  // Subsurface Components
  | 'surface_casing'
  | 'production_casing'
  | 'production_tubing'
  | 'sucker_rod_string'
  | 'downhole_pump_barrel'
  | 'pump_plunger'
  | 'standing_valve'
  | 'traveling_valve'
  | 'reservoir_sand'
  | 'steam_injection_line'
  | 'perforation_zone'
  | 'geological_overburden'
  | 'geological_caprock';

export type ComponentCategory =
  | 'surface'
  | 'subsurface'
  | 'electrical'
  | 'mechanical'
  | 'hydraulic'
  | 'geological';

export type ComponentStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INACTIVE';

export interface RigComponentMetadata {
  id: RigComponentId;
  name: string;
  category: ComponentCategory;
  description: string;
  function: string;
  specifications: Record<string, string>;
  telemetryBinding?: {
    primaryValueKey?: string;
    unit?: string;
    label?: string;
  };
}

export type ViewMode = 'surface' | 'subsurface' | 'operational';

export interface RigAnimationState {
  isPlaying: boolean;
  speedMultiplier: number;
  syncWithLiveSpm: boolean;
  crankAngle: number;
  strokeFraction: number; // 0 (bottom of stroke) to 1 (top of stroke)
}

export interface RigVisibilityOptions {
  showSurface: boolean;
  showSubsurface: boolean;
  showGeology: boolean;
  showSteamPath: boolean;
  showFluidFlow: boolean;
  showLabels: boolean;
  wireframe: boolean;
}

export interface BlenderAssetOverride {
  componentId: RigComponentId;
  modelUrl: string;
  scale?: [number, number, number];
  rotation?: [number, number, number];
  positionOffset?: [number, number, number];
}

export interface BlenderAssetManifest {
  name: string;
  version: string;
  fullModelUrl?: string;
  overrides: BlenderAssetOverride[];
  source: 'procedural_fallback' | 'blender_glb';
}

export interface KinematicState {
  crankAngle: number; // radians
  walkingBeamAngle: number; // radians
  beamPivotAngle: number;
  horseheadTipY: number; // meters relative to base
  polishedRodY: number; // meters
  plungerY: number; // meters downhole
  crankPinX: number;
  crankPinY: number;
  motorRpm: number;
  currentSpm: number;
}
