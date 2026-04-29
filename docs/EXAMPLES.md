# Примеры использования Path# Core

## 1. Создание Engine и работа с путями

```typescript
import { Engine } from '@path/core';

const engine = new Engine();

// Создать путь
engine.dispatch({
  type: 'CREATE_PATH',
  payload: {
    title: 'Learn TypeScript',
    description: 'Complete TypeScript guide',
  },
});

// Получить состояние
const state = engine.getState();
const pathId = Array.from(state.paths.keys())[0];

console.log(state.paths.get(pathId));
```

## 2. Работа с нодами

```typescript
// Добавить ноду в путь
engine.dispatch({
  type: 'ADD_NODE',
  payload: {
    pathId,
    title: 'Basics',
    description: 'Learn the basics',
  },
});

// Получить список нод
const path = state.paths.get(pathId);
const nodeId = path.nodes[0].id;

console.log(path.nodes);
```

## 3. Связывание нод

```typescript
// Создать еще одну ноду
engine.dispatch({
  type: 'ADD_NODE',
  payload: {
    pathId,
    title: 'Advanced',
  },
});

const nodes = state.paths.get(pathId)!.nodes;
const fromNodeId = nodes[0].id;
const toNodeId = nodes[1].id;

// Связать ноды
engine.dispatch({
  type: 'CONNECT_NODES',
  payload: {
    pathId,
    fromNodeId,
    toNodeId,
  },
});

const edges = state.paths.get(pathId)!.edges;
console.log(edges); // [{ id, fromNodeId, toNodeId }]
```

## 4. Отметить ноду как выполненную

```typescript
engine.dispatch({
  type: 'COMPLETE_NODE',
  payload: {
    pathId,
    nodeId,
  },
});

const achievements = state.achievements;
console.log(achievements); // содержит достижение
```

## 5. Подписка на события

```typescript
const eventBus = engine.getEventBus();

eventBus.subscribe('path.created', (event) => {
  console.log('Path created:', event.path.title);
});

eventBus.subscribe('node.completed', (event) => {
  console.log('Node completed:', event.nodeId);
});

eventBus.subscribe('error', (event) => {
  console.error('Error:', event.error);
});
```

## 6. Модули

```typescript
import { HomeModule, NodeModule, YearModule } from '@path/modules';

const homeModule = new HomeModule();
const engine = new Engine();

// Регистрировать модуль
engine.getModuleManager().register(homeModule);

// Активировать модуль
await engine.getModuleManager().activate('home-module', engine);

// Проверить активность
const isActive = engine.getModuleManager().isActive('home-module');
console.log(isActive); // true

// Деактивировать модуль
await engine.getModuleManager().deactivate('home-module', engine);
```

## 7. Расширения

```typescript
import { UglyUIExtension } from '@path/extensions';

const uglyUI = new UglyUIExtension();
engine.getExtensionManager().register(uglyUI);

// Включить расширение
await engine.getExtensionManager().enable('ugly-ui', {});

// Отключить расширение
await engine.getExtensionManager().disable('ugly-ui', {});
```

## 8. Сохранение и загрузка состояния

```typescript
// Сохранить состояние в JSON файл
engine.save('./path-state.json');

// Загрузить состояние из JSON файла
const engine2 = new Engine();
engine2.load('./path-state.json');

const state2 = engine2.getState();
console.log(state2.paths.size); // будет равна размеру из первого engine
```

## 9. Полный workflow

```typescript
import { Engine } from '@path/core';
import { HomeModule, NodeModule, YearModule } from '@path/modules';

const engine = new Engine();

// Зарегистрировать модули
engine.getModuleManager().register(new HomeModule());
engine.getModuleManager().register(new NodeModule());
engine.getModuleManager().register(new YearModule());

// Активировать модули
await engine.getModuleManager().activate('node-module', engine);

// Подписаться на события
engine.getEventBus().subscribe('node.completed', (event) => {
  console.log(`🎉 Node completed: ${event.nodeId}`);
});

// Создать путь
engine.dispatch({
  type: 'CREATE_PATH',
  payload: { title: 'My Learning Path' },
});

const state = engine.getState();
const pathId = Array.from(state.paths.keys())[0];

// Добавить несколько нод
const nodeIds: string[] = [];
for (let i = 0; i < 3; i++) {
  engine.dispatch({
    type: 'ADD_NODE',
    payload: { pathId, title: `Step ${i + 1}` },
  });
}

const nodes = state.paths.get(pathId)!.nodes;
nodeIds.push(...nodes.map((n) => n.id));

// Связать ноды в цепь
for (let i = 0; i < nodeIds.length - 1; i++) {
  engine.dispatch({
    type: 'CONNECT_NODES',
    payload: {
      pathId,
      fromNodeId: nodeIds[i],
      toNodeId: nodeIds[i + 1],
    },
  });
}

// Отметить первую ноду как выполненную
engine.dispatch({
  type: 'COMPLETE_NODE',
  payload: { pathId, nodeId: nodeIds[0] },
});

// Сохранить состояние
engine.save('./my-path.json');

console.log('Done! Check ./my-path.json');
```

---

Больше примеров в тестах и исходниках:
- `engine/core/src/engine.ts`
- `modules/modules/src/*`
- `apps/web/src/server.ts`
