# Обзор Модулей

## 🔗 Детальные документы по модулям

- **[PATH_MODULE.md](./PATH_MODULE.md)** - Подробная документация PathModule
- **[HOME_MODULE.md](./HOME_MODULE.md)** - Подробная документация HomeModule

---

## Что такое модули?

**Модули** — это изолированные **страницы/вкладки приложения**, каждая со своей бизнес-логикой. Критическое уточнение:

- **ТОЛЬКО ОДИН модуль активен одновременно** (как вкладки в браузере)
- Когда переходишь на другой модуль:
  - активный модуль деактивируется
  - следующий активируется  
  - неактивный НЕ рендерится
  - неактивный НЕ вычисляется
  - неактивный НЕ держит состояние в памяти (только в Core)
- Каждый модуль регистрируется в Engine через `register(api: EngineAPI)`
- Каждый модуль может обрабатывать команды через `api.onCommand()`
- Каждый модуль может слушать события через `api.onEvent()`
- Каждый модуль предоставляет вкладку через `getTabs()`

## Модули в Path# v0

### 1. PathModule 📍

**Назначение**: управление путями (создание, удаление, обновление)

**Что делает**:
- Обрабатывает `CREATE_PATH` команду
- Генерирует событие `path.created`
- Регистрирует вкладку "Paths"

**Команды**:
- `CREATE_PATH: { title: string }` → создает путь

**События**:
- `path.created: { path }` → путь создан

**Состояние**:
```typescript
state.paths = [
  {
    id: string;
    title: string;
    nodes: [];
    createdAt: string;
  }
]
```

**Файл**: `packages/modules/src/pathModule.ts`

### 2. HomeModule 🏠

**Назначение**: отслеживание событий и логирование в v0

**Что делает**:
- Подписывается на события `path.created`, `path.deleted`
- Логирует всё для отладки

**Команды**:
- Не обрабатывает

**События** (подписывается):
- `path.created` → логирует "Path created"
- `path.deleted` → логирует "Path deleted"

**Файл**: `packages/modules/src/homeModule.ts`

### 3. NodeModule 📦

**Статус**: Зарегистрирован, ожидает реального сценария

**Когда понадобится**: Когда появится сценарий, требующий работы с нодами (шагами) внутри путей, тогда добавим:
- Обработчики `ADD_NODE`, `REMOVE_NODE` команд
- События `node.added`, `node.completed`
- Хранение нодов в `state.nodes`

**Сейчас**: Модуль зарегистрирован, но не имеет функциональности. Это нормально - когда сценарий появится, добавим только то, что нужно.

**Файл**: `packages/modules/src/nodeModule.ts`

### 4. YearModule 📅

**Статус**: Зарегистрирован, ожидает реального сценария

**Когда понадобится**: Когда появится сценарий для годовой системы прогресса, тогда добавим:
- Управление годовой шкалой (дни, месяцы, годы)
- Отслеживание прогресса по дням
- События для временной шкалы

**Сейчас**: Модуль зарегистрирован, но не имеет функциональности. Это нормально - когда сценарий появится, добавим только то, что нужно.

**Файл**: `packages/modules/src/yearModule.ts`

## Как написать свой модуль

### Структура модуля

```typescript
import { IModule, EngineAPI } from '@path/core';

export class MyModule implements IModule {
  id = 'my-module';
  name = 'My Module';
  version = '1.0.0';
  
  register(api: EngineAPI) {
    // 1. Зарегистрировать вкладку
    api.registerTab({
      id: 'my-tab',
      title: 'My Tab'
    });
    
    // 2. Зарегистрировать команды
    api.onCommand('MY_COMMAND', (payload) => {
      const state = api.getState();
      // ... логика ...
      api.setState({...state, ...updates});
      api.emitEvent('my-event', {...});
    });
    
    // 3. Подписаться на события
    const eventBus = api.getEventBus();
    eventBus.on('other-module-event', (data) => {
      // ... реагировать на событие ...
    });
  }
}
```

### Пример: Полный модуль

```typescript
export class StatsModule implements IModule {
  id = 'stats-module';
  name = 'Statistics';
  version = '1.0.0';
  
  register(api: EngineAPI) {
    // Вкладка
    api.registerTab({
      id: 'stats-tab',
      title: 'Stats',
      icon: '📊'
    });
    
    // Команда для сброса статистики
    api.onCommand('RESET_STATS', () => {
      const state = api.getState();
      api.setState({
        ...state,
        stats: {
          totalPaths: 0,
          totalNodes: 0,
          completedPaths: 0
        }
      });
      api.emitEvent('stats.reset', {});
    });
    
    // Слушать события из PathModule
    const eventBus = api.getEventBus();
    eventBus.on('path.created', () => {
      const state = api.getState();
      const stats = state.stats || { totalPaths: 0, totalNodes: 0 };
      // Можно обновить статистику (но в отдельном обработчике команды!)
    });
  }
}
```

## Жизненный цикл модуля

```
1. NEW
   └─ Модуль создан

2. REGISTERED
   └─ Server вызывает module.register(api)
   └─ Модуль регистрирует команды через api.onCommand()
   └─ Модуль регистрирует вкладку через api.registerTab()
   └─ Модуль подписывается на события через eventBus.on()

3. ACTIVE
   └─ Может обрабатывать команды
   └─ Может слушать события

4. FOREVER
   └─ Модуль живет пока живет Engine
   └─ Нет явной деактивации
```

## Правила написания модулей

### ✅ DO (Требования)

1. **Имплементируй IModule interface**
   ```typescript
   class MyModule implements IModule {
     id: string;
     name: string;
     version: string;
     register(api: EngineAPI): void;
   }
   ```

2. **Используй только EngineAPI**
   ```typescript
   register(api: EngineAPI) {
     // ✅ Работай только с api
     // ❌ Не требуй Engine напрямую
   }
   ```

3. **Изменяй состояние только в обработчиках команд**
   ```typescript
   api.onCommand('MY_COMMAND', () => {
     api.setState({...}); // ✅ ПРАВИЛЬНО
   });
   
   eventBus.on('event', () => {
     api.setState({...}); // ❌ НЕПРАВИЛЬНО
   });
   ```

4. **Используй события для оповещения других модулей**
   ```typescript
   api.onCommand('CREATE_PATH', (payload) => {
     // ... логика ...
     api.emitEvent('path.created', {...});
   });
   ```

5. **Регистрируй команды в register()**
   ```typescript
   register(api) {
     api.onCommand('MY_COMMAND', handler); // ✅ Здесь
   }
   ```

### ❌ DO NOT (Запреты)

1. **Не импортируй другие модули напрямую**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   import PathModule from './path-module';
   
   class MyModule {
     register(api) {
       pathModule.doSomething(); // Сильная связь!
     }
   }
   ```

2. **Не изменяй состояние в подписке на событие**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   eventBus.on('path.created', () => {
     api.setState({...}); // Может быть цикл!
   });
   ```

3. **Не требуй прямой доступ к Engine**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   register(engine: Engine) {
     engine.privateMethod(); // Не существует!
   }
   ```

4. **Не сохраняй глобальное состояние в модуле**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   export class MyModule {
     private localState = {}; // Не надо!
     
     register(api) {
       api.onCommand('CMD', () => {
         this.localState = {...}; // Состояние только в Engine!
       });
     }
   }
   ```

5. **Не делай асинхронные команды без await**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onCommand('SAVE', async () => {
     api.setState({...}); // Может выполниться неправильно
     await someAPI.call();
   });
   ```

## Интеграция модуля в Server

Модули регистрируются в `apps/web/src/server.ts`:

```typescript
async function initializeModules() {
  const pathModule = new PathModule();
  const homeModule = new HomeModule();
  const nodeModule = new NodeModule();
  const yearModule = new YearModule();

  await engine.registerModule(pathModule);
  await engine.registerModule(homeModule);
  await engine.registerModule(nodeModule);
  await engine.registerModule(yearModule);
}
```

После этого модули автоматически доступны для браузера через:
- `/api/ui/tabs` → список вкладок
- `/api/command` → отправка команд
- `/api/state` → чтение состояния

## Примеры команд

### CREATE_PATH

```javascript
fetch('http://localhost:3000/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: 'Learning TypeScript' }
  })
});
```

Обработчик в PathModule:
```typescript
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
  api.emitEvent('path.created', { path: newPath });
});
```

## Тестирование модуля

```typescript
it('PathModule should create path', () => {
  const api = new TestEngineAPI(); // Mock EngineAPI
  const module = new PathModule();
  
  module.register(api);
  
  // Вызвать команду
  const handler = api.getCommandHandler('CREATE_PATH');
  handler({ title: 'Test Path' });
  
  // Проверить состояние
  const state = api.getState();
  expect(state.paths).toHaveLength(1);
  expect(state.paths[0].title).toBe('Test Path');
});
```

## Дополнительно

- [Engine](../core/ENGINE.md)
- [EngineAPI](../core/ENGINE_API.md)
- [PathModule детально](./PATH_MODULE.md)
- [Server API](../api/SERVER_API.md)
