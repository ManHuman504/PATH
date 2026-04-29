# API Reference — Path# Core

## Engine API

### Methods

#### `dispatch(command: Command): void`

Выполнить команду. Обновляет состояние и публикует события.

```typescript
engine.dispatch({
  type: 'CREATE_PATH',
  payload: { title: 'My Path' },
});
```

#### `getState(): Readonly<ICoreState>`

Получить текущее состояние (read-only, frozen).

```typescript
const state = engine.getState();
const paths = Array.from(state.paths.values());
const achievements = Array.from(state.achievements.values());
```

#### `getEventBus(): EventBus`

Получить EventBus для подписки на события.

```typescript
const bus = engine.getEventBus();
bus.subscribe('node.completed', (event) => {
  console.log('Node completed:', event.nodeId);
});
```

#### `getModuleManager(): ModuleManager`

Получить ModuleManager для управления модулями.

```typescript
const mm = engine.getModuleManager();
await mm.activate('home-module', engine);
```

#### `getExtensionManager(): ExtensionManager`

Получить ExtensionManager для управления расширениями.

```typescript
const em = engine.getExtensionManager();
await em.enable('ugly-ui', {});
```

#### `save(filePath: string): void`

Сохранить состояние в JSON файл.

```typescript
engine.save('./state.json');
```

#### `load(filePath: string): void`

Загрузить состояние из JSON файла.

```typescript
engine.load('./state.json');
```

## EventBus API

### Methods

#### `subscribe<T>(eventType: string, handler: EventHandler<T>): () => void`

Подписаться на событие. Возвращает функцию отписки.

```typescript
const unsubscribe = bus.subscribe('path.created', (event) => {
  console.log(event.path.title);
});

// Позже отписаться
unsubscribe();
```

#### `emit<T>(eventType: string, event: T): void`

Опубликовать событие (используется внутри Core).

```typescript
bus.emit('custom.event', { data: 'value' });
```

#### `clear(): void`

Очистить все подписки.

```typescript
bus.clear();
```

## ModuleManager API

### Methods

#### `register(module: IModule): void`

Зарегистрировать модуль.

```typescript
const homeModule = new HomeModule();
mm.register(homeModule);
```

#### `activate(moduleId: string, engine: Engine): Promise<void>`

Активировать модуль.

```typescript
await mm.activate('home-module', engine);
```

#### `deactivate(moduleId: string, engine: Engine): Promise<void>`

Деактивировать модуль.

```typescript
await mm.deactivate('home-module', engine);
```

#### `isActive(moduleId: string): boolean`

Проверить, активен ли модуль.

```typescript
if (mm.isActive('home-module')) {
  console.log('Home module is active');
}
```

#### `getActiveModules(): IModule[]`

Получить список активных модулей.

```typescript
const active = mm.getActiveModules();
active.forEach((m) => console.log(m.name));
```

## ExtensionManager API

### Methods

#### `register(extension: IExtension): void`

Зарегистрировать расширение.

```typescript
const uglUI = new UglyUIExtension();
em.register(uglUI);
```

#### `enable(extensionId: string, context: any): Promise<void>`

Включить расширение.

```typescript
await em.enable('ugly-ui', {});
```

#### `disable(extensionId: string, context: any): Promise<void>`

Отключить расширение.

```typescript
await em.disable('ugly-ui', {});
```

#### `isEnabled(extensionId: string): boolean`

Проверить, включено ли расширение.

```typescript
if (em.isEnabled('ugly-ui')) {
  console.log('Ugly UI is enabled');
}
```

#### `getEnabledExtensions(): IExtension[]`

Получить список включенных расширений.

```typescript
const enabled = em.getEnabledExtensions();
enabled.forEach((e) => console.log(e.name));
```

## Web Server API (Express)

### Endpoints

#### `POST /api/command`

Выполнить команду.

```bash
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"CREATE_PATH","payload":{"title":"My Path"}}'
```

#### `GET /api/state`

Получить текущее состояние.

```bash
curl http://localhost:3000/api/state
```

Response:
```json
{
  "paths": [{ "id": "...", "title": "...", "nodes": [], "edges": [] }],
  "achievements": []
}
```

#### `POST /api/module/activate/:moduleId`

Активировать модуль.

```bash
curl -X POST http://localhost:3000/api/module/activate/home-module
```

#### `POST /api/module/deactivate/:moduleId`

Деактивировать модуль.

```bash
curl -X POST http://localhost:3000/api/module/deactivate/home-module
```

#### `GET /api/modules`

Получить список активных модулей.

```bash
curl http://localhost:3000/api/modules
```

Response:
```json
{
  "modules": [
    { "id": "home-module", "name": "Home Module" },
    { "id": "node-module", "name": "Node Module" }
  ]
}
```

#### `POST /api/extension/enable/:extensionId`

Включить расширение.

```bash
curl -X POST http://localhost:3000/api/extension/enable/ugly-ui
```

#### `POST /api/extension/disable/:extensionId`

Отключить расширение.

```bash
curl -X POST http://localhost:3000/api/extension/disable/ugly-ui
```

#### `GET /api/extensions`

Получить список включенных расширений.

```bash
curl http://localhost:3000/api/extensions
```

Response:
```json
{
  "extensions": [
    { "id": "ugly-ui", "name": "Ugly UI Extension" }
  ]
}
```

#### `GET /api/events`

Получить логы событий.

```bash
curl http://localhost:3000/api/events
```

Response:
```json
[
  { "type": "path.created", "timestamp": "2026-01-28T10:00:00.000Z" },
  { "type": "node.added", "timestamp": "2026-01-28T10:01:00.000Z" }
]
```

## Типы данных

### IPath

```typescript
interface IPath {
  id: string;
  title: string;
  nodes: INode[];
  edges: IEdge[];
  createdAt: Date;
}
```

### INode

```typescript
interface INode {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}
```

### IEdge

```typescript
interface IEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}
```

### IAchievement

```typescript
interface IAchievement {
  id: string;
  nodeId: string;
  pathId: string;
  completedAt: Date;
}
```

### ICoreState

```typescript
interface ICoreState {
  paths: Map<string, IPath>;
  achievements: Map<string, IAchievement>;
}
```

### IModule

```typescript
interface IModule {
  id: string;
  name: string;
  activate(engine: any): Promise<void>;
  deactivate(engine: any): Promise<void>;
}
```

### IExtension

```typescript
interface IExtension {
  id: string;
  name: string;
  enable(context: any): Promise<void>;
  disable(context: any): Promise<void>;
}
```

## Commands

### CreatePathCommand

```typescript
{
  type: 'CREATE_PATH',
  payload: {
    title: string,
    description?: string
  }
}
```

### DeletePathCommand

```typescript
{
  type: 'DELETE_PATH',
  payload: {
    pathId: string
  }
}
```

### AddNodeCommand

```typescript
{
  type: 'ADD_NODE',
  payload: {
    pathId: string,
    title: string,
    description?: string
  }
}
```

### UpdateNodeCommand

```typescript
{
  type: 'UPDATE_NODE',
  payload: {
    pathId: string,
    nodeId: string,
    title?: string,
    description?: string
  }
}
```

### DeleteNodeCommand

```typescript
{
  type: 'DELETE_NODE',
  payload: {
    pathId: string,
    nodeId: string
  }
}
```

### ConnectNodesCommand

```typescript
{
  type: 'CONNECT_NODES',
  payload: {
    pathId: string,
    fromNodeId: string,
    toNodeId: string
  }
}
```

### DisconnectNodesCommand

```typescript
{
  type: 'DISCONNECT_NODES',
  payload: {
    pathId: string,
    edgeId: string
  }
}
```

### CompleteNodeCommand

```typescript
{
  type: 'COMPLETE_NODE',
  payload: {
    pathId: string,
    nodeId: string
  }
}
```

## Events

```typescript
'path.created'
'path.deleted'
'node.added'
'node.updated'
'node.deleted'
'node.completed'
'edge.created'
'edge.deleted'
'error'
```

---

Смотри [EXAMPLES.md](./EXAMPLES.md) для практических примеров использования.
