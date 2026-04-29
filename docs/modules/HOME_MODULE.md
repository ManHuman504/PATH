# HomeModule - Главный модуль

## Что это?

HomeModule - это модуль который:
- **Не обрабатывает** команды (не имеет api.onCommand())
- **Слушает** события от других модулей
- **Логирует** происходящие события
- **Будет содержать** главную логику приложения

## Роль в системе

```
PathModule
    ├─ обрабатывает CREATE_PATH
    └─ испускает path.created
    
         ↓ событие
    
HomeModule ← ВЫ ЗДЕСЬ
    ├─ слушает path.created
    ├─ логирует событие
    └─ может запустить другие действия
```

## Исходный код

Файл: [packages/modules/src/homeModule.ts](../../packages/modules/src/homeModule.ts)

```typescript
import { IModule, EngineAPI } from '@path/core';

export class HomeModule implements IModule {
  id = 'home-module';
  name = 'Home Module';
  
  async register(api: EngineAPI): Promise<void> {
    console.log('[HOME] Registering module');
    
    // Слушать событие создания пути
    api.onEvent('path.created', (data) => {
      this.onPathCreated(api, data);
    });
  }
  
  private onPathCreated(api: EngineAPI, data: any) {
    const { path, timestamp } = data;
    console.log(`[HOME] Path created: "${path.title}" at ${timestamp}`);
    
    // Можно добавить дополнительную логику:
    // - Обновить статистику
    // - Отправить уведомление
    // - Запустить автосохранение
    // - Обновить индекс поиска
  }
  
  getTabs(): Array<{ id: string; title: string; icon: string }> {
    return [
      {
        id: 'home',
        title: 'Home',
        icon: '🏠'
      }
    ];
  }
}
```

## Как это работает?

### Шаг 1: Регистрация модуля

```typescript
register(api: EngineAPI) {
  // Зарегистрировать слушатель события
  api.onEvent('path.created', (data) => {
    this.onPathCreated(api, data);
  });
}
```

Server вызывает при инициализации:
```typescript
const homeModule = new HomeModule();
await homeModule.register(engineAPI);
```

### Шаг 2: PathModule создает путь

```typescript
// PathModule обрабатывает CREATE_PATH
api.emitEvent('path.created', {
  path: newPath,
  timestamp: '2024-01-28T12:00:00Z'
});
```

### Шаг 3: HomeModule получает событие

```typescript
api.onEvent('path.created', (data) => {
  // data = { path: {...}, timestamp: '...' }
  this.onPathCreated(api, data);
});
```

### Шаг 4: HomeModule обрабатывает событие

```typescript
onPathCreated(api: EngineAPI, data: any) {
  console.log('[HOME] Path created:', data.path.title);
  
  // Можно делать здесь:
  // - Обновлять UI
  // - Обновлять статистику
  // - Отправлять данные на сервер
  // - Запускать другие процессы
}
```
## Текущая роль (v0)

HomeModule на данный момент:
1. **Логирует** события (для отладки)
2. **Проверяет** что события работают
3. **Предоставляет** вкладку Home (пустая, для будущего расширения)

## ⚠️ Правило: "НЕ добавлять на будущее"

Мы НЕ добавляем функции "на будущее":
- ❌ НЕ добавляем статистику "может быть понадобится"
- ❌ НЕ добавляем быстрый доступ "может быть пригодится"
- ❌ НЕ расширяем функции "для готовности"

✅ **Когда сценарий появится**, добавим функцию
✅ **Только то, что используется**, находится в коде

Это ключевой принцип Path#. Неиспользуемый код = техдолг.

## Примеры событий для слушания

### Слушать создание пути

```typescript
api.onEvent('path.created', (data) => {
  console.log('New path:', data.path.title);
  // Сделать что-то
});
```

### Слушать удаление пути (когда будет реализовано)

```typescript
api.onEvent('path.deleted', (data) => {
  console.log('Path deleted:', data.path.id);
});
```

### Слушать добавление узла (когда будет реализовано)

```typescript
api.onEvent('node.added', (data) => {
  console.log('Node added:', data.node.title);
});
```

## Правила для HomeModule

### ✅ DO (Требования)

1. **Только слушать события, не отправлять команды**
   ```typescript
   // ✅ ПРАВИЛЬНО
   api.onEvent('path.created', handler);
   
   // ❌ НЕПРАВИЛЬНО (HomeModule не должна отправлять команды)
   api.dispatch({ type: 'CREATE_PATH', ... });
   ```

2. **Логировать все события для отладки**
   ```typescript
   // ✅ ПРАВИЛЬНО
   api.onEvent('path.created', (data) => {
     console.log('[HOME] Path created:', data.path.title);
     // Дополнительная обработка
   });
   ```

3. **Обрабатывать события асинхронно если нужно**
   ```typescript
   // ✅ ПРАВИЛЬНО
   api.onEvent('path.created', async (data) => {
     // Может быть async если нужна задержка
     await this.syncWithServer(data.path);
   });
   ```

4. **Предоставлять информацию о доступных вкладках**
   ```typescript
   // ✅ ПРАВИЛЬНО
   getTabs() {
     return [{ id: 'home', title: 'Home', icon: '🏠' }];
   }
   ```

### ❌ DO NOT (Запреты)

1. **НЕ отправлять команды**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onEvent('path.created', (data) => {
     api.dispatch({ type: 'LOG_ACTIVITY', ... });
   });
   ```

2. **НЕ менять состояние напрямую**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onEvent('path.created', (data) => {
     const state = api.getState();
     state.lastPath = data.path;  // Мутация!
   });
   
   // ✅ ПРАВИЛЬНО (если надо)
   api.onEvent('path.created', (data) => {
     api.setState({
       ...api.getState(),
       lastPath: data.path
     });
   });
   ```

3. **НЕ хранить состояние в модуле**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   class HomeModule {
     private eventCount = 0;
     
     onPathCreated(data) {
       this.eventCount++;  // Храним в модуле
     }
   }
   
   // ✅ ПРАВИЛЬНО
   class HomeModule {
     onPathCreated(api, data) {
       api.setState({
         eventCount: (api.getState().eventCount || 0) + 1
       });
     }
   }
   ```

4. **НЕ игнорировать ошибки**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onEvent('path.created', (data) => {
     const x = data.unknown.property.that.doesnt.exist; // Crash!
   });
   
   // ✅ ПРАВИЛЬНО
   api.onEvent('path.created', (data) => {
     if (!data?.path) {
       console.error('[HOME] Invalid event data');
       return;
     }
     
     try {
       this.handlePath(data.path);
     } catch (error) {
       console.error('[HOME] Error handling path:', error);
     }
   });
   ```

5. **НЕ регистрировать команды (это не роль HomeModule)**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   api.onCommand('HOME_ACTION', handler);
   
   // ✅ ПРАВИЛЬНО (если нужна специфичная команда)
   // Создать отдельный модуль для этого
   ```

## Примеры расширения HomeModule

### Пример 1: Подсчет статистики

```typescript
api.onEvent('path.created', (data) => {
  const state = api.getState();
  const stats = state.stats || { totalPaths: 0 };
  
  api.setState({
    ...state,
    stats: {
      totalPaths: stats.totalPaths + 1,
      lastPathCreated: new Date().toISOString()
    }
  });
  
  console.log('[HOME] Total paths:', stats.totalPaths + 1);
});
```

### Пример 2: Синхронизация с сервером

```typescript
api.onEvent('path.created', async (data) => {
  try {
    // Отправить на сервер
    const response = await fetch('https://api.example.com/sync', {
      method: 'POST',
      body: JSON.stringify({ path: data.path })
    });
    
    if (!response.ok) {
      console.error('[HOME] Sync failed');
      return;
    }
    
    console.log('[HOME] Synced with server');
  } catch (error) {
    console.error('[HOME] Sync error:', error);
  }
});
```

### Пример 3: Запуск уведомлений

```typescript
api.onEvent('path.created', (data) => {
  // Показать уведомление
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Path Created', {
      body: `New path: ${data.path.title}`,
      icon: '📍'
    });
  }
  
  console.log('[HOME] Notification sent');
});
```

### Пример 4: Обновление индекса поиска

```typescript
api.onEvent('path.created', (data) => {
  const state = api.getState();
  const index = state.searchIndex || {};
  
  // Добавить в индекс поиска
  index[data.path.id] = {
    title: data.path.title,
    content: data.path,
    timestamp: data.timestamp
  };
  
  api.setState({
    ...state,
    searchIndex: index
  });
  
  console.log('[HOME] Added to search index');
});
```

### Пример 5: Запуск работника (Worker)

```typescript
api.onEvent('path.created', (data) => {
  // Запустить асинхронную работу
  const worker = new Worker('/workers/index-paths.js');
  worker.postMessage({ path: data.path });
  
  worker.onmessage = (e) => {
    console.log('[HOME] Worker result:', e.data);
  };
});
```

## Интеграция с UI

HomeModule предоставляет вкладку:
```typescript
getTabs() {
  return [
    {
      id: 'home',
      title: 'Home',
      icon: '🏠'
    }
  ];
}
```

Server используемет эту информацию:
```typescript
const tabs = extensionManager.getTabs();
// tabs = [
//   { id: 'paths', title: 'Paths', icon: '📍' },
//   { id: 'home', title: 'Home', icon: '🏠' }
// ]

extension.renderUI({ state, tabs, commands });
```

UI может отобразить вкладки:
```html
<nav class="tabs">
  <button>📍 Paths</button>
  <button>🏠 Home</button>
</nav>
```

## Для чего это нужно?

HomeModule отделяет:
- **Бизнес-логику** (пути создаются в PathModule)
- **Системную логику** (реакции на события в HomeModule)

Это позволяет:
1. **Добавлять** новые реакции без изменения PathModule
2. **Удалять** реакции без влияния на создание путей
3. **Тестировать** отдельно PathModule и HomeModule
4. **Масштабировать** - добавлять новые модули слушатели

## Жизненный цикл

```
1. Server инициализирует HomeModule
2. HomeModule регистрирует слушатели событий
3. PathModule создает путь
4. PathModule испускает событие
5. HomeModule получает событие и обрабатывает
6. Процесс повторяется при каждом событии
```

## Дополнительно

- [PathModule](./PATH_MODULE.md)
- [Все модули](./MODULES_OVERVIEW.md)
- [Engine API](../core/ENGINE_API.md)
- [Server API](../api/SERVER_API.md)
