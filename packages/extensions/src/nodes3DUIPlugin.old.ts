// LEGACY file archived to packages/legacy/nodes3DUIPlugin.old.ts
// Original file content preserved in legacy folder.

// import { IPlugin, PluginRenderProps, PluginClass } from './pluginSystem';

/**
 * Nodes3DUIPlugin - интеграция нового 3D-редактора нод
 * Использует модуль @path/nodes-3d для отображения интерактивных 3D-нод
 */
export class Nodes3DUIPlugin implements IPlugin {
  id = 'nodes-3d-ui';
  name = '3D Nodes Editor';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Modern 3D node editor with hybrid rendering (WebGL + HTML)';
  author = 'PATH# Team';
  metadata = {
    name: '3D Nodes Editor',
    version: '1.0.0',
    class: PluginClass.UI,
    moduleId: 'node-module',
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1'],
    dependencies: ['path-module']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const currentPathId = state.activePathId || state.currentPathId || null;
    
    // Валидация: нужен активный путь
    if (!currentPathId) {
      return this.renderErrorState('No Path Selected', 'Please select a path first to manage nodes.');
    }

    const paths = state.paths || [];
    const currentPath = paths.find((p: any) => p.id === currentPathId);
    
    if (!currentPath) {
      return this.renderErrorState('Path Not Found', 'The selected path no longer exists.');
    }

    const nodes = currentPath?.nodes || [];
    const stateJson = JSON.stringify({ currentPath, nodes }).replace(/</g, '\\u003c');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>3D Node Editor - ${currentPath.name || 'PATH'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0f;
      color: #e5e5e5;
      overflow: hidden;
      height: 100vh;
    }

    #viewport-container {
      width: 100vw;
      height: 100vh;
      position: relative;
    }

    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 1000;
    }

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e5e5e5;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .path-info h1 {
      font-size: 18px;
      font-weight: 600;
      color: #4fc3f7;
    }

    .path-info p {
      font-size: 13px;
      color: #888;
      margin-top: 2px;
    }

    .top-bar-right {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    }

    .action-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
    }

    #viewport {
      width: 100%;
      height: 100%;
      padding-top: 60px;
    }

    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 2000;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(79, 195, 247, 0.3);
      border-top-color: #4fc3f7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: 60px 20px;
      color: #888;
    }

    .error-state h2 {
      font-size: 24px;
      margin-bottom: 12px;
      color: #ff5252;
    }

    .controls-hint {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(20, 20, 30, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      color: #888;
      font-size: 12px;
      z-index: 100;
    }

    .controls-hint strong {
      color: #4fc3f7;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <!-- Верхняя панель -->
  <div class="top-bar">
    <div class="top-bar-left">
      <button class="back-btn" onclick="window.navigateToHub()">← Back to Hub</button>
      <div class="path-info">
        <h1>${currentPath.name || 'Untitled Path'}</h1>
        <p>${nodes.length} nodes • ${currentPath.description || 'No description'}</p>
      </div>
    </div>
    <div class="top-bar-right">
      <button class="action-btn secondary" onclick="window.toggleSettings()">⚙️ Settings</button>
      <button class="action-btn" onclick="window.createNewNode()">+ Add Node</button>
    </div>
  </div>

  <!-- 3D Viewport -->
  <div id="viewport-container">
    <div id="viewport"></div>
    <div class="loading">
      <div class="loading-spinner"></div>
      <p style="margin-top: 16px; color: #888;">Loading 3D Editor...</p>
    </div>
  </div>

  <!-- Controls Hint -->
  <div class="controls-hint">
    <strong>Controls:</strong> Drag to pan • Scroll to zoom
  </div>

  <!-- Three.js -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
    }
  }
  </script>

  <script type="module">
    import * as THREE from 'three';

    // State данные
    const initialState = ${stateJson};
    const { currentPath, nodes } = initialState;

    console.log('[3D Nodes Editor] Initializing...', { pathId: currentPath.id, nodesCount: nodes.length });

    // ============ INFINITE GRID SHADER ============
    const gridVertexShader = \`
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    \`;

    const gridFragmentShader = \`
      uniform vec3 uCameraPosition;
      uniform float uGridSize;
      uniform float uDotSize;
      
      varying vec3 vWorldPosition;
      
      void main() {
        // Позиция относительно камеры для бесконечности
        vec2 worldPos = vWorldPosition.xz + uCameraPosition.xz;
        
        // Создаём сетку точек
        vec2 grid = fract(worldPos / uGridSize);
        vec2 distFromCenter = abs(grid - 0.5) * 2.0;
        
        // Точка в центре каждой ячейки
        float dot = 1.0 - smoothstep(uDotSize - 0.01, uDotSize, length(distFromCenter));
        
        // Приглушённый серый цвет для фона
        vec3 backgroundColor = vec3(0.08, 0.08, 0.10);
        vec3 dotColor = vec3(0.2, 0.2, 0.22);
        
        vec3 finalColor = mix(backgroundColor, dotColor, dot);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    \`;

    // ============ SCENE SETUP ============
    const container = document.getElementById('viewport');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    // Ортогональная камера - строго сверху (2D холст)
    const aspect = container.clientWidth / container.clientHeight;
    const viewSize = 20;
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect,
      viewSize, -viewSize,
      0.1, 1000
    );
    camera.position.set(0, 50, 0); // Строго сверху
    camera.lookAt(0, 0, 0);
    camera.zoom = 1;
    camera.updateProjectionMatrix();

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // CSS2D removed: node cards are real 3D meshes with canvas textures

    // ============ CAMERA PAN & NODE DRAG ============
    let isDraggingCamera = false;
    let isDraggingNode = false;
    let draggedNode = null;
    let hoveredNode = null;
    let previousMousePosition = { x: 0, y: 0 };
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const dragPoint = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();
    const nodeMeshes = [];
    
    renderer.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Левая кнопка
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes, false);
        
        if (intersects.length > 0) {
          // Клик по ноде - перетаскиваем ноду
          isDraggingNode = true;
          draggedNode = intersects[0].object.parent;
          if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
            dragOffset.copy(draggedNode.position).sub(dragPoint);
          }
          renderer.domElement.style.cursor = 'move';
        } else {
          // Клик по пустому месту - двигаем камеру
          isDraggingCamera = true;
          renderer.domElement.style.cursor = 'grabbing';
        }
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      if (isDraggingCamera) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        const moveScale = (viewSize * 2) / container.clientHeight / camera.zoom;
        
        // Двигаем камеру в направлении движения мыши (без инверсии)
        cameraTarget.x -= deltaX * moveScale;
        cameraTarget.z -= deltaY * moveScale;
        
        camera.position.x = cameraTarget.x;
        camera.position.z = cameraTarget.z;
        camera.lookAt(cameraTarget);
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else if (isDraggingNode && draggedNode) {
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
          draggedNode.position.copy(dragPoint.add(dragOffset));
        }
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Hover над нодой
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes, false);
        const nextHovered = intersects.length > 0 ? intersects[0].object.parent : null;
        
        if (nextHovered !== hoveredNode) {
          if (hoveredNode) {
            hoveredNode.scale.set(1, 1, 1);
            hoveredNode.userData.topMaterial.opacity = 0.95;
          }
          if (nextHovered) {
            nextHovered.scale.set(1.02, 1.0, 1.02);
            nextHovered.userData.topMaterial.opacity = 1.0;
          }
          hoveredNode = nextHovered;
        }
        
        renderer.domElement.style.cursor = intersects.length > 0 ? 'move' : 'grab';
      }
    });
    
    window.addEventListener('mouseup', () => {
      if (isDraggingCamera) {
        isDraggingCamera = false;
        renderer.domElement.style.cursor = 'grab';
      }
      if (isDraggingNode) {
        isDraggingNode = false;
        draggedNode = null;
        renderer.domElement.style.cursor = 'grab';
      }
    });
    
    renderer.domElement.style.cursor = 'grab';
    
    // Zoom с колесиком
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      camera.zoom += e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      camera.zoom = Math.max(0.5, Math.min(camera.zoom, 3)); // Ограничения
      camera.updateProjectionMatrix();
    });

    // Освещение (для 3D элементов)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 0); // Сверху
    scene.add(directionalLight);

    // ============ INFINITE GRID ============
    const gridUniforms = {
      uCameraPosition: { value: new THREE.Vector3() },
      uGridSize: { value: 0.12 }, // Очень маленькое расстояние между точками
      uDotSize: { value: 0.99 } // Очень маленькие точки
    };

    const gridGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const gridMaterial = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      uniforms: gridUniforms,
      side: THREE.DoubleSide
    });

    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    scene.add(gridMesh);

    // ============ CREATE 3D NODES ============
    const nodeObjects = [];
    const nodeCanvasSize = { w: 1024, h: 640 };

    function drawRoundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function truncateText(text, maxChars) {
      if (!text) return '';
      return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
    }

    function createNodeTexture(node) {
      const canvas = document.createElement('canvas');
      canvas.width = nodeCanvasSize.w;
      canvas.height = nodeCanvasSize.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Background
      ctx.fillStyle = 'rgba(15, 20, 25, 0.95)';
      drawRoundedRect(ctx, 10, 10, canvas.width - 20, canvas.height - 20, 16);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(79, 195, 247, 0.9)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Title
      ctx.fillStyle = '#4fc3f7';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.fillText(truncateText(node.title || 'New Node', 24), 30, 70);

      // Description
      ctx.fillStyle = '#999';
      ctx.font = '400 20px Inter, sans-serif';
      ctx.fillText(truncateText(node.description || 'No description', 32), 30, 120);

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 170);
      ctx.lineTo(canvas.width - 30, 170);
      ctx.stroke();

      // ID
      ctx.fillStyle = '#666';
      ctx.font = '400 18px Inter, sans-serif';
      ctx.fillText('ID: ' + node.id.substring(0, 8) + '...', 30, 210);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    }

    nodes.forEach((node, index) => {
      const nodeGroup = new THREE.Group();

      // Позиционирование: по x в зависимости от индекса
      const x = (index - nodes.length / 2) * 6;
      nodeGroup.position.set(x, 0, 0);

      const texture = createNodeTexture(node);
      const cardGeometry = new THREE.BoxGeometry(6.5, 0.35, 4.2);
      const topMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.98,
        roughness: 0.6,
        metalness: 0.1
      });
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0x0d1218,
        transparent: true,
        opacity: 0.98,
        roughness: 0.8,
        metalness: 0.05
      });
      const materials = [
        sideMaterial, // right
        sideMaterial, // left
        topMaterial,  // top
        sideMaterial, // bottom
        sideMaterial, // front
        sideMaterial  // back
      ];
      const cardMesh = new THREE.Mesh(cardGeometry, materials);
      cardMesh.position.y = 0.18;
      nodeGroup.add(cardMesh);

      // Легкий наклон для 3D перспективы
      nodeGroup.rotation.x = -0.18;

      nodeGroup.userData = { node, topMaterial, mesh: cardMesh };
      scene.add(nodeGroup);
      nodeObjects.push(nodeGroup);
      nodeMeshes.push(cardMesh);
    });

    // Убираем loading
    document.querySelector('.loading').style.display = 'none';

    // ============ ANIMATION LOOP ============
    function animate() {
      requestAnimationFrame(animate);
      
      // Обновление uniform'ов шейдера
      gridUniforms.uCameraPosition.value.copy(camera.position);
      
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const aspect = width / height;
      
      // Обновляем ортогональную камеру
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    });

    // API для кнопок
    window.navigateToHub = () => {
      window.location.href = '/';
    };

    window.createNewNode = () => {
      console.log('[3D Editor] Create new node');
      // TODO: открыть модальное окно создания ноды
      alert('Create node feature coming soon!');
    };

    window.toggleSettings = () => {
      console.log('[3D Editor] Toggle settings');
      alert('Settings panel coming soon!');
    };

    console.log('[3D Nodes Editor] Ready! ${nodes.length} nodes rendered.');
  </script>
</body>
</html>
    `;
  }

  private renderErrorState(title: string, message: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Error - ${title}</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0a0f;
      color: #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .error-state {
      text-align: center;
      padding: 40px;
    }
    .error-state h2 {
      color: #ff5252;
      font-size: 24px;
      margin-bottom: 12px;
    }
    .error-state p {
      color: #888;
      font-size: 16px;
    }
    .back-btn {
      margin-top: 24px;
      background: #2196F3;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="error-state">
    <h2>${title}</h2>
    <p>${message}</p>
    <button class="back-btn" onclick="window.location.href='/'">← Back to Hub</button>
  </div>
</body>
</html>
    `;
  }
}

export default Nodes3DUIPlugin;
