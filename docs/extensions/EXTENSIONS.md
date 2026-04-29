# Система расширений (Extensions)

## Что такое расширение?

**Расширение** — это код который:

- Подключается в runtime
- Рендерит UI
- Общается с Engine только через HTTP API (не напрямую!)
- Может быть включено/отключено

На данный момент есть одно расширение: **UglyUIExtension** — простой интерфейс на темной теме.

## Архитектура расширений

**КРИТИЧНО:** Расширения НЕ имеют прямого доступа к DOM, HTML или CSS.
Расширения ТОЛЬКО описывают UI декларативно.

```
Core (Engine)
  ↓ состояние
  
Extension.renderUI()
  ↓ возвращает JSON-описание UI (не HTML!)
  
UIHost / Renderer  
  ↓ интерпретирует описание в реальный UI
  
Browser
  ↓ отображает
```

**Что происходит:**
1. Extension ЗНАЕТ ТОЛЬКО про: состояние, команды, события
2. Extension НЕ ЗНАЕТ про: DOM, HTML, CSS, браузер
3. Extension возвращает описание: `{ type: "button", label: "Create" }`
4. Рендерер преобразует в реальную кнопку (ugly theme, nice theme и т.д.)
5. Если рендерер изменится - Extension не ломается

## Интерфейс расширения

**ПРАВИЛО:** `renderUI()` НЕ возвращает HTML!
Она возвращает JSON-описание UI, которое интерпретирует рендерер.

```typescript
interface IExtension {
  id: string;         // 'ugly-ui'
  name: string;       // 'Simple UI'
  
  async renderUI(props: {
    state: any;                     // состояние от Core
    tabs: Array<{id, title, icon}>; // вкладки от модулей  
    commands: string[];             // доступные команды
  }): Promise<UIDescription>;       // JSON-описание, не HTML!
}

// Пример возвращаемого значения
interface UIDescription {
  type: 'panel';
  title: string;
  children: [
    { type: 'text', value: 'Total paths: 5' },
    { type: 'button', label: 'Create Path', action: 'CREATE_PATH' }
  ]
}
```

**Вот это ПРАВИЛЬНО:**
- Extension возвращает JSON
- Рендерер интерпретирует JSON
- UIHost отображает результат
- Extension не может "сломать" UI изменением самого себя

## UglyUIExtension - текущее расширение

### Что делает?

Рендерит HTML интерфейс с:
- Формой для создания пути
- Списком путей в grid
- Dark theme (темная тема)
- Встроенный JavaScript для отправки команд

### Как работает?

```typescript
class UglyUIExtension implements IExtension {
  id = 'ugly-ui';
  name = 'Simple UI';
  
  async renderUI(props) {
    const { state, tabs, commands } = props;
    const paths = state.paths || [];
    
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Path#</title>
        <style>
          /* CSS для UI */
          body { background: #0f0f0f; color: #e0e0e0; }
          .btn { background: #3b82f6; color: white; }
        </style>
      </head>
      <body>
        <h1>Path#</h1>
        <input id="pathName" placeholder="Enter path name">
        <button onclick="sendCommand('CREATE_PATH')">Create</button>
        
        <div class="paths-list">
          ${paths.map(p => `
            <div class="path-item">
              <strong>${p.title}</strong>
              <small>#${p.id.substring(0, 8)}</small>
            </div>
          `).join('')}
        </div>
        
        <script>
          const API = window.location.origin + '/api';
          
          async function sendCommand(type) {
            const payload = {};
            if (type === 'CREATE_PATH') {
              const input = document.getElementById('pathName');
              payload.title = input.value.trim();
            }
            
            const res = await fetch(API + '/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, payload })
            });
            
            if (res.ok) {
              location.reload(); // Обновить страницу
            }
          }
        </script>
      </body>
    </html>
    `;
  }
}
```

## Правила для расширений

### ✅ DO (Требования)

1. **Расширение имплементирует IExtension**
   ```typescript
   class MyExtension implements IExtension {
     id: string;
     name: string;
     renderUI(props): Promise<string>
   }
   ```

2. **renderUI возвращает строку HTML**
   ```typescript
   async renderUI(props) {
     return `<!DOCTYPE html>...`; // Строка!
   }
   ```

3. **JavaScript в HTML использует HTTP API**
   ```javascript
   // ✅ ПРАВИЛЬНО
   const API = window.location.origin + '/api';
   fetch(API + '/command', { ... });
   
   // ❌ НЕПРАВИЛЬНО
   import Engine from '@path/core'; // Не доступно в браузере!
   ```

4. **Состояние передается через props**
   ```typescript
   async renderUI(props) {
     const { state, tabs, commands } = props;
     // Используй state для рендера
     return `... ${state.paths.length} paths ...`;
   }
   ```

5. **Команды отправляются через fetch()**
   ```javascript
   const res = await fetch(API + '/command', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       type: 'CREATE_PATH',
       payload: { title: 'My Path' }
     })
   });
   ```

### ❌ DO NOT (Запреты)

1. **Расширение НЕ может напрямую импортировать Engine**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   import { Engine } from '@path/core';
   
   class MyExtension {
     private engine: Engine;
   }
   ```

2. **Расширение НЕ может хранить состояние**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   class MyExtension {
     private paths = []; // Не надо!
     
     renderUI(props) {
       this.paths = props.state.paths; // Дублирование!
     }
   }
   ```

3. **JavaScript НЕ должен обновлять DOM вручную**
   ```javascript
   // ❌ НЕПРАВИЛЬНО (может рассинхронизироваться)
   document.getElementById('list').innerHTML = '<div>...</div>';
   
   // ✅ ПРАВИЛЬНО
   location.reload(); // Перезагрузить всю страницу с свежим состоянием
   ```

4. **Расширение НЕ может напрямую писать команды в state**
   ```javascript
   // ❌ НЕПРАВИЛЬНО
   fetch('/api/state', {
     method: 'POST',
     body: JSON.stringify({ paths: [...] })
   });
   
   // ✅ ПРАВИЛЬНО
   fetch('/api/command', {
     method: 'POST',
     body: JSON.stringify({
       type: 'CREATE_PATH',
       payload: { title: '...' }
     })
   });
   ```

5. **Расширение НЕ должно содержать сложную логику**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   renderUI(props) {
     // Вычисление сложных метрик
     const stats = props.state.paths.map(p => ({
       ...p,
       nodeCount: this.calculateComplexStats(p),
       relationships: this.analyzeRelations(p)
     }));
   }
   
   // ✅ ПРАВИЛЬНО
   renderUI(props) {
     // Просто рендер того что есть в состоянии
     return props.state.paths.map(p => `<div>${p.title}</div>`);
   }
   ```

## Как написать свое расширение

### Шаг 1: Создать класс

```typescript
import { IExtension } from '@path/core';

export class MyUIExtension implements IExtension {
  id = 'my-ui';
  name = 'My Custom UI';
  
  async renderUI(props) {
    const { state, tabs, commands } = props;
    
    return `
    <!DOCTYPE html>
    <html>
      <!-- Весь HTML здесь -->
    </html>
    `;
  }
}
```

### Шаг 2: Добавить в Server

```typescript
// apps/web/src/server.ts
import { MyUIExtension } from '@path/extensions';

async function initializeModules() {
  // ... модули ...
  
  const myUI = new MyUIExtension();
  activeExtension = myUI;
}
```

### Шаг 3: Протестировать

Открыть браузер:
```
http://localhost:3000
```

Server будет вызывать `myUI.renderUI()` и отправлять HTML в браузер.

## Примеры расширений

### Пример 1: Минимальное расширение

```typescript
export class SimpleExtension implements IExtension {
  id = 'simple';
  name = 'Simple UI';
  
  async renderUI(props) {
    return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Paths (${props.state.paths?.length || 0})</h1>
        <button onclick="alert('Hello!')">Click me</button>
      </body>
    </html>
    `;
  }
}
```

### Пример 2: С формой

```typescript
export class FormExtension implements IExtension {
  id = 'form';
  name = 'Form UI';
  
  async renderUI(props) {
    return `
    <!DOCTYPE html>
    <html>
      <body>
        <form onsubmit="handleSubmit(event)">
          <input name="title" placeholder="Path name" required>
          <button type="submit">Create</button>
        </form>
        
        <script>
          const API = window.location.origin + '/api';
          
          async function handleSubmit(e) {
            e.preventDefault();
            const title = e.target.title.value;
            
            const res = await fetch(API + '/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'CREATE_PATH',
                payload: { title }
              })
            });
            
            if (res.ok) {
              location.reload();
            }
          }
        </script>
      </body>
    </html>
    `;
  }
}
```

### Пример 3: С использованием всех props

```typescript
export class AdvancedExtension implements IExtension {
  id = 'advanced';
  name = 'Advanced UI';
  
  async renderUI(props) {
    const { state, tabs, commands } = props;
    
    return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Path#</h1>
        
        <!-- Вкладки -->
        <nav>
          ${tabs.map(t => `<button>${t.title}</button>`).join('')}
        </nav>
        
        <!-- Пути -->
        <div>
          <h2>Paths</h2>
          ${state.paths?.map(p => `<div>${p.title}</div>`).join('')}
        </div>
        
        <!-- Доступные команды -->
        <div>
          <h2>Commands</h2>
          ${commands.map(c => `<button onclick="run('${c}')">${c}</button>`).join('')}
        </div>
        
        <script>
          const API = window.location.origin + '/api';
          
          async function run(type) {
            const res = await fetch(API + '/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, payload: {} })
            });
            console.log('Command executed:', type);
          }
        </script>
      </body>
    </html>
    `;
  }
}
```

## Жизненный цикл расширения

```
1. NEW
   └─ Создано

2. ENABLED
   └─ Server вызывает activeExtension = extension
   └─ Готово к renderUI()

3. RENDERING
   └─ renderUI() вызывается при каждом запросе GET /api/ui/render
   └─ Возвращает HTML с текущим состоянием
   └─ Браузер получает HTML и отображает

4. USER INTERACTION
   └─ Пользователь нажимает кнопку в браузере
   └─ JavaScript отправляет fetch() на /api/command
   └─ Server обрабатывает команду
   └─ Extension рендерится снова с новым состоянием

5. DISABLED (редко)
   └─ activeExtension = null
   └─ renderUI() больше не вызывается
```

## Почему расширения только через HTTP API?

### Проблема: Прямой доступ

```typescript
// ❌ Если бы расширение имело прямой доступ
class BadExtension {
  constructor(private engine: Engine) {}
  
  renderUI() {
    // Расширение может напрямую поломать Engine!
    this.engine.state.paths = null;
    this.engine.commandHandlers.clear();
  }
}
```

### Решение: HTTP API

```typescript
// ✅ Расширение только через HTTP
class GoodExtension {
  async renderUI(props) {
    // Расширение может только:
    // 1. Читать props.state (безопасно)
    // 2. Отправлять fetch() на /api/command (безопасно)
    // 3. Отправлять fetch() на /api/state (безопасно)
    
    // Поломать Engine не может! Нет доступа.
  }
}
```

## Дополнительно

- [Server API](../api/SERVER_API.md)
- [UI Система](./UI_SYSTEM.md)
- [Модули](../modules/MODULES_OVERVIEW.md)
