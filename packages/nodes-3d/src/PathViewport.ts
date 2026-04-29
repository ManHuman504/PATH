/**
 * PathViewport - основной класс для управления 3D-viewport
 * Интегрирует Three.js сцену, гибридный рендеринг и систему интерактивности
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { PathNode, PathNodeConfig } from './PathNode';
import { InteractionSystem, InteractionCallbacks } from './InteractionSystem';
import { gridVertexShader, gridFragmentShader } from './shaders/gridShader';

export interface PathViewportConfig {
  background?: number;
  antialias?: boolean;
  enableShadows?: boolean;
  callbacks?: InteractionCallbacks;
}

export class PathViewport {
  // Core Three.js components
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private css2DRenderer: CSS2DRenderer;
  private controls: OrbitControls;
  
  // Custom systems
  private interactionSystem: InteractionSystem;
  private gridMesh: THREE.Mesh;
  private gridUniforms: any;
  
  // Container and state
  private container: HTMLElement;
  private nodes: Map<string, PathNode> = new Map();
  private animationId: number | null = null;
  private lastTime: number = 0;
  private clock: THREE.Clock;
  
  // Mouse tracking for shader
  private mouseWorldPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
  
  constructor(container: HTMLElement, config: PathViewportConfig = {}) {
    this.container = container;
    this.clock = new THREE.Clock();
    
    // Инициализация сцены
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.background || 0x0a0a0f);
    
    // Инициализация камеры
    this.camera = this.createCamera();
    
    // Инициализация рендереров
    this.renderer = this.createWebGLRenderer(config.antialias);
    this.css2DRenderer = this.createCSS2DRenderer();
    
    // Инициализация контролов
    this.controls = this.createControls();
    
    // Создание освещения
    this.setupLighting();
    
    // Создание бесконечного фона
    this.gridMesh = this.createInfiniteGrid();
    this.scene.add(this.gridMesh);
    
    // Инициализация системы интерактивности
    this.interactionSystem = new InteractionSystem(
      this.camera,
      this.scene,
      this.container,
      config.callbacks
    );
    
    // Обработка изменения размера окна
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Отслеживание мыши для шейдера
    this.container.addEventListener('mousemove', this.onMouseMoveForShader.bind(this));
    
    // Запуск цикла анимации
    this.startAnimationLoop();
  }
  
  /**
   * Создает перспективную камеру
   */
  private createCamera(): THREE.PerspectiveCamera {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 0, 10);
    return camera;
  }
  
  /**
   * Создает WebGL рендерер
   */
  private createWebGLRenderer(antialias: boolean = true): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: false
    });
    
    renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(renderer.domElement);
    
    return renderer;
  }
  
  /**
   * Создает CSS2D рендерер для HTML-слоя
   */
  private createCSS2DRenderer(): CSS2DRenderer {
    const css2DRenderer = new CSS2DRenderer();
    css2DRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    
    // Стили для CSS2D контейнера
    css2DRenderer.domElement.style.position = 'absolute';
    css2DRenderer.domElement.style.top = '0';
    css2DRenderer.domElement.style.left = '0';
    css2DRenderer.domElement.style.pointerEvents = 'none';
    
    this.container.appendChild(css2DRenderer.domElement);
    
    return css2DRenderer;
  }
  
  /**
   * Создает контролы с настройками
   */
  private createControls(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Отключаем вращение, оставляем только панорамирование
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    
    // Включаем инерцию (damping) для плавности
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Ограничения зума
    controls.minDistance = 2;
    controls.maxDistance = 50;
    
    // Скорость панорамирования
    controls.panSpeed = 1.0;
    controls.screenSpacePanning = true;
    
    return controls;
  }
  
  /**
   * Настраивает освещение сцены
   */
  private setupLighting(): void {
    // Ambient light для общей освещенности
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light для теней и объема
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    
    // Point light для акцентов
    const pointLight = new THREE.PointLight(0x4fc3f7, 0.5, 20);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);
  }
  
  /**
   * Создает бесконечную сетку с кастомным шейдером
   */
  private createInfiniteGrid(): THREE.Mesh {
    // Создаем большую плоскость
    const geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    
    // Uniforms для шейдера
    this.gridUniforms = {
      uCameraPosition: { value: new THREE.Vector3() },
      uCursorPosition: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uCursorRadius: { value: 1.0 }
    };
    
    // Создаем кастомный материал с шейдерами
    const material = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      uniforms: this.gridUniforms,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -1; // Размещаем за нодами
    mesh.renderOrder = -1; // Рендерим первым
    
    return mesh;
  }
  
  /**
   * Обработчик движения мыши для шейдера
   */
  private onMouseMoveForShader(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Конвертируем в мировые координаты
    const vector = new THREE.Vector3(x, y, 0);
    vector.unproject(this.camera);
    
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    
    this.mouseWorldPosition.set(pos.x, pos.y);
  }
  
  /**
   * Обработчик изменения размера окна
   */
  private onWindowResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.css2DRenderer.setSize(width, height);
  }
  
  /**
   * Главный цикл анимации
   */
  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      this.animationId = requestAnimationFrame(animate);
      
      // Вычисляем дельту времени
      const deltaTime = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();
      
      // Обновляем контролы (важно для damping)
      this.controls.update();
      
      // Обновляем uniforms для шейдера
      this.gridUniforms.uCameraPosition.value.copy(this.camera.position);
      this.gridUniforms.uCursorPosition.value.copy(this.mouseWorldPosition);
      this.gridUniforms.uTime.value = elapsedTime;
      
      // Рендерим сцену
      this.renderer.render(this.scene, this.camera);
      this.css2DRenderer.render(this.scene, this.camera);
      
      this.lastTime = currentTime;
    };
    
    animate(0);
  }
  
  /**
   * Создает новую ноду
   */
  public createNode(config: PathNodeConfig): PathNode {
    const node = new PathNode(config);
    const id = this.generateNodeId();
    
    // Сохраняем ссылку на ноду в userData
    node.group.userData.pathNode = node;
    node.group.userData.nodeId = id;
    
    this.nodes.set(id, node);
    this.scene.add(node.group);
    
    return node;
  }
  
  /**
   * Удаляет ноду
   */
  public removeNode(nodeOrId: PathNode | string): void {
    let node: PathNode | undefined;
    let id: string;
    
    if (typeof nodeOrId === 'string') {
      id = nodeOrId;
      node = this.nodes.get(id);
    } else {
      node = nodeOrId;
      id = node.group.userData.nodeId;
    }
    
    if (node) {
      this.scene.remove(node.group);
      node.dispose();
      this.nodes.delete(id);
    }
  }
  
  /**
   * Возвращает все ноды
   */
  public getNodes(): PathNode[] {
    return Array.from(this.nodes.values());
  }
  
  /**
   * Центрирует камеру на ноде
   */
  public focusOnNode(node: PathNode, animated: boolean = true): void {
    const position = node.getPosition();
    
    // Fallback: No animation for now to ensure stability
    this.controls.target.copy(position);
    this.camera.position.set(position.x, position.y, this.camera.position.z);
  }
  
  /**
   * Генерирует уникальный ID для ноды
   */
  private generateNodeId(): string {
    return `viewport_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Возвращает камеру
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
  
  /**
   * Возвращает сцену
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }
  
  /**
   * Уничтожает viewport и освобождает ресурсы
   */
  public dispose(): void {
    // Останавливаем анимацию
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Удаляем все ноды
    this.nodes.forEach(node => node.dispose());
    this.nodes.clear();
    
    // Очищаем сцену
    this.scene.clear();
    
    // Освобождаем ресурсы рендереров
    this.renderer.dispose();
    this.controls.dispose();
    this.interactionSystem.dispose();
    
    // Удаляем DOM-элементы
    this.renderer.domElement.remove();
    this.css2DRenderer.domElement.remove();
    
    // Удаляем обработчики событий
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
