/**
 * InteractionSystem - система для обработки интерактивности
 * Включает raycasting для детекции объектов и drag-and-drop
 */

import * as THREE from 'three';
import { PathNode } from './PathNode';

export interface InteractionCallbacks {
  onNodeHover?: (node: PathNode | null) => void;
  onNodeClick?: (node: PathNode) => void;
  onNodeDragStart?: (node: PathNode) => void;
  onNodeDrag?: (node: PathNode, position: THREE.Vector3) => void;
  onNodeDragEnd?: (node: PathNode) => void;
}

export class InteractionSystem {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private container: HTMLElement;
  private callbacks: InteractionCallbacks;
  
  private hoveredNode: PathNode | null = null;
  private draggedNode: PathNode | null = null;
  private dragPlane: THREE.Plane;
  private dragOffset: THREE.Vector3;
  private isDragging: boolean = false;
  
  constructor(
    camera: THREE.Camera,
    scene: THREE.Scene,
    container: HTMLElement,
    callbacks: InteractionCallbacks = {}
  ) {
    this.camera = camera;
    this.scene = scene;
    this.container = container;
    this.callbacks = callbacks;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.dragOffset = new THREE.Vector3();
    
    this.setupEventListeners();
  }
  
  /**
   * Настраивает обработчики событий мыши
   */
  private setupEventListeners(): void {
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.addEventListener('click', this.onClick.bind(this));
  }
  
  /**
   * Обновляет позицию мыши в нормализованных координатах
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  
  /**
   * Выполняет raycast и возвращает найденную ноду
   */
  private raycastNodes(): PathNode | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    for (const intersect of intersects) {
      if (intersect.object.userData.isPathNode) {
        // Находим группу ноды
        let obj = intersect.object;
        while (obj.parent && !(obj instanceof THREE.Group && obj.userData.pathNode)) {
          obj = obj.parent;
        }
        
        if (obj.userData.pathNode) {
          return obj.userData.pathNode as PathNode;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Обработчик движения мыши
   */
  private onMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    
    if (this.isDragging && this.draggedNode) {
      // Вычисляем новую позицию через проекцию на плоскость
      const intersectionPoint = new THREE.Vector3();
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint);
      
      if (intersectionPoint) {
        const newPosition = intersectionPoint.sub(this.dragOffset);
        this.draggedNode.setTransform({ x: newPosition.x, y: newPosition.y, z: newPosition.z });
        
        if (this.callbacks.onNodeDrag) {
          this.callbacks.onNodeDrag(this.draggedNode, newPosition);
        }
      }
    } else {
      // Проверяем наведение
      const node = this.raycastNodes();
      
      if (node !== this.hoveredNode) {
        // Сбрасываем предыдущую наведенную ноду
        if (this.hoveredNode) {
          this.setNodeHoverState(this.hoveredNode, false);
        }
        
        // Устанавливаем новую наведенную ноду
        this.hoveredNode = node;
        if (this.hoveredNode) {
          this.setNodeHoverState(this.hoveredNode, true);
        }
        
        if (this.callbacks.onNodeHover) {
          this.callbacks.onNodeHover(this.hoveredNode);
        }
      }
    }
  }
  
  /**
   * Обработчик нажатия мыши
   */
  private onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Только левая кнопка
    
    this.updateMousePosition(event);
    const node = this.raycastNodes();
    
    if (node) {
      this.isDragging = true;
      this.draggedNode = node;
      
      // Вычисляем offset для плавного перетаскивания
      const intersectionPoint = new THREE.Vector3();
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint);
      
      if (intersectionPoint) {
        this.dragOffset.copy(intersectionPoint).sub(node.getPosition());
      }
      
      if (this.callbacks.onNodeDragStart) {
        this.callbacks.onNodeDragStart(node);
      }
      
      // Предотвращаем движение камеры при перетаскивании
      event.stopPropagation();
    }
  }
  
  /**
   * Обработчик отпускания мыши
   */
  private onMouseUp(event: MouseEvent): void {
    if (this.isDragging && this.draggedNode) {
      if (this.callbacks.onNodeDragEnd) {
        this.callbacks.onNodeDragEnd(this.draggedNode);
      }
      
      this.isDragging = false;
      this.draggedNode = null;
    }
  }
  
  /**
   * Обработчик клика
   */
  private onClick(event: MouseEvent): void {
    if (this.isDragging) return; // Не обрабатываем клик при перетаскивании
    
    this.updateMousePosition(event);
    const node = this.raycastNodes();
    
    if (node && this.callbacks.onNodeClick) {
      this.callbacks.onNodeClick(node);
    }
  }
  
  /**
   * Устанавливает визуальное состояние hover для ноды
   */
  private setNodeHoverState(node: PathNode, hovered: boolean): void {
    const material = node.mesh.material as THREE.MeshStandardMaterial;
    
    if (hovered) {
      material.emissive.setHex(0x444444);
      node.htmlElement.style.borderColor = 'rgba(33, 150, 243, 1)';
      node.htmlElement.style.boxShadow = '0 6px 30px rgba(33, 150, 243, 0.5)';
    } else {
      material.emissive.setHex(0x000000);
      node.htmlElement.style.borderColor = 'rgba(33, 150, 243, 0.8)';
      node.htmlElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    }
  }
  
  /**
   * Возвращает текущую позицию мыши в мировых координатах
   */
  public getMouseWorldPosition(): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersectionPoint = new THREE.Vector3();
    const intersected = this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint);
    return intersected ? intersectionPoint : null;
  }
  
  /**
   * Уничтожает систему и удаляет обработчики
   */
  public dispose(): void {
    this.container.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.container.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.removeEventListener('click', this.onClick.bind(this));
  }
}
