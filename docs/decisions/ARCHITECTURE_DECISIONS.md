# Решения архитектуры (ADRs)

## Введение

Этот документ объясняет **почему** была выбрана текущая архитектура Path#. Каждое решение включает:

- **Контекст** - почему этот вопрос был важен
- **Проблема** - что нужно было решить
- **Решение** - что выбрали
- **Альтернативы** - что рассматривали
- **Последствия** - что изменилось

---

## ADR-001: Microkernel архитектура

### Контекст

Path# должна быть:
1. **Легко расширяемой** - добавлять новые модули без изменения ядра
2. **Модульной** - каждый модуль независим
3. **Тестируемой** - можно тестировать модули отдельно
4. **Генерической** - ядро не знает о domain-specific концепциях

### Проблема

Если архитектура будет monolithic (все в одном месте):
- Сложно добавлять новые функции (затрагивают весь код)
- Сложно тестировать (все зависит от всего)
- Сложно понять (код перепутан)

Если архитектура будет слишком сложной (MicroServices):
- Overhead - нужна сеть между компонентами
- Сложно разрабатывать локально

### Решение

**Microkernel архитектура:**

```
┌──────────────────────────────────────────┐
│           Пользовательский интерфейс      │
│           (Браузер + JavaScript)         │
└──────────────────────┬────────────────────┘
                       │
                       ↓ HTTP API
                   Server (Express)
                       ↓
        ┌──────────────────────────────┐
        │       GENERIC CORE (Engine)   │
        │  • dispatch(command)          │
        │  • getState()                 │
        │  • emitEvent(event)           │
        └──────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │       PLUGINS (Modules)       │
        │  • PathModule                 │
        │  • HomeModule                 │
        │  • NodeModule                 │
        │  • YearModule                 │
        └──────────────────────────────┘
```

### Альтернативы

#### 1. Monolithic

```
Server
  ├─ Path management code
  ├─ Home management code
  ├─ Node management code
  └─ Year management code
```

**Минусы:**
- Если добавить новый домен - нужно менять Server
- Все части зависят друг от друга
- Сложно тестировать

#### 2. Microservices

```
API Gateway
  ├─ Path Service
  ├─ Home Service
  ├─ Node Service
  └─ Year Service
```

**Минусы:**
- Overhead коммуникации (HTTP между сервисами)
- Сложно разрабатывать локально
- Нужно разворачивать несколько приложений

### Последствия

✅ **Плюсы:**
- Engine не знает о PathModule, HomeModule и т.д.
- Можно добавить новый модуль без изменения Engine
- Каждый модуль легко тестировать
- Легко добавить UI расширение (UglyUIExtension)

⚠️ **Минусы:**
- Больше файлов (нужно разобраться в структуре)
- Нужно документация (что мы и делаем)

---

## ADR-002: EngineAPI как единственный public interface для модулей

### Контекст

Модули должны взаимодействовать с Engine. Вопрос: как это сделать?

### Проблема

Если модули имеют доступ напрямую к Engine:
```typescript
// ❌ Плохо
class PathModule {
  constructor(private engine: Engine) {}
  
  async register() {
    // Модуль может поломать engine
    this.engine.state = null;        // Проблема!
    this.engine.handlers.clear();    // Проблема!
  }
}
```

Если модули имеют доступ к разным interface:
```typescript
// ❌ Плохо
class PathModule {
  // Разные интерфейсы для разных операций
  constructor(
    private dispatchService: DispatchService,
    private stateService: StateService,
    private eventService: EventService
  ) {}
}
```

### Решение

**Единственный public interface - EngineAPI:**

```typescript
interface EngineAPI {
  dispatch(command): void;           // Отправить команду
  getState(): any;                   // Получить состояние
  setState(state): void;             // Обновить состояние
  
  onCommand(type, handler): void;    // Слушать команды
  emitEvent(type, data): void;       // Отправить событие
  onEvent(type, handler): void;      // Слушать события
  
  getTabs(): Array<{...}>;           // Получить вкладки для UI
  getAvailableCommands(): string[];  // Список команд
}
```

**Использование:**
```typescript
class PathModule implements IModule {
  async register(api: EngineAPI) {
    // Модуль может только:
    api.onCommand('CREATE_PATH', handler);  // ✅ OK
    api.emitEvent('path.created', data);    // ✅ OK
    api.getState();                         // ✅ OK
    
    // Модуль НЕ может:
    // api.state = null;                     // ❌ No direct access
    // api.handlers.clear();                 // ❌ No direct access
  }
}
```

### Альтернативы

#### 1. Функциональный подход (событиями только)

```typescript
class PathModule {
  register(eventBus: EventBus) {
    eventBus.on('command:CREATE_PATH', handler);
    eventBus.emit('path:created', data);
  }
}
```

**Минусы:**
- Модуль не может получить состояние (нужно слушать события)
- Сложная синхронизация

#### 2. Разные интерфейсы для разных операций

```typescript
interface CommandDispatcher { dispatch(cmd); }
interface StateStore { getState(); }
interface EventEmitter { emit(); }

class PathModule {
  register(
    dispatcher: CommandDispatcher,
    store: StateStore,
    emitter: EventEmitter
  ) {
    // Много зависимостей, непонятно какие нужны
  }
}
```

**Минусы:**
- Много зависимостей
- Модулю нужно знать обо всех интерфейсах

### Последствия

✅ **Плюсы:**
- Единая точка входа для модулей
- Безопасно (модуль не может поломать Engine)
- Документировать просто (всего 8 методов)
- Тестировать просто (mock EngineAPI)

⚠️ **Минусы:**
- Engine нужно реализовать EngineAPI
- Каждый новый метод нужно добавить в интерфейс

---

## ADR-003: HTTP API как единственный способ доступа для браузера

### Контекст

Браузер должен взаимодействовать с Engine (отправлять команды, получать состояние).

### Проблема

Если браузер имеет прямой доступ к Engine:
```javascript
// ❌ Невозможно!
import { Engine } from '@path/core';
engine.dispatch(...);
```

Это невозможно потому что:
1. Engine - это Node.js код (TypeScript, require())
2. Браузер - это JavaScript (может использовать только fetch, WebSocket и т.д.)

### Решение

**HTTP API как мост между браузером и Engine:**

```
Browser (JavaScript)
  │
  ├─ fetch('/api/command')  ← POST команда
  │
  ├─ fetch('/api/state')    ← GET состояние
  │
  └─ location.reload()      ← обновить UI
  
             ↓ HTTP
             
Server (Express)
  │
  ├─ POST /api/command      → engine.dispatch()
  │
  ├─ GET /api/state         → engine.getState()
  │
  └─ GET /api/ui/render     → extension.renderUI()
  
             ↓
             
Engine (TypeScript/Node.js)
```

**Реализация:**
```typescript
// Server.ts
app.post('/api/command', (req, res) => {
  const { type, payload } = req.body;
  
  try {
    engine.dispatch({ type, payload });
    res.json({
      success: true,
      state: engine.getState()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});
```

### Альтернативы

#### 1. WebSocket для real-time обновлений

```javascript
// Браузер
const ws = new WebSocket('ws://localhost:3000');
ws.send(JSON.stringify({ type: 'CREATE_PATH', ... }));
ws.onmessage = (event) => {
  const { state } = JSON.parse(event.data);
  updateUI(state);
};
```

**Плюсы:**
- Real-time обновления
- Меньше latency
- Можно синхронизировать между вкладками браузера

**Минусы:**
- Сложнее реализовать
- Нужно управлять соединением (reconnect, heartbeat)
- Сейчас достаточно простого HTTP

#### 2. GraphQL API

```javascript
// Браузер
const query = `
  query GetPaths {
    paths { id title }
  }
`;
fetch('/graphql', { body: JSON.stringify({ query }) });
```

**Плюсы:**
- Гибкость (браузер выбирает какие поля нужны)
- Единый endpoint

**Минусы:**
- Overhead (для простого CRUD не нужно)
- Сложнее тестировать

### Последствия

✅ **Плюсы:**
- Браузер не зависит от Node.js
- Легко масштабировать (можно добавить другой сервис на другом языке)
- Безопасно (браузер не может напрямую поломать Engine)
- Легко отладить (смотреть Network в DevTools)

⚠️ **Минусы:**
- Latency (HTTP запрос медленнее чем직接 вызов)
- Нужен Server (дополнительный слой)

---

## ADR-004: Расширения через HTTP, не через NPM

### Контекст

UI нужна определенная архитектура. Вопрос: как загружать расширения?

### Проблема

Если расширения загружаются через NPM:
```typescript
// ❌ Сложно
import UglyUIExtension from '@path/ugly-ui-extension';
import NiceUIExtension from '@path/nice-ui-extension';

const extensions = [new UglyUIExtension(), new NiceUIExtension()];
```

Нужно:
- Перезагружать Server если выбрать другое расширение
- Все расширения должны быть установлены
- Нельзя загружать расширение из браузера

### Решение

**Расширения встроены в Server, но загружаются через HTTP:**

```typescript
// Server инициализирует все расширения
const activeExtension = new UglyUIExtension();

// Браузер получает UI через HTTP
GET /api/ui/render
  ↓
Server вызывает activeExtension.renderUI()
  ↓
Браузер отображает HTML
```

### Альтернативы

#### 1. Динамическая загрузка расширений

```typescript
// Расширения как файлы в /extensions/
// Server загружает .js файлы динамически

const extensionPath = './extensions/ugly-ui.js';
const ExtensionClass = require(extensionPath);
const extension = new ExtensionClass();
```

**Плюсы:**
- Не нужно перезагружать Server
- Не нужно устанавливать через NPM

**Минусы:**
- Сложнее реализовать
- Нужно управлять жизненным циклом расширения
- Нужна система для выбора расширения

#### 2. Расширения как плагины браузера

```javascript
// Расширение это скрипт в браузере
<script src="/extensions/custom-ui.js"></script>

<script>
  const extension = new CustomUI();
  const html = extension.render(state);
</script>
```

**Плюсы:**
- Расширение может быть написано на JavaScript
- Не зависит от Server

**Минусы:**
- Расширение имеет доступ к DOM, может быть сложно
- Не типизировано

### Последствия

✅ **Плюсы:**
- Простая реализация
- Расширение типизировано (TypeScript)
- Безопасно (расширение работает на Server, не в браузере)
- Легко менять расширение (просто изменить activeExtension)

⚠️ **Минусы:**
- Нужно перезагружать Server чтобы менять расширение (потом добавим динамическую загрузку)
- Все расширения должны быть установлены

---

## ADR-005: Состояние в памяти (в данный момент)

### Контекст

Engine хранит состояние где-то. Где?

### Проблема

Если состояние хранить в памяти:
```typescript
// ❌ Проблемы
class Engine {
  state = {};  // Теряется при перезагрузке
}
```

Если состояние хранить в БД:
```typescript
// ❌ Сложно для MVP
class Engine {
  async getState() {
    return await database.query('...');
  }
}
```

### Решение (текущее, временное)

**Состояние в памяти:**

```typescript
class Engine {
  private state: any = {
    paths: []
  };
  
  getState() {
    return this.state;
  }
  
  setState(newState) {
    this.state = newState;
  }
}
```

**Использование:**
```typescript
// Создать путь
engine.setState({
  paths: [
    ...engine.getState().paths,
    { id: 'path_abc', title: 'My Path' }
  ]
});
```

### Альтернативы

#### 1. File System

```typescript
// Сохранять состояние в файл
const fs = require('fs');

getState() {
  return JSON.parse(fs.readFileSync('./state.json'));
}

setState(state) {
  fs.writeFileSync('./state.json', JSON.stringify(state, null, 2));
}
```

**Плюсы:**
- Состояние persists (сохраняется)
- Просто реализовать

**Минусы:**
- Медленнее (нужно писать в диск)
- Не масштабируется (каждое изменение = операция диска)

#### 2. База данных (PostgreSQL, MongoDB)

```typescript
getState() {
  return await db.collection('state').findOne({});
}

setState(state) {
  await db.collection('state').updateOne({}, { $set: state });
}
```

**Плюсы:**
- Масштабируется
- Можно иметь историю изменений
- Можно иметь несколько серверов

**Минусы:**
- Сложнее реализовать
- Нужна БД (дополнительный сервис)
- Overhead для MVP

### Последствия

✅ **Плюсы:**
- Просто реализовать (для MVP)
- Быстро (все в памяти)
- Не нужна БД (дополнительный сервис)

⚠️ **Минусы:**
- Состояние теряется при перезагрузке
- Не масштабируется (один процесс)

**План на будущее:**
1. MVP - состояние в памяти ✅ (текущее)
2. Сохранение в файл (просто, работает)
3. База данных (когда будет нужно масштабировать)

---

## ADR-006: TypeScript вместо JavaScript

### Контекст

На каком языке писать Path#?

### Решение

**TypeScript** (не JavaScript)

```typescript
// ✅ TypeScript
class Engine {
  private state: IState = {};
  
  dispatch(command: ICommand): void {
    // Compiler проверит типы
    const handler: ICommandHandler = this.handlers.get(command.type);
  }
}
```

vs

```javascript
// ❌ JavaScript
class Engine {
  dispatch(command) {
    // Нет проверки типов
    const handler = this.handlers.get(command.type);
  }
}
```

### Альтернативы

1. **JavaScript с JSDoc**
2. **Flow (Facebook's type checker)**
3. **Python/Rust/Go (другие языки)**

### Последствия

✅ **Плюсы:**
- Compile-time проверка типов (ошибки видны до запуска)
- IDE поддержка (автодополнение, рефакторинг)
- Документация в коде
- Легче для команды (большие проекты)

⚠️ **Минусы:**
- Нужно компилировать
- Больше кода (типы)

---

## Итоги

| Решение | Причина | Алтернатива |
|---------|---------|-----------|
| Microkernel | Модульность, тестируемость | Monolithic, Microservices |
| EngineAPI | Безопасность, простота | Direct access, многие интерфейсы |
| HTTP API | Браузер-Server разделение | WebSocket, GraphQL |
| Расширения через HTTP | Простота | Динамическая загрузка |
| Состояние в памяти | MVP простота | File System, DB |
| TypeScript | Надежность | JavaScript, Flow |

Эти решения выбирались для **простоты и скорости MVP разработки**, но могут измениться когда будет больше требований.
