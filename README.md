# Path# — платформа для фиксации ПРОШЛОГО прогресса

## ✅ ПРОЕКТ ПОЛНОСТЬЮ РАБОЧИЙ - PHASE 5 COMPLETE ✨

**Статус**: v5.0.0 Production Ready на localhost:3000  
**Последние обновления**: 30 января 2026  
**Phase 5**: ✅ Complete Settings System + Modern Light Theme  

---

## 🎯 Phase 5 Summary - What's New

✨ **Professional Settings System with Modern Dual-Theme Support**

### Key Achievements
- ⚙️ **Settings System** - 18 configurable parameters across 5 sections
- 🎨 **Modern Light Theme** - Professional off-white design with soft shadows
- 🔄 **Real-time Switching** - Theme changes instantly without page reload
- 🎭 **Logo Adaptation** - Automatic color switching (white→dark)
- 💾 **Persistence** - All settings saved to settings.json
- 📚 **Complete Documentation** - 6 new/updated docs with 1500+ lines

### Settings Features
- **General**: Theme (dark/light), Language (ru/en)
- **Nodes & Hub**: Grid display, highlight nodes, autosave, quick chain
- **Achievements**: Notifications, difficulty display
- **Modules & Plugins**: Active modules/extensions, dependency check
- **Developer**: Engine logs, cache clear, UI debug mode

### Light Theme Features
- Off-white background (#F7F7F9, not pure white)
- Near-black text (#111827, not pure black)
- Soft shadows for elevation (not hard borders)
- Automatic logo color inversion
- Smooth 0.3s transitions
- Complete component coverage

### Documentation Files
1. **[SETTINGS_SYSTEM.md](SETTINGS_SYSTEM.md)** - Settings system reference
2. **[LIGHT_THEME_GUIDE.md](LIGHT_THEME_GUIDE.md)** - Design guide with color palette
3. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details
4. **[USER_GUIDE.md](USER_GUIDE.md)** - Updated with settings usage
5. **[PHASE5_LIGHT_THEME_COMPLETE.md](PHASE5_LIGHT_THEME_COMPLETE.md)** - Phase 5 report
6. **[LIGHT_THEME_TEST_CHECKLIST.md](LIGHT_THEME_TEST_CHECKLIST.md)** - QA checklist

[📖 **Full Phase 5 Report →**](PHASE5_LIGHT_THEME_COMPLETE.md) | [📚 **All 5 Phases Summary →**](DEVELOPMENT_SUMMARY.md)

---

## 🚀 Быстрый старт (30 секунд)

### 🎯 Вариант 1: Одно-кликовый запуск (рекомендуется)

**Windows:**
- Двойной клик на `start-dev.bat` в корне проекта
- ИЛИ в PowerShell: `.\start-dev.ps1`

**Linux/macOS:**
```bash
chmod +x start-dev.sh && ./start-dev.sh
```

### 📝 Вариант 2: Ручной запуск

```bash
npm install
npm run dev
```

### 🌐 Затем:
Откройте браузер: **http://localhost:3000**

**[📚 Полное руководство запуска →](QUICK_LAUNCH.md)**

---

## � Essential Documentation

### 🔌 Plugin Development (NEW!)
- **[Complete API Documentation](docs/API_DOCUMENTATION.md)** ⭐ - All methods with examples (2000+ lines)
- **[Plugin Development Guide](docs/PLUGIN_DEVELOPMENT_GUIDE.md)** ⭐ - Create plugins in 10 mins (1500+ lines)  
- **[Visual Constructor Integration](docs/VISUAL_CONSTRUCTOR_INTEGRATION.md)** ⭐ - Build visual UI builders (1200+ lines)

### 📚 Project Overview
- **[Development Summary](DEVELOPMENT_SUMMARY.md)** - All 4 phases explained
- **[Phase 4B Complete](PHASE_4B_COMPLETE.md)** - Latest updates & features
- **[Plugin Class System](PLUGIN_CLASS_SYSTEM.md)** - Plugin classification & selection
- **[Full Documentation Index](docs/INDEX.md)** - All 40+ documents

---

## �📋 Что было исправлено

5 критических проблем исправлены:

1. ✅ **HomeModule** - добавлены listeners на path.deleted и другие события
2. ✅ **NodeModule** - реализованы UPDATE_NODE, DELETE_NODE, COMPLETE_NODE команды
3. ✅ **PathModule** - улучшена логика и логирование
4. ✅ **Engine** - проверена error handling (уже работает)
5. ✅ **Server** - проверена инициализация модулей (работает отлично)

**[Полный отчёт об исправлениях →](FIXES_COMPLETED.md)**

---

## 🎯 Быстрый старт

1. **[📖 Полная документация](docs/INDEX.md)** - начните с этого!
2. **[✅ Исправления](FIXES_COMPLETED.md)** - что было исправлено
3. **[📋 Master Brief](docs/master-brief.md)** - 8 принципов (конституция проекта)

---

## Что такое Path#?

**Path#** отличается от Notion, Todoist и подобных систем тем, что:

- **Notion** = "я хочу / я планирую" → фокус на БУДУЩЕЕ
- **Path#** = "я уже иду / я прошёл" → фокус на ПРОШЛОЕ

Path# для людей, которые:
- Реально что-то делают
- Выгорают, потому что не видят прогресса
- Теряют ощущение пути

Path# решает через структурированную фиксацию шагов, даже микрошагов.
Результат = след, а не обещание.

Это монорепозиторий для MVP платформы "Path#". Здесь находится microkernel (Core), модули, расширения и простой веб-frontend для демо.

- **Core** (`engine/core`): микроядро с Engine, EventBus, ModuleManager, ExtensionManager
- **Modules** (`modules/modules`): логические подсистемы (Home, Node, Year)
- **Plugins/Extensions** (`plugins/extensions`): UI-плагины (HubUIPlugin, NodeUIPlugin) и fallback UglyUI
- **Web App** (`apps/web`): простой веб-интерфейс на Express + vanilla JS
- **Shared** (`modules/shared`): общие утилиты

## Быстрый старт

### Требования

- Node.js >= 18
- npm или yarn

### Установка и запуск

```bash
# 1. Клонировать репозиторий (или уже есть в папке)
cd /path/to/PATH#

## Plugin Development

We provide a safe plugin scaffold in `plugins/template` which includes a VM-based test runner and a minimal `PluginAPI` for local development. See `CONTRIBUTING_PLUGIN.md` for details.

---

PATH#

# 2. Установить зависимости (npm workspaces)
npm install

# 3. Собрать все пакеты (опционально, dev будет компилировать на лету)
npm run build --workspaces

# 4. Запустить веб-приложение
cd apps/web
npm run dev
```

Откройте **http://localhost:3000** в браузере.

### Структура проекта в браузере

1. **Home** вкладка
   - Активные модули
   - Кнопки включить/отключить модули
   - Кнопки включить/отключить расширения (UI)
   - Список путей

2. **Nodes** вкладка
   - Создать новый путь
   - Добавить ноду в путь
   - Связать две ноды
   - Просмотр всех путей и нод

3. **Year** вкладка
   - Отметить ноду как выполненную (achievement)
   - Список ачивок

4. **Event Log** (внизу)
   - Логируются все события из Core

### Примеры команд (через API)

```bash
# Создать путь
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"CREATE_PATH","payload":{"title":"Learn TypeScript"}}'

# Получить состояние
curl http://localhost:3000/api/state

# Активировать модуль
curl -X POST http://localhost:3000/api/module/activate/node-module

# Включить расширение
curl -X POST http://localhost:3000/api/extension/enable/nice-ui
```

## Основные возможности MVP

✅ **Core работает без UI** — можно дергать команды из скриптов/тестов

✅ **Модули активируются/деактивируются** — каждый модуль отдельно управляется

✅ **Команды Core**: createPath, addNode, connectNodes, completeNode (+ delete операции)

✅ **EventBus**: события логируются в консоль и отражаются в браузере

✅ **Сохранение состояния**: поддержка load/save в JSON файлы

✅ **Расширения UI**: можно переключить между UglyUI и NiceUI — интерфейс меняется, данные сохраняются

## Структура Core

```typescript
Engine
  - dispatch(command) — выполнить команду
  - getState() — прочитать состояние
  - on(eventType, handler) — подписаться на события
  - getModuleManager() — управление модулями
  - getExtensionManager() — управление расширениями
```

### Команды

```typescript
type Command =
  | CreatePathCommand
  | DeletePathCommand
  | AddNodeCommand
  | UpdateNodeCommand
  | DeleteNodeCommand
  | ConnectNodesCommand
  | DisconnectNodesCommand
  | CompleteNodeCommand;
```

### События

```typescript
'path.created'
'path.deleted'
'node.added'
'node.updated'
'node.deleted'
'node.completed'
'edge.created'
'edge.deleted'
'error'
```

## Дальнейшие шаги

1. Расширить YearModule (месяцы, недели, дни)
2. Добавить бэкенд (возможно, Node.js + SQLite вместо JSON)
3. Реализовать Community Module
4. Перейти на Electron (если нужно десктопное приложение)
5. Улучшить визуализацию (граф нод, статистика)

## Документация

Смотри папку [docs/](./docs):

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — архитектура microkernel
- [docs/EXAMPLES.md](./docs/EXAMPLES.md) — примеры использования Core
- [docs/API.md](./docs/API.md) — полная API документация

## MVP Definition of Done

✅ Core работает без UI (можно дергать из скриптов)
✅ Модули активируются/деактивируются (HomeModule, NodeModule, YearModule)
✅ Web-демо с вкладками и формами
✅ События логируются в консоль и в браузер
✅ Расширения можно переключать (UglyUI ↔ NiceUI)
✅ Сохранение/загрузка состояния в JSON

## Контрибьютинг

1. Каждый новый шаг = минимальный рабочий результат
2. TypeScript strict mode
3. Никакой UI-логики в Core
4. Все действия через команды (dispatch)
5. Логировать в консоль

---

**Статус:** MVP 🚀
**Язык:** TypeScript 5.3
**Платформа:** Node.js + Web (Express)
**Лицензия:** MIT

