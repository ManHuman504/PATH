# Архитектура Path# (Microkernel)

## Общая концепция

```
┌─────────────────────────────────────────┐
│           Extensions (UI)                │
│  (UglyUI, NiceUI, ... другие)           │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    [API Router]         [Event Bus]
        │                     │
┌───────▼──────────────────────▼────────┐
│      Engine (Core / Microkernel)       │
│                                        │
│ - dispatch(command)                   │
│ - getState() → ICoreState              │
│ - getEventBus()                        │
│ - getModuleManager()                   │
│ - getExtensionManager()                │
│ - save/load JSON                       │
└───────┬──────────────────────┬────────┘
        │                     │
    ┌───▼────┐         ┌─────▼──────┐
    │ Modules│         │  Extensions│
    │ Manager│         │  Manager   │
    └───┬────┘         └────────────┘
        │
    ┌───▼────────────────┐
    │ Home, Node, Year   │
    │ (регистрируются)   │
    └────────────────────┘
```

## Уровни архитектуры

### 1. Core (packages/core)

**Самостоятельный модуль, не зависит от UI.**

Содержит:
- `Engine` — выполняет команды, хранит состояние
- `EventBus` — pub/sub система для событий
- `ModuleManager` — управление модулями
- `ExtensionManager` — управление расширениями
- Типы: `IPath`, `INode`, `IEdge`, `IAchievement`
- Команды: `CreatePath`, `AddNode`, `ConnectNodes`, `CompleteNode`, etc.

**Принцип:** Core ничего не знает о UI, React, Electron, DOM.

### 2. Modules (packages/modules)

**Логические подсистемы платформы.**

Каждый модуль:
- Имеет `id` и `name`
- Реализует `activate(engine)` и `deactivate(engine)`
- Подписывается на события Engine

Примеры:
- `HomeModule` — главная, показывает статус
- `NodeModule` — работа с нодами (create, update, link)
- `YearModule` — фиксация прогресса по времени (года, месяцы, недели)

**Принцип:** Модуль активен только когда выбран (не "думает обо всём сразу").

### 3. Extensions (packages/extensions)

**UI-надстройки, могут меняться без изменения Core.**

Каждое расширение:
- Имеет `id` и `name`
- Реализует `enable(context)` и `disable(context)`
- Получает доступ **только** к публичному API Core (через `context`)
- **Не лезет** напрямую в приватные поля Engine

Примеры:
- `UglyUIExtension` — кнопки сверху, monospace
- `NiceUIExtension` — боковое меню, стили

**Принцип:** Core не импортирует расширения; расширения используют Core через API.

### 4. Web App (apps/web)

**Frontend для MVP демо.**

- Express сервер на Node.js
- REST API endpoints для команд
- Vanilla JS + HTML/CSS для UI
- Может работать с разными расширениями UI

## Data Flow

### Команда (Command)

```
UI (кнопка) 
  → POST /api/command 
  → engine.dispatch(command) 
  → Engine обновляет состояние
  → EventBus.emit('event')
  → Modules слышат событие
  → UI обновляется (polling /api/state)
```

### Пример: Создать ноду

```typescript
// 1. UI отправляет команду
POST /api/command {
  type: 'ADD_NODE',
  payload: { pathId, title }
}

// 2. Server передаёт в Engine
engine.dispatch(command)

// 3. Engine обновляет состояние
state.paths.get(pathId).nodes.push(newNode)

// 4. Engine публикует событие
eventBus.emit('node.added', { nodeId, node, pathId })

// 5. Modules слышат
NodeModule.subscribe('node.added', console.log)

// 6. UI запрашивает новое состояние
GET /api/state → { paths, achievements }

// 7. Браузер обновляет DOM
document.getElementById('node-list').innerHTML = ...
```

## Типы и Интерфейсы

### Path (Путь)

```typescript
interface IPath {
  id: string;
  title: string;
  nodes: INode[];
  edges: IEdge[];
  createdAt: Date;
}
```

### Node (Нода/Шаг)

```typescript
interface INode {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}
```

### Edge (Связь)

```typescript
interface IEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}
```

### Achievement (Ачивка)

```typescript
interface IAchievement {
  id: string;
  nodeId: string;
  pathId: string;
  completedAt: Date;
}
```

## Команды (Commands)

```typescript
type Command =
  | CreatePathCommand
  | DeletePathCommand
  | AddNodeCommand
  | UpdateNodeCommand
  | DeleteNodeCommand
  | ConnectNodesCommand
  | DisconnectNodesCommand
  | CompleteNodeCommand;

interface CreatePathCommand {
  type: 'CREATE_PATH';
  payload: { title: string; description?: string };
}

interface AddNodeCommand {
  type: 'ADD_NODE';
  payload: { pathId: string; title: string; description?: string };
}

interface CompleteNodeCommand {
  type: 'COMPLETE_NODE';
  payload: { pathId: string; nodeId: string };
}
// ... остальные команды
```

## События (Events)

```typescript
'path.created' → { pathId, path }
'path.deleted' → { pathId }
'node.added' → { pathId, nodeId, node }
'node.updated' → { pathId, nodeId, node }
'node.deleted' → { pathId, nodeId }
'node.completed' → { pathId, nodeId, achievement }
'edge.created' → { pathId, edgeId, edge }
'edge.deleted' → { pathId, edgeId }
'error' → { command, error }
```

## Расширения и безопасность (MVP-уровень)

### Что может расширение?

✅ Получить публичный API Engine через `context`
✅ Отписаться на события через EventBus
✅ Хранить свой UI-конфиг в localStorage (для браузера)
✅ Выполнять команды через Engine.dispatch()

### Что НЕ может расширение?

❌ Напрямую менять state.paths (должно быть через команды)
❌ Импортировать приватные классы Core
❌ Обходить EventBus для коммуникации

**Сейчас (MVP):** контракт на честность. Позже можно добавить sandbox/permissions.

## Сохранение состояния

### JSON формат

```json
{
  "paths": [
    {
      "id": "abc123",
      "title": "Learn TypeScript",
      "nodes": [
        {
          "id": "node1",
          "title": "Basics",
          "completed": false,
          "createdAt": "2026-01-28T10:00:00.000Z"
        }
      ],
      "edges": [
        {
          "id": "edge1",
          "fromNodeId": "node1",
          "toNodeId": "node2"
        }
      ],
      "createdAt": "2026-01-28T10:00:00.000Z"
    }
  ],
  "achievements": [
    {
      "id": "ach1",
      "nodeId": "node1",
      "pathId": "abc123",
      "completedAt": "2026-01-28T11:00:00.000Z"
    }
  ]
}
```

### API

```typescript
engine.save('./path-state.json');
engine.load('./path-state.json');
```

## Чек-лист для новых разработчиков

- [ ] Core не импортирует UI-зависимости
- [ ] UI не является источником истины (истина в Engine)
- [ ] Все действия идут через команды Core
- [ ] Модули можно включать/выключать
- [ ] Расширение может быть заменено без изменения Core
- [ ] Events логируются в консоль
- [ ] Состояние можно сохранить в JSON

---

**Больше примеров:** [EXAMPLES.md](./EXAMPLES.md)
