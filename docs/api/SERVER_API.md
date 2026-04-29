# REST API сервера Path#

## Обзор

Server - это Express.js приложение на порту 3000. Он:

1. **Рендерит UI** (расширения)
2. **Обрабатывает команды** (от браузера)
3. **Предоставляет состояние** (через API)
4. **Управляет модулями** (инициализация)

```
Browser
  │
  ├─ GET /                      → Редирект на /api/ui/render
  │
  ├─ GET /api/ui/render        → HTML UI
  │
  ├─ POST /api/command         → Отправить команду
  │
  ├─ GET /api/state            → Получить состояние
  │
  ├─ GET /api/extensions       → Список расширений
  │
  ├─ GET /api/tabs             → Список вкладок
  │
  ├─ GET /api/modules          → Список модулей
  │
  └─ GET /api/commands         → Список команд
```

## Эндпоинты

### 1. GET / - Главная страница

Редирект на UI.

**Запрос:**
```
GET http://localhost:3000
```

**Ответ:**
```
302 Found
Location: /api/ui/render
```

---

### 2. GET /api/ui/render - Получить UI

Возвращает **полную HTML страницу** с UI расширением.

**Запрос:**
```
GET http://localhost:3000/api/ui/render
```

**Ответ:**
```http
HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head>
    <title>Path#</title>
    <style>...</style>
  </head>
  <body>
    <h1>Path#</h1>
    <!-- UI Content -->
    <script>
      async function sendCommand(type) { ... }
    </script>
  </body>
</html>
```

**Размер:** ~12,544 байт (весь UI в одном файле)

**Как работает:**
```
1. Server получает GET /api/ui/render
2. Server вызывает engine.getState()
3. Server вызывает extensionManager.getTabs()
4. Server вызывает engine.getAvailableCommands()
5. Server вызывает activeExtension.renderUI({ state, tabs, commands })
6. Server возвращает HTML браузеру
7. Браузер отображает страницу с встроенным JavaScript
```

**Ошибки:**
- 500 - если Extension.renderUI() упал

---

### 3. POST /api/command - Отправить команду

Отправить команду в Engine для выполнения.

**Запрос:**
```http
POST http://localhost:3000/api/command
Content-Type: application/json

{
  "type": "CREATE_PATH",
  "payload": {
    "title": "My New Path"
  }
}
```

**Ответ (успех):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "state": {
    "paths": [
      {
        "id": "path_abc123",
        "title": "My New Path",
        "created": "2024-01-28T12:00:00Z"
      }
    ]
  }
}
```

**Ответ (ошибка):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Unknown command type: INVALID_TYPE"
}
```

**Как работает:**
```
1. Server получает POST /api/command
2. Server парсит JSON body: { type, payload }
3. Server вызывает engine.dispatch({ type, payload })
4. Engine выполняет команду (вызывает обработчик)
5. Engine обновляет state
6. Engine испускает события
7. Server возвращает { success: true, state }
```

**Примеры команд:**

**Создать путь:**
```javascript
await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: 'My Path' }
  })
});
```

**Удалить путь (когда будет реализована):**
```javascript
await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'DELETE_PATH',
    payload: { id: 'path_abc123' }
  })
});
```

---

### 4. GET /api/state - Получить состояние

Возвращает текущее состояние Engine.

**Запрос:**
```
GET http://localhost:3000/api/state
```

**Ответ:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "paths": [
    {
      "id": "path_abc123",
      "title": "My New Path",
      "created": "2024-01-28T12:00:00Z"
    },
    {
      "id": "path_def456",
      "title": "Another Path",
      "created": "2024-01-28T12:01:00Z"
    }
  ]
}
```

**Когда использовать:**
- Для получения свежего состояния (вместо перезагрузки)
- Для синхронизации между вкладками браузера
- Для отладки

**JavaScript пример:**
```javascript
// Получить свежее состояние
const response = await fetch('/api/state');
const state = await response.json();

console.log('Paths:', state.paths);
```

---

### 5. GET /api/extensions - Список расширений

Возвращает информацию об активном расширении.

**Запрос:**
```
GET http://localhost:3000/api/extensions
```

**Ответ:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "active": {
    "id": "ugly-ui",
    "name": "Simple UI"
  }
}
```

**Использование:**
```javascript
const response = await fetch('/api/extensions');
const ext = await response.json();

console.log('Active extension:', ext.active.name);
```

---

### 6. GET /api/tabs - Список вкладок

Возвращает вкладки от модулей.

**Запрос:**
```
GET http://localhost:3000/api/tabs
```

**Ответ:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "paths",
    "title": "Paths",
    "icon": "📍"
  },
  {
    "id": "home",
    "title": "Home",
    "icon": "🏠"
  }
]
```

**Как это работает:**
```
Server вызывает каждый модуль:
  pathModule.getTabs()    → [{ id: 'paths', title: 'Paths', icon: '📍' }]
  homeModule.getTabs()    → [{ id: 'home', title: 'Home', icon: '🏠' }]
  nodeModule.getTabs()    → []
  yearModule.getTabs()    → []

Server объединяет результаты и отправляет
```

---

### 7. GET /api/modules - Список модулей

Возвращает информацию о загруженных модулях.

**Запрос:**
```
GET http://localhost:3000/api/modules
```

**Ответ:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "path-module",
    "name": "Path Module",
    "enabled": true
  },
  {
    "id": "home-module",
    "name": "Home Module",
    "enabled": true
  },
  {
    "id": "node-module",
    "name": "Node Module",
    "enabled": true
  },
  {
    "id": "year-module",
    "name": "Year Module",
    "enabled": true
  }
]
```

---

### 8. GET /api/commands - Список команд

Возвращает доступные команды.

**Запрос:**
```
GET http://localhost:3000/api/commands
```

**Ответ:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

["CREATE_PATH", "DELETE_PATH", "UPDATE_PATH"]
```

**Как это работает:**
```
Engine хранит зарегистрированные команды:
  engine.onCommand('CREATE_PATH', handler)
  engine.onCommand('DELETE_PATH', handler)
  engine.onCommand('UPDATE_PATH', handler)

Server вызывает engine.getAvailableCommands()
Server возвращает массив строк
```

---

## Полный цикл (пример)

### Сценарий: Создать новый путь

```
Шаг 1: Браузер загружает страницу
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/ui/render
  ↓
Server:
  state = engine.getState()           → { paths: [] }
  tabs = extensionManager.getTabs()   → [{ id: 'paths', title: 'Paths' }]
  commands = engine.getAvailableCommands() → ['CREATE_PATH']
  html = extension.renderUI({ state, tabs, commands })
  
Браузер получает HTML и отображает:
  - Форму для ввода названия пути
  - Кнопку "Create"
  - Пустое состояние (нет путей)

Шаг 2: Пользователь вводит название и нажимает "Create"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JavaScript отправляет:
POST /api/command
{
  "type": "CREATE_PATH",
  "payload": { "title": "My Path" }
}

Server:
  engine.dispatch({ type: 'CREATE_PATH', payload: { title: 'My Path' } })
  
Engine:
  handler = handlers['CREATE_PATH']  → pathModule.handleCreatePath
  handler(payload)
    → pathModule.handleCreatePath({ title: 'My Path' })
    → engine.setState({ paths: [{ id: 'path_abc', title: 'My Path' }] })
    → engine.emitEvent('path.created', { path: {...} })
  
Модули слушают событие:
  homeModule.onEvent('path.created') → console.log('Path created!')
  
Server возвращает:
{
  "success": true,
  "state": {
    "paths": [{ id: 'path_abc', title: 'My Path', created: '...' }]
  }
}

Шаг 3: Браузер обновляет страницу
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JavaScript вызывает:
location.reload()
  ↓
GET /api/ui/render (снова)
  ↓
Server:
  state = engine.getState()  → { paths: [{ id: 'path_abc', title: 'My Path' }] }
  html = extension.renderUI(state)  → HTML с новым путем
  
Браузер отображает:
  - Форму для ввода (очищена)
  - Список путей (один путь: "My Path")
  - Пустое состояние исчезло
```

## Ошибки и обработка

### Ошибка 400 - Неверная команда

```javascript
const res = await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'UNKNOWN_COMMAND',
    payload: {}
  })
});

// res.status === 400
const error = await res.json();
// error = { success: false, error: 'Unknown command type: UNKNOWN_COMMAND' }
```

### Ошибка 500 - Сервер упал

```javascript
const res = await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: null }  // Ошибка в обработчике
  })
});

// res.status === 500
const error = await res.text();
// Сервер перезагрузился
```

## Правила API

### ✅ DO (Требования)

1. **Используй правильный HTTP метод**
   - GET для чтения (/api/state)
   - POST для изменений (/api/command)

2. **Отправляй JSON в правильном формате**
   ```javascript
   // ✅ ПРАВИЛЬНО
   {
     "type": "CREATE_PATH",
     "payload": { "title": "..." }
   }
   ```

3. **Обрабатывай ошибки**
   ```javascript
   // ✅ ПРАВИЛЬНО
   const res = await fetch('/api/command', {...});
   if (!res.ok) {
     const error = await res.json();
     console.error('Error:', error.error);
   }
   ```

4. **Используй правильный Content-Type**
   ```javascript
   // ✅ ПРАВИЛЬНО
   headers: { 'Content-Type': 'application/json' }
   ```

5. **Используй правильный URL**
   ```javascript
   // ✅ ПРАВИЛЬНО
   const API = window.location.origin + '/api';
   fetch(API + '/command', {...});
   
   // ❌ НЕПРАВИЛЬНО
   fetch('/api/command', {...}); // Может не работать если приложение не на корне
   ```

### ❌ DO NOT (Запреты)

1. **НЕ отправляй команды с невалидными данными**
   ```javascript
   // ❌ НЕПРАВИЛЬНО
   await fetch('/api/command', {
     body: JSON.stringify({
       type: 'CREATE_PATH'  // Нет payload!
     })
   });
   ```

2. **НЕ используй GET для изменения состояния**
   ```javascript
   // ❌ НЕПРАВИЛЬНО
   GET /api/command?type=CREATE_PATH&title=Test
   
   // ✅ ПРАВИЛЬНО
   POST /api/command
   { "type": "CREATE_PATH", "payload": { "title": "Test" } }
   ```

3. **НЕ полагайся на порядок эндпоинтов**
   ```javascript
   // ❌ НЕПРАВИЛЬНО
   const commands = await fetch('/api/commands');
   await fetch('/api/command', { ... }); // Может измениться!
   
   // ✅ ПРАВИЛЬНО
   await fetch('/api/command', { ... });
   const state = await fetch('/api/state');
   ```

4. **НЕ обращайся к Engine напрямую**
   ```javascript
   // ❌ НЕПРАВИЛЬНО (в браузере)
   import { Engine } from '@path/core';
   engine.dispatch(...);
   
   // ✅ ПРАВИЛЬНО
   fetch('/api/command', {...});
   ```

## Отладка API

### Используй браузер DevTools

Открыть F12 → Network вкладка:

```
1. Нажать кнопку в UI
2. Должен появиться запрос POST /api/command
3. Смотреть Request body - что отправляется
4. Смотреть Response - что приходит обратно
5. Смотреть Status - должен быть 200 (успех)
```

### Используй curl в терминале

```bash
# Получить состояние
curl http://localhost:3000/api/state | jq

# Отправить команду
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"CREATE_PATH","payload":{"title":"Test"}}'

# Получить доступные команды
curl http://localhost:3000/api/commands
```

## Что дальше?

- Добавить DELETE_PATH команду
- Добавить UPDATE_PATH команду
- Добавить аутентификацию (если нужно)
- Добавить кэширование состояния
- Добавить WebSocket для real-time обновлений
