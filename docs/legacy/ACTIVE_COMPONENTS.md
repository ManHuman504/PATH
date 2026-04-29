# 📋 ACTIVE COMPONENTS - PATH# System

## Дата обновления: 30.01.2026

Этот файл содержит актуальный список **работающих** компонентов системы.

---

## 🔧 CORE (packages/core)

**Статус**: ⚠️ **DO NOT TOUCH** (см. [DO_NOT_TOUCH.md](../packages/core/DO_NOT_TOUCH.md))

- ✅ `engine.ts` - Главный движок
- ✅ `interfaces.ts` - Интерфейсы модулей и расширений
- ✅ `moduleManager.ts` - Управление модулями
- ✅ `eventBus.ts` - Шина событий
- ✅ `types.ts` - Типы системы

---

## 📦 MODULES (packages/modules)

Активные модули, зарегистрированные в движке:

### ✅ PathModule (`pathModule.ts`)
- **Priority**: 100
- **Commands**: `CREATE_PATH`, `DELETE_PATH`, `SET_ACTIVE_PATH`, `CLEAR_ACTIVE_PATH`, `OPEN_PATH`
- **Events**: `path.created`, `path.deleted`, `path.activated`, `path.deactivated`
- **Tab**: `paths-tab`
- **Статус**: **АКТИВНЫЙ** (используется постоянно)

### ✅ NodeModule (`nodeModule.ts`)
- **Priority**: 50
- **Commands**: `CREATE_NODE`, `UPDATE_NODE_*`, `DELETE_NODE`, `COMPLETE_NODE`, `ADD_CONNECTION`, `REMOVE_CONNECTION`
- **Events**: `node.created`, `node.updated`, `node.deleted`, `node.completed`, `node.connectionAdded`
- **Tab**: `nodes-tab`
- **Статус**: **АКТИВНЫЙ** (используется постоянно)

### ✅ HubModule (`hubModule.ts`)
- **Priority**: 10
- **Commands**: `GET_HUB_STATUS`, `GET_SYSTEM_INFO`
- **Events**: `hub.statsUpdated`
- **Tab**: `hub-tab`
- **Статус**: **АКТИВНЫЙ** (интеграция с hub-ui)

### ✅ YearModule (`yearModule.ts`)
- **Priority**: 5
- **Commands**: Нет
- **Events**: Нет
- **Tab**: Нет
- **Статус**: **АКТИВНЫЙ** (регистрируется, но минимален)

### ⚠️ HomeModule (`homeModule.ts`)
- **Статус**: **НЕ ИСПОЛЬЗУЕТСЯ** (заменен на HubModule)
- **Примечание**: Можно удалить в будущем

---

## 🎨 EXTENSIONS / PLUGINS (packages/extensions)

### ✅ Plugin System
- `pluginSystem.ts` - PluginManager, базовые интерфейсы
- `interfaces.ts` - IPlugin, PluginAPI, PluginRenderProps

### ✅ Active UI Plugins

#### 1. HubUIPlugin (`hubUIPlugin.ts`)
- **ID**: `hub-ui`
- **Class**: UI
- **Статус**: **ОСНОВНОЙ ИНТЕРФЕЙС** (используется по умолчанию)
- **Функции**: Главное меню, список путей, создание путей
- **Новое v1.3**: Профессиональная светлая тема с soft shadows и автоматической сменой цвета логотипа

**Theme System** (NEW in v1.3):
- Dual-theme support: dark (default) + modern light theme
- CSS class-based: `body.theme-light`, `body.theme-dark`
- Light theme palette:
  - Background: `#F7F7F9` (не чистый белый)
  - Text: `#111827` (не чистый черный)
  - Soft shadows вместо жестких границ
  - Logo color filter для автоматической инверсии
- Плавные переходы (0.3s cubic-bezier)
- Полная документация: [LIGHT_THEME_GUIDE.md](./LIGHT_THEME_GUIDE.md)

#### 2. NodeUIPlugin (`nodeUIPlugin.ts`)
- **ID**: `node-ui`
- **Class**: UI
- **Статус**: **АКТИВНЫЙ** (редактор нод)
- **Функции**: Визуальный редактор нод, canvas, connections

### ✅ Extensions

#### UglyUIExtension (`uglyUIExtension.ts`)
- **ID**: `ugly-ui`
- **Статус**: **FALLBACK** (используется как запасной интерфейс)
- **Функции**: Минимальный интерфейс без стилей

### ✅ Utilities

#### UIBuilder (`uiBuilder.ts`)
- **Статус**: **АКТИВНЫЙ** (система декларативного UI)
- **Функции**: Генерация HTML из JSON конфигурации

---

## 🛠️ SHARED (packages/shared)

### ✅ Active Utilities

- `safeHtml.ts` - Система безопасного рендеринга
- `helpers.ts` - Helper функции для модулей
- `actionSystem.example.ts` - Примеры использования safe HTML
- `index.ts` - Экспорт всех утилит

---

## ⚙️ SETTINGS SYSTEM (NEW!)

### Configuration Files

#### `settings.json` (ROOT)
- **Статус**: **АКТИВНЫЙ**
- **Функция**: Персональные настройки пользователя
- **Структура**: 5 разделов, 18 параметров
- **API**: GET/POST `/api/settings`
- **Документация**: [SETTINGS_SYSTEM.md](./SETTINGS_SYSTEM.md)

### Settings Structure

#### General (3)
- `theme` - "dark" | "light" (применяется мгновенно в UI, см. [LIGHT_THEME_GUIDE.md](./LIGHT_THEME_GUIDE.md))
- `language` - "ru" | "en" (для будущих переводов)
- `reset_settings` - boolean (кнопка сброса)

#### Nodes & Hub (4)
- `grid_display` - boolean (сетка vs список)
- `highlight_active_nodes` - boolean (выделение активной ноды)
- `autosave_nodes` - boolean (автосохранение)
- `quick_chain_mode` - boolean (быстрая цепочка)

#### Achievements (2)
- `show_notifications` - boolean (уведомления при достижениях)
- `display_difficulty` - boolean (отображение сложности)

#### Modules & Plugins (3)
- `active_modules` - array (список активных модулей)
- `active_extensions` - array (список активных расширений)
- `dependency_check` - boolean (проверка зависимостей)

#### Developer (3)
- `engine_logs` - boolean (подробные логи)
- `clear_cache` - button (очистка кэша)
- `ui_debug_mode` - boolean (режим отладки UI)

### Implementation Status
✅ Settings UI в HubUIPlugin - все 18 параметров  
✅ API endpoints (GET/POST) - работают и сохраняют в файл  
✅ Settings loading at startup - интегрировано в server.ts  
✅ Theme switching - применяется мгновенно к документу  
✅ Difficulty toggle - скрывает/показывает рейтинги  
✅ Settings persistence - сохраняется в settings.json  
✅ Full documentation - см. SETTINGS_SYSTEM.md  

### Testing Results
✓ GET /api/settings - возвращает все 18 параметров  
✓ POST /api/settings - обновляет и сохраняет в файл  
✓ Theme persistence - сохраняется на рестарте сервера  
✓ Language persistence - сохраняется на рестарте  
✓ Settings UI - все toggles работают корректно  

---

## 📚 DOCUMENTATION (docs/)

### ✅ Актуальная документация:

- `README.md` - Главный README
- `INDEX.md` - Индекс документации
- `API_DOCUMENTATION.md` - Полный API reference
- `ARCHITECTURE.md` - Архитектура системы
- `PLUGIN_DEVELOPMENT_GUIDE.md` - Гайд по разработке плагинов
- `SAFE_RENDERING_GUIDE.md` - Руководство по безопасному рендерингу
- `SAFE_HTML_CHEATSHEET.txt` - Шпаргалка по safe HTML
- `EXAMPLES.md` - Примеры кода

### ✅ Актуальные подпапки:

- `api/` - API документация
  - `SERVER_API.md`
  - `EXTENSION_API.md`
- `core/` - Документация движка
  - `ENGINE.md`
  - `ENGINE_API.md`
- `modules/` - Документация модулей
  - `PATH_MODULE.md`
  - `HOME_MODULE.md`
  - `MODULES_OVERVIEW.md`
- `extensions/` - Документация плагинов
  - `EXTENSIONS.md`
  - `PLUGIN_SYSTEM.md`
  - `PROFESSIONAL_PLUGINS.md`
  - `PLUGINS_QUICK_REFERENCE.md`
- `ui/` - Документация UI
  - `UI_BUILDER.md`
  - `UI_SYSTEM.md`
- `setup/` - Гайды по установке
  - `QUICKSTART.md`
  - `SETUP.md`
- `decisions/` - Архитектурные решения
  - `ARCHITECTURE_DECISIONS.md`
- `reference/` - Справочники
  - `QUICK_REFERENCE.md`
  - `COMMANDS_AND_EVENTS_REFERENCE.md`

---

## ❌ УДАЛЕННЫЕ КОМПОНЕНТЫ

### Удалено 30.01.2026:

- ❌ `docs/legacy/` - Устаревшая документация
- ❌ `docs/INCOMPLETE_UNUSED_FEATURES.md` - Неполные фичи
- ❌ `docs/audit/` - Временные отчеты аудита
- ❌ `packages/extensions/src/niceUIExtension.ts` - Неиспользуемое расширение
- ❌ `packages/extensions/src/examplePlugins.ts` - MVP/демо плагины
- ❌ `packages/extensions/src/completeExamplePlugin.ts` - Полный пример плагина
- ❌ `packages/extensions/src/visualBuilderPlugin.ts` - MVP визуальный конструктор
- ❌ `test-hub-render.js` - Тестовый скрипт
- ❌ `verify-implementation.ps1` - Тестовый скрипт
- ❌ `Group 17.png`, `Group 17.svg`, `изображение 2 (Traced).png` - Неиспользуемые изображения

---

## 🎯 ПРАВИЛА ПОДДЕРЖКИ

### Добавление новых компонентов:

1. ✅ Добавить в соответствующую папку
2. ✅ Зарегистрировать в движке/PluginManager
3. ✅ Обновить этот файл (ACTIVE_COMPONENTS.md)
4. ✅ Добавить документацию

### Удаление компонентов:

1. ✅ Убедиться что компонент нигде не используется
2. ✅ Удалить импорты
3. ✅ Удалить файл
4. ✅ Обновить этот файл (ACTIVE_COMPONENTS.md)
5. ✅ Обновить документацию

### Модификация core:

⚠️ **Запрещено без разрешения владельца**

См. [packages/core/DO_NOT_TOUCH.md](../packages/core/DO_NOT_TOUCH.md)

---

## 📊 СТАТИСТИКА

- **Активных модулей**: 4 (Path, Node, Hub, Year)
- **Активных UI плагинов**: 2 (Hub, Node)
- **Активных расширений**: 1 (UglyUI fallback)
- **Вспомогательных систем**: 3 (Settings, PluginManager, UIBuilder)
- **API endpoints**: 11+ (paths, nodes, achievements, settings, ui, etc.)
- **Utility пакетов**: 2 (safeHtml, helpers)
- **Settings параметров**: 18 (5 разделов)

---

**Последнее обновление**: 30.01.2026  
**Версия**: 1.2 (Settings System Added)  
**Статус**: Стабильная сборка с модульной системой настроек
