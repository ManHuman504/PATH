# Path# — Гайд по запуску (SETUP)

## Структура проекта

```
PATH#/
├── apps/
│   └── web/              # 🌐 Web приложение (Express + Vanilla JS)
├── engine/
│   └── core/             # 🧠 Микроядро (Engine, EventBus, ...)
├── modules/
│   ├── modules/          # 📦 Модули (Home, Node, Year)
│   ├── nodes-3d/         # 🧭 3D visualizer module
│   └── shared/           # 📚 Общие утилиты
├── plugins/
│   └── extensions/       # 🎨 UI Расширения (UglyUI, NiceUI)
├── docs/                 # 📖 Документация
├── package.json          # workspace config
└── README.md
```

## Установка (первый раз)

### Требования

- **Node.js** ≥ 18
- **npm** ≥ 9 (поддержка workspaces)

Проверить версию:
```bash
node --version   # v18.0.0+
npm --version    # 9.0.0+
```

### Шаг 1: Установить зависимости

```bash
cd /path/to/PATH#
npm install
```

Это установит все зависимости для всех пакетов в workspaces.

### Шаг 2: Убедиться, что все собирается

```bash
# Собрать TypeScript для всех пакетов
npm run build --workspaces
```

Если есть ошибки — проверьте tsconfig.json в каждом пакете.

## Запуск

### Вариант 1: Веб-приложение (рекомендуется для MVP)

```bash
cd apps/web
npm run dev
```

Откройте **http://localhost:3000** в браузере.

**Интерфейс:**
- **Home** вкладка — управление модулями и расширениями
- **Nodes** вкладка — создание путей и нод
- **Year** вкладка — отметить ноды как выполненные
- **Event Log** — логирование событий

### Вариант 2: Демо Core (без UI)

```bash
cd engine/core
npx ts-node src/demo.ts
```

Выведет в консоль:
- Создание пути
- Добавление нод
- Связывание нод
- Отметить как выполненные
- Сохранение в JSON

Создаст файл `demo-state.json` в текущей папке.

## Разработка

### Структура исходного кода

Каждый пакет имеет:
```
package/
├── src/          # TypeScript исходники
├── dist/         # Собранный JavaScript (auto-generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Добавить зависимость между пакетами

```json
{
  "dependencies": {
    "@path/core": "workspace:*"
  }
}
```

Npm автоматически свяжет пакеты.

### Сборка отдельного пакета

```bash
cd engine/core
npm run build

# или с watch
npm run build -- --watch
```

### Проверка типов

```bash
npm run build --workspaces
```

Если TypeScript нашел ошибки — будут выведены.

## Тестирование API

### Через curl

```bash
# Создать путь
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"CREATE_PATH","payload":{"title":"My Path"}}'

# Получить состояние
curl http://localhost:3000/api/state

# Активировать модуль
curl -X POST http://localhost:3000/api/module/activate/node-module

# Получить список модулей
curl http://localhost:3000/api/modules

# Включить расширение
curl -X POST http://localhost:3000/api/extension/enable/nice-ui

# Получить события
curl http://localhost:3000/api/events
```

### Через браузер

1. Откройте http://localhost:3000
2. Используйте формы на вкладках
3. Смотрите Event Log внизу

## Сохранение и загрузка

Core может сохранять состояние в JSON:

```typescript
// Сохранить
engine.save('./my-state.json');

// Загрузить
engine.load('./my-state.json');
```

Формат JSON:
```json
{
  "paths": [
    {
      "id": "...",
      "title": "...",
      "nodes": [...],
      "edges": [...],
      "createdAt": "2026-01-28T10:00:00.000Z"
    }
  ],
  "achievements": [...]
}
```

## Расширения (Extensions)

### Текущие расширения

1. **UglyUIExtension** — простой интерфейс с кнопками сверху
2. **NiceUIExtension** — интерфейс с боковым меню

Обе расширения можно включать/отключать через API без перезагрузки данных.

### Добавить новое расширение

1. Создать файл в `plugins/extensions/src/myExtension.ts`
2. Реализовать интерфейс `IExtension`
3. Экспортировать в `plugins/extensions/src/index.ts`
4. Зарегистрировать в `apps/web/src/server.ts`

## Отладка

### Консоль браузера

1. Откройте DevTools (F12)
2. Смотрите Console для ошибок
3. Смотрите Network для API запросов

### Консоль сервера

Terminal с `npm run dev` в apps/web выводит:
```
[Engine] Dispatching command: CREATE_PATH
[Engine] Path created: abc123
[ModuleManager] Activated module: Home Module
[EventBus] Publishing event: path.created
```

### Логирование в Core

Используйте `console.log` для отладки:
```typescript
console.log(`[ComponentName] Message`);
```

## Проблемы и решения

### npm install не работает
```bash
# Очистить кэш
npm cache clean --force

# Переустановить
rm -rf node_modules package-lock.json
npm install
```

### TypeScript ошибки
```bash
# Пересобрать все
npm run build --workspaces

# или проверить tsconfig
cat packages/core/tsconfig.json
```

### Порт 3000 занят
```bash
# Найти процесс
lsof -i :3000

# Завершить процесс
kill -9 <PID>

# или выбрать другой порт в server.ts
```

### Модули не активируются
1. Проверьте ID модуля в ModuleManager
2. Убедитесь, что модуль зарегистрирован
3. Смотрите консоль сервера для ошибок

## Структура данных

### Путь (Path)
```typescript
{
  id: "abc123",
  title: "Learn TypeScript",
  nodes: [...],
  edges: [...],
  createdAt: 2026-01-28T10:00:00.000Z
}
```

### Нода (Node)
```typescript
{
  id: "node1",
  title: "Basics",
  description: "Learn the basics",
  completed: false,
  createdAt: 2026-01-28T10:00:00.000Z
}
```

### Связь (Edge)
```typescript
{
  id: "edge1",
  fromNodeId: "node1",
  toNodeId: "node2"
}
```

### Достижение (Achievement)
```typescript
{
  id: "ach1",
  nodeId: "node1",
  pathId: "abc123",
  completedAt: 2026-01-28T11:00:00.000Z
}
```

## Дальнейшие шаги

1. ✅ Core работает
2. ✅ Web UI
3. ⏳ Расширить YearModule (месяцы, недели, дни)
4. ⏳ Backend API (SQLite)
5. ⏳ Community Module
6. ⏳ Electron десктопное приложение
7. ⏳ Лучшая визуализация (граф)

## Ссылки

- [README.md](./README.md) — обзор проекта
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — архитектура
- [docs/EXAMPLES.md](./docs/EXAMPLES.md) — примеры кода
- [docs/API.md](./docs/API.md) — API документация

---

**Статус:** MVP 🚀  
**Версия:** 0.1.0  
**Лицензия:** MIT
