# PathEngine 3D - Руководство по разработке

## 📋 Обзор

PathEngine 3D - это независимый модуль для создания интерактивных 3D-графических систем на базе Three.js с гибридным рендерингом (WebGL + HTML).

## 🏗️ Архитектура

### Основные компоненты

1. **PathViewport** - Центральный класс управления viewport
   - Интеграция Three.js (Scene, Camera, Renderer)
   - CSS2DRenderer для HTML-слоя
   - Управление жизненным циклом анимации
   - Система освещения

2. **PathNode** - Класс интерактивной ноды
   - 3D-меш (THREE.Group + THREE.Mesh)
   - HTML-контент через CSS2DObject
   - Гибкая трансформация (position, rotation, scale)

3. **InteractionSystem** - Система интерактивности
   - Raycasting для детекции объектов
   - Drag & Drop в 3D-пространстве
   - События: hover, click, drag start/end

4. **GridShader** - Процедурный бесконечный фон
   - Vertex/Fragment шейдеры
   - Реакция на позицию камеры
   - Интерактивность с курсором

## 🚀 Быстрый старт

### Установка зависимостей

```bash
cd packages/nodes-3d
npm install
```

### Сборка модуля

```bash
npm run build
```

Скомпилированные файлы появятся в `dist/`.

### Разработка с автоперекомпиляцией

```bash
npm run dev
```

## 💻 Использование

### Базовая инициализация

```typescript
import { initPathEngine } from '@path/nodes-3d';

const container = document.getElementById('viewport');
const engine = initPathEngine(container, {
  background: 0x0a0a0f,
  antialias: true,
  enableShadows: true
});
```

### Создание нод

```typescript
// Простая нода
const node1 = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>Hello World</div>'
});

// Кастомная нода
const node2 = engine.createNode({
  position: { x: 3, y: 2, z: 0 },
  rotation: { x: 0, y: 0.3, z: 0 },
  scale: { x: 1.2, y: 1.2, z: 1.2 },
  html: `
    <div style="padding: 16px;">
      <h3>Custom Node</h3>
      <p>With rich HTML content</p>
    </div>
  `,
  width: 250,
  height: 150,
  color: 0x9c27b0
});
```

### Работа с нодами

```typescript
// Изменение позиции
node1.setTransform({ x: 1, y: 2, z: 0 });

// Обновление HTML
node1.setHTML('<div>Updated content</div>');

// Изменение цвета
node1.setColor(0xff5722);

// Скрытие/показ
node1.setVisible(false);

// Получение позиции
const position = node1.getPosition();
```

### Интерактивность

```typescript
const engine = initPathEngine(container, {
  callbacks: {
    onNodeHover: (node) => {
      if (node) {
        console.log('Hovering:', node);
      }
    },
    
    onNodeClick: (node) => {
      console.log('Clicked:', node);
      engine.focusOnNode(node);
    },
    
    onNodeDragStart: (node) => {
      console.log('Drag started:', node);
    },
    
    onNodeDrag: (node, position) => {
      console.log('Dragging:', position);
    },
    
    onNodeDragEnd: (node) => {
      console.log('Drag ended:', node);
    }
  }
});
```

### Управление нодами

```typescript
// Получить все ноды
const allNodes = engine.getNodes();

// Удалить ноду
engine.removeNode(node1);

// Центрировать камеру на ноде
engine.focusOnNode(node2, true); // с анимацией
```

### Очистка ресурсов

```typescript
// При уничтожении компонента
engine.dispose();
```

## 🎨 Кастомизация

### Стили нод

HTML-контент нод можно стилизовать через inline-стили или CSS-классы:

```typescript
const node = engine.createNode({
  html: `
    <div class="my-custom-node">
      <h3>Styled Node</h3>
      <p>Custom styling</p>
    </div>
  `
});
```

```css
.my-custom-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
}
```

### Модификация шейдеров

Шейдеры находятся в [src/shaders/gridShader.ts](src/shaders/gridShader.ts). Можно изменить:

- Размер и частоту сетки
- Цвета и яркость
- Радиус влияния курсора
- Паттерны и эффекты

### Настройка контролов

```typescript
// После создания engine можно получить доступ к контролам
const controls = engine.getControls(); // (нужно добавить getter)

controls.minDistance = 5;
controls.maxDistance = 100;
controls.dampingFactor = 0.1;
```

## 📁 Структура файлов

```
packages/nodes-3d/
├── src/
│   ├── index.ts              # Entry point, initPathEngine()
│   ├── PathViewport.ts       # Основной класс viewport
│   ├── PathNode.ts           # Класс ноды
│   ├── InteractionSystem.ts  # Система интерактивности
│   └── shaders/
│       └── gridShader.ts     # Шейдеры фона
├── dist/                     # Скомпилированные файлы
├── demo.html                 # Демо-страница
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Технические детали

### Система координат

- X: горизонталь (лево/право)
- Y: вертикаль (низ/верх)
- Z: глубина (ближе/дальше от камеры)

### Производительность

- WebGL рендеринг для 3D-графики
- CSS2D для HTML (аппаратное ускорение)
- Процедурная генерация фона (один меш)
- Оптимизированный raycasting

### Совместимость

- Three.js r160+
- TypeScript 5.3+
- Современные браузеры с WebGL 2.0

## 🐛 Отладка

### Включение статистики

```typescript
import Stats from 'three/examples/jsm/libs/stats.module';

const stats = Stats();
document.body.appendChild(stats.dom);

// В цикле анимации
stats.update();
```

### Отображение вспомогательных объектов

```typescript
const scene = engine.getScene();

// Grid helper
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

// Axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
```

## 📚 Дальнейшее развитие

### Планируемые функции

- [ ] Система коннекторов между нодами
- [ ] Анимации трансформаций (GSAP integration)
- [ ] Мини-карта для навигации
- [ ] Группировка и иерархия нод
- [ ] Export/Import сцены в JSON
- [ ] Тулбар с инструментами
- [ ] Undo/Redo система
- [ ] Мультиселект нод

### Интеграция с основной системой

После тестирования модуль можно интегрировать в основное приложение:

```typescript
// В основном приложении
import { initPathEngine } from '@path/nodes-3d';

// Инициализация в нужном контейнере
const pathViewport = initPathEngine(
  document.getElementById('main-viewport')
);
```

## 📄 Лицензия

MIT

## 🤝 Вклад

Модуль находится в активной разработке. При добавлении новых функций следуйте архитектуре:

1. Изолированные классы с четкой ответственностью
2. TypeScript strict mode
3. Документирование публичных API
4. Примеры использования в README

---

**Status**: ✅ Core implementation complete  
**Version**: 1.0.0  
**Last Updated**: 2026-02-08
