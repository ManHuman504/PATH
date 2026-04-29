# Engine - Ядро Path#

## Что такое Engine?

**Engine** — это сердце Path#. Это полностью **генерический state machine**, который:

✅ **Что делает:**
- Хранит состояние приложения (`Record<string, any>`)
- Обрабатывает команды (любого типа)
- Генерирует события
- Управляет модулями и расширениями
- Предоставляет публичное API для модулей

❌ **Что НЕ делает:**
- Не знает о путях, нодах, ячейках календаря
- Не говорит как рисовать UI
- Не содержит бизнес-логику

## Как я это понимаю

Engine — это как **белый лист и набор инструментов**. Сам по себе он ничего не делает и не знает про ваш домен. Но он предоставляет инструменты:

- **Команды** → способ изменить состояние
- **События** → способ услышать о изменениях
- **Состояние** → единый источник истины
- **Модули** → способ добавить бизнес-логику

Мудулям нужно только сказать "зарегистрируйся", и они начнут работать.

## Структура Engine

```typescript
class Engine {
  // ❌ Нет специфичных методов для путей
  // ❌ Нет engine.createPath()
  // ❌ Нет engine.paths

  // ✅ Только универсальные методы
  async dispatch(command: { type: string; payload?: any })
  getState(): Record<string, any>
  setState(newState: Record<string, any>)
  async registerModule(module: IModule)
  getModules(): IModule[]
  
  // API для модулей
  getEngineAPI(): EngineAPI
  
  // Управление расширениями
  getActiveExtension(): IExtension | null
  enableExtension(id: string)
  disableExtension(id: string)
  
  // Вкладки (модули как страницы)
  registerTab(tab: ITab)
  getTabs(): ITab[]
  
  // Команды доступные в UI
  getAvailableCommands(): string[]
}
```

## Как работает dispatch (самый важный метод)

```typescript
async dispatch(command: { type: string; payload?: any }) {
  // 1. Найти обработчик команды
  const handler = this.commandHandlers.get(command.type);
  
  if (!handler) {
    console.warn(`No handler for command: ${command.type}`);
    return;
  }
  
  // 2. Выполнить обработчик
  await handler(command.payload);
  
  // 3. Обработчик сам вызывает api.setState() если нужно
  // 4. Обработчик сам вызывает api.emitEvent() если нужно
  
  // ✅ dispatch завершилась
  // Состояние обновилось, события отправлены
}
```

## Пример: CREATE_PATH команда

Вот как работает самая важная команда в v0:

```typescript
// 1. PathModule регистрирует обработчик
register(api: EngineAPI) {
  api.onCommand('CREATE_PATH', (payload) => {
    // payload = { title: "Learning TypeScript" }
    
    // 2. Получить текущее состояние
    const state = api.getState();
    const paths = state.paths || [];
    
    // 3. Создать новый путь (просто объект)
    const newPath = {
      id: generateId(),
      title: payload.title,
      createdAt: new Date(),
      nodes: []
    };
    
    // 4. Обновить состояние
    api.setState({
      ...state,
      paths: [...paths, newPath]
    });
    
    // 5. Отправить событие
    api.emitEvent('path.created', {
      path: newPath
    });
  });
}
```

При вызове:
```typescript
await engine.dispatch({
  type: 'CREATE_PATH',
  payload: { title: 'Learning TypeScript' }
});
```

Происходит:
1. ✅ Engine.dispatch() вызывает обработчик PathModule
2. ✅ Обработчик обновляет состояние через api.setState()
3. ✅ Обработчик генерирует событие path.created
4. ✅ HomeModule слышит событие и логирует "Path created"
5. ✅ engine.getState() теперь возвращает новый путь

## Жизненный цикл Engine

```
1. NEW
   └─ Engine создан, состояние пусто {}

2. INITIALIZING
   └─ Регистрируются модули
   └─ Модули вызывают register(api)
   └─ Модули подписываются на события
   └─ Регистрируются обработчики команд

3. READY
   └─ Готов к dispatch() команд
   └─ Готов возвращать getState()

4. RUNNING
   └─ Обрабатывает команды от браузера
   └─ Генерирует события
   └─ Хранит состояние в памяти
```

## Состояние (State)

State — это просто объект `Record<string, any>`:

```typescript
{
  paths: [
    {
      id: "abc123",
      title: "Learning TypeScript",
      nodes: [],
      createdAt: "2026-01-29T..."
    }
  ]
}
```

**ВАЖНО**: В v0 state содержит ТОЛЬКО то, что используется в реальных сценариях. НЕ добавляем поля "на будущее" (users, achievements, timeline и т.д.). Когда появится сценарий, который требует этих данных - тогда добавим.

### Правила работы с state:

1. **Состояние синглтон** — одно на весь Engine
2. **Состояние иммутабельно** — не изменяем напрямую, создаем новое
3. **setState() вызывается обработчиком** — не по команде сервера

```typescript
// ❌ НЕПРАВИЛЬНО
state.paths.push(newPath);  // Мутация!

// ✅ ПРАВИЛЬНО
api.setState({
  ...state,
  paths: [...state.paths, newPath]
});
```

## EngineAPI - Публичный контракт

Это единственное что видят модули:

```typescript
interface EngineAPI {
  // Команды
  onCommand(type: string, handler: CommandHandler): void;
  
  // События
  emitEvent(type: string, data: any): void;
  getEventBus(): IEventBus;
  
  // Состояние
  getState(): any;
  setState(newState: any): void;
  
  // Вкладки
  registerTab(tab: ITab): void;
  getTabs(): ITab[];
  
  // Информация
  getAvailableCommands(): string[];
}
```

Модуль получает этот API и работает через него. **Больше ничего видеть не должен.**

## Ограничения Engine (Что нельзя делать)

### ❌ Нельзя:

1. **Делать Engine специфичным для домена**
   - ❌ `engine.createPath(title)` 
   - ❌ `engine.paths` свойство
   - ❌ `engine.nodes`

2. **Добавлять логику в Engine**
   - ❌ `if (command.type === 'CREATE_PATH') { ... create logic ... }`
   - ✅ Логика в модулях, Engine только делегирует

3. **Давать модулям прямой доступ к Engine**
   - ❌ `module.engine = engine;`
   - ✅ `module.register(api)` где api = EngineAPI

4. **Хранить состояние в нескольких местах**
   - ❌ `engine.state` + `module.state`
   - ✅ Только `engine.getState()`

5. **Вызывать setState из UI**
   - ❌ `fetch('/api/state', { method: 'POST', body: newState })`
   - ✅ Только команды через `/api/command`

## Примеры использования

### Пример 1: Зарегистрировать обработчик команды

```typescript
class PathModule {
  register(api: EngineAPI) {
    api.onCommand('CREATE_PATH', (payload) => {
      const state = api.getState();
      const newPath = {
        id: uuid(),
        title: payload.title,
        nodes: []
      };
      api.setState({
        ...state,
        paths: [...(state.paths || []), newPath]
      });
    });
  }
}
```

### Пример 2: Подписаться на событие

```typescript
class HomeModule {
  register(api: EngineAPI) {
    const eventBus = api.getEventBus();
    
    eventBus.on('path.created', (data) => {
      console.log('Path created:', data.path.title);
      // Рассчитать статистику, обновить UI и т.д.
    });
  }
}
```

### Пример 3: Использовать текущее состояние

```typescript
api.onCommand('DELETE_PATH', (payload) => {
  const state = api.getState();
  const pathsWithoutDeleted = state.paths.filter(
    p => p.id !== payload.pathId
  );
  api.setState({
    ...state,
    paths: pathsWithoutDeleted
  });
});
```

## Почему Engine создан так?

### Проблема: Монолитный Engine

Если бы Engine знал про пути:

```typescript
// ❌ ПЛОХО
class Engine {
  paths: IPath[] = [];
  nodes: INode[] = [];
  
  createPath(title: string) {
    const path = new Path(title);
    this.paths.push(path);
  }
  
  addNode(pathId: string, nodeData: any) {
    const path = this.paths.find(p => p.id === pathId);
    path.addNode(nodeData);
  }
}
```

**Проблемы:**
- Engine растет с каждой фичей
- Сложно добавлять новый функционал
- Тестировать сложно (нужно мокировать весь Engine)
- Нельзя переносить на другую платформу (все упирается в Engine)

### Решение: Генерический Engine

```typescript
// ✅ ХОРОШО
class Engine {
  private state: Record<string, any> = {};
  
  dispatch(command: { type: string; payload?: any }) {
    const handler = this.handlers.get(command.type);
    handler?.(command.payload);
  }
  
  getState() { return this.state; }
  setState(newState) { this.state = newState; }
}
```

**Преимущества:**
- Engine очень маленький (~100 строк кода)
- Engine не меняется никогда (стабилен)
- Все изменения = новые модули
- Легко перенести на другую платформу (просто создаешь новый Server)
- Легко тестировать (Engine это просто dispatch + state)

## Дальнейшее развитие

### Может ли Engine расти?

Нет. Engine должен остаться маленьким навсегда. Новые возможности добавляются только как:

- ✅ Новые команды → новые обработчики в модулях
- ✅ Новые события → новые подписки в модулях
- ✅ Новое состояние → новые ключи в state (не новые методы Engine)

### Может ли Engine стать быстрее?

Да, но это не изменит API:

- ✅ Кэширование состояния
- ✅ Оптимизация dispatch
- ✅ Асинхронные операции (уже поддержаны)

Все останется совместимым.

## Контрольный список: правильно ли используется Engine?

Ответь "ДА" на все вопросы:

- ☐ Engine имеет метод `dispatch()`?
- ☐ Engine имеет `getState()` и `setState()`?
- ☐ Engine не знает про пути, ноды и т.д.?
- ☐ Модули получают `EngineAPI`, не прямой доступ к Engine?
- ☐ Все команды обрабатываются модулями?
- ☐ Состояние одно и в Engine?
- ☐ Нет специфичных методов для домена (типа `createPath`)?
- ☐ Новые фичи = новые модули, не новые методы Engine?

Если все "ДА" — архитектура правильная!
