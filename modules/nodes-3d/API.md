# PathEngine 3D - API Reference

## 📦 Экспорты модуля

```typescript
import { 
  initPathEngine,
  PathViewport,
  PathNode,
  PathViewportConfig,
  PathNodeConfig,
  InteractionCallbacks 
} from '@path/nodes-3d';
```

---

## 🚀 initPathEngine()

Главная функция инициализации PathEngine.

### Сигнатура

```typescript
function initPathEngine(
  container: HTMLElement,
  config?: PathViewportConfig
): PathViewport
```

### Параметры

- **container**: `HTMLElement` - DOM-элемент контейнера для viewport
- **config**: `PathViewportConfig` (опционально) - Конфигурация viewport

### Возвращает

`PathViewport` - Экземпляр viewport

### Пример

```typescript
const engine = initPathEngine(
  document.getElementById('viewport'),
  {
    background: 0x0a0a0f,
    antialias: true,
    callbacks: {
      onNodeClick: (node) => console.log('Clicked:', node)
    }
  }
);
```

---

## 🎮 PathViewport

Основной класс управления viewport.

### Методы

#### `createNode(config: PathNodeConfig): PathNode`

Создает новую ноду.

```typescript
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>My Node</div>',
  color: 0x2196F3,
  width: 200,
  height: 100
});
```

#### `removeNode(nodeOrId: PathNode | string): void`

Удаляет ноду из сцены.

```typescript
engine.removeNode(node);
// или
engine.removeNode('node_id');
```

#### `getNodes(): PathNode[]`

Возвращает массив всех нод в сцене.

```typescript
const allNodes = engine.getNodes();
console.log('Total nodes:', allNodes.length);
```

#### `focusOnNode(node: PathNode, animated?: boolean): void`

Центрирует камеру на указанной ноде.

```typescript
engine.focusOnNode(node, true); // с анимацией
```

#### `getCamera(): THREE.PerspectiveCamera`

Возвращает камеру Three.js.

```typescript
const camera = engine.getCamera();
camera.position.set(0, 0, 15);
```

#### `getScene(): THREE.Scene`

Возвращает сцену Three.js.

```typescript
const scene = engine.getScene();
scene.fog = new THREE.Fog(0x000000, 10, 50);
```

#### `dispose(): void`

Уничтожает viewport и освобождает все ресурсы.

```typescript
engine.dispose();
```

---

## 📦 PathNode

Класс интерактивной ноды с гибридным рендерингом.

### Свойства

- **group**: `THREE.Group` - Корневая группа ноды
- **mesh**: `THREE.Mesh` - 3D-меш корпуса
- **htmlObject**: `CSS2DObject` - HTML-слой
- **htmlElement**: `HTMLDivElement` - DOM-элемент с контентом

### Методы

#### `setTransform(position?, rotation?, scale?): void`

Устанавливает трансформацию ноды.

```typescript
node.setTransform(
  { x: 1, y: 2, z: 0 },        // position
  { x: 0, y: 0.5, z: 0 },      // rotation (radians)
  { x: 1.5, y: 1.5, z: 1.5 }   // scale
);
```

#### `setHTML(html: string): void`

Обновляет HTML-контент ноды.

```typescript
node.setHTML('<div>Updated content</div>');
```

#### `setColor(color: number): void`

Изменяет цвет корпуса ноды.

```typescript
node.setColor(0xff5722); // Оранжевый
```

#### `setVisible(visible: boolean): void`

Показывает или скрывает ноду.

```typescript
node.setVisible(false); // Скрыть
node.setVisible(true);  // Показать
```

#### `getPosition(): THREE.Vector3`

Возвращает текущую позицию ноды.

```typescript
const pos = node.getPosition();
console.log(pos.x, pos.y, pos.z);
```

#### `dispose(): void`

Освобождает ресурсы ноды.

```typescript
node.dispose();
```

---

## ⚙️ Типы конфигурации

### PathViewportConfig

```typescript
interface PathViewportConfig {
  background?: number;           // Цвет фона (hex), по умолчанию 0x0a0a0f
  antialias?: boolean;          // Сглаживание, по умолчанию true
  enableShadows?: boolean;      // Тени, по умолчанию true
  callbacks?: InteractionCallbacks;
}
```

### PathNodeConfig

```typescript
interface PathNodeConfig {
  position?: { x: number; y: number; z: number };  // Позиция, default: {0,0,0}
  rotation?: { x: number; y: number; z: number };  // Вращение (радианы)
  scale?: { x: number; y: number; z: number };     // Масштаб, default: {1,1,1}
  html?: string;                                   // HTML-контент
  width?: number;                                  // Ширина в px, default: 200
  height?: number;                                 // Высота в px, default: 100
  color?: number;                                  // Цвет (hex), default: 0x2196F3
}
```

### InteractionCallbacks

```typescript
interface InteractionCallbacks {
  onNodeHover?: (node: PathNode | null) => void;
  onNodeClick?: (node: PathNode) => void;
  onNodeDragStart?: (node: PathNode) => void;
  onNodeDrag?: (node: PathNode, position: THREE.Vector3) => void;
  onNodeDragEnd?: (node: PathNode) => void;
}
```

---

## 🎯 События интерактивности

### onNodeHover

Вызывается при наведении/отведении курсора от ноды.

```typescript
onNodeHover: (node) => {
  if (node) {
    console.log('Hovering over:', node);
  } else {
    console.log('Not hovering');
  }
}
```

### onNodeClick

Вызывается при клике на ноду.

```typescript
onNodeClick: (node) => {
  console.log('Clicked node:', node);
  node.setColor(0xff0000);
}
```

### onNodeDragStart

Вызывается при начале перетаскивания ноды.

```typescript
onNodeDragStart: (node) => {
  console.log('Started dragging:', node);
  node.setColor(0xffff00);
}
```

### onNodeDrag

Вызывается во время перетаскивания ноды.

```typescript
onNodeDrag: (node, position) => {
  console.log('Position:', position.x, position.y);
}
```

### onNodeDragEnd

Вызывается при завершении перетаскивания.

```typescript
onNodeDragEnd: (node) => {
  console.log('Finished dragging:', node);
  
  // Сохраняем позицию
  const pos = node.getPosition();
  saveToDatabase(node, pos);
}
```

---

## 🎨 Стилизация HTML-контента нод

### Встроенные стили

```typescript
const node = engine.createNode({
  html: `
    <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <h3 style="margin: 0; color: white;">Title</h3>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8);">Description</p>
    </div>
  `
});
```

### CSS-классы

```typescript
// В HTML
const node = engine.createNode({
  html: `
    <div class="custom-node">
      <h3>Title</h3>
      <p>Description</p>
    </div>
  `
});

// В CSS
.custom-node {
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
}

.custom-node h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: white;
}
```

### Интерактивные элементы

```typescript
const node = engine.createNode({
  html: `
    <div style="padding: 16px;">
      <button id="myButton" style="padding: 8px 16px; background: #4fc3f7; 
              border: none; border-radius: 4px; color: white; cursor: pointer;">
        Click Me
      </button>
    </div>
  `
});

// Добавляем обработчик после создания
const button = node.htmlElement.querySelector('#myButton');
button.addEventListener('click', (e) => {
  e.stopPropagation(); // Предотвращаем всплытие
  alert('Button clicked!');
});
```

---

## 🔧 Продвинутое использование

### Доступ к Three.js объектам

```typescript
const camera = engine.getCamera();
const scene = engine.getScene();

// Добавление кастомных объектов
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### Кастомные униформы для шейдера

```typescript
// Доступ к шейдеру фона (требует модификации PathViewport)
const gridMesh = engine.gridMesh; // Нужно добавить getter
gridMesh.material.uniforms.uCursorRadius.value = 2.0;
```

### Анимации с внешними библиотеками

```typescript
import gsap from 'gsap';

const node = engine.createNode({
  position: { x: -5, y: 0, z: 0 },
  html: '<div>Animated</div>'
});

// Анимация с GSAP
gsap.to(node.group.position, {
  x: 5,
  duration: 2,
  ease: 'power2.inOut',
  yoyo: true,
  repeat: -1
});
```

---

## 🐛 Отладка

### Включение вспомогательных объектов

```typescript
import * as THREE from 'three';

const scene = engine.getScene();

// Сетка
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(gridHelper);

// Оси координат
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
```

### Логирование позиций

```typescript
const engine = initPathEngine(container, {
  callbacks: {
    onNodeDrag: (node, position) => {
      console.log(`Node position: x=${position.x.toFixed(2)}, y=${position.y.toFixed(2)}`);
    }
  }
});
```

---

## 📊 Примеры паттернов

### Фабрика нод

```typescript
function createNodeFactory(engine) {
  return {
    createTextNode(text, position) {
      return engine.createNode({
        position,
        html: `<div style="padding: 12px;">${text}</div>`
      });
    },
    
    createImageNode(imageUrl, position) {
      return engine.createNode({
        position,
        html: `<img src="${imageUrl}" style="width: 100%; border-radius: 8px;">`,
        width: 150,
        height: 150
      });
    }
  };
}

const factory = createNodeFactory(engine);
factory.createTextNode('Hello', { x: 0, y: 0, z: 0 });
```

### Менеджер нод

```typescript
class NodeManager {
  constructor(engine) {
    this.engine = engine;
    this.nodes = new Map();
  }
  
  create(id, config) {
    const node = this.engine.createNode(config);
    this.nodes.set(id, node);
    return node;
  }
  
  remove(id) {
    const node = this.nodes.get(id);
    if (node) {
      this.engine.removeNode(node);
      this.nodes.delete(id);
    }
  }
  
  get(id) {
    return this.nodes.get(id);
  }
}

const manager = new NodeManager(engine);
manager.create('node1', { position: { x: 0, y: 0, z: 0 } });
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-08
