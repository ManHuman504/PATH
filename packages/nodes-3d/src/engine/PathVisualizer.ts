import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export interface PathVisualizerOptions {
  container: HTMLElement;
  backgroundColor?: number;
  gridSpacing?: number;
  fov?: number;
}

export class PathVisualizer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private cssScene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private webGLRenderer: THREE.WebGLRenderer;
  private cssRenderer: CSS3DRenderer;
  private controls: MapControls;
  private raycaster: THREE.Raycaster;
  private mouseNdc: THREE.Vector2;
  private mousePixel: THREE.Vector2;
  private mouseWorld: THREE.Vector3 = new THREE.Vector3();
  private dragPlane: THREE.Plane;
  private dragOffset: THREE.Vector3;
  private draggingNode: { gl: THREE.Mesh; css: CSS3DObject } | null = null;
  private backgroundScene: THREE.Scene | null = null;
  private backgroundCamera: THREE.OrthographicCamera | null = null;
  private gridUniforms: {
    uSpacing: { value: number };
    uDotRadius: { value: number };
    uBaseColor: { value: THREE.Color };
    uHotColor: { value: THREE.Color };
    uMouse: { value: THREE.Vector2 };
    uMouseRadius: { value: number };
    uResolution: { value: THREE.Vector2 };
    uOffset: { value: THREE.Vector2 };
    uPixelScale: { value: number };
  } | null = null;
  
  // Connection System
  private tempConnectionLine: THREE.Line | null = null;
  private connectionState: {
    active: boolean;
    sourceNodeId: string | null;
    startPoint: THREE.Vector3;
  } = { active: false, sourceNodeId: null, startPoint: new THREE.Vector3() };
  
  private nodes: Map<string, { gl: THREE.Mesh, css: CSS3DObject }> = new Map();
  private hoveredNodeId: string | null = null;
  private connections: Array<{ line: THREE.Line, fromId: string, toId: string }> = [];
  private animationId: number | null = null;
  private contextMenu: HTMLElement | null = null;
  
  constructor(options: PathVisualizerOptions) {
    console.log('%c PathVisualizer: V2.5 - SHADER GRID ACTIVATED ', 'background: #222; color: #bada55; padding: 4px; border-radius: 4px;');
    this.container = options.container;
    
    // Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Important: Must be null to see backgroundScene
    this.cssScene = new THREE.Scene();

    // Camera (Straight top-down/frontal view for 2.5D)
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(options.fov ?? 40, width / height, 0.1, 10000);
    this.camera.position.set(0, 0, 1500); // Look straight at XY plane
    this.camera.lookAt(0, 0, 0);

    // WebGL Renderer
    this.webGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.webGLRenderer.setSize(width, height);
    this.webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webGLRenderer.setClearColor(0x0a0a0f, 1);
    this.webGLRenderer.autoClear = false;
    this.webGLRenderer.domElement.style.position = 'absolute';
    this.webGLRenderer.domElement.style.top = '0';
    this.webGLRenderer.domElement.style.left = '0';
    this.webGLRenderer.domElement.style.zIndex = '1';
    this.webGLRenderer.domElement.style.outline = 'none'; // Remove focus border
    this.webGLRenderer.domElement.style.border = 'none';
    this.container.appendChild(this.webGLRenderer.domElement);

    // CSS3D Renderer
    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(width, height);
    this.cssRenderer.domElement.style.position = 'absolute';
    this.cssRenderer.domElement.style.top = '0';
    this.cssRenderer.domElement.style.left = '0';
    this.cssRenderer.domElement.style.zIndex = '2';
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    this.cssRenderer.domElement.style.outline = 'none'; // Remove focus border
    this.cssRenderer.domElement.style.border = 'none';
    this.container.appendChild(this.cssRenderer.domElement);

    // MapControls (Configured for XY panning)
    this.controls = new MapControls(this.camera, this.webGLRenderer.domElement);
    this.controls.enableRotate = false; // Keep it flat
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true; // Essential for XY plane
    this.controls.minDistance = 200;
    this.controls.maxDistance = 5000;

    this.raycaster = new THREE.Raycaster();
    this.mouseNdc = new THREE.Vector2();
    this.mousePixel = new THREE.Vector2(99999, 99999);
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Flat on XY plane
    this.dragOffset = new THREE.Vector3();

    // Lighting (Soft ambient + subtle directional)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(50, 100, 50);
    this.scene.add(dirLight);

    // Background Grid (Subtle dots)
    this.createCleanGrid(options.gridSpacing ?? 50);

    // Resize Handler
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.webGLRenderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.webGLRenderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    this.webGLRenderer.domElement.addEventListener('pointermove', this.onPointerMove); // Keep this for hover effects
    window.addEventListener('pointerup', this.onGlobalPointerUp);
    window.addEventListener('click', () => this.hideContextMenu());

    // Start Animation Loop
    this.animate();
  }

  private createCleanGrid(spacing: number) {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.backgroundScene = new THREE.Scene();
    this.backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Scale spacing relative to view or keep fixed? Fixed for "canvas" feel.
    // However, when zooming out, dots should get closer. uSpacing handles this in world space if we pass it right?
    // Actually, in the shader we used screen space logic.
    // Let's make uSpacing world-space relative by ignoring camera zoom in shader? 
    // No, we want it to behave like a zoomable canvas.
    // Correct approach: uSpacing is world units. In shader we used ` pixel = vUv * uResolution`. This is screen space.
    // To make it stick to world, we need world coordinates.
    // But for "Infinite canvas" we just need the dots to slide.
    
    // Let's adjust the shader to be screen-space but offset-aware, which is what we have.
    // The issue might be visibility. Let's boost the colors.

    this.gridUniforms = {
      uSpacing: { value: spacing },
      uDotRadius: { value: 1.0 }, 
      uBaseColor: { value: new THREE.Color(0.4, 0.4, 0.45) }, // Much brighter for visibility
      uHotColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, 
      uMouse: { value: new THREE.Vector2(99999, 99999) },
      uMouseRadius: { value: 150 }, // Tighter radius (~3 grid cells)
      uResolution: { value: new THREE.Vector2(width, height) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uPixelScale: { value: 1.0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.gridUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uSpacing;
        uniform float uDotRadius;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec2 uMouse;
        uniform float uMouseRadius;
        uniform vec2 uResolution;
        uniform vec2 uOffset;
        uniform float uPixelScale;
        varying vec2 vUv;

        float circle(vec2 uv, float r) {
          // Sharp dots regardless of zoom, but with a tiny bit of AA
          float edge = 1.0 / uPixelScale;
          return 1.0 - smoothstep(r, r + edge, length(uv));
        }

        void main() {
          // REAL WORLD COORDINATES
          vec2 worldPos = (vUv - 0.5) * (uResolution / uPixelScale) + uOffset;
          
          float distToMouse = length(worldPos - uMouse);
          float glow = smoothstep(uMouseRadius, 0.0, distToMouse);

          // Grid in world space
          vec2 cell = mod(worldPos, uSpacing) - (uSpacing * 0.5);
          
          float dynamicRadius = uDotRadius + (glow * 4.0 / uPixelScale); 
          float dot = circle(cell, dynamicRadius);

          vec3 color = mix(uBaseColor, uHotColor, glow * 0.8);
          float alpha = dot * (0.2 + glow * 0.6);
          
          if (alpha < 0.01) discard;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    this.backgroundScene.add(quad);
  }

  public addNode(config: { id: string, x: number, y: number, label: string, htmlContent: string }) {
    const nodeWidth = 200;
    const nodeHeight = 120;
    const depth = 30; // Solid thickness for 3D look

    // WebGL: Volumetric box in XY plane
    const geometry = new THREE.BoxGeometry(nodeWidth, nodeHeight, depth);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x222228,
      roughness: 0.1,
      metalness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    const plate = new THREE.Mesh(geometry, material);
    // Mirror Y to match screen coordinates (where Y grows down)
    plate.position.set(config.x, -config.y, -depth/2); 
    
    // Add glowing neon edge
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ 
      color: 0x00ff96, 
      transparent: true, 
      opacity: 0.5 
    }));
    plate.add(line);
    
    // Connection Handle (Hidden by default)
    const handleGeo = new THREE.SphereGeometry(6, 16, 16);
    const handleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(nodeWidth / 2 + 10, 0, depth / 2); // Right side, front face
    handle.name = 'ConnectionHandle';
    handle.visible = false;
    plate.add(handle);

    this.scene.add(plate);

    // CSS3D: HTML card overlay (perfectly on top of the plate)
    const div = document.createElement('div');
    // Allow dragging via the div
    div.addEventListener('pointerdown', (e) => {
      // Ignore clicks on inputs or buttons if any
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
      
      e.stopPropagation(); // Don't let canvas catch it
      
      this.draggingNode = this.nodes.get(config.id) || null;
      if (this.draggingNode) {
        this.controls.enabled = false;
        
        // Calculate offset just like in canvas pointerdown
        this.updateMouseNdc(e);
        this.raycaster.setFromCamera(this.mouseNdc, this.camera);
        // We know we hit this node's plane roughly
        const dragPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, dragPoint);
        this.dragOffset.copy(dragPoint).sub(this.draggingNode.gl.position);

        // Attach global move listener for smooth drag over CSS elements
        window.addEventListener('pointermove', this.onGlobalPointerMove);
        window.addEventListener('pointerup', this.onGlobalPointerUp);
      }
    });

    div.style.width = `${nodeWidth}px`;
    div.style.height = `${nodeHeight}px`;
    div.style.background = 'rgba(10, 10, 15, 0.9)';
    div.style.border = '1px solid rgba(0, 255, 150, 0.3)';
    div.style.borderRadius = '12px';
    div.style.padding = '16px';
    div.style.boxSizing = 'border-box';
    div.style.color = '#fff';
    div.style.fontFamily = 'Inter, system-ui, sans-serif';
    div.style.pointerEvents = 'auto';
    div.style.cursor = 'grab';
    div.innerHTML = config.htmlContent;

    const cssObject = new CSS3DObject(div);
    cssObject.position.set(config.x, -config.y, 1); // Slightly in front of the plate
    this.cssScene.add(cssObject);

    this.nodes.set(config.id, { gl: plate, css: cssObject });

    // Standard initialization (No animation)
    plate.scale.set(1, 1, 1);
    cssObject.scale.set(1, 1, 1);
  }

  private showContextMenu(x: number, y: number, worldPos: THREE.Vector3) {
    this.hideContextMenu();

    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.background = '#1a1a20';
    menu.style.border = '1px solid #333';
    menu.style.borderRadius = '8px';
    menu.style.padding = '4px';
    menu.style.zIndex = '1000';
    menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    menu.style.color = 'white';
    menu.style.fontFamily = 'Inter, sans-serif';
    menu.style.fontSize = '13px';
    menu.style.minWidth = '140px';

    const item = document.createElement('div');
    item.innerText = 'Add New Node';
    item.style.padding = '8px 12px';
    item.style.cursor = 'pointer';
    item.style.borderRadius = '4px';
    item.onmouseenter = () => item.style.background = '#00ff9622';
    item.onmouseleave = () => item.style.background = 'transparent';
    item.onclick = () => {
      this.addNode({
        id: `node_${Date.now()}`,
        x: worldPos.x,
        y: -worldPos.y, // Mirror for local coordinate logic
        label: 'New Node',
        htmlContent: `
        <div style="height: 100%; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-weight: 600; font-size: 15px; color: #00ff96;">New Node</div>
          <div style="font-size: 13px; opacity: 0.7; color: #a0a0a0;">Created manually</div>
          <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; opacity: 0.4; font-family: monospace;">ID: ${Date.now().toString().slice(-4)}</span>
          </div>
        </div>`
      });
      this.hideContextMenu();
    };

    menu.appendChild(item);
    document.body.appendChild(menu);
    this.contextMenu = menu;
  }

  private hideContextMenu() {
    if (this.contextMenu) {
      document.body.removeChild(this.contextMenu);
      this.contextMenu = null;
    }
  }

  public addConnection(fromId: string, toId: string) {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);
    if (!from || !to) return;

    const material = new THREE.LineBasicMaterial({ color: 0x00ff96, transparent: true, opacity: 0.3 });
    const geometry = new THREE.BufferGeometry().setFromPoints([
      from.gl.position.clone().setZ(0),
      to.gl.position.clone().setZ(0)
    ]);
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.connections.push({ line, fromId, toId });
  }

  public focusOnNodes() {
    if (this.nodes.size === 0) return;
    
    const box = new THREE.Box3();
    this.nodes.forEach(n => box.expandByPoint(n.gl.position));
    
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    this.controls.target.set(center.x, center.y, 0);
    this.camera.position.set(center.x, center.y, 1500);
    this.camera.lookAt(center.x, center.y, 0);
    this.controls.update();
  }

  private onPointerDown = (event: PointerEvent) => {
    // Right Click for Context Menu
    if (event.button === 2) {
      this.updateMouseNdc(event);
      this.raycaster.setFromCamera(this.mouseNdc, this.camera);
      const worldPos = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, worldPos);
      this.showContextMenu(event.clientX, event.clientY, worldPos);
      return;
    }

    this.updateMouseNdc(event);
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);

    const nodeMeshes = Array.from(this.nodes.values()).map(n => n.gl);
    const hits = this.raycaster.intersectObjects(nodeMeshes, true);

    if (hits.length > 0) {
      const hit = hits[0];
      
      // Check if Handle Clicked
      if (hit.object.name === 'ConnectionHandle') {
        const parentNode = hit.object.parent as THREE.Mesh;
        const nodeEntry = Array.from(this.nodes.entries()).find(([id, n]) => n.gl === parentNode);
        
        if (nodeEntry) {
          this.connectionState = {
            active: true,
            sourceNodeId: nodeEntry[0],
            startPoint: hit.point.clone()
          };
          this.controls.enabled = false;
          
          // Create temp line
          const geometry = new THREE.BufferGeometry().setFromPoints([hit.point, hit.point]);
          const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
          this.tempConnectionLine = new THREE.Line(geometry, material);
          this.scene.add(this.tempConnectionLine);
          
          window.addEventListener('pointermove', this.onGlobalPointerMove);
          window.addEventListener('pointerup', this.onGlobalPointerUp);
        }
        return;
      }

      // Check if Node Body Clicked
      let targetMesh = hit.object;
      // Traverse up to find the root mesh (the one in our map)
      while (targetMesh.parent && targetMesh.parent.type !== 'Scene') {
        targetMesh = targetMesh.parent as THREE.Object3D;
      }

      const nodeEntry = Array.from(this.nodes.entries()).find(([id, n]) => n.gl === targetMesh);
      if (nodeEntry) {
        this.draggingNode = nodeEntry[1];
        this.controls.enabled = false;
        
        // Use visual cursor for drag
        document.body.style.cursor = 'grabbing';
        this.draggingNode.css.element.style.cursor = 'grabbing';

        const dragPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, dragPoint);
        this.dragOffset.copy(dragPoint).sub(this.draggingNode.gl.position);
        
        window.addEventListener('pointermove', this.onGlobalPointerMove);
        window.addEventListener('pointerup', this.onGlobalPointerUp);
      }
    }
  };

  // Global listeners to ensure smooth drag even if mouse leaves canvas/node
  private onGlobalPointerMove = (event: PointerEvent) => {
    this.onPointerMove(event);
  };

  private onGlobalPointerUp = (event: PointerEvent) => {
    this.onPointerUp(event);
    window.removeEventListener('pointermove', this.onGlobalPointerMove);
    window.removeEventListener('pointerup', this.onGlobalPointerUp);
  };

  private onPointerMove = (event: PointerEvent) => {
    this.updateMouseNdc(event);
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    
    // Always update mouseWorld for the grid shader
    this.raycaster.ray.intersectPlane(this.dragPlane, this.mouseWorld);

    // 1. Connection Dragging
    if (this.connectionState.active && this.tempConnectionLine) {
      const endPoint = this.mouseWorld.clone();
      // Snap to Z=0 for logic, but maybe hit target node?
      // Use raycaster to snap to target node handle?
      // For now, simple line to mouse plane
      const positions = this.tempConnectionLine.geometry.attributes.position as THREE.BufferAttribute;
      positions.setXYZ(1, endPoint.x, endPoint.y, endPoint.z); // simple 3d drag
      positions.needsUpdate = true;
      return; 
    }

    // 2. Node Dragging
    if (this.draggingNode) {
      const dragPoint = this.mouseWorld.clone();
      dragPoint.sub(this.dragOffset);

      const x = dragPoint.x;
      const y = dragPoint.y;

      // Keep Z fixed while dragging
      this.draggingNode.gl.position.set(x, y, this.draggingNode.gl.position.z);
      this.draggingNode.css.position.set(x, y, 1);
      
      this.updateConnectionLines();
      return;
    }

    // 3. Hover Effects (Handles & Wiggle)
    const nodeMeshes = Array.from(this.nodes.values()).map(n => n.gl);
    const hits = this.raycaster.intersectObjects(nodeMeshes, true);
    
    let currentHoveredId: string | null = null;

    if (hits.length > 0) {
      // Find the root node
      let targetMesh = hits[0].object;
      while (targetMesh.parent && targetMesh.parent.type !== 'Scene') {
        targetMesh = targetMesh.parent as THREE.Object3D;
      }
      
      const nodeEntry = Array.from(this.nodes.entries()).find(([id, n]) => n.gl === targetMesh);
      if (nodeEntry) {
        currentHoveredId = nodeEntry[0];
        const node = nodeEntry[1];
        
        // Show handle
        const handle = node.gl.getObjectByName('ConnectionHandle');
        if (handle) {
          handle.visible = true;
          if (hits[0].object.name === 'ConnectionHandle') {
            handle.scale.setScalar(1.5);
            document.body.style.cursor = 'crosshair';
          } else {
            handle.scale.setScalar(1.0);
            document.body.style.cursor = 'grab';
          }
        }

        // Wiggle Effect (Only if new node hovered)
        if (this.hoveredNodeId !== currentHoveredId) {
          // TODO: Implement custom tween for wiggle
        }
      }
    } else {
      document.body.style.cursor = 'default';
    }

    // Reset rotation if mouse left the node
    if (this.hoveredNodeId && this.hoveredNodeId !== currentHoveredId) {
      const prevNode = this.nodes.get(this.hoveredNodeId);
      if (prevNode) {
        prevNode.gl.rotation.set(0, 0, 0);
        prevNode.css.rotation.set(0, 0, 0);
        
        const handle = prevNode.gl.getObjectByName('ConnectionHandle');
        if (handle) handle.visible = false;
      }
    }

    this.hoveredNodeId = currentHoveredId;
    this.updateGridHover();
  };

  private updateConnectionLines() {
    this.connections.forEach(conn => {
      const from = this.nodes.get(conn.fromId);
      const to = this.nodes.get(conn.toId);
      if (from && to) {
        const positions = (conn.line.geometry.attributes.position as THREE.BufferAttribute);
        positions.setXYZ(0, from.gl.position.x, from.gl.position.y, 0);
        positions.setXYZ(1, to.gl.position.x, to.gl.position.y, 0);
        positions.needsUpdate = true;
      }
    });
  }

  private onPointerUp = (event: PointerEvent) => {
    // Finish Connection
    if (this.connectionState.active) {
      // Raycast one last time to find target
      this.updateMouseNdc(event);
      this.raycaster.setFromCamera(this.mouseNdc, this.camera);
      const nodeMeshes = Array.from(this.nodes.values()).map(n => n.gl);
      const hits = this.raycaster.intersectObjects(nodeMeshes, true);
      
      if (hits.length > 0) {
        let targetMesh = hits[0].object;
        while (targetMesh.parent && targetMesh.parent.type !== 'Scene') {
          targetMesh = targetMesh.parent as THREE.Object3D;
        }
        
        const targetNodeEntry = Array.from(this.nodes.entries()).find(([id, n]) => n.gl === targetMesh);
        if (targetNodeEntry && targetNodeEntry[0] !== this.connectionState.sourceNodeId) {
          // Valid connection!
          this.addConnection(this.connectionState.sourceNodeId!, targetNodeEntry[0]);
        }
      }

      // Cleanup
      if (this.tempConnectionLine) {
        this.scene.remove(this.tempConnectionLine);
        this.tempConnectionLine = null;
      }
      this.connectionState = { active: false, sourceNodeId: null, startPoint: new THREE.Vector3() };
      this.controls.enabled = true;
      return;
    }

    // Finish Drag
    if (this.draggingNode) {
      document.body.style.cursor = 'default';
      this.draggingNode.css.element.style.cursor = 'grab';
      this.draggingNode = null;
      this.controls.enabled = true;
    }
  };

  private updateMouseNdc(event: PointerEvent) {
    const rect = this.webGLRenderer.domElement.getBoundingClientRect();
    this.mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.mousePixel.set(event.clientX - rect.left, event.clientY - rect.top);
  }

  private updateGridHover() {
    // Moved complex mouse/offset logic into animate to ensure perfect sync
  }

  private onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.webGLRenderer.setSize(width, height);
    this.cssRenderer.setSize(width, height);
    if (this.gridUniforms) {
      this.gridUniforms.uResolution.value.set(width, height);
      this.gridUniforms.uOffset.value.set(-width / 2, -height / 2);
    }
  }

  private animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.controls.update();

    if (this.gridUniforms) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      // WORLD SPACE GRID LOGIC:
      // 1. Grid moves with camera (elements stuck to grid)
      // 2. Dots stay constant world size (mostly)
      const fovRad = (this.camera.fov * Math.PI) / 180;
      const heightInWorld = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
      const pixelScale = height / heightInWorld;

      this.gridUniforms.uResolution.value.set(width, height);
      this.gridUniforms.uPixelScale.value = pixelScale;
      this.gridUniforms.uOffset.value.set(this.camera.position.x, this.camera.position.y);
      this.gridUniforms.uMouse.value.set(this.mouseWorld.x, this.mouseWorld.y);
      this.gridUniforms.uSpacing.value = 50; // 50 world units
    }
    
    if (this.backgroundScene && this.backgroundCamera) {
      this.webGLRenderer.clear();
      this.webGLRenderer.render(this.backgroundScene, this.backgroundCamera);
      this.webGLRenderer.clearDepth();
    }
    this.webGLRenderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.cssScene, this.camera);
  }

  public dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.webGLRenderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.webGLRenderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.webGLRenderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.webGLRenderer.domElement.removeEventListener('pointerleave', this.onPointerUp);
    this.container.innerHTML = '';
  }
}
