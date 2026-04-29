# 🔌 Professional Plugin System - Complete Guide

## Концепция (как в Figma)

**Plugin** - это полнофункциональный код на TypeScript/JavaScript который:
- ✅ Полный контроль над HTML, CSS, JavaScript
- ✅ Полная поддержка анимаций и интерактивности
- ✅ Доступ к Core только через API (изолирован)
- ✅ Runtime загрузка и выполнение
- ✅ Автоматическое управление жизненным циклом
- ✅ Горячая перезагрузка (hot reload)

```
┌─────────────────────────┐
│  Core Engine            │
│  (TypeScript/State)     │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│  Plugin System          │
│  - Load plugins         │
│  - Execute code         │
│  - Provide API          │
│  - Manage lifecycle     │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│  Your Plugin            │
│  - TypeScript/JS        │
│  - Full HTML/CSS/JS     │
│  - Access API           │
│  - Return HTML string   │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│  Browser                │
│  - Render HTML          │
│  - Run animations       │
│  - Handle interactions  │
└─────────────────────────┘
```

---

## Архитектура Plugin System

### 1. PluginManager
Управляет жизненным циклом плагинов:
- Регистрация плагинов
- Загрузка (инициализация)
- Выгрузка (cleanup)
- Переключение активного плагина
- Рендер активного плагина

### 2. PluginAPI
API для плагинов (изоляция):
- `getState()` - получить состояние
- `executeCommand()` - отправить команду
- `onStateChange()` - подписаться на изменения
- `onEvent()` - подписаться на события
- `getTabs()` - получить вкладки модулей
- `getModules()` - получить модули
- `log()` / `error()` - логирование

### 3. IPlugin Interface
Что должен имплементировать плагин:
- `id` - уникальный идентификатор
- `name` - название для UI
- `version` - версия
- `init()` - инициализация (опционально)
- `render()` - генерация HTML
- `cleanup()` - очистка (опционально)

---

## Создание плагина (пошагово)

### Шаг 1: Создайте класс

```typescript
import { IPlugin, PluginAPI, PluginRenderProps } from '@path/extensions';

export class MyPlugin implements IPlugin {
  id = 'my-plugin';
  name = 'My First Plugin';
  version = '1.0.0';
  description = 'My awesome plugin';

  // ...методы...
}
```

### Шаг 2: Реализуйте init() (опционально)

```typescript
async init(api: PluginAPI): Promise<void> {
  api.log('My plugin initialized');

  // Подписывайтесь на события
  api.onEvent('path.created', (data) => {
    api.log('Path created!', data);
  });

  // Подписывайтесь на изменения состояния
  api.onStateChange((state) => {
    api.log('State changed', state);
  });
}
```

### Шаг 3: Реализуйте render()

```typescript
async render(props: PluginRenderProps): Promise<string> {
  const { state, tabs, commands } = props;

  // Вы можете вернуть полноценный HTML
  // С полной поддержкой CSS и JavaScript!

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Plugin</title>
        <style>
          /* Ваш CSS */
          body { background: #333; color: white; }
        </style>
      </head>
      <body>
        <h1>Hello from Plugin!</h1>
        <p>Total paths: ${state.paths?.length || 0}</p>

        <script>
          // Ваш JavaScript
          console.log('Plugin loaded');

          async function sendCommand(type, payload) {
            const resp = await fetch('/api/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, payload })
            });
            return resp.json();
          }
        </script>
      </body>
    </html>
  `;
}
```

### Шаг 4: Реализуйте cleanup() (опционально)

```typescript
async cleanup(): Promise<void> {
  // Очистка ресурсов при выгрузке плагина
  api.log('Plugin cleanup');
}
```

---

## Примеры плагинов

### Пример 1: Простой плагин

```typescript
import { IPlugin, PluginAPI, PluginRenderProps } from '@path/extensions';

export class SimplePlugin implements IPlugin {
  id = 'simple';
  name = 'Simple Plugin';
  version = '1.0.0';

  async render(props: PluginRenderProps): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Simple Plugin</h1>
          <p>Paths: ${props.state.paths?.length || 0}</p>
        </body>
      </html>
    `;
  }
}
```

**Использование:**
```typescript
const manager = new PluginManager(engine, eventBus, moduleManager);
const plugin = new SimplePlugin();

manager.registerPlugin(plugin);
await manager.loadPlugin(plugin.id);
manager.setActivePlugin(plugin.id);

const html = await manager.renderActive({
  state: engine.getState(),
  tabs: [],
  commands: []
});
```

---

### Пример 2: Плагин с анимациями

```typescript
export class AnimatedPlugin implements IPlugin {
  id = 'animated';
  name = 'Animated Dashboard';
  version = '1.0.0';

  async render(props: PluginRenderProps): Promise<string> {
    const paths = props.state.paths || [];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }

            .card {
              animation: slideIn 0.5s ease-out;
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 10px;
            }

            .card:nth-child(2) { animation-delay: 0.1s; }
            .card:nth-child(3) { animation-delay: 0.2s; }
          </style>
        </head>
        <body>
          <h1>Animated Dashboard</h1>
          ${paths.map(p => \`
            <div class="card">
              <h3>\${p.title}</h3>
              <p>\${p.nodes?.length || 0} nodes</p>
            </div>
          \`).join('')}
        </body>
      </html>
    `;
  }
}
```

---

### Пример 3: Плагин с интерактивностью

```typescript
export class InteractivePlugin implements IPlugin {
  id = 'interactive';
  name = 'Interactive';
  version = '1.0.0';

  async render(props: PluginRenderProps): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            form {
              max-width: 400px;
              margin: 20px;
            }
            input, button {
              padding: 10px;
              margin: 5px 0;
              width: 100%;
            }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              cursor: pointer;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Create Path</h1>
          <form onsubmit="handleSubmit(event)">
            <input type="text" id="title" placeholder="Path name" required>
            <textarea id="description" placeholder="Description"></textarea>
            <button type="submit">Create</button>
          </form>

          <script>
            async function handleSubmit(e) {
              e.preventDefault();
              const title = document.getElementById('title').value;
              const description = document.getElementById('description').value;

              const resp = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'CREATE_PATH',
                  payload: { title, description }
                })
              });

              const result = await resp.json();
              if (result.success) {
                alert('Path created!');
                location.reload();
              } else {
                alert('Error: ' + result.error);
              }
            }
          </script>
        </body>
      </html>
    `;
  }
}
```

---

### Пример 4: Плагин с жизненным циклом

```typescript
export class AdvancedPlugin implements IPlugin {
  id = 'advanced';
  name = 'Advanced';
  version = '1.0.0';

  private unsubscribe: (() => void) | null = null;

  async init(api: PluginAPI): Promise<void> {
    api.log('Plugin initializing...');

    // Подписываемся на события
    this.unsubscribe = api.onStateChange((state) => {
      api.log('State changed, current paths:', state.paths?.length);
    });
  }

  async render(props: PluginRenderProps): Promise<string> {
    return `<h1>Advanced Plugin</h1>`;
  }

  async cleanup(): Promise<void> {
    // Отписываемся от событий
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
```

---

### Пример 5: Плагин с графиками (как в примере DataVisualizationPlugin)

```typescript
export class ChartPlugin implements IPlugin {
  id = 'charts';
  name = 'Charts & Analytics';
  version = '1.0.0';

  async render(props: PluginRenderProps): Promise<string> {
    const paths = props.state.paths || [];
    const total = paths.length;
    const completed = paths.filter(p => p.nodes?.every(n => n.completed)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            svg circle {
              transition: stroke-dasharray 0.5s ease;
            }
          </style>
        </head>
        <body>
          <h1>Analytics</h1>
          <svg viewBox="0 0 100 100" width="200" height="200">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ddd" stroke-width="8"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="8"
                    stroke-dasharray="${percentage * 2.51} 251"
                    stroke-dashoffset="0"
                    transform="rotate(-90 50 50)"/>
          </svg>
          <p>Completion: ${percentage}%</p>
        </body>
      </html>
    `;
  }
}
```

---

## PluginAPI в деталях

### getState()
```typescript
async init(api: PluginAPI) {
  const state = api.getState();
  
  console.log('Paths:', state.paths);
  console.log('Home stats:', state.home);
  console.log('Nodes:', state.nodes);
}
```

### executeCommand()
```typescript
async render(props) {
  // В JavaScript обработчике:
  // await fetch('/api/command', {
  //   method: 'POST',
  //   body: JSON.stringify({ type: 'CREATE_PATH', payload: {...} })
  // });
}
```

### onStateChange()
```typescript
async init(api: PluginAPI) {
  // Подписываемся на изменения
  const unsubscribe = api.onStateChange((state) => {
    console.log('State changed!', state.paths?.length);
  });

  // Позже отписываемся
  // unsubscribe();
}
```

### onEvent()
```typescript
async init(api: PluginAPI) {
  api.onEvent('path.created', (data) => {
    console.log('New path created:', data);
  });

  api.onEvent('node.completed', (data) => {
    console.log('Node completed:', data);
  });
}
```

### getTabs()
```typescript
async render(props: PluginRenderProps) {
  // props.tabs уже содержит активные вкладки
  // Или:
  const tabs = props.tabs;
  // [
  //   { id: 'home', title: 'Home', icon: '🏠' },
  //   { id: 'path', title: 'Paths', icon: '📁' }
  // ]
}
```

### Логирование
```typescript
async init(api: PluginAPI) {
  api.log('Simple message');
  api.log('With data:', { foo: 'bar' });
  api.error('Error message', new Error('details'));
}
```

---

## Жизненный цикл плагина

```
1. registerPlugin(plugin)
   ↓ плагин зарегистрирован, но не загружен
   ↓
2. loadPlugin(pluginId)
   ↓ вызывается init()
   ↓ плагин получает доступ к API
   ↓
3. setActivePlugin(pluginId)
   ↓ плагин становится активным
   ↓
4. renderActive(props)
   ↓ вызывается render()
   ↓ возвращается HTML
   ↓
5. unloadPlugin(pluginId)
   ↓ вызывается cleanup()
   ↓ освобождаются ресурсы
```

---

## PluginManager API

### Регистрация плагина
```typescript
const manager = new PluginManager(engine, eventBus, moduleManager);
const plugin = new MyPlugin();
manager.registerPlugin(plugin);
```

### Загрузка плагина
```typescript
await manager.loadPlugin('my-plugin');
```

### Установка активного плагина
```typescript
manager.setActivePlugin('my-plugin');
```

### Рендер активного плагина
```typescript
const html = await manager.renderActive({
  state: engine.getState(),
  tabs: moduleManager.getTabs(),
  commands: engine.getAvailableCommands()
});
```

### Выгрузка плагина
```typescript
await manager.unloadPlugin('my-plugin');
```

### Получить список плагинов
```typescript
const plugins = manager.getPlugins();
// [
//   { id: 'simple', name: 'Simple Plugin', version: '1.0.0' },
//   { id: 'animated', name: 'Animated', version: '1.0.0' }
// ]
```

### Проверить загружен ли плагин
```typescript
if (manager.isPluginLoaded('my-plugin')) {
  console.log('Loaded!');
}
```

---

## Интеграция с Server

### В expressServer
```typescript
import { PluginManager, SimplePlugin, AnimatedPlugin } from '@path/extensions';

export class ExpressServer {
  private pluginManager: PluginManager;

  constructor(engine, eventBus, moduleManager) {
    this.pluginManager = new PluginManager(engine, eventBus, moduleManager);

    // Зарегистрируйте плагины
    this.pluginManager.registerPlugin(new SimplePlugin());
    this.pluginManager.registerPlugin(new AnimatedPlugin());

    // Загрузите плагины
    this.pluginManager.loadPlugin('simple-plugin');
    this.pluginManager.loadPlugin('animated-plugin');

    // Установите активный
    this.pluginManager.setActivePlugin('animated-plugin');
  }

  setupRoutes() {
    // GET /api/ui/render - рендер активного плагина
    this.app.get('/api/ui/render', async (req, res) => {
      try {
        const html = await this.pluginManager.renderActive({
          state: this.engine.getState(),
          tabs: this.moduleManager.getTabs(),
          commands: this.engine.getAvailableCommands()
        });
        res.send(html);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // POST /api/plugins/load
    this.app.post('/api/plugins/load', (req, res) => {
      const { pluginId } = req.body;
      try {
        this.pluginManager.loadPlugin(pluginId);
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // POST /api/plugins/set-active
    this.app.post('/api/plugins/set-active', (req, res) => {
      const { pluginId } = req.body;
      try {
        this.pluginManager.setActivePlugin(pluginId);
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // GET /api/plugins
    this.app.get('/api/plugins', (req, res) => {
      const plugins = this.pluginManager.getPlugins();
      const active = this.pluginManager.getActivePluginId();
      res.json({ plugins, active });
    });
  }
}
```

---

## Чек-лист для разработки плагина

- [ ] Класс имплементирует `IPlugin`
- [ ] Есть уникальный `id`
- [ ] Есть понятное `name`
- [ ] Задана `version`
- [ ] Метод `render()` возвращает валидный HTML
- [ ] HTML содержит `<!DOCTYPE html>` и `<html>` теги
- [ ] CSS включён в `<style>` тег
- [ ] JavaScript включён в `<script>` тег
- [ ] Нет синтаксических ошибок в HTML/CSS/JS
- [ ] Протестировано в браузере
- [ ] Нет ошибок в console браузера
- [ ] PluginAPI используется правильно (если есть init())
- [ ] Ресурсы освобождаются в cleanup() (если используется)

---

## Лучшие практики

✅ **ДА:**
- Используйте правильный HTML структуру
- Тестируйте разные размеры экрана (responsive)
- Используйте WebSockets для real-time обновлений (опционально)
- Обрабатывайте ошибки в JavaScript
- Документируйте ваш плагин

❌ **НЕТ:**
- Не используйте глобальные переменные
- Не пишите прямо в document.body (чистая среда)
- Не забывайте про unsubscribe в init()
- Не создавайте бесконечные loop запросов
- Не используйте очень тяжёлые JavaScript library без причины

---

## Готовые примеры

В репозитории есть 4 полноценных примера плагинов:

1. **SimplePlugin** - минимальный пример
2. **AnimatedPlugin** - с CSS анимациями и интерактивностью
3. **InteractivePlugin** - с формами и JavaScript обработчиками
4. **DataVisualizationPlugin** - с графиками и SVG визуализацией

Смотрите в `packages/extensions/src/examplePlugins.ts`

---

## Готово для Visual Builder!

Эта система полностью готова для подключения Figma-like визуального конструктора:

1. **Конструктор** генерирует JSON конфигурацию UI
2. **JSON** преобразуется в TypeScript код плагина
3. **Плагин** загружается в PluginManager
4. **Browser** отображает результат с анимациями и интерактивностью

Вся гибкость HTML/CSS/JS доступна!
