import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  RigComponentId,
  ViewMode,
  RigAnimationState,
  RigVisibilityOptions,
  ComponentStatus
} from '../../types/rig3d';
import { ProceduralRigBuilder, RigAssemblyRefs } from './ProceduralRigBuilder';
import { computeRigKinematics, DEFAULT_RIG_GEOMETRY } from './RigKinematics';

interface RigCanvasProps {
  viewMode: ViewMode;
  selectedComponent: RigComponentId | null;
  onSelectComponent: (id: RigComponentId | null) => void;
  onHoverComponent: (id: RigComponentId | null, event?: { x: number; y: number }) => void;
  animationState: RigAnimationState;
  onUpdateCrankAngle: (angle: number) => void;
  visibility: RigVisibilityOptions;
  componentStatuses: Partial<Record<RigComponentId, ComponentStatus>>;
  liveSpm?: number;
  liveStrokeM?: number;
  isCssInjecting?: boolean;
}

export const RigCanvas: React.FC<RigCanvasProps> = ({
  viewMode,
  selectedComponent,
  onSelectComponent,
  onHoverComponent,
  animationState,
  onUpdateCrankAngle,
  visibility,
  componentStatuses,
  liveSpm = 5.5,
  liveStrokeM = 2.8,
  isCssInjecting = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const builderRef = useRef<ProceduralRigBuilder | null>(null);
  const assemblyRefs = useRef<RigAssemblyRefs | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Camera Orbit / Pan state
  const orbitState = useRef({
    isDragging: false,
    dragButton: 0, // 0 = rotate, 2 = pan
    lastX: 0,
    lastY: 0,
    theta: 0.85, // azimuthal angle
    phi: 1.28, // polar angle
    radius: 23.0,
    target: new THREE.Vector3(0.8, 1.2, 0.0),
    targetLerp: new THREE.Vector3(0.8, 1.2, 0.0),
    radiusLerp: 23.0,
    thetaLerp: 0.85,
    phiLerp: 1.28
  });

  const crankAngleRef = useRef(animationState.crankAngle);
  crankAngleRef.current = animationState.crankAngle;

  // View presets
  const applyViewModeCamera = (mode: ViewMode) => {
    const s = orbitState.current;
    if (mode === 'surface') {
      s.targetLerp.set(0.5, 2.8, 0.0);
      s.radiusLerp = 19.0;
      s.thetaLerp = 0.75;
      s.phiLerp = 1.25;
    } else if (mode === 'subsurface') {
      s.targetLerp.set(DEFAULT_RIG_GEOMETRY.wellheadX, -7.0, 0.0);
      s.radiusLerp = 22.0;
      s.thetaLerp = 0.65;
      s.phiLerp = 1.35;
    } else {
      // operational
      s.targetLerp.set(0.8, 1.2, 0.0);
      s.radiusLerp = 23.0;
      s.thetaLerp = 0.85;
      s.phiLerp = 1.28;
    }
  };

  useEffect(() => {
    applyViewModeCamera(viewMode);
  }, [viewMode]);

  // Update visibility when toggles change
  useEffect(() => {
    if (builderRef.current && assemblyRefs.current) {
      builderRef.current.updateVisibility(assemblyRefs.current, visibility);
    }
  }, [visibility]);

  // Three.js Mount & Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06111f);
    scene.fog = new THREE.FogExp2(0x06111f, 0.015);
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig (Industrial cinematic studio lighting)
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(12, 22, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xfbbf24, 0.45); // Subtle crude gold fill
    fillLight.position.set(-14, 10, -10);
    scene.add(fillLight);

    const underGlow = new THREE.DirectionalLight(0xf97316, 0.6); // Warm thermal flare orange subsurface rim
    underGlow.position.set(4, -18, 5);
    scene.add(underGlow);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(32, 32, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.4;
    scene.add(gridHelper);

    // 5. Build Procedural Rig
    const builder = new ProceduralRigBuilder();
    builderRef.current = builder;
    const refs = builder.buildRig();
    assemblyRefs.current = refs;
    scene.add(refs.rootGroup);

    // Raycaster & Mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedComponent = (e: MouseEvent): RigComponentId | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(refs.rootGroup.children, true);
      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== refs.rootGroup) {
          if (cur.userData.componentId) {
            return cur.userData.componentId as RigComponentId;
          }
          cur = cur.parent;
        }
      }
      return null;
    };

    // Event Handlers for Orbit & Interaction
    const onPointerDown = (e: MouseEvent) => {
      orbitState.current.isDragging = true;
      orbitState.current.dragButton = e.button;
      orbitState.current.lastX = e.clientX;
      orbitState.current.lastY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (orbitState.current.isDragging) {
        const dx = e.clientX - orbitState.current.lastX;
        const dy = e.clientY - orbitState.current.lastY;
        orbitState.current.lastX = e.clientX;
        orbitState.current.lastY = e.clientY;

        if (orbitState.current.dragButton === 0) {
          // Orbit rotate
          orbitState.current.thetaLerp -= dx * 0.007;
          orbitState.current.phiLerp = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, orbitState.current.phiLerp - dy * 0.007)
          );
        } else if (orbitState.current.dragButton === 2 || e.shiftKey) {
          // Pan
          const panSpeed = orbitState.current.radius * 0.0012;
          const forward = new THREE.Vector3().subVectors(camera.position, orbitState.current.target).normalize();
          const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
          const up = new THREE.Vector3().crossVectors(forward, right).normalize();

          orbitState.current.targetLerp.addScaledVector(right, -dx * panSpeed);
          orbitState.current.targetLerp.addScaledVector(up, dy * panSpeed);
        }
      } else {
        // Hover Raycast
        const hitId = getIntersectedComponent(e);
        onHoverComponent(hitId, { x: e.clientX, y: e.clientY });
        container.style.cursor = hitId ? 'pointer' : 'default';
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      if (orbitState.current.isDragging) {
        // If minimal movement, treat as a selection click
        const dx = Math.abs(e.clientX - orbitState.current.lastX);
        const dy = Math.abs(e.clientY - orbitState.current.lastY);
        if (dx < 4 && dy < 4 && e.button === 0) {
          const hitId = getIntersectedComponent(e);
          onSelectComponent(hitId);
        }
      }
      orbitState.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitState.current.radiusLerp = Math.max(
        4.0,
        Math.min(50.0, orbitState.current.radiusLerp + e.deltaY * 0.015)
      );
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('resize', onResize);

    // Initial View setup
    applyViewModeCamera(viewMode);

    // 6. Animation Render Loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update crank angle if playing
      if (animationState.isPlaying) {
        const effectiveSpm = animationState.syncWithLiveSpm ? liveSpm : 5.5;
        // radians per second = SPM / 60 * 2*PI
        const omega = (effectiveSpm / 60) * 2 * Math.PI * animationState.speedMultiplier;
        const newAngle = (crankAngleRef.current + omega * delta) % (Math.PI * 2);
        crankAngleRef.current = newAngle;
        onUpdateCrankAngle(newAngle);
      }

      // Compute exact mechanical kinematics
      const k = computeRigKinematics(
        crankAngleRef.current,
        liveSpm,
        liveStrokeM,
        DEFAULT_RIG_GEOMETRY
      );

      // Apply kinematics to 3D subassemblies
      if (refs) {
        // Crank rotation
        refs.crankGroup.rotation.z = k.crankAngle;

        // Walking beam angular oscillation
        refs.walkingBeamGroup.rotation.z = k.walkingBeamAngle;

        // Pitman arms connecting crank pin to rear walking beam equalizer
        const rearX = -DEFAULT_RIG_GEOMETRY.rearBeamLength * Math.cos(k.walkingBeamAngle);
        const rearY = DEFAULT_RIG_GEOMETRY.pivotHeight - DEFAULT_RIG_GEOMETRY.rearBeamLength * Math.sin(k.walkingBeamAngle);

        const pitmanDirLeft = new THREE.Vector3(
          rearX - k.crankPinX,
          rearY - k.crankPinY,
          0
        );
        const pitmanMidLeft = new THREE.Vector3(
          (k.crankPinX + rearX) / 2,
          (k.crankPinY + rearY) / 2,
          1.05
        );
        refs.pitmanLeft.position.copy(pitmanMidLeft);
        refs.pitmanLeft.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          pitmanDirLeft.clone().normalize()
        );

        const pitmanMidRight = new THREE.Vector3(
          (k.crankPinX + rearX) / 2,
          (k.crankPinY + rearY) / 2,
          -1.05
        );
        refs.pitmanRight.position.copy(pitmanMidRight);
        refs.pitmanRight.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          pitmanDirLeft.clone().normalize()
        );

        // Polished rod & carrier bar vertical travel
        refs.polishedRodGroup.position.y = k.polishedRodY - 1.35;

        // Downhole pump plunger travel
        refs.plungerGroup.position.y = k.plungerY;

        // Motor rotor spinning
        refs.motorRotorGroup.rotation.x += delta * (k.motorRpm * 0.1047);

        // Update Bridle Wire lines
        const horseheadTipX = DEFAULT_RIG_GEOMETRY.wellheadX;
        const horseheadTipY = DEFAULT_RIG_GEOMETRY.pivotHeight + DEFAULT_RIG_GEOMETRY.frontBeamLength * Math.sin(k.walkingBeamAngle);
        const carrierY = 3.8 + (k.polishedRodY - 1.35);

        const positions = refs.bridleCables.geometry.attributes.position;
        if (positions) {
          positions.setXYZ(0, horseheadTipX, horseheadTipY, 0.45);
          positions.setXYZ(1, horseheadTipX, carrierY, 0.45);
          positions.setXYZ(2, horseheadTipX, horseheadTipY, -0.45);
          positions.setXYZ(3, horseheadTipX, carrierY, -0.45);
          positions.needsUpdate = true;
        }

        // Pulse steam thermal rings if in CSS Injection mode
        if (isCssInjecting && refs.steamGroup) {
          const pulse = 0.5 + 0.5 * Math.sin(currentTime * 0.005);
          refs.steamGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive = new THREE.Color(0xf97316);
              child.material.emissiveIntensity = 0.4 + 0.6 * pulse;
            }
          });
        }
      }

      // Smooth Orbit Camera Interpolation (Damping)
      const s = orbitState.current;
      s.theta += (s.thetaLerp - s.theta) * 0.08;
      s.phi += (s.phiLerp - s.phi) * 0.08;
      s.radius += (s.radiusLerp - s.radius) * 0.08;
      s.target.lerp(s.targetLerp, 0.08);

      camera.position.x = s.target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = s.target.y + s.radius * Math.cos(s.phi);
      camera.position.z = s.target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(s.target);

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Update component material highlights whenever selectedComponent or statuses change
  useEffect(() => {
    if (!assemblyRefs.current) return;
    const meshesMap = assemblyRefs.current.componentMeshes;

    meshesMap.forEach((meshes, componentId) => {
      const isSelected = selectedComponent === componentId;
      const status = componentStatuses[componentId] || 'NORMAL';

      meshes.forEach((mesh) => {
        if (!(mesh.material instanceof THREE.MeshStandardMaterial)) return;

        // Clone base material or use existing
        if (!mesh.userData.originalEmissive) {
          mesh.userData.originalEmissive = mesh.material.emissive.clone();
          mesh.userData.originalEmissiveIntensity = mesh.material.emissiveIntensity;
        }

        if (isSelected) {
          // Selected highlight: Rich petroleum crude gold glow
          mesh.material.emissive = new THREE.Color(0xfbbf24);
          mesh.material.emissiveIntensity = 0.7;
        } else if (status === 'CRITICAL') {
          // Critical fault highlight: Vivid rose-red glow
          mesh.material.emissive = new THREE.Color(0xf43f5e);
          mesh.material.emissiveIntensity = 0.65;
        } else if (status === 'WARNING') {
          // Warning highlight: Amber glow
          mesh.material.emissive = new THREE.Color(0xf59e0b);
          mesh.material.emissiveIntensity = 0.45;
        } else {
          // Restore normal base appearance
          mesh.material.emissive = mesh.userData.originalEmissive;
          mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity;
        }
      });
    });
  }, [selectedComponent, componentStatuses]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden select-none outline-none"
    />
  );
};
