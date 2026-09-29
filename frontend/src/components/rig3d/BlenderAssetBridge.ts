import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BlenderAssetManifest, RigComponentId } from '../../types/rig3d';

export class BlenderAssetBridge {
  private loader: GLTFLoader;
  private loadedMeshes: Map<RigComponentId, THREE.Object3D> = new Map();
  private manifest: BlenderAssetManifest;

  constructor() {
    this.loader = new GLTFLoader();
    this.manifest = {
      name: 'BagheTwin Blender Asset Integration Layer',
      version: '1.0.0',
      source: 'procedural_fallback',
      overrides: []
    };
  }

  public getManifest(): BlenderAssetManifest {
    return this.manifest;
  }

  /**
   * Loads a custom GLTF/GLB model from URL or ArrayBuffer and binds its sub-meshes
   * to BagheTwin RigComponentIds based on node names.
   */
  public async loadCustomModel(
    source: string | ArrayBuffer,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; mappedComponents: string[]; rootObject: THREE.Object3D }> {
    return new Promise((resolve, reject) => {
      const onLoad = (gltf: any) => {
        const root = gltf.scene || gltf.scenes[0];
        const mapped: string[] = [];

        // Traverse loaded Blender hierarchy and index recognizable components
        root.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const cleanName = child.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const matchedId = this.matchComponentId(cleanName);

            if (matchedId) {
              child.userData.componentId = matchedId;
              child.userData.isBlenderAsset = true;
              this.loadedMeshes.set(matchedId, child);
              mapped.push(`${matchedId} -> ${child.name}`);
            }
          }
        });

        this.manifest.source = 'blender_glb';
        resolve({
          success: true,
          mappedComponents: mapped,
          rootObject: root
        });
      };

      const onError = (err: any) => {
        console.warn('Blender Asset Bridge: Failed to load GLTF model, reverting to procedural:', err);
        resolve({
          success: false,
          mappedComponents: [],
          rootObject: new THREE.Group()
        });
      };

      if (typeof source === 'string') {
        this.loader.load(
          source,
          onLoad,
          (xhr) => {
            if (xhr.total && onProgress) {
              onProgress((xhr.loaded / xhr.total) * 100);
            }
          },
          onError
        );
      } else {
        this.loader.parse(source, '', onLoad, onError);
      }
    });
  }

  /**
   * Matches Blender mesh object names against BagheTwin component IDs
   */
  private matchComponentId(nodeName: string): RigComponentId | null {
    if (nodeName.includes('walking_beam') || nodeName.includes('beam')) return 'walking_beam';
    if (nodeName.includes('horsehead') || nodeName.includes('horse_head')) return 'horsehead';
    if (nodeName.includes('samson') || nodeName.includes('post') || nodeName.includes('a_frame')) return 'samson_post';
    if (nodeName.includes('crank') || nodeName.includes('counterweight')) return 'crank_counterweight';
    if (nodeName.includes('pitman') || nodeName.includes('connecting_rod')) return 'pitman_arm';
    if (nodeName.includes('gear') || nodeName.includes('reducer')) return 'gearbox';
    if (nodeName.includes('motor') || nodeName.includes('engine')) return 'electric_motor';
    if (nodeName.includes('vfd') || nodeName.includes('cabinet') || nodeName.includes('scada')) return 'vfd_cabinet';
    if (nodeName.includes('wellhead') || nodeName.includes('christmas_tree') || nodeName.includes('xmas')) return 'wellhead';
    if (nodeName.includes('stuffing') || nodeName.includes('packing')) return 'stuffing_box';
    if (nodeName.includes('flowline') || nodeName.includes('pipe')) return 'flowline';
    if (nodeName.includes('tubing')) return 'production_tubing';
    if (nodeName.includes('casing')) return 'production_casing';
    if (nodeName.includes('sucker_rod') || nodeName.includes('rod')) return 'sucker_rod_string';
    if (nodeName.includes('pump_barrel') || nodeName.includes('barrel')) return 'downhole_pump_barrel';
    if (nodeName.includes('plunger')) return 'pump_plunger';
    if (nodeName.includes('reservoir') || nodeName.includes('sand')) return 'reservoir_sand';
    if (nodeName.includes('steam')) return 'steam_injection_line';
    return null;
  }

  public getComponentOverride(id: RigComponentId): THREE.Object3D | undefined {
    return this.loadedMeshes.get(id);
  }

  public clearOverrides(): void {
    this.loadedMeshes.clear();
    this.manifest.source = 'procedural_fallback';
  }
}
