# 🏗️ Архитектура Professional Plugin System

## Слои системы

```
┌────────────────────────────────────────────────────────────┐
│  BROWSER LAYER                                             │
│  ├─ HTML Rendering                                         │
│  ├─ CSS Animations                                         │
│  ├─ JavaScript Interactions                                │
│  └─ Form Handling                                          │
└────────────────┬─────────────────────────────────────────┘
                 │ GET /api/ui/render
                 │ Receives: HTML string with everything
                 ↓
┌────────────────────────────────────────────────────────────┐
│  EXPRESS SERVER                                            │
│  ├─ GET /api/ui/render                                     │
│  │   └─ manager.renderActive()                             │
│  ├─ POST /api/plugins/load                                 │
│  │   └─ manager.loadPlugin(id)                             │
│  ├─ POST /api/plugins/set-active                           │
│  │   └─ manager.setActivePlugin(id)                        │
│  ├─ GET /api/plugins                                       │
│  │   └─ manager.getPlugins()                               │
│  └─ POST /api/command                                      │
│      └─ engine.executeCommand()                            │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│  PLUGIN MANAGER                                            │
│  ├─ registerPlugin(plugin)                                 │
│  ├─ loadPlugin(id) → plugin.init(api)                      │
│  ├─ setActivePlugin(id)                                    │
│  ├─ renderActive(props) → plugin.render(props)             │
│  ├─ unloadPlugin(id) → plugin.cleanup()                    │
│  └─ getPlugins() / getLoadedPlugins()                      │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│  PLUGIN API (Isolation Layer)                              │
│  ├─ getState()                                             │
│  ├─ executeCommand(type, payload)                          │
│  ├─ onStateChange(callback) → unsubscribe()                │
│  ├─ onEvent(event, callback) → unsubscribe()               │
│  ├─ getTabs()                                              │
│  ├─ getModules()                                           │
│  └─ log() / error()                                        │
│                                                            │
│  📌 Плагины НЕ имеют прямого доступа к Engine/EventBus    │
│     Только через PluginAPI!                               │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│  YOUR PLUGIN (TypeScript/JavaScript)                       │
│                                                            │
│  implements IPlugin {                                      │
│    id = 'my-plugin'                                        │
│    name = 'My Plugin'                                      │
│    version = '1.0.0'                                       │
│                                                            │
│    async init(api: PluginAPI) {                            │
│      // Subscribe to events                                │
│      // Initialize resources                               │
│    }                                                       │
│                                                            │
│    async render(props: PluginRenderProps): string {        │
│      // Return complete HTML with CSS and JS               │
│      // Full control over UI                               │
│      return `<!DOCTYPE html>...`                           │
│    }                                                       │
│                                                            │
│    async cleanup() {                                       │
│      // Unsubscribe from events                            │
│      // Clean up resources                                 │
│    }                                                       │
│  }                                                         │
└────────────────┬──────────────────────────────────────────┘
                 │
                 │ render() → HTML string
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│  RENDERED OUTPUT                                           │
│  ├─ HTML Structure                                         │
│  ├─ CSS Styling                                            │
│  ├─ JavaScript Logic                                       │
│  ├─ Animations                                             │
│  ├─ Interactivity                                          │
│  └─ Form Handling                                          │
└────────────────────────────────────────────────────────────┘
```

---

## Жизненный цикл плагина

```
┌─────────────────┐
│  Plugin Class   │
│  (не загружена) │
└────────┬────────┘
         │ registerPlugin()
         ↓
┌─────────────────────────┐
│  REGISTERED             │
│  ├─ id, name, version   │
│  ├─ Методы доступны     │
│  └─ В памяти            │
└────────┬────────────────┘
         │ loadPlugin()
         ↓
┌──────────────────────────┐
│  LOADED                  │
│  ├─ init() вызывается    │
│  ├─ API доступен         │
│  ├─ Resources инициируют │
│  └─ Events слушаются     │
└────────┬─────────────────┘
         │ setActivePlugin()
         ↓
┌──────────────────────────┐
│  ACTIVE                  │
│  ├─ renderActive() готов │
│  ├─ Browser видит UI     │
│  └─ Интерактивен         │
└────────┬─────────────────┘
         │ unloadPlugin()
         ↓
┌──────────────────────────┐
│  UNLOADED                │
│  ├─ cleanup() вызывается │
│  ├─ Events отписаны      │
│  ├─ Resources освобождены│
│  └─ Из памяти удалён     │
└──────────────────────────┘
```

---

## Поток данных

### 1. Инициализация плагина

```
Server Start
    ↓
PluginManager.registerPlugin(plugin)
    ↓
PluginManager.loadPlugin('my-plugin')
    ↓
plugin.init(api) вызывается
    ↓
Plugin подписывается на события
    ↓
api.onEvent('path.created', callback)
    ↓
EventBus регистрирует listener
    ↓
Plugin готов к render()
```

### 2. Рендер плагина

```
Browser: GET /api/ui/render
    ↓
Server: manager.renderActive(props)
    ↓
PluginManager вызывает: activePlugin.render(props)
    ↓
Plugin генерирует HTML
    ↓
HTML возвращается в Browser
    ↓
Browser отображает страницу
    ↓
JavaScript выполняется
    ↓
Animations воспроизводятся
```

### 3. User interaction

```
Browser: User clicks button
    ↓
JavaScript: fetch('/api/command', {...})
    ↓
Server: POST /api/command
    ↓
Engine: executeCommand(type, payload)
    ↓
Module: handlers['COMMAND_NAME'] вызывается
    ↓
EventBus: emit('path.created', data)
    ↓
Plugin listeners: onEvent('path.created', callback)
    ↓
Callback вызывается с данными
    ↓
Plugin может обновить UI (требуется reload)
```

---

## Преимущества архитектуры

### ✅ Гибкость
- Плагины имеют **полный контроль** над HTML, CSS, JavaScript
- Поддерживаются все CSS animations и transitions
- Поддерживается весь JavaScript (асинхронность, события и т.д.)
- Возможны любые интерфейсы (charts, forms, tables, и т.д.)

### ✅ Изоляция
- Плагины **НЕ имеют прямого доступа** к Engine, EventBus, ModuleManager
- Все взаимодействие идёт через PluginAPI
- Core остаётся защищён от ошибок в плагинах
- Плагины можно безопасно загружать/выгружать

### ✅ Масштабируемость
- Система поддерживает множество плагинов одновременно
- Runtime загрузка новых плагинов
- Горячая перезагрузка (hot reload) возможна
- Плагины могут взаимодействовать через события

### ✅ Типобезопасность
- Все интерфейсы описаны через TypeScript
- PluginAPI имеет полную типизацию
- IDE поддержка (autocomplete)
- Ошибки типов ловятся на компиляции

### ✅ Готовность для конструктора
- Конструктор может генерировать TypeScript код плагинов
- JSON → TS код → Compilation → Loading → Rendering
- Все анимации и интерактивность поддерживаются
- Как в Figma!

---

## Готовые примеры

| Плагин | Файл | Что демонстрирует |
|--------|------|-------------------|
| SimplePlugin | examplePlugins.ts | Минимальный пример |
| AnimatedPlugin | examplePlugins.ts | CSS animations, responsive дизайн |
| InteractivePlugin | examplePlugins.ts | Формы, JavaScript, fetch, feedback |
| DataVisualizationPlugin | examplePlugins.ts | Графики, SVG, advanced CSS |

---

## Для разработчика плагинов

### Шаблон нового плагина

```typescript
import { IPlugin, PluginAPI, PluginRenderProps } from '@path/extensions';

export class MyAwesomePlugin implements IPlugin {
  id = 'my-awesome-plugin';
  name = 'My Awesome Plugin';
  version = '1.0.0';
  description = 'Description of what my plugin does';

  private stateUnsubscribe: (() => void) | null = null;

  async init(api: PluginAPI): Promise<void> {
    // Initialize: setup listeners, prepare data
    api.log('Plugin initialized');

    this.stateUnsubscribe = api.onStateChange((state) => {
      api.log('State updated');
    });
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state, tabs, commands } = props;

    // Generate HTML with full control
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${this.name}</title>
          <style>
            /* Your CSS here */
          </style>
        </head>
        <body>
          <!-- Your HTML here -->
          <script>
            // Your JavaScript here
          </script>
        </body>
      </html>
    `;
  }

  async cleanup(): Promise<void> {
    // Cleanup: unsubscribe, free resources
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }
  }
}
```

---

## Что дальше (для визуального конструктора)

### Этап 1: Конструктор UI
```
1. Drag-and-drop компоненты (как Figma)
2. Редактирование свойств (colors, fonts, animations)
3. Live preview
4. Генерация JSON конфигурации
```

### Этап 2: Code generation
```
1. JSON → TypeScript код плагина
2. Добавление интерактивности
3. Компиляция в JavaScript
4. Отправка на сервер
```

### Этап 3: Loading & Rendering
```
1. Server получает код плагина
2. Регистрирует в PluginManager
3. Загружает плагин
4. Устанавливает активным
5. Browser видит результат!
```

### Этап 4: Обновление в реальном времени
```
1. Конструктор изменяет компонент
2. Генерирует новый код
3. Отправляет на сервер
4. Server перезагружает плагин
5. Browser видит обновление сразу
```

---

## Безопасность

### Изоляция контекста
```typescript
// PluginAPI предоставляет ограниченный доступ
- ✅ getState() - только read-only данные
- ✅ executeCommand() - только через валидный API
- ✅ onEvent() - только к зарегистрированным событиям

// Плагины НЕ могут:
- ❌ Прямо модифицировать Engine
- ❌ Прямо менять EventBus
- ❌ Получать доступ к другим плагинам
- ❌ Читать приватные данные Core
```

### Обработка ошибок
```typescript
// Plugin errors не ломают Core
try {
  const html = await plugin.render(props);
} catch (error) {
  // Error обработан
  // Возвращается fallback HTML
  return '<h1>Error in plugin</h1>';
}
```

---

## Производительность

### Оптимизация
- Плагины рендерят HTML один раз
- CSS animations работают в браузере (GPU accelerated)
- JavaScript выполняется асинхронно
- Нет лишних re-renders

### Масштабируемость
- Система поддерживает 10+ плагинов без проблем
- Runtime загрузка не замораживает браузер
- Выгрузка плагинов освобождает память

---

## Документация

- **PROFESSIONAL_PLUGINS.md** - Полное руководство
- **PLUGINS_QUICK_REFERENCE.md** - Быстрая справка
- **examplePlugins.ts** - 4 готовых примера
- **pluginSystem.ts** - Реализация (изучите исходный код)

---

## Заключение

Эта архитектура обеспечивает:
- ✅ Полную гибкость для плагинов (как Figma)
- ✅ Безопасность через изоляцию
- ✅ Готовность для визуального конструктора
- ✅ Поддержку анимаций и интерактивности
- ✅ Простоту разработки плагинов
- ✅ Масштабируемость системы

**Готово для производства!** 🚀
