/**
 * PathNode - класс для создания интерактивных 3D-нод с HTML-контентом
 * Использует гибридный рендеринг: 3D-меш для корпуса + CSS2DObject для HTML
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as TWEEN from '@tweenjs/tween.js';

export interface PathNodeConfig {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  html?: string;
  width?: number;
  height?: number;
  color?: number;
}

export class PathNode {
  public group: THREE.Group;
  public mesh: THREE.Mesh;
  public htmlObject: CSS2DObject;
  public htmlElement: HTMLDivElement;
  private config: PathNodeConfig;
  // Fallback userData because I saw this.userData usage in code but it wasn't defined on class
  public userData: any = {};
  
  constructor(config: PathNodeConfig = {}) {
    this.config = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      html: '<div>Node</div>',
      width: 200,
      height: 100,
      color: 0x2196F3,
      ...config
    };
    
    this.group = new THREE.Group();
    this.mesh = this.createMesh();
    this.htmlElement = this.createHTMLElement();
    this.htmlObject = new CSS2DObject(this.htmlElement);
    
    this.group.add(this.mesh);
    this.group.add(this.htmlObject);
    
    this.setTransform(
      this.config.position!,
      this.config.rotation,
      this.config.scale
    );

    // Initial log to debug creation
    console.log('[PathNode] Created node', this.userData.nodeId);
    
    // DISABLE ANIMATIONS - Force visibility
    this.group.scale.set(1, 1, 1);
    (this.mesh.material as THREE.MeshStandardMaterial).opacity = 1;
    (this.mesh.material as THREE.MeshStandardMaterial).transparent = true;
  }

  /**
   * Анимация появления ноды (DISABLED)
   */
  private playEntryAnimation(): void {
    // Disabled to restore functionality
  }

  /**
   * Создает 3D-меш корпуса ноды
   */
  private createMesh(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      this.config.width! / 100,
      this.config.height! / 100,
      0.2
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Добавляем userData для идентификации при raycasting
    const nodeId = this.generateId();
    mesh.userData.nodeId = nodeId;
    mesh.userData.isPathNode = true;
    (this.group as any).userData = (this.group as any).userData || {};
    this.group.userData.nodeId = nodeId; // Support group identification too
    
    return mesh;
  }
  
  /**
   * Создает HTML-элемент с контентом
   */
  private createHTMLElement(): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'path-node-content';
    div.innerHTML = this.config.html || '';
    
    // Базовые стили для HTML-контенера
    Object.assign(div.style, {
      width: `${this.config.width}px`,
      height: `${this.config.height}px`,
      background: 'rgba(30, 30, 40, 0.95)',
      border: '2px solid rgba(33, 150, 243, 0.8)',
      borderRadius: '8px',
      padding: '12px',
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      pointerEvents: 'auto',
      cursor: 'move',
      userSelect: 'none',
      overflow: 'hidden'
    });
    
    return div;
  }
  
  /**
   * Устанавливает трансформацию ноды
   */
  public setTransform(
    position?: { x: number; y: number; z: number },
    rotation?: { x: number; y: number; z: number },
    scale?: { x: number; y: number; z: number }
  ): void {
    if (position) {
      this.group.position.set(position.x, position.y, position.z);
    }
    
    if (rotation) {
      this.group.rotation.set(rotation.x, rotation.y, rotation.z);
    }
    
    if (scale) {
      this.group.scale.set(scale.x, scale.y, scale.z);
    }
  }
  
  /**
   * Обновляет HTML-контент ноды
   */
  public setHTML(html: string): void {
    this.htmlElement.innerHTML = html;
  }
  
  /**
   * Обновляет цвет корпуса ноды
   */
  public setColor(color: number): void {
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(color);
  }
  
  /**
   * Показывает/скрывает ноду
   */
  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }
  
  /**
   * Генерирует уникальный ID
   */
  private generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Возвращает позицию ноды
   */
  public getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }
  
  /**
   * Уничтожает ноду и освобождает ресурсы
   */
  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.htmlElement.remove();
  }
}
