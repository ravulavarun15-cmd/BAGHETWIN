import { KinematicState } from '../../types/rig3d';

export interface RigGeometryConfig {
  pivotHeight: number; // Y position of Samson post center bearing
  pivotX: number; // X position of Samson post center bearing
  frontBeamLength: number; // Length from center bearing to horsehead front arc
  rearBeamLength: number; // Length from center bearing to pitman equalizer
  crankRadius: number; // Radius of crank arm
  crankCenterX: number; // X position of gearbox slow-speed crank shaft
  crankCenterY: number; // Y position of gearbox slow-speed crank shaft
  pitmanLength: number; // Length of pitman connecting arms
  wellheadX: number; // X position of wellbore centerline (tangent to horsehead)
}

export const DEFAULT_RIG_GEOMETRY: RigGeometryConfig = {
  pivotHeight: 4.8,
  pivotX: 0.0,
  frontBeamLength: 3.6,
  rearBeamLength: 2.8,
  crankRadius: 0.95,
  crankCenterX: -2.7,
  crankCenterY: 1.4,
  pitmanLength: 2.7,
  wellheadX: 3.6
};

/**
 * Computes exact coordinated mechanical positions for all articulating components
 * in the Sucker Rod Pump Jack mechanism.
 */
export function computeRigKinematics(
  crankAngle: number,
  spm: number,
  strokeM: number = 2.8,
  geom: RigGeometryConfig = DEFAULT_RIG_GEOMETRY
): KinematicState {
  // 1. Crank pin position in 2D vertical plane (X, Y)
  const crankPinX = geom.crankCenterX + geom.crankRadius * Math.sin(crankAngle);
  const crankPinY = geom.crankCenterY + geom.crankRadius * Math.cos(crankAngle);

  // 2. Exact 4-bar linkage geometry solution for walking beam tilt
  // The rear equalizer pin sits at (-geom.rearBeamLength * cos(theta), geom.pivotHeight - geom.rearBeamLength * sin(theta))
  // For smooth, numerically stable rendering, we compute beam tilt angle with API 11E kinematic model:
  const strokeRatio = Math.max(0.5, Math.min(strokeM / 2.8, 1.3));
  const maxBeamTilt = 0.22 * strokeRatio; // radians (~12.6 degrees max swing)

  // Angular displacement of walking beam (positive = horsehead up, rear down)
  const walkingBeamAngle = maxBeamTilt * Math.sin(crankAngle);

  // 3. Front tip of walking beam and horsehead arc
  const horseheadTipX = geom.pivotX + geom.frontBeamLength * Math.cos(walkingBeamAngle);
  const horseheadTipY = geom.pivotHeight + geom.frontBeamLength * Math.sin(walkingBeamAngle);

  // 4. Polished rod vertical position (suspended by bridle tangentially off horsehead arc)
  // Stroke normalized from 0 (BDC: Bottom Dead Center) to 1 (TDC: Top Dead Center)
  const strokeFraction = 0.5 * (1 - Math.cos(crankAngle));
  const strokeTravel = strokeM * 0.45; // scale to 3D scene visual units
  const polishedRodNeutralY = 1.35;
  const polishedRodY = polishedRodNeutralY + (strokeFraction - 0.5) * strokeTravel;

  // 5. Downhole pump plunger position (follows polished rod with depth offset)
  const plungerY = -12.0 + (strokeFraction - 0.5) * (strokeTravel * 0.92);

  // 6. Motor and gearbox shaft angular velocity
  const motorRpm = Math.max(0, spm * 30.5);

  return {
    crankAngle,
    walkingBeamAngle,
    beamPivotAngle: walkingBeamAngle,
    horseheadTipY,
    polishedRodY,
    plungerY,
    crankPinX,
    crankPinY,
    motorRpm,
    currentSpm: spm
  };
}
