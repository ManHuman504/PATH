# PathModule - Управление путями

## Что это?

PathModule - это модуль который:
- **Обрабатывает** команду CREATE_PATH
- **Управляет** состоянием путей (paths array)
- **Испускает** события когда путь создан
- **Предоставляет** вкладку для UI

## Роль в системе

```
Браузер (UI)
    ↓ fetch('/api/command', { type: 'CREATE_PATH', ... })
    ↓
Server
    ↓ engine.dispatch({ type: 'CREATE_PATH', ... })
    ↓
Engine
    ↓ вызывает обработчик команды
    ↓
PathModule ← ВЫ ЗДЕСЬ
    ├─ api.onCommand('CREATE_PATH')
    ├─ api.setState({ paths: [...] })
    ├─ api.emitEvent('path.created', ...)
    └─ api.getTabs() → [{ id: 'paths', title: 'Paths' }]
    ↓
HomeModule
    ├─ api.onEvent('path.created') → логирует
    
Server
    ↓ возвращает новое состояние
    ↓
Браузер
    ↓ location.reload() обновляет UI
```

## Исходный код

Файл: [packages/modules/src/pathModule.ts](../../packages/modules/src/pathModule.ts)

```typescript
import { IModule, EngineAPI } from '@path/core';

export class PathModule implements IModule {
  id = 'path-module';
  name = 'Path Module';
  
  async register(api: EngineAPI): Promise<void> {
    console.log('[PATH] Registering module');
    
    // Инициализировать состояние
    if (!api.getState().paths) {
      api.setState({ paths: [] });
    }
    
    // Зарегистрировать команду CREATE_PATH
    api.onCommand('CREATE_PATH', (payload: any) => {
      this.handleCreatePath(api, payload);
    });
  }
  
  private handleCreatePath(api: EngineAPI, payload: any) {
    const { title } = payload;
    
    if (!title || typeof title !== 'string') {
      console.error('[PATH] Invalid title');
      return;
    }
    
    // Создать новый путь
    const newPath = {
      id: 'path_' + Math.random().toString(36).substring(7),
      title: title.trim(),
      created: new Date().toISOString(),
      nodeCount: 0,
      nodes: []
    };
    
    // Обновить состояние
    const currentState = api.getState();
    api.setState({
      ...currentState,
      paths: [...currentState.paths, newPath]
    });
    
    // Испустить событие
    api.emitEvent('path.created', {
      path: newPath,
      timestamp: new Date().toISOString()
    });
    
    console.log(`[PATH] Path created: "${newPath.title}" (${newPath.id})`);
  }
  
  getTabs(): Array<{ id: string; title: string; icon: string }> {
    return [
      {
        id: 'paths',
        title: 'Paths',
        icon: '📍'
      }
    ];
  }
}
```

## Как это работает?

### Шаг 1: Регистрация модуля

```typescript
register(api: EngineAPI) {
  // Инициализировать состояние
  if (!api.getState().paths) {
    api.setState({ paths: [] });
  }
  
  // Зарегистрировать команду
  api.onCommand('CREATE_PATH', (payload) => {
    this.handleCreatePath(api, payload);
  });
}
```

Server вызывает `module.register(api)` при инициализации:

```typescript
// Server.ts
const pathModule = new PathModule();
await pathModule.register(engineAPI);
```

### Шаг 2: Пользователь создает путь

Браузер отправляет:
```javascript
fetch('/api/command', {
  method: 'POST',
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: 'My New Path' }
  })
});
```

### Шаг 3: Обработка команды

Engine вызывает обработчик:
```typescript
api.onCommand('CREATE_PATH', (payload) => {
  // payload = { title: 'My New Path' }
  this.handleCreatePath(api, payload);
});
```

### Шаг 4: Создание пути и обновление состояния

```typescript
const newPath = {
  id: 'path_abc123',
  title: 'My New Path',
  created: '2024-01-28T12:00:00Z',
  nodeCount: 0,
  nodes: []
};

api.setState({
  ...currentState,
  paths: [...currentState.paths, newPath]
});
```

### Шаг 5: Испускание события

```typescript
api.emitEvent('path.created', {
  path: newPath,
  timestamp: '2024-01-28T12:00:00Z'
});
```

HomeModule слушает это событие:
```typescript
api.onEvent('path.created', (data) => {
  console.log('[HOME] Path created:', data.path.title);
});
```

### Шаг 6: UI обновляется

Server возвращает новое состояние браузеру:
```json
{
  "success": true,
  "state": {
    "paths": [
      {
        "id": "path_abc123",
        "title": "My New Path",
        "created": "2024-01-28T12:00:00Z",
        "nodeCount": 0,
        "nodes": []
      }
    ]
  }
}
```

Браузер обновляет страницу:
```javascript
location.reload();
```

## Структура Path

```typescript
interface Path {
  id: string;              // Уникальный ID (path_abc123)
  title: string;           // Название пути
  created: string;         // ISO дата создания
  nodeCount: number;       // Количество узлов
  nodes: Node[];           // Массив узлов (пока пусто)
}
```

## Примеры использования

### Пример 1: Создать путь

```javascript
// Браузер
const response = await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: 'My Path' }
  })
});

const result = await response.json();
console.log('Paths:', result.state.paths);
```

### Пример 2: Получить список путей

```javascript
// Браузер
const response = await fetch('/api/state');
const state = await response.json();
console.log('All paths:', state.paths);
```

### Пример 3: Слушать события создания пути

```typescript
// В другом модуле
api.onEvent('path.created', (data) => {
  console.log('New path created:', data.path.title);
  // Сделать что-то с новым путем
});
```

## Правила для PathModule

### ✅ DO (Требования)

1. **Инициализировать состояние если нужно**
   ```typescript
   if (!api.getState().paths) {
     api.setState({ paths: [] });
   }
   ```

2. **Валидировать входные данные**
   ```typescript
   if (!title || typeof title !== 'string') {
     console.error('Invalid title');
     return;
   }
   ```

3. **Испускать события после изменения состояния**
   ```typescript
   api.setState({ paths: [...] });
   api.emitEvent('path.created', { path });
   ```

4. **Логировать операции для отладки**
   ```typescript
   console.log('[PATH] Path created:', newPath.id);
   ```

5. **Предоставлять вкладку для UI**
   ```typescript
   getTabs() {
     return [{ id: 'paths', title: 'Paths', icon: '📍' }];
   }
   ```

### ❌ DO NOT (Запреты)

1. **НЕ хранить состояние в модуле**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   private paths = [];
   
   // ✅ ПРАВИЛЬНО
   api.setState({ paths: [] });
   ```

2. **НЕ напрямую менять состояние**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   const state = api.getState();
   state.paths.push(newPath);  // Мутация!
   
   // ✅ ПРАВИЛЬНО
   api.setState({
     paths: [...api.getState().paths, newPath]
   });
   ```

3. **НЕ отправлять команды из модуля**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.dispatch({ type: 'CREATE_PATH', ... });
   
   // ✅ ПРАВИЛЬНО
   // Модуль только слушает команды, не отправляет
   ```

4. **НЕ использовать setTimeout/async без необходимости**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onCommand('CREATE_PATH', async (payload) => {
     await sleep(1000);  // Зачем ждать?
     this.handleCreatePath(api, payload);
   });
   
   // ✅ ПРАВИЛЬНО (если нужна задержка)
   api.onCommand('CREATE_PATH', async (payload) => {
     // Только если обращаемся к асинк API
     const data = await fetchExternalAPI();
     api.setState({ ...data });
   });
   ```

5. **НЕ смешивать несколько команд в одном обработчике**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onCommand('PATH_ACTION', (payload) => {
     if (payload.action === 'create') {
       this.handleCreatePath(api, payload);
     } else if (payload.action === 'delete') {
       this.handleDeletePath(api, payload);
     }
   });
   
   // ✅ ПРАВИЛЬНО
   api.onCommand('CREATE_PATH', (payload) => {
     this.handleCreatePath(api, payload);
   });
   api.onCommand('DELETE_PATH', (payload) => {
     this.handleDeletePath(api, payload);
   });
   ```

## ⚠️ Важное правило: НЕ добавлять "на будущее"

**Мастер-принцип Path#:**

> Функция, которая не участвует в ЖИВОМ сценарии — вредна.

ПОЭТОМУ:
- ❌ НЕ описывать UPDATE_PATH, DELETE_PATH если их нет в коде
- ❌ НЕ добавлять методы в API заранее "на будущее"
- ❌ НЕ проектировать "универсально" для неизвестного будущего

**В v0 есть ТОЛЬКО CREATE_PATH.** Она работает. Других команд нет.

Когда потребуется DELETE_PATH:
1. Появится реальный сценарий
2. Мы напишем код в PathModule
3. Обновим документацию
4. Готово

Не наоборот.

## Тестирование PathModule

### Unit тест (пример)

```typescript
import { PathModule } from './pathModule';
import { Engine } from '@path/core';

describe('PathModule', () => {
  let module: PathModule;
  let engine: Engine;
  
  beforeEach(() => {
    module = new PathModule();
    engine = new Engine();
  });
  
  it('should create path', async () => {
    await module.register(engine.getAPI());
    
    engine.dispatch({
      type: 'CREATE_PATH',
      payload: { title: 'Test Path' }
    });
    
    const state = engine.getState();
    expect(state.paths).toHaveLength(1);
    expect(state.paths[0].title).toBe('Test Path');
  });
  
  it('should emit event when path created', async () => {
    await module.register(engine.getAPI());
    
    let eventFired = false;
    engine.getAPI().onEvent('path.created', () => {
      eventFired = true;
    });
    
    engine.dispatch({
      type: 'CREATE_PATH',
      payload: { title: 'Test Path' }
    });
    
    expect(eventFired).toBe(true);
  });
});
```

## Связь с другими модулями

```
PathModule
  ├─ испускает: path.created
  ├─ слушает: (ничего пока)
  │
HomeModule
  ├─ слушает: path.created
  └─ логирует событие

NodeModule
  ├─ будет: слушать path.created
  └─ будет: инициализировать nodes массив
```


