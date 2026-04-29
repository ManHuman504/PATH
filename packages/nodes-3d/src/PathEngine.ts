import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface PathEngineOptions {
  background?: number;
  fov?: number;
  gridSpacing?: number;
  pointSize?: number;
}

interface NodeHandle {
  group: THREE.Group;
  mesh: THREE.Mesh;
  target: THREE.Vector3;
}

export class PathEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private grid: THREE.Points;
  private gridUniforms: {
    uMouse: { value: THREE.Vector3 };
    uPointSize: { value: number };
    uBaseColor: { value: THREE.Color };
    uHotColor: { value: THREE.Color };
  };
  private raycaster: THREE.Raycaster;
  private mouseNdc: THREE.Vector2;
  private dragPlane: THREE.Plane;
  private dragPoint: THREE.Vector3;
  private dragOffset: THREE.Vector3;
  private draggingNode: NodeHandle | null = null;
  private nodes: NodeHandle[] = [];
  private animationId: number | null = null;

  constructor(container: HTMLElement, options: PathEngineOptions = {}) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.background ?? 0x000000);

    const fov = options.fov ?? 50;
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    this.camera.position.set(0, 12, 50);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    this.raycaster = new THREE.Raycaster();
    this.mouseNdc = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.dragPoint = new THREE.Vector3();
    this.dragOffset = new THREE.Vector3();

    this.gridUniforms = {
      uMouse: { value: new THREE.Vector3(9999, 9999, 0) },
      uPointSize: { value: options.pointSize ?? 0.08 },
      uBaseColor: { value: new THREE.Color(0.4, 0.4, 0.4) },
      uHotColor: { value: new THREE.Color(1, 1, 1) }
    };
    this.grid = this.createPointGrid(options.gridSpacing ?? 10);
    this.scene.add(this.grid);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(10, 20, 10);
    this.scene.add(directional);

    this.bindEvents();
    this.animate();
  }

  addNode(x: number, y: number, label: string): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, 0);

    const geometry = new RoundedBoxGeometry(8, 4.5, 2, 6, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b0b0b,
      roughness: 0.6,
      metalness: 0.2
    });
    const mesh = new THREE.Mesh(geometry, bodyMaterial);
    group.add(mesh);

    const texture = this.createLabelTexture(label);
    const faceGeometry = new THREE.PlaneGeometry(7.2, 3.8);
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.6,
      metalness: 0.1
    });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, 0, 1.05);
    group.add(face);

    this.scene.add(group);

    const handle: NodeHandle = {
      group,
      mesh,
      target: group.position.clone()
    };
    this.nodes.push(handle);

    return group;
  }

  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }

  private createPointGrid(spacing: number): THREE.Points {
    const half = 500;
    const size = Math.floor((half * 2) / spacing);
    const positions = new Float32Array((size + 1) * (size + 1) * 3);
    let i = 0;
    for (let x = -half; x <= half; x += spacing) {
      for (let y = -half; y <= half; y += spacing) {
        positions[i++] = x;
        positions[i++] = y;
        positions[i++] = 0;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: this.gridUniforms,
      vertexShader: `
        uniform float uPointSize;
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vec4 mvPosition = viewMatrix * world;
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uPointSize * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uMouse;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        varying vec3 vWorld;
        void main() {
          float d = distance(vWorld.xy, uMouse.xy);
          float strength = smoothstep(40.0, 0.0, d);
          vec3 color = mix(uBaseColor, uHotColor, strength);
          float alpha = mix(0.2, 1.0, strength);
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    return new THREE.Points(geometry, material);
  }

  private createLabelTexture(label: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const fallback = new THREE.Texture();
      fallback.needsUpdate = true;
      return fallback;
    }

    ctx.fillStyle = 'rgba(12, 12, 12, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(191, 160, 94, 0.9)';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = '#f0d18a';
    ctx.font = '600 32px Inter, sans-serif';
    ctx.fillText(label || 'Node', 24, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onMouseMove = (event: MouseEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPoint)) {
      this.gridUniforms.uMouse.value.copy(this.dragPoint);
    }

    if (this.draggingNode) {
      this.draggingNode.target.copy(this.dragPoint.add(this.dragOffset));
    }
  };

  private onMouseDown = (event: MouseEvent): void => {
    if (event.button !== 0) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodes.map(n => n.mesh));
    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const node = this.nodes.find(n => n.mesh === mesh) || null;
      if (node && this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPoint)) {
        this.draggingNode = node;
        this.dragOffset.copy(node.group.position).sub(this.dragPoint);
      }
    }
  };

  private onMouseUp = (): void => {
    this.draggingNode = null;
  };

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();

    // Smooth node movement
    this.nodes.forEach(node => {
      node.group.position.lerp(node.target, 0.2);
    });

    this.renderer.render(this.scene, this.camera);
  };
}