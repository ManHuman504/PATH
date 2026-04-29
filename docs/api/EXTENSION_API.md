# 🔌 Extension API - Взаимодействие с системой

## Обзор

**Extension API** - это набор HTTP endpoints через который Extensions взаимодействуют с Core:

```
Extension (JSON config)
         ↓
    UIBuilder
         ↓
    Browser
         ↓
  POST /api/command  →  Engine  →  Module handlers
  GET /api/state     →  Engine  →  Current state
  GET /api/tabs      →  ModuleManager  →  Active tabs
```

---

## Основные endpoints

### 1. GET /api/ui/render - Получить отрендеренный UI

Получает полную HTML страницу с UI от активного Extension.

**Запрос:**
```bash
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
    <!-- UI сгенерированный UIBuilder -->
    <script>...</script>
  </body>
</html>
```

**Процесс:**
1. Server вызывает `activeExtension.buildUIConfig()`
2. Extension возвращает JSON конфигурацию
3. Server передаёт JSON в UIBuilder
4. UIBuilder генерирует HTML с CSS и JS
5. Server возвращает готовый HTML браузеру

---

### 2. GET /api/ui/config - Получить JSON конфигурацию

Получает JSON конфигурацию UI без рендера в HTML.

**Запрос:**
```bash
GET http://localhost:3000/api/ui/config
```

**Ответ:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "title": "Dashboard",
  "subtitle": "Welcome back",
  "sections": [
    {
      "type": "stats",
      "items": [
        { "label": "Paths", "value": 5, "icon": "📊" },
        { "label": "Done", "value": 3, "icon": "✅" }
      ]
    },
    {
      "type": "form",
      "title": "Create",
      "fields": [
        { "name": "title", "label": "Title", "type": "text" }
      ],
      "actions": [
        { "label": "Create", "command": "CREATE_PATH", "style": "primary" }
      ]
    }
  ]
}
```

**Использование:**
- Отладка Extensions
- Работа с UI программно
- Тестирование конфигураций

---

### 3. POST /api/command - Отправить команду

Отправляет команду на обработку Core.

**Запрос:**
```bash
POST http://localhost:3000/api/command
Content-Type: application/json

{
  "type": "CREATE_PATH",
  "payload": {
    "title": "My New Path",
    "description": "Optional description"
  }
}
```

**Ответ (успех):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "path-123",
    "title": "My New Path",
    "createdAt": "2024-01-29T10:30:00Z"
  }
}
```

**Ответ (ошибка):**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Command handler not found: CREATE_PATH"
}
```

**Как работает:**
1. Browser отправляет POST с командой
2. Server вызывает `engine.executeCommand(type, payload)`
3. Engine ищет command handler в модулях
4. Module обрабатывает команду
5. Module генерирует события через EventBus
6. Server возвращает результат браузеру

---

### 4. GET /api/state - Получить состояние

Получает текущее состояние приложения.

**Запрос:**
```bash
GET http://localhost:3000/api/state
```

**Ответ:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "paths": [
    {
      "id": "path-1",
      "title": "Learning TypeScript",
      "description": "Learn TypeScript basics",
      "nodes": [
        {
          "id": "node-1",
          "title": "Setup development environment",
          "completed": true,
          "createdAt": "2024-01-20T10:00:00Z"
        }
      ]
    }
  ],
  "home": {
    "totalPaths": 1,
    "totalNodes": 5,
    "completedNodes": 2
  }
}
```

---

### 5. GET /api/tabs - Получить вкладки

Получает список доступных вкладок от модулей.

**Запрос:**
```bash
GET http://localhost:3000/api/tabs
```

**Ответ:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "home",
    "title": "Home",
    "icon": "🏠"
  },
  {
    "id": "path",
    "title": "Paths",
    "icon": "📁"
  },
  {
    "id": "node",
    "title": "Nodes",
    "icon": "📝"
  }
]
```

---

### 6. GET /api/modules - Получить модули

Получает список загруженных модулей.

**Запрос:**
```bash
GET http://localhost:3000/api/modules
```

**Ответ:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "home-module",
    "name": "Home"
  },
  {
    "id": "path-module",
    "name": "Paths"
  },
  {
    "id": "node-module",
    "name": "Nodes"
  }
]
```

---

### 7. GET /api/commands - Получить команды

Получает список доступных команд.

**Запрос:**
```bash
GET http://localhost:3000/api/commands
```

**Ответ:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  "CREATE_PATH",
  "DELETE_PATH",
  "UPDATE_PATH",
  "CREATE_NODE",
  "UPDATE_NODE",
  "DELETE_NODE",
  "COMPLETE_NODE"
]
```

---

### 8. GET /api/extensions - Получить расширения

Получает список доступных Extensions.

**Запрос:**
```bash
GET http://localhost:3000/api/extensions
```

**Ответ:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "ugly-ui",
    "name": "Simple UI"
  },
  {
    "id": "nice-ui",
    "name": "Advanced UI"
  },
  {
    "id": "custom-ui",
    "name": "My Custom UI"
  }
]
```

---

## Использование в Extension

### Пример: Extension с формой

```typescript
export class MyExtension implements IUIExtension {
  id = 'my-extension';
  name = 'My UI';

  async buildUIConfig(props) {
    const { state, commands } = props;

    return {
      title: 'Create Path',
      sections: [
        {
          type: 'form',
          fields: [
            {
              name: 'title',
              label: 'Path Name',
              type: 'text',
              placeholder: 'Enter name'
            }
          ],
          actions: [
            {
              label: 'Create',
              command: 'CREATE_PATH',  // ← Это отправится в POST /api/command
              style: 'primary'
            }
          ]
        }
      ]
    };
  }
}
```

**Что происходит:**
1. Extension возвращает JSON конфиг с `command: 'CREATE_PATH'`
2. UIBuilder генерирует кнопку с onclick handler
3. Пользователь нажимает кнопку
4. Browser отправляет `POST /api/command { type: "CREATE_PATH", payload: {...} }`
5. Server обрабатывает команду
6. PathModule создаёт path
7. Генерируется событие `path.created`
8. HomeModule слушает и обновляет counter
9. Browser получает ответ и может перезагрузить UI

---

## Обработка команд в модулях

### Как Module обрабатывает команду

```typescript
// pathModule.ts

export class PathModule {
  async initialize(api) {
    // Регистрируем command handler
    api.addCommandHandler('CREATE_PATH', async (payload) => {
      const { title, description } = payload;

      // Создаём path
      const path = {
        id: generateId(),
        title,
        description,
        nodes: [],
        createdAt: new Date().toISOString()
      };

      // Добавляем в состояние
      const state = api.getState();
      state.paths.push(path);

      // Генерируем событие
      api.getEventBus().emit('path.created', { path });

      // Возвращаем результат
      return { path };
    });
  }
}
```

---

## Поток данных команды

```
Browser Form
    ↓ нажата кнопка
    ↓ собираются данные формы
    ↓
POST /api/command
{ type: 'CREATE_PATH', payload: { title: '...' } }
    ↓
Server GET /api/command handler
    ↓
engine.executeCommand('CREATE_PATH', { title: '...' })
    ↓
ModuleManager ищет handler в каждом Module
    ↓
PathModule.handlers['CREATE_PATH'] находится
    ↓
await handler({ title: '...' })
    ↓
PathModule создаёт path
    ↓
eventBus.emit('path.created', { path })
    ↓
HomeModule слушает 'path.created'
    ↓
HomeModule обновляет counter в состоянии
    ↓
Server возвращает результат браузеру
{ success: true, data: { path: {...} } }
    ↓
Browser получает ответ
    ↓
Опционально: перезагружает UI или делает что-то ещё
```

---

## Примеры запросов

### curl

```bash
# Получить конфигурацию UI
curl http://localhost:3000/api/ui/config | jq

# Получить состояние
curl http://localhost:3000/api/state | jq

# Создать path
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CREATE_PATH",
    "payload": { "title": "Learning" }
  }'

# Получить список команд
curl http://localhost:3000/api/commands | jq
```

### JavaScript (в браузере)

```javascript
// Получить конфигурацию
const config = await fetch('/api/ui/config').then(r => r.json());
console.log(config);

// Получить состояние
const state = await fetch('/api/state').then(r => r.json());
console.log(state);

// Отправить команду
const result = await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: 'My Path' }
  })
}).then(r => r.json());

console.log(result);
```

### Python

```python
import requests
import json

# Получить конфигурацию
config = requests.get('http://localhost:3000/api/ui/config').json()
print(config)

# Отправить команду
response = requests.post('http://localhost:3000/api/command', json={
    'type': 'CREATE_PATH',
    'payload': {'title': 'My Path'}
})
print(response.json())
```

---

## Обработка ошибок

### Invalid command

```json
{
  "success": false,
  "error": "Command handler not found: INVALID_COMMAND"
}
```

**Решение:** Проверьте что:
- Команда зарегистрирована в модуле
- Имя команды написано правильно (case-sensitive)
- Модуль инициализирован

### Invalid payload

```json
{
  "success": false,
  "error": "Missing required field: title"
}
```

**Решение:** Проверьте что payload содержит все обязательные поля.

### Server error

```json
{
  "success": false,
  "error": "Internal server error: ..."
}
```

**Решение:** Смотрите логи сервера (`npm run dev`).

---

## Лучшие практики

✅ **ДА:**
- Используйте GET /api/state для получения данных в Extension
- Используйте GET /api/tabs для динамического построения UI
- Используйте GET /api/commands для проверки доступных команд
- Проверяйте ошибки при отправке команд
- Документируйте какие команды поддерживает ваш Extension

❌ **НЕТ:**
- Не используйте hardcoded command имена
- Не пропускайте обработку ошибок
- Не отправляйте огромные payload (будут медленные)
- Не создавайте бесконечные циклы запросов

---

## Тестирование API

### Простой тест всех endpoints

```bash
#!/bin/bash

echo "Testing Path# API"
echo "================="

echo "1. UI Config:"
curl -s http://localhost:3000/api/ui/config | jq '.title'

echo "2. State:"
curl -s http://localhost:3000/api/state | jq '.paths | length'

echo "3. Tabs:"
curl -s http://localhost:3000/api/tabs | jq '.[].title'

echo "4. Commands:"
curl -s http://localhost:3000/api/commands | jq '.[]' | head -5

echo "5. Extensions:"
curl -s http://localhost:3000/api/extensions | jq '.[].name'

echo "6. Modules:"
curl -s http://localhost:3000/api/modules | jq '.[].name'
```

---

## Интеграция с вашим приложением

Если вы хотите использовать Extension API снаружи (например, из другого приложения):

```javascript
// Создайте client для работы с API

class PathClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async getState() {
    return fetch(`${this.baseUrl}/api/state`).then(r => r.json());
  }

  async getUI() {
    return fetch(`${this.baseUrl}/api/ui/config`).then(r => r.json());
  }

  async executeCommand(type, payload) {
    return fetch(`${this.baseUrl}/api/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    }).then(r => r.json());
  }

  async createPath(title, description) {
    return this.executeCommand('CREATE_PATH', { title, description });
  }

  async getTabs() {
    return fetch(`${this.baseUrl}/api/tabs`).then(r => r.json());
  }
}

// Использование
const client = new PathClient();
const result = await client.createPath('My Path', 'Description');
console.log(result);
```

---

## Реальные примеры

Смотрите:
- `apps/web/src/server.ts` - реализация endpoints
- `packages/extensions/src/uglyUIExtension.ts` - пример Extension
- `docs/extensions/EXTENSION_GUIDE.md` - руководство по Extensions
