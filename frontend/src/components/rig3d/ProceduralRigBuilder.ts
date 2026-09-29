import * as THREE from 'three';
import { RigComponentId, RigVisibilityOptions } from '../../types/rig3d';
import { RIG_COMPONENTS_CATALOG } from './RigComponentsCatalog';
import { DEFAULT_RIG_GEOMETRY } from './RigKinematics';

export interface RigAssemblyRefs {
  rootGroup: THREE.Group;
  surfaceGroup: THREE.Group;
  subsurfaceGroup: THREE.Group;
  geologyGroup: THREE.Group;
  steamGroup: THREE.Group;
  fluidFlowGroup: THREE.Group;
  // Articulating sub-assemblies for animation:
  walkingBeamGroup: THREE.Group;
  crankGroup: THREE.Group;
  pitmanLeft: THREE.Mesh;
  pitmanRight: THREE.Mesh;
  polishedRodGroup: THREE.Group;
  plungerGroup: THREE.Group;
  motorRotorGroup: THREE.Group;
  bridleCables: THREE.LineSegments;
  // Mesh lookup for hit-testing and status updates
  componentMeshes: Map<RigComponentId, THREE.Mesh[]>;
}

export class ProceduralRigBuilder {
  private materials: Map<string, THREE.Material> = new Map();
  private geom = DEFAULT_RIG_GEOMETRY;

  constructor() {
    this.initMaterials();
  }

  private initMaterials() {
    // Industrial dark palette matching BagheTwin theme
    const createMat = (name: string, color: number, metalness = 0.5, roughness = 0.4, transparent = false, opacity = 1.0) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        transparent,
        opacity,
        side: THREE.DoubleSide
      });
      this.materials.set(name, mat);
      return mat;
    };

    createMat('steel_dark', 0x242e38, 0.7, 0.4);
    createMat('steel_structural', 0x3a4856, 0.6, 0.5);
    createMat('steel_yellow', 0xd9822b, 0.4, 0.4); // Industrial equipment orange/yellow
    createMat('steel_gold', 0xf59e0b, 0.6, 0.3); // Petroleum amber/gold equipment accent
    createMat('steel_polished', 0xd1d5db, 0.9, 0.15); // Stainless polished rod
    createMat('cast_iron', 0x1f2937, 0.8, 0.6); // Gearbox, motor casing
    createMat('concrete_pad', 0x334155, 0.1, 0.9); // Concrete foundation
    createMat('brass_valve', 0xd97706, 0.8, 0.3); // Valves & fittings
    createMat('piping_surface', 0x475569, 0.6, 0.4);
    createMat('casing_outer', 0x334155, 0.6, 0.5);
    createMat('tubing_inner', 0x64748b, 0.7, 0.3);
    createMat('geology_overburden', 0x1e293b, 0.05, 0.95, true, 0.35);
    createMat('geology_caprock', 0x0f172a, 0.1, 0.9, true, 0.75);
    createMat('geology_reservoir', 0x78350f, 0.15, 0.85, true, 0.65);
    createMat('steam_glow', 0xf97316, 0.2, 0.2, true, 0.8);
    createMat('crude_fluid', 0x09090b, 0.3, 0.2, true, 0.85);
  }

  public getMaterial(name: string): THREE.Material {
    return this.materials.get(name) || this.materials.get('steel_structural')!;
  }

  public buildRig(): RigAssemblyRefs {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'OilRig_Root';

    const surfaceGroup = new THREE.Group();
    surfaceGroup.name = 'Surface_Equipment';

    const subsurfaceGroup = new THREE.Group();
    subsurfaceGroup.name = 'Subsurface_Equipment';

    const geologyGroup = new THREE.Group();
    geologyGroup.name = 'Geological_Strata';

    const steamGroup = new THREE.Group();
    steamGroup.name = 'Steam_Injection_System';

    const fluidFlowGroup = new THREE.Group();
    fluidFlowGroup.name = 'Fluid_Flow_Dynamics';

    const componentMeshes = new Map<RigComponentId, THREE.Mesh[]>();
    const registerMesh = (id: RigComponentId, mesh: THREE.Mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.componentId = id;
      mesh.userData.componentName = RIG_COMPONENTS_CATALOG[id].name;
      mesh.userData.category = RIG_COMPONENTS_CATALOG[id].category;
      mesh.userData.baseMaterial = mesh.material;

      if (!componentMeshes.has(id)) {
        componentMeshes.set(id, []);
      }
      componentMeshes.get(id)!.push(mesh);
    };

    // ==========================================
    // 1. SURFACE EQUIPMENT
    // ==========================================

    // A. Concrete Pad & Skid Base
    const padGeo = new THREE.BoxGeometry(11.0, 0.4, 4.2);
    const padMesh = new THREE.Mesh(padGeo, this.getMaterial('concrete_pad'));
    padMesh.position.set(0.5, -0.2, 0);
    registerMesh('pump_jack_base', padMesh);
    surfaceGroup.add(padMesh);

    // Steel Skid Runners
    const runnerGeo = new THREE.BoxGeometry(9.6, 0.25, 0.3);
    const runnerLeft = new THREE.Mesh(runnerGeo, this.getMaterial('steel_structural'));
    runnerLeft.position.set(0.2, 0.125, 1.4);
    const runnerRight = new THREE.Mesh(runnerGeo, this.getMaterial('steel_structural'));
    runnerRight.position.set(0.2, 0.125, -1.4);
    registerMesh('pump_jack_base', runnerLeft);
    registerMesh('pump_jack_base', runnerRight);
    surfaceGroup.add(runnerLeft, runnerRight);

    // Skid Cross-members
    for (let x = -4.0; x <= 4.0; x += 1.6) {
      const crossGeo = new THREE.BoxGeometry(0.25, 0.22, 2.8);
      const crossMesh = new THREE.Mesh(crossGeo, this.getMaterial('steel_dark'));
      crossMesh.position.set(x, 0.11, 0);
      registerMesh('pump_jack_base', crossMesh);
      surfaceGroup.add(crossMesh);
    }

    // B. Samson Post A-Frame (Center Pivot at X = 0, Y = 4.8)
    const legRadius = 0.14;
    const legHeight = 4.95;
    const legGeo = new THREE.CylinderGeometry(legRadius * 0.8, legRadius, legHeight, 12);

    // 4 inclined legs forming the pyramid A-frame
    const legConfigs = [
      { startX: -1.2, startZ: 1.1, endX: 0.0, endZ: 0.35 },
      { startX: -1.2, startZ: -1.1, endX: 0.0, endZ: -0.35 },
      { startX: 1.2, startZ: 1.1, endX: 0.0, endZ: 0.35 },
      { startX: 1.2, startZ: -1.1, endX: 0.0, endZ: -0.35 }
    ];

    legConfigs.forEach((cfg) => {
      const start = new THREE.Vector3(cfg.startX, 0.25, cfg.startZ);
      const end = new THREE.Vector3(cfg.endX, this.geom.pivotHeight, cfg.endZ);
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(legRadius * 0.8, legRadius, len, 12),
        this.getMaterial('steel_gold')
      );
      leg.position.copy(mid);
      leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      registerMesh('samson_post', leg);
      surfaceGroup.add(leg);
    });

    // Horizontal & diagonal braces on Samson Post
    const braceGeo = new THREE.BoxGeometry(0.12, 0.12, 1.8);
    const braceMid = new THREE.Mesh(braceGeo, this.getMaterial('steel_dark'));
    braceMid.position.set(0, 2.4, 0);
    registerMesh('samson_post', braceMid);
    surfaceGroup.add(braceMid);

    // Center Saddle Bearing Housing at top of Samson post
    const saddleGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.1, 16);
    saddleGeo.rotateX(Math.PI / 2);
    const saddleMesh = new THREE.Mesh(saddleGeo, this.getMaterial('steel_yellow'));
    saddleMesh.position.set(0, this.geom.pivotHeight, 0);
    registerMesh('samson_post', saddleMesh);
    surfaceGroup.add(saddleMesh);

    // C. Walking Beam & Horsehead Assembly (Articulating Group)
    const walkingBeamGroup = new THREE.Group();
    walkingBeamGroup.name = 'WalkingBeam_Assembly';
    walkingBeamGroup.position.set(0, this.geom.pivotHeight, 0);

    // Walking Beam body (I-beam structural member)
    const beamLength = this.geom.frontBeamLength + this.geom.rearBeamLength;
    const beamOffset = (this.geom.frontBeamLength - this.geom.rearBeamLength) / 2;

    // Web
    const webGeo = new THREE.BoxGeometry(beamLength, 0.65, 0.1);
    const webMesh = new THREE.Mesh(webGeo, this.getMaterial('steel_gold'));
    webMesh.position.set(beamOffset, 0, 0);
    registerMesh('walking_beam', webMesh);
    walkingBeamGroup.add(webMesh);

    // Top & Bottom Flanges
    const flangeGeo = new THREE.BoxGeometry(beamLength, 0.08, 0.45);
    const topFlange = new THREE.Mesh(flangeGeo, this.getMaterial('steel_dark'));
    topFlange.position.set(beamOffset, 0.34, 0);
    const bottomFlange = new THREE.Mesh(flangeGeo, this.getMaterial('steel_dark'));
    bottomFlange.position.set(beamOffset, -0.34, 0);
    registerMesh('walking_beam', topFlange);
    registerMesh('walking_beam', bottomFlange);
    walkingBeamGroup.add(topFlange, bottomFlange);

    // Equalizer crossbar at rear of walking beam (X = -rearBeamLength)
    const equalizerGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12);
    equalizerGeo.rotateX(Math.PI / 2);
    const equalizerMesh = new THREE.Mesh(equalizerGeo, this.getMaterial('steel_yellow'));
    equalizerMesh.position.set(-this.geom.rearBeamLength, 0, 0);
    registerMesh('pitman_arm', equalizerMesh);
    walkingBeamGroup.add(equalizerMesh);

    // Horsehead mounted on front of walking beam (X = frontBeamLength)
    const horseheadGroup = new THREE.Group();
    horseheadGroup.name = 'Horsehead_Subgroup';
    horseheadGroup.position.set(this.geom.frontBeamLength, 0, 0);

    // Curved front arc of Horsehead (Torus / curved sector)
    const arcGeo = new THREE.TorusGeometry(1.6, 0.15, 12, 24, Math.PI * 0.55);
    arcGeo.rotateZ(Math.PI * 0.95);
    const arcMesh = new THREE.Mesh(arcGeo, this.getMaterial('steel_yellow'));
    arcMesh.position.set(0.1, -0.4, 0);
    registerMesh('horsehead', arcMesh);
    horseheadGroup.add(arcMesh);

    // Horsehead side web plates
    const hhWebGeo = new THREE.BoxGeometry(1.2, 1.1, 0.28);
    const hhWebMesh = new THREE.Mesh(hhWebGeo, this.getMaterial('steel_dark'));
    hhWebMesh.position.set(-0.35, -0.2, 0);
    registerMesh('horsehead', hhWebMesh);
    horseheadGroup.add(hhWebMesh);

    walkingBeamGroup.add(horseheadGroup);
    surfaceGroup.add(walkingBeamGroup);

    // D. Gearbox Speed Reducer
    const gearBoxGeo = new THREE.BoxGeometry(1.6, 1.4, 1.5);
    const gearBoxMesh = new THREE.Mesh(gearBoxGeo, this.getMaterial('cast_iron'));
    gearBoxMesh.position.set(this.geom.crankCenterX, 1.0, 0);
    registerMesh('gearbox', gearBoxMesh);
    surfaceGroup.add(gearBoxMesh);

    // Gearbox slow-speed output shaft
    const gearShaftGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16);
    gearShaftGeo.rotateX(Math.PI / 2);
    const gearShaft = new THREE.Mesh(gearShaftGeo, this.getMaterial('steel_polished'));
    gearShaft.position.set(this.geom.crankCenterX, this.geom.crankCenterY, 0);
    registerMesh('gearbox', gearShaft);
    surfaceGroup.add(gearShaft);

    // E. Crank & Counterweight Assembly (Articulating Group)
    const crankGroup = new THREE.Group();
    crankGroup.name = 'Crank_Counterweight_Assembly';
    crankGroup.position.set(this.geom.crankCenterX, this.geom.crankCenterY, 0);

    // Twin Crank Arms & Heavy Counterweight Slabs
    const crankArmLength = this.geom.crankRadius * 1.35;
    const crankArmGeo = new THREE.BoxGeometry(0.24, crankArmLength, 0.16);

    const crankLeft = new THREE.Mesh(crankArmGeo, this.getMaterial('steel_structural'));
    crankLeft.position.set(0, crankArmLength * 0.25, 1.05);

    const crankRight = new THREE.Mesh(crankArmGeo, this.getMaterial('steel_structural'));
    crankRight.position.set(0, crankArmLength * 0.25, -1.05);

    // Counterweight heavy slabs attached to crank arms
    const weightGeo = new THREE.BoxGeometry(0.85, 0.85, 0.35);
    const weightLeft = new THREE.Mesh(weightGeo, this.getMaterial('steel_yellow'));
    weightLeft.position.set(0, crankArmLength * 0.45, 1.05);

    const weightRight = new THREE.Mesh(weightGeo, this.getMaterial('steel_yellow'));
    weightRight.position.set(0, crankArmLength * 0.45, -1.05);

    // Crank Pins connecting to Pitman arms
    const pinGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 12);
    pinGeo.rotateX(Math.PI / 2);
    const pinLeft = new THREE.Mesh(pinGeo, this.getMaterial('steel_polished'));
    pinLeft.position.set(0, -this.geom.crankRadius, 1.05);

    const pinRight = new THREE.Mesh(pinGeo, this.getMaterial('steel_polished'));
    pinRight.position.set(0, -this.geom.crankRadius, -1.05);

    registerMesh('crank_counterweight', crankLeft);
    registerMesh('crank_counterweight', crankRight);
    registerMesh('crank_counterweight', weightLeft);
    registerMesh('crank_counterweight', weightRight);

    crankGroup.add(crankLeft, crankRight, weightLeft, weightRight, pinLeft, pinRight);
    surfaceGroup.add(crankGroup);

    // F. Pitman Arms (Connecting Links)
    const pitmanGeo = new THREE.CylinderGeometry(0.08, 0.08, this.geom.pitmanLength, 12);
    const pitmanLeft = new THREE.Mesh(pitmanGeo, this.getMaterial('steel_structural'));
    const pitmanRight = new THREE.Mesh(pitmanGeo, this.getMaterial('steel_structural'));
    registerMesh('pitman_arm', pitmanLeft);
    registerMesh('pitman_arm', pitmanRight);
    surfaceGroup.add(pitmanLeft, pitmanRight);

    // G. Electric Prime Mover & V-Belt Drive
    const motorGroup = new THREE.Group();
    motorGroup.name = 'Electric_Motor_Assembly';
    motorGroup.position.set(-4.2, 0.65, 0);

    const motorBodyGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 16);
    motorBodyGeo.rotateZ(Math.PI / 2);
    const motorBody = new THREE.Mesh(motorBodyGeo, this.getMaterial('cast_iron'));

    // Motor Pulley / Rotor
    const motorRotorGroup = new THREE.Group();
    const pulleyGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.3, 16);
    pulleyGeo.rotateX(Math.PI / 2);
    const motorPulley = new THREE.Mesh(pulleyGeo, this.getMaterial('steel_polished'));
    motorPulley.position.set(0.6, 0, 0);
    motorRotorGroup.add(motorPulley);

    // Motor Terminal Box
    const termGeo = new THREE.BoxGeometry(0.3, 0.3, 0.25);
    const termBox = new THREE.Mesh(termGeo, this.getMaterial('steel_yellow'));
    termBox.position.set(0, 0.5, 0.3);

    registerMesh('electric_motor', motorBody);
    registerMesh('electric_motor', motorPulley);
    registerMesh('electric_motor', termBox);

    motorGroup.add(motorBody, motorRotorGroup, termBox);
    surfaceGroup.add(motorGroup);

    // V-Belts connecting motor to gearbox
    const beltGeo = new THREE.BoxGeometry(1.6, 0.06, 0.2);
    const belt = new THREE.Mesh(beltGeo, this.getMaterial('steel_dark'));
    belt.position.set(-3.4, 0.65, 0);
    registerMesh('electric_motor', belt);
    surfaceGroup.add(belt);

    // H. VFD Control Console & SCADA RTU Cabinet
    const vfdGeo = new THREE.BoxGeometry(0.9, 1.8, 0.7);
    const vfdMesh = new THREE.Mesh(vfdGeo, this.getMaterial('steel_structural'));
    vfdMesh.position.set(-4.2, 1.15, -1.8);

    // VFD status beacon on top (Green/Amber/Red indicator)
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 12);
    const beaconMesh = new THREE.Mesh(beaconGeo, this.getMaterial('steam_glow'));
    beaconMesh.position.set(-4.2, 2.15, -1.8);

    // VFD screen panel
    const screenGeo = new THREE.BoxGeometry(0.4, 0.3, 0.02);
    const screenMesh = new THREE.Mesh(screenGeo, this.getMaterial('steel_gold'));
    screenMesh.position.set(-3.74, 1.45, -1.8);

    registerMesh('vfd_cabinet', vfdMesh);
    registerMesh('vfd_cabinet', beaconMesh);
    registerMesh('vfd_cabinet', screenMesh);
    surfaceGroup.add(vfdMesh, beaconMesh, screenMesh);

    // I. Wellhead Christmas Tree & Surface Production Piping
    const wellheadGroup = new THREE.Group();
    wellheadGroup.name = 'Wellhead_Assembly';
    wellheadGroup.position.set(this.geom.wellheadX, 0, 0);

    // Surface Casing Flange (Ground to Wellhead base)
    const flangeBaseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.3, 16);
    const flangeBase = new THREE.Mesh(flangeBaseGeo, this.getMaterial('steel_structural'));
    flangeBase.position.set(0, 0.15, 0);

    // Tubing Head Spool
    const spoolGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.5, 16);
    const spoolMesh = new THREE.Mesh(spoolGeo, this.getMaterial('steel_dark'));
    spoolMesh.position.set(0, 0.55, 0);

    // Master Gate Valves
    const valveGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 12);
    const masterValve = new THREE.Mesh(valveGeo, this.getMaterial('steel_structural'));
    masterValve.position.set(0, 0.95, 0);

    // Valve Handwheels
    const wheelGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
    wheelGeo.rotateY(Math.PI / 2);
    const wheelMesh = new THREE.Mesh(wheelGeo, this.getMaterial('brass_valve'));
    wheelMesh.position.set(0.3, 0.95, 0);

    // Stuffing Box on top of wellhead
    const stuffingGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.45, 16);
    const stuffingMesh = new THREE.Mesh(stuffingGeo, this.getMaterial('steel_yellow'));
    stuffingMesh.position.set(0, 1.35, 0);

    // Production Tee & Wing Valve
    const teeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.6, 12);
    teeGeo.rotateZ(Math.PI / 2);
    const teeMesh = new THREE.Mesh(teeGeo, this.getMaterial('steel_structural'));
    teeMesh.position.set(0.25, 0.8, 0);

    registerMesh('wellhead', flangeBase);
    registerMesh('wellhead', spoolMesh);
    registerMesh('wellhead', masterValve);
    registerMesh('wellhead', wheelMesh);
    registerMesh('wellhead', teeMesh);
    registerMesh('stuffing_box', stuffingMesh);

    wellheadGroup.add(flangeBase, spoolMesh, masterValve, wheelMesh, teeMesh, stuffingMesh);
    surfaceGroup.add(wellheadGroup);

    // Flowline leading away from Wellhead
    const flowlineGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 12);
    flowlineGeo.rotateZ(Math.PI / 2);
    const flowlineMesh = new THREE.Mesh(flowlineGeo, this.getMaterial('piping_surface'));
    flowlineMesh.position.set(this.geom.wellheadX + 2.0, 0.8, 0);
    registerMesh('flowline', flowlineMesh);
    surfaceGroup.add(flowlineMesh);

    // J. Polished Rod & Carrier Bar (Articulating Group)
    const polishedRodGroup = new THREE.Group();
    polishedRodGroup.name = 'PolishedRod_CarrierBar';
    polishedRodGroup.position.set(this.geom.wellheadX, 0, 0);

    // Carrier Bar
    const carrierBarGeo = new THREE.BoxGeometry(0.15, 0.12, 1.4);
    const carrierBar = new THREE.Mesh(carrierBarGeo, this.getMaterial('steel_yellow'));
    carrierBar.position.set(0, 3.8, 0);

    // Stainless Steel Polished Rod (extends into stuffing box)
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.2, 12);
    const polishedRod = new THREE.Mesh(rodGeo, this.getMaterial('steel_polished'));
    polishedRod.position.set(0, 2.0, 0);

    registerMesh('bridle_cable', carrierBar);
    registerMesh('sucker_rod_string', polishedRod);
    polishedRodGroup.add(carrierBar, polishedRod);
    surfaceGroup.add(polishedRodGroup);

    // Bridle Wire Rope lines (dynamically updated in render loop)
    const bridleGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(this.geom.wellheadX, 5.0, 0.5),
      new THREE.Vector3(this.geom.wellheadX, 3.8, 0.5),
      new THREE.Vector3(this.geom.wellheadX, 5.0, -0.5),
      new THREE.Vector3(this.geom.wellheadX, 3.8, -0.5)
    ]);
    const bridleMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    const bridleCables = new THREE.LineSegments(bridleGeo, bridleMat);
    bridleCables.userData.componentId = 'bridle_cable';
    surfaceGroup.add(bridleCables);

    // ==========================================
    // 2. SUBSURFACE EQUIPMENT & GEOLOGY
    // ==========================================

    // A. Subsurface Wellbore Casing Strings
    // Surface Casing (0 to -4m visual depth)
    const sCasingGeo = new THREE.CylinderGeometry(0.48, 0.48, 4.0, 24, 1, true);
    const sCasingMesh = new THREE.Mesh(sCasingGeo, this.getMaterial('casing_outer'));
    sCasingMesh.position.set(this.geom.wellheadX, -2.0, 0);
    registerMesh('surface_casing', sCasingMesh);
    subsurfaceGroup.add(sCasingMesh);

    // Production Casing (0 to -14m visual depth)
    const pCasingGeo = new THREE.CylinderGeometry(0.36, 0.36, 14.0, 24, 1, true);
    const pCasingMesh = new THREE.Mesh(pCasingGeo, this.getMaterial('casing_outer'));
    pCasingMesh.position.set(this.geom.wellheadX, -7.0, 0);
    registerMesh('production_casing', pCasingMesh);
    subsurfaceGroup.add(pCasingMesh);

    // Production Tubing string (0 to -11.5m visual depth)
    const tubingGeo = new THREE.CylinderGeometry(0.18, 0.18, 11.5, 20, 1, true);
    const tubingMesh = new THREE.Mesh(tubingGeo, this.getMaterial('tubing_inner'));
    tubingMesh.position.set(this.geom.wellheadX, -5.75, 0);
    registerMesh('production_tubing', tubingMesh);
    subsurfaceGroup.add(tubingMesh);

    // Sucker Rod String inside Tubing
    const rodStringGeo = new THREE.CylinderGeometry(0.035, 0.035, 11.0, 10);
    const rodStringMesh = new THREE.Mesh(rodStringGeo, this.getMaterial('steel_polished'));
    rodStringMesh.position.set(this.geom.wellheadX, -5.5, 0);
    registerMesh('sucker_rod_string', rodStringMesh);
    subsurfaceGroup.add(rodStringMesh);

    // Rod Guides / Centralizers placed periodically along sucker rod
    for (let y = -1.5; y >= -10.5; y -= 2.2) {
      const guideGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.25, 8);
      const guideMesh = new THREE.Mesh(guideGeo, this.getMaterial('steel_yellow'));
      guideMesh.position.set(this.geom.wellheadX, y, 0);
      registerMesh('sucker_rod_string', guideMesh);
      subsurfaceGroup.add(guideMesh);
    }

    // Downhole Pump Barrel (Stator at Y = -11.5 to -13.5m)
    const barrelGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.2, 20, 1, true);
    const barrelMesh = new THREE.Mesh(barrelGeo, this.getMaterial('steel_gold'));
    barrelMesh.position.set(this.geom.wellheadX, -12.4, 0);
    registerMesh('downhole_pump_barrel', barrelMesh);
    subsurfaceGroup.add(barrelMesh);

    // Standing Valve (at bottom of barrel)
    const sValveGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const sValveMesh = new THREE.Mesh(sValveGeo, this.getMaterial('brass_valve'));
    sValveMesh.position.set(this.geom.wellheadX, -13.4, 0);
    registerMesh('standing_valve', sValveMesh);
    subsurfaceGroup.add(sValveMesh);

    // Downhole Pump Plunger & Traveling Valve (Articulating Group)
    const plungerGroup = new THREE.Group();
    plungerGroup.name = 'Downhole_Plunger_Assembly';
    plungerGroup.position.set(this.geom.wellheadX, -12.0, 0);

    const plungerBodyGeo = new THREE.CylinderGeometry(0.17, 0.17, 1.4, 16);
    const plungerBody = new THREE.Mesh(plungerBodyGeo, this.getMaterial('steel_polished'));

    // Traveling Valve (inside plunger top)
    const tValveGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const tValveMesh = new THREE.Mesh(tValveGeo, this.getMaterial('brass_valve'));
    tValveMesh.position.set(0, 0.6, 0);

    registerMesh('pump_plunger', plungerBody);
    registerMesh('traveling_valve', tValveMesh);
    plungerGroup.add(plungerBody, tValveMesh);
    subsurfaceGroup.add(plungerGroup);

    // Casing Perforation Tunnels into Reservoir
    const perfGroup = new THREE.Group();
    perfGroup.name = 'Casing_Perforations';
    for (let y = -12.5; y >= -14.0; y -= 0.35) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        const tunnelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8);
        tunnelGeo.rotateZ(Math.PI / 2);
        const tunnel = new THREE.Mesh(tunnelGeo, this.getMaterial('cast_iron'));
        tunnel.position.set(
          this.geom.wellheadX + Math.cos(angle) * 0.55,
          y,
          Math.sin(angle) * 0.55
        );
        tunnel.rotation.y = angle;
        perfGroup.add(tunnel);
      }
    }
    perfGroup.children.forEach((c) => registerMesh('perforation_zone', c as THREE.Mesh));
    subsurfaceGroup.add(perfGroup);

    // B. Steam Injection Line (CSS Dual-Well Thermal Pathway)
    const steamPipeGeo = new THREE.CylinderGeometry(0.07, 0.07, 12.8, 12);
    const steamPipeMesh = new THREE.Mesh(steamPipeGeo, this.getMaterial('steam_glow'));
    steamPipeMesh.position.set(this.geom.wellheadX - 0.75, -6.4, 0.3);
    registerMesh('steam_injection_line', steamPipeMesh);
    steamGroup.add(steamPipeMesh);

    // Steam Nozzle Dispersion Rings at Reservoir Depth
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.5 + i * 0.4, 0.06, 8, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, this.getMaterial('steam_glow'));
      ringMesh.position.set(this.geom.wellheadX, -13.0 - i * 0.3, 0);
      steamGroup.add(ringMesh);
    }
    subsurfaceGroup.add(steamGroup);

    // C. Geological Strata
    // Overburden Layer (0 to -9.5m visual depth)
    const overburdenGeo = new THREE.BoxGeometry(10.0, 9.5, 8.0);
    const overburdenMesh = new THREE.Mesh(overburdenGeo, this.getMaterial('geology_overburden'));
    overburdenMesh.position.set(this.geom.wellheadX, -4.75, 0);
    registerMesh('geological_overburden', overburdenMesh);
    geologyGroup.add(overburdenMesh);

    // Dense Shale Caprock Layer (-9.5 to -11.5m visual depth)
    const caprockGeo = new THREE.BoxGeometry(10.0, 2.0, 8.0);
    const caprockMesh = new THREE.Mesh(caprockGeo, this.getMaterial('geology_caprock'));
    caprockMesh.position.set(this.geom.wellheadX, -10.5, 0);
    registerMesh('geological_caprock', caprockMesh);
    geologyGroup.add(caprockMesh);

    // Baghewala Sandstone Heavy-Oil Reservoir (-11.5 to -15.5m visual depth)
    const reservoirGeo = new THREE.BoxGeometry(10.0, 4.0, 8.0);
    const reservoirMesh = new THREE.Mesh(reservoirGeo, this.getMaterial('geology_reservoir'));
    reservoirMesh.position.set(this.geom.wellheadX, -13.5, 0);
    registerMesh('reservoir_sand', reservoirMesh);
    geologyGroup.add(reservoirMesh);

    subsurfaceGroup.add(geologyGroup);

    // Attach all groups to root
    rootGroup.add(surfaceGroup);
    rootGroup.add(subsurfaceGroup);

    return {
      rootGroup,
      surfaceGroup,
      subsurfaceGroup,
      geologyGroup,
      steamGroup,
      fluidFlowGroup,
      walkingBeamGroup,
      crankGroup,
      pitmanLeft,
      pitmanRight,
      polishedRodGroup,
      plungerGroup,
      motorRotorGroup,
      bridleCables,
      componentMeshes
    };
  }

  /**
   * Applies visibility settings to various subsystem groups
   */
  public updateVisibility(refs: RigAssemblyRefs, options: RigVisibilityOptions) {
    refs.surfaceGroup.visible = options.showSurface;
    refs.subsurfaceGroup.visible = options.showSubsurface;
    refs.geologyGroup.visible = options.showGeology;
    refs.steamGroup.visible = options.showSteamPath;

    // Apply wireframe toggle across all standard materials
    this.materials.forEach((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.wireframe = options.wireframe;
      }
    });
  }
}
