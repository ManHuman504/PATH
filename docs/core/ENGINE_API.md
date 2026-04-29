# EngineAPI - Контракт между Engine и Модулями

## Что такое EngineAPI?

**EngineAPI** — это единственное **публичное API** которое Engine предоставляет модулям. Это контракт:

> "Вот что ты можешь делать. Больше ничего."

Модулю не дается прямой доступ к Engine. Вместо этого он получает `EngineAPI` с ограниченным набором методов.

## Интерфейс EngineAPI

```typescript
interface EngineAPI {
  // 1️⃣ Команды
  onCommand(type: string, handler: CommandHandler): void;
  
  // 2️⃣ События
  emitEvent(type: string, data?: any): void;
  getEventBus(): IEventBus;
  
  // 3️⃣ Состояние
  getState(): Record<string, any>;
  setState(newState: Record<string, any>): void;
  
  // 4️⃣ Вкладки (модули как страницы)
  registerTab(tab: { id: string; title: string; icon?: string; }): void;
  getTabs(): Array<{ id: string; title: string; icon?: string; }>;
  
  // 5️⃣ Информация
  getAvailableCommands(): string[];
}
```

## Каждый метод - что он делает

### 1️⃣ Команды: `onCommand(type, handler)`

**Назначение**: регистрировать обработчик команды

```typescript
api.onCommand('CREATE_PATH', (payload) => {
  // Этот код выполнится когда сервер отправит команду CREATE_PATH
  const state = api.getState();
  const newPath = {
    id: uuid(),
    title: payload.title,
    nodes: []
  };
  api.setState({
    ...state,
    paths: [...state.paths, newPath]
  });
});
```

**Когда используется**: На этапе инициализации модуля в методе `register()`

**Что может вернуть**: ничего, это просто регистрация

### 2️⃣ События: `emitEvent(type, data)`

**Назначение**: сгенерировать событие, которое услышат другие модули

```typescript
api.onCommand('CREATE_PATH', (payload) => {
  const state = api.getState();
  // ... создаем путь ...
  api.setState({...state, paths: [...]});
  
  // 📢 Сказать другим модулям что произошло
  api.emitEvent('path.created', {
    path: newPath,
    timestamp: Date.now()
  });
});
```

**Когда используется**: После изменения состояния, чтобы уведомить остальное

**Что может вернуть**: ничего

### 3️⃣ События: `getEventBus().on(type, handler)`

**Назначение**: подписаться на событие от других модулей

```typescript
const eventBus = api.getEventBus();

eventBus.on('path.created', (data) => {
  console.log('Путь создан:', data.path.title);
  // Может сделать что-то в ответ (расчеты, логирование и т.д.)
});

eventBus.on('path.deleted', (data) => {
  console.log('Путь удален');
});
```

**Когда используется**: На этапе инициализации или когда нужно реагировать на события

**Что может вернуть**: ничего

### 4️⃣ Состояние: `getState()`

**Назначение**: получить текущее состояние всей системы

```typescript
const state = api.getState();

console.log(state.paths);     // Массив путей

// Состояние ЧИТАЕМОЕ, использовать для принятия решений
if (state.paths.length > 10) {
  // Много путей, может нужна оптимизация
}
```

**Когда используется**: Всегда когда нужна информация для логики

**Что может вернуть**: `Record<string, any>` - объект с состоянием

### 5️⃣ Состояние: `setState(newState)`

**Назначение**: обновить состояние (ВАЖНО: только из обработчика команды)

```typescript
// ✅ ПРАВИЛЬНО - в обработчике команды
api.onCommand('CREATE_PATH', (payload) => {
  const state = api.getState();
  api.setState({
    ...state,
    paths: [...state.paths, newPath]
  });
});

// ❌ НЕПРАВИЛЬНО - просто так из подписки на событие
eventBus.on('something', () => {
  api.setState({...}); // ПЛОХО! Может быть бесконечный цикл
});
```

**Когда используется**: Только в обработчиках команд

**Важно**: используй spread оператор для иммутабельности

```typescript
// ✅ ПРАВИЛЬНО (новый объект)
api.setState({ ...state, paths: [...state.paths, newPath] });

// ❌ НЕПРАВИЛЬНО (мутация)
state.paths.push(newPath);
api.setState(state);
```

### 6️⃣ Вкладки: `registerTab(tab)`

**Назначение**: сказать серверу что этот модуль имеет вкладку/табу в UI

```typescript
api.registerTab({
  id: 'paths-tab',
  title: 'Paths',
  icon: '📍'
});

api.registerTab({
  id: 'timeline-tab',
  title: 'Timeline',
  icon: '📅'
});
```

**Когда используется**: На этапе инициализации модуля

**Что это означает для сервера**: когда браузер запросит `/api/ui/tabs`, сервер вернет список всех зарегистрированных вкладок

### 7️⃣ Вкладки: `getTabs()`

**Назначение**: получить список вкладок (например для навигации)

```typescript
const tabs = api.getTabs();
// [
//   { id: 'paths-tab', title: 'Paths', icon: '📍' },
//   { id: 'timeline-tab', title: 'Timeline', icon: '📅' }
// ]
```

**Когда используется**: Когда нужно знать какие вкладки есть

### 8️⃣ Информация: `getAvailableCommands()`

**Назначение**: получить список всех доступных команд

```typescript
const commands = api.getAvailableCommands();
// ['CREATE_PATH', 'DELETE_PATH', 'ADD_NODE', ...]

// Сервер может отправить это UI чтобы показать какие действия возможны
```

**Когда используется**: На сервере когда нужно предоставить информацию UI

## Практический пример: PathModule

Вот как PathModule использует весь контракт:

```typescript
export class PathModule {
  id = 'path-module';
  name = 'Paths';
  version = '1.0.0';
  
  register(api: EngineAPI) {
    // 1️⃣ Зарегистрировать вкладку
    api.registerTab({
      id: 'paths-tab',
      title: 'Paths',
      icon: '📍'
    });
    
    // 2️⃣ Зарегистрировать обработчик CREATE_PATH
    api.onCommand('CREATE_PATH', (payload) => {
      const state = api.getState();
      
      const newPath = {
        id: crypto.randomUUID(),
        title: payload.title,
        nodes: [],
        createdAt: new Date().toISOString()
      };
      
      // Обновить состояние
      api.setState({
        ...state,
        paths: [...(state.paths || []), newPath]
      });
      
      // Уведомить других модулей
      api.emitEvent('path.created', { path: newPath });
    });
    
    // 3️⃣ Зарегистрировать DELETE_PATH
    api.onCommand('DELETE_PATH', (payload) => {
      const state = api.getState();
      api.setState({
        ...state,
        paths: state.paths.filter(p => p.id !== payload.pathId)
      });
      api.emitEvent('path.deleted', { pathId: payload.pathId });
    });
  }
}
```

И как HomeModule (слушатель) это использует:

```typescript
export class HomeModule {
  id = 'home-module';
  name = 'Home';
  version = '1.0.0';
  
  register(api: EngineAPI) {
    const eventBus = api.getEventBus();
    
    // Подписаться на события
    eventBus.on('path.created', (data) => {
      console.log('HomeModule: Path created -', data.path.title);
      // Может вычислить статистику и т.д.
    });
    
    eventBus.on('path.deleted', (data) => {
      console.log('HomeModule: Path deleted');
    });
  }
}
```

## Принципы работы с EngineAPI

### 1️⃣ Модуль получает EngineAPI, а не Engine

```typescript
// ✅ ПРАВИЛЬНО
register(api: EngineAPI) {
  api.onCommand('CREATE_PATH', ...);
}

// ❌ НЕПРАВИЛЬНО
register(engine: Engine) {
  // У тебя нет доступа к engine.commandHandlers и прочему
  // Это работает только потому что Engine дает EngineAPI
}
```

### 2️⃣ Через EngineAPI модуль **не может** сломать Engine

```typescript
// Модуль может только:
// ✅ Читать состояние через getState()
// ✅ Изменять состояние через setState()
// ✅ Обрабатывать команды через onCommand()
// ✅ Генерировать события через emitEvent()

// Модуль НЕ может:
// ❌ Удалить обработчик команды другого модуля
// ❌ Отключить EventBus
// ❌ Получить прямой доступ к внутренним структурам Engine
```

### 3️⃣ EngineAPI одинаков для всех модулей

Каждый модуль получает **один и тот же API** с одинаковыми возможностями:

```typescript
pathModule.register(engineAPI);
homeModule.register(engineAPI);  // Тот же самый API!
nodeModule.register(engineAPI);
yearModule.register(engineAPI);
```

Нет "привилегированных" модулей. Все равны перед API.

## Ограничения EngineAPI (Что НЕЛЬЗЯ делать)

### ❌ Нельзя:

1. **Изменять состояние вне обработчика команды**
   ```typescript
   // ❌ В подписке на событие
   eventBus.on('path.created', () => {
     api.setState({...}); // Может быть бесконечный цикл!
   });
   ```

2. **Вызывать api.emitEvent() вне обработчика команды**
   ```typescript
   // ❌ Множественные события за раз
   api.emitEvent('event1');
   api.emitEvent('event2');
   // Сложно отследить причину события
   ```

3. **Сохранять ссылку на API и использовать позже**
   ```typescript
   // ❌ Сохраняем для использования потом
   let savedAPI;
   
   api.onCommand('CREATE_PATH', (payload) => {
     savedAPI = api;
   });
   
   // Потом используем вне контекста
   setTimeout(() => {
     savedAPI.setState({...}); // Сложно отследить откуда это пришло
   }, 5000);
   ```

4. **Использовать setState() синхронно после dispatch()**
   ```typescript
   // ❌ Состояние может не обновиться сразу
   api.setState({...});
   const state = api.getState(); // Может быть не обновленное состояние
   ```

## Дополнительно

Документы по связанным темам:
- [Engine - ядро](./ENGINE.md)
- [Модули - как их писать](../modules/MODULES_OVERVIEW.md)
- [Server API - как браузер отправляет команды](../api/SERVER_API.md)
