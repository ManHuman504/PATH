# ⚡ Plugin System - Быстрая справка

## Структура плагина

```typescript
import { IPlugin, PluginAPI, PluginRenderProps } from '@path/extensions';

export class MyPlugin implements IPlugin {
  id = 'my-plugin';
  name = 'My Plugin';
  version = '1.0.0';

  async init(api: PluginAPI): Promise<void> {
    // Инициализация (опционально)
  }

  async render(props: PluginRenderProps): Promise<string> {
    // Вернуть HTML с полным контролем
    return `<!DOCTYPE html><html>...</html>`;
  }

  async cleanup(): Promise<void> {
    // Очистка (опционально)
  }
}
```

---

## Быстрые примеры

### 1️⃣ Очень простой плагин

```typescript
export class SimplePlugin implements IPlugin {
  id = 'simple';
  name = 'Simple';
  version = '1.0.0';

  async render(props: PluginRenderProps): Promise<string> {
    const count = props.state.paths?.length || 0;
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Paths: ${count}</h1>
        </body>
      </html>
    `;
  }
}
```

### 2️⃣ С анимациями

```typescript
async render(props: PluginRenderProps): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          h1 { animation: slideIn 0.5s ease-out; }
        </style>
      </head>
      <body>
        <h1>Hello!</h1>
      </body>
    </html>
  `;
}
```

### 3️⃣ С формой

```typescript
async render(props: PluginRenderProps): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <form onsubmit="handleSubmit(event)">
          <input type="text" placeholder="Name" required>
          <button type="submit">Submit</button>
        </form>

        <script>
          async function handleSubmit(e) {
            e.preventDefault();
            const resp = await fetch('/api/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'CREATE_PATH',
                payload: { title: 'My Path' }
              })
            });
            const result = await resp.json();
            console.log(result);
          }
        </script>
      </body>
    </html>
  `;
}
```

### 4️⃣ С жизненным циклом

```typescript
export class LifecyclePlugin implements IPlugin {
  id = 'lifecycle';
  name = 'Lifecycle';
  version = '1.0.0';

  private unsubscribe: (() => void) | null = null;

  async init(api: PluginAPI): Promise<void> {
    // Подписаться на события
    this.unsubscribe = api.onStateChange((state) => {
      console.log('State changed');
    });
  }

  async render(props: PluginRenderProps): Promise<string> {
    return `<h1>Hello</h1>`;
  }

  async cleanup(): Promise<void> {
    // Отписаться
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
```

---

## PluginAPI методы

```typescript
// Получить состояние
const state = api.getState();

// Подписаться на изменения состояния
const unsub = api.onStateChange((state) => { ... });

// Выполнить команду
const result = await api.executeCommand('CREATE_PATH', { title: '...' });

// Получить доступные команды
const commands = api.getCommands();

// Подписаться на событие
api.onEvent('path.created', (data) => { ... });

// Получить вкладки модулей
const tabs = api.getTabs();

// Получить модули
const modules = api.getModules();

// Логирование
api.log('Message');
api.error('Error', error);
```

---

## Регистрация плагина

```typescript
const manager = new PluginManager(engine, eventBus, moduleManager);

// Зарегистрировать
manager.registerPlugin(new MyPlugin());

// Загрузить (инициализировать)
await manager.loadPlugin('my-plugin');

// Установить активным
manager.setActivePlugin('my-plugin');

// Рендер
const html = await manager.renderActive({
  state: engine.getState(),
  tabs: moduleManager.getTabs(),
  commands: engine.getAvailableCommands()
});

// Выгрузить (cleanup)
await manager.unloadPlugin('my-plugin');
```

---

## Props для render()

```typescript
interface PluginRenderProps {
  state: any;                    // Состояние приложения
  tabs: Array<{                  // Вкладки от модулей
    id: string;
    title: string;
    icon?: string;
  }>;
  commands: string[];            // Доступные команды
}
```

---

## Доступ к состоянию

```typescript
const { state } = props;

// Пути
state.paths // Array<Path>
state.paths[0].title
state.paths[0].nodes // Array<Node>

// Ноды
state.nodes // Array<Node>
state.nodes[0].title
state.nodes[0].completed

// Home модуль
state.home.totalPaths
state.home.totalNodes
state.home.completedNodes
```

---

## Отправка команд из браузера

```typescript
// В HTML/JS
async function sendCommand(type, payload) {
  const resp = await fetch('/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload })
  });
  return resp.json();
}

// Использование
await sendCommand('CREATE_PATH', { title: 'New Path' });
await sendCommand('UPDATE_NODE', { id: '...', completed: true });
await sendCommand('DELETE_PATH', { id: '...' });
```

---

## Доступные команды

```
CREATE_PATH
DELETE_PATH
UPDATE_PATH
CREATE_NODE
UPDATE_NODE
DELETE_NODE
COMPLETE_NODE
// + ваши кастомные команды
```

---

## HTML шаблон

```typescript
return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My Plugin</title>
      <style>
        /* Ваш CSS */
        body { margin: 0; padding: 20px; }
      </style>
    </head>
    <body>
      <!-- Ваше содержимое -->
      <h1>Hello</h1>

      <script>
        // Ваш JavaScript
        console.log('Plugin loaded');
      </script>
    </body>
  </html>
`;
```

---

## Примеры событий

```typescript
async init(api: PluginAPI) {
  // Path события
  api.onEvent('path.created', (data) => console.log('Path created', data));
  api.onEvent('path.deleted', (data) => console.log('Path deleted', data));
  api.onEvent('path.updated', (data) => console.log('Path updated', data));

  // Node события
  api.onEvent('node.created', (data) => console.log('Node created', data));
  api.onEvent('node.deleted', (data) => console.log('Node deleted', data));
  api.onEvent('node.updated', (data) => console.log('Node updated', data));
  api.onEvent('node.completed', (data) => console.log('Node completed', data));

  // State событие
  api.onEvent('state:changed', (data) => console.log('State changed'));
}
```

---

## Готовые примеры в коде

Смотрите `plugins/extensions/src/examplePlugins.ts`:

1. **SimplePlugin** - минимальный пример
2. **AnimatedPlugin** - с CSS анимациями (красивый!)
3. **InteractivePlugin** - с формами и JavaScript
4. **DataVisualizationPlugin** - с графиками и SVG

Скопируйте и адаптируйте под себя!

---

## Чек-лист

- [ ] Класс имплементирует `IPlugin`
- [ ] Есть `id`, `name`, `version`
- [ ] `render()` возвращает HTML string
- [ ] HTML содержит `<!DOCTYPE html>`
- [ ] CSS в `<style>` теге
- [ ] JS в `<script>` теге
- [ ] Нет синтаксических ошибок
- [ ] Работает в браузере (F12)

---

## Интеграция в сервер

```typescript
import { PluginManager, SimplePlugin, AnimatedPlugin } from '@path/extensions';

// В конструкторе сервера
this.pluginManager = new PluginManager(engine, eventBus, moduleManager);
this.pluginManager.registerPlugin(new SimplePlugin());
this.pluginManager.registerPlugin(new AnimatedPlugin());

// В routes
app.get('/api/ui/render', async (req, res) => {
  const html = await this.pluginManager.renderActive({
    state: this.engine.getState(),
    tabs: this.moduleManager.getTabs(),
    commands: this.engine.getAvailableCommands()
  });
  res.send(html);
});
```

---

## Для визуального конструктора

Система полностью готова! Конструктор может:

1. Генерировать TypeScript код плагина
2. Отправлять код на сервер (POST /api/plugins/create)
3. Сервер компилирует и загружает плагин
4. Browser видит результат

Все благодаря гибкой PluginAPI!
