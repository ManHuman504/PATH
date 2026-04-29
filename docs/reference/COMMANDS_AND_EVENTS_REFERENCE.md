# Справочная таблица: Реальные команды и события

## Команды (Commands)

### Зарегистрированные и работающие ✅

| Команда | Модуль | Где | Параметры | Статус |
|---------|--------|-----|-----------|--------|
| `CREATE_PATH` | PathModule | pathModule.ts:32 | `{ title: string }` | ✅ РАБОТАЕТ |
| `DELETE_PATH` | PathModule | pathModule.ts:44 | `{ pathId: string }` | ✅ РАБОТАЕТ |
| `ADD_NODE` | PathModule | pathModule.ts:57 | `{ pathId: string, title: string, description?: string }` | ✅ РАБОТАЕТ |

### Определены в типах но НЕ зарегистрированы ❌

| Команда | Где определена | Параметры | Статус | Примечание |
|---------|----------------|-----------|--------|-----------|
| `UPDATE_NODE` | commands.ts:31 | `{ pathId, nodeId, title?, description? }` | ❌ НЕТ ОБРАБОТЧИКА | Ожидает реализации |
| `DELETE_NODE` | commands.ts:42 | `{ pathId, nodeId }` | ❌ НЕТ ОБРАБОТЧИКА | Ожидает реализации |
| `CONNECT_NODES` | commands.ts:52 | `{ pathId, fromNodeId, toNodeId }` | ❌ НЕТ ОБРАБОТЧИКА | Ожидает реализации |
| `DISCONNECT_NODES` | commands.ts:63 | `{ pathId, edgeId }` | ❌ НЕТ ОБРАБОТЧИКА | Ожидает реализации |
| `COMPLETE_NODE` | commands.ts:73 | `{ pathId, nodeId }` | ❌ НЕТ ОБРАБОТЧИКА | Ожидает реализации |

---

## События (Events)

### Испускаются (emit) и слушаются (on) ✅

| События | Испускает | Слушает | Где | Статус |
|---------|-----------|---------|-----|--------|
| `path.created` | PathModule | HomeModule | pathModule.ts:48 → homeModule.ts:9 | ✅ РАБОТАЕТ |
| `node.added` | PathModule | NodeModule | pathModule.ts:75 → nodeModule.ts:9 | ✅ РАБОТАЕТ |

### Испускаются но НИКТО не слушает ⚠️

| События | Испускает | Где | Статус | Почему проблема |
|---------|-----------|-----|--------|-----------------|
| `path.deleted` | PathModule | pathModule.ts:54 | ⚠️ СИРОТА | HomeModule не слушает - нужно добавить |

### Определены в типах но НЕ испускаются ❌

| События | Где | Статус | Примечание |
|---------|-----|--------|-----------|
| `node.completed` | commands.ts | ❌ НИГДЕ | Ожидает реализации |
| `edge.connected` | commands.ts | ❌ НИГДЕ | Ожидает реализации |
| `edge.disconnected` | commands.ts | ❌ НИГДЕ | Ожидает реализации |

---

## Поток данных в реальности

### CREATE_PATH пример:

```
Browser (UglyUI HTML)
  ↓ onClick "Create" button
  ↓ document.getElementById('pathName').value
  ↓ sendCommand('CREATE_PATH') function
  ↓ fetch('http://localhost:3000/api/command', {
      method: 'POST',
      body: JSON.stringify({
        type: 'CREATE_PATH',
        payload: { title: 'My Path' }
      })
    })

Server (Express.js)
  ↓ POST /api/command handler
  ↓ engine.dispatch({ type: 'CREATE_PATH', payload: {...} })

Engine (engine.ts)
  ↓ Ищет обработчики в commandHandlers Map
  ↓ Находит 1 обработчик для 'CREATE_PATH'

PathModule (pathModule.ts:32)
  ↓ api.onCommand('CREATE_PATH', handler)
  ↓ const state = api.getState()
  ↓ state.paths.push({ id, title, nodes: [] })
  ↓ api.setState({ paths: [...] })
  ✓ api.emitEvent('path.created', { pathId, title })

EventBus (eventBus.ts)
  ↓ Есть подписчик на 'path.created'

HomeModule (homeModule.ts:9)
  ↓ api.getEventBus().on('path.created', handler)
  ✓ console.log('[HomeModule] Path created')

Browser (отправитель)
  ← Response: { success: true, state: { paths: [...] } }
  ← location.reload() → GET /api/ui/render

Server
  ↓ GET /api/ui/render
  ↓ const state = engine.getState()
  ↓ const html = extension.renderUI(state)

UglyUIExtension
  ↓ return `<!DOCTYPE html>...${state.paths.map(...)}`

Browser
  ← Новая HTML страница с путем в списке
  ✓ Пользователь видит результат!
```

---

## Интерфейсы в коде

### EngineAPI (engine.ts)

```typescript
interface EngineAPI {
  // Команды
  onCommand(commandType: string, handler: (payload: any) => void | Promise<void>): void;
  
  // События
  emitEvent(eventType: string, data: any): void;
  getEventBus(): EventBus;
  
  // Состояние
  getState(): Record<string, any>;
  setState(update: Record<string, any>): void;
  
  // Вкладки
  registerTab(tab: UITab): void;
  getTabs(): UITab[];
  
  // Информация
  getAvailableCommands(): string[];
}
```

**Используется**: ✅ В каждом модуле (parameter в register())

### IModule (engine.ts)

```typescript
interface IModule {
  id: string;
  name: string;
  version: string;
  register(api: EngineAPI): Promise<void>;
}
```

**Используется**: ✅ Все модули имплементируют

### UITab (engine.ts)

```typescript
interface UITab {
  id: string;
  title: string;
  moduleId: string;
  commands: string[];
  icon?: string;
}
```

**Используется**: ✅ PathModule регистрирует (строка 80)

### IUIExtension (extensions/interfaces.ts)

```typescript
interface IUIExtension {
  interceptRequest?(command: string, payload: any): Promise<boolean | any>;
  renderUI?(state: any): Promise<string>;
  handleEvent?(eventType: string, eventData: any, state: any): Promise<any>;
}
```

**Используется**: ❌ НЕ ИСПОЛЬЗУЕТСЯ! 
- NiceUIExtension и UglyUIExtension НЕ имплементируют этот интерфейс
- Они просто имеют свои собственные методы

---

## Модули состояние

### Какое состояние создает каждый модуль

| Модуль | Создает в state | Пример | Статус |
|--------|-----------------|--------|--------|
| PathModule | `state.paths` | `[{ id, title, nodes: [], createdAt }]` | ✅ Создает |
| HomeModule | Ничего | - | ✅ Только слушает |
| NodeModule | Ничего | - | ✅ Только слушает |
| YearModule | Ничего | - | ✅ Не имплементировано |

---

## Функции которые РАБОТАЮТ

### Engine (engine.ts)

| Метод | Где | Работает | Примечание |
|-------|-----|----------|-----------|
| `registerModule(module)` | engine.ts:55 | ✅ ДА | Регистрирует модуль один раз |
| `dispatch(command)` | engine.ts:68 | ✅ ДА | Выполняет команду |
| `onCommand(type, handler)` | engine.ts:87 | ✅ ДА | Регистрирует обработчик |
| `emitEvent(type, data)` | engine.ts:95 | ✅ ДА | Отправляет событие |
| `getState()` | engine.ts:103 | ✅ ДА | Возвращает копию состояния |
| `setState(update)` | engine.ts:110 | ✅ ДА | Обновляет состояние |
| `registerTab(tab)` | engine.ts:117 | ✅ ДА | Регистрирует вкладку |
| `getTabs()` | engine.ts:125 | ✅ ДА | Возвращает вкладки |
| `getAvailableCommands()` | engine.ts:132 | ✅ ДА | Возвращает список команд |
| `getEventBus()` | engine.ts:138 | ✅ ДА | Возвращает EventBus |

### EventBus (eventBus.ts)

| Метод | Работает | Примечание |
|-------|----------|-----------|
| `subscribe(type, handler)` | ✅ ДА | Подписывает и возвращает unsubscribe |
| `emit(type, event)` | ✅ ДА | Отправляет событие всем подписчикам |
| `on(type, handler)` | ✅ ДА | Alias для subscribe |
| `clear()` | ✅ ДА | Очищает все подписки |

### Модули

| Модуль | register() | Работает |
|--------|-----------|----------|
| PathModule | pathModule.ts:12 | ✅ ДА |
| HomeModule | homeModule.ts:8 | ✅ ДА |
| NodeModule | nodeModule.ts:8 | ✅ ДА |
| YearModule | yearModule.ts:8 | ✅ ДА (но пусто) |

---

## Статус по версиям

### Path# v0 MVP состояние:

```
✅ РАБОТАЮТ:
├─ Engine (микроядро)
├─ EventBus (события)
├─ State management
├─ CREATE_PATH команда
├─ DELETE_PATH команда
├─ ADD_NODE команда
└─ path.created и node.added события

🟠 ЧАСТИЧНО:
├─ path.deleted событие (испускается, не слушается)
├─ Node operations (команды определены, не реализованы)
└─ Edge operations (команды определены, не реализованы)

❌ НЕ РЕАЛИЗОВАНО:
├─ Update/Delete node
├─ Connect/Disconnect nodes
├─ Complete node
├─ Year/Timeline система
└─ Extension system (только HTML, нет JSON-описания как в docs)

⚠️ ДОКУМЕНТАЦИЯ:
├─ renderUI() неверно описана
├─ Модули неверно описаны
├─ Фейк-команды в документации
└─ Интерфейсы устарели
```

---

**Последнее обновление**: 29 января 2026  
**Версия аудита**: 1.0  
**Статус**: ✅ Актуально
