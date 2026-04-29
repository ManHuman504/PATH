# @path/nodes-3d

Независимый модуль для создания 3D-графической системы нод на базе Three.js с гибридным рендерингом (WebGL + HTML).

## Особенности

- 🎨 Бесконечный процедурный фон через кастомные шейдеры
- 🎯 Интерактивные 3D-ноды с HTML-контентом
- 🖱️ Drag & Drop в 3D-пространстве
- ⚡ Плавная анимация с инерцией
- 🔧 Полностью типизированный TypeScript

## Использование

```typescript
import { initPathEngine } from '@path/nodes-3d';

const container = document.getElementById('viewport');
const engine = initPathEngine(container);

// Создаем ноду
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>Hello World</div>'
});
```

## Архитектура

- **PathViewport** - основной класс viewport с Three.js сценой
- **PathNode** - класс ноды с гибридным рендерингом
- **GridShader** - процедурный бесконечный фон
- **InteractionSystem** - raycasting и drag-and-drop
