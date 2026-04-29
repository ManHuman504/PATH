# UI Система Path#

## ⚠️ ВАЖНО: UIRenderer Абстракция

Extension **НЕ ПРОИЗВОДИТ HTML**. Extension производит **JSON ОПИСАНИЕ** UI, которое **UIRenderer интерпретирует**.

Это позволяет:
- ✅ Множественным renderers работать с одним Extension (web, desktop, mobile)
- ✅ Extensions оставаться пестотехнологичными и portable
- ✅ Разделение ответственности: Extension о логике, Renderer о внешнем виде

## Архитектура UI

```
Engine State
    ↓
Extension.renderUI(state) → UIDescription (JSON)
    ↓
UIRenderer.render(description) → Browser-specific (HTML, React, etc)
    ↓
User sees: Rendered UI
    ↓
User clicks
    ↓
Browser: fetch(/api/command)
    ↓
Server
    ↓
Engine: dispatch(command)
    ↓
State changes
    ↓
Extension.renderUI() called again
    ↓
UIRenderer updates
```

## UIDescription - JSON Modель

Extension возвращает **`UIDescription`** объект. Это JSON, описывающий структуру UI:

```typescript
interface UIDescription {
  type: 'container' | 'text' | 'button' | 'form' | 'list' | 'grid' | 'input';
  children?: UIDescription[];
  props?: Record<string, any>;
  handlers?: {
    onClick?: string;  // Имя команды для dispatch
    onSubmit?: string; // Имя команды для dispatch
  };
}
```

**Примеры**:

### Кнопка

```json
{
  "type": "button",
  "props": {
    "label": "Create Path",
    "variant": "primary"
  },
  "handlers": {
    "onClick": "CREATE_PATH"
  }
}
```

### Форма ввода

```json
{
  "type": "form",
  "children": [
    {
      "type": "input",
      "props": {
        "name": "title",
        "placeholder": "Enter path name",
        "maxlength": 100
      }
    },
    {
      "type": "button",
      "props": {
        "label": "Create",
        "variant": "primary"
      },
      "handlers": {
        "onClick": "CREATE_PATH"
      }
    }
  ]
}
```

### Список путей (grid)

```json
{
  "type": "grid",
  "props": {
    "columns": 3,
    "gap": 20
  },
  "children": [
    {
      "type": "container",
      "children": [
        {
          "type": "text",
          "props": {
            "content": "Path Title",
            "size": "large"
          }
        },
        {
          "type": "text",
          "props": {
            "content": "Created: 2024-01-28",
            "size": "small",
            "color": "muted"
          }
        }
      ]
    }
  ]
}
```

## UIRenderer - как он работает

**UIRenderer** - это компонент в браузере (или мобильном приложении), который:

1. **Получает UIDescription** от Server (как JSON)
2. **Интерпретирует** структуру (тип, дети, пропсы)
3. **Рендерит** в нужную платформу (HTML в браузере, SwiftUI на iOS и т.д.)
4. **Вешает обработчики** на кнопки/инпуты, которые отправляют команды

Пример UIRenderer для браузера:

```typescript
class UIRenderer {
  render(description: UIDescription): HTMLElement {
    switch (description.type) {
      case 'button':
        const btn = document.createElement('button');
        btn.textContent = description.props.label;
        btn.onclick = () => {
          fetch('/api/command', {
            method: 'POST',
            body: JSON.stringify({
              type: description.handlers?.onClick,
              payload: {} // Собрать из других элементов
            })
          });
        };
        return btn;
        
      case 'container':
        const div = document.createElement('div');
        description.children?.forEach(child => {
          div.appendChild(this.render(child));
        });
        return div;
        
      // ... и т.д. для других типов
    }
  }
}
```

**Ключевое свойство**: Extension вообще не знает как рендерится UI. Extension только говорит "нарисуй кнопку с таким текстом" и UIRenderer решает КАК это сделать.

## Текущие Extensions (примеры)

### UglyUIExtension vs NiceUIExtension

Оба Extensions возвращают ОДИНакОВЫЕ `UIDescription` объекты:

```typescript
// UglyUIExtension
async renderUI(state) {
  return {
    type: 'container',
    children: [
      { type: 'text', props: { content: 'Path#' } },
      { type: 'button', props: { label: 'Create' } }
      // ...
    ]
  };
}

// NiceUIExtension - возвращает ТАКОЙ ЖЕ UIDescription
async renderUI(state) {
  return {
    type: 'container',
    children: [
      { type: 'text', props: { content: 'Path#' } },
      { type: 'button', props: { label: 'Create' } }
      // ...
    ]
  };
}
```

Разница только в том, как **UIRenderer интерпретирует** `type: 'button'`:
- **UglyUIRenderer**: Рисует простую кнопку черным текстом на сером
- **NiceUIRenderer**: Рисует красивую кнопку с анимацией

**Это позволяет менять тему БЕЗ ИЗМЕНЕНИЯ EXTENSION CODE.**

## Как Extension создает UIDescription

### Пример: renderUI() в PATH_MODULE

```typescript
class PathModule implements IModule {
  async renderUI(state): Promise<UIDescription> {
    const paths = state.paths || [];
    
    return {
      type: 'container',
      children: [
        // Заголовок
        { type: 'text', props: { content: 'Your Paths', size: 'large' } },
        
        // Форма создания
        {
          type: 'form',
          children: [
            {
              type: 'input',
              props: { name: 'title', placeholder: 'Path name' }
            },
            {
              type: 'button',
              props: { label: 'Create Path', variant: 'primary' },
              handlers: { onClick: 'CREATE_PATH' }
            }
          ]
        },
        
        // Список путей (если есть)
        paths.length === 0 
          ? { type: 'text', props: { content: 'No paths yet' } }
          : {
              type: 'grid',
              props: { columns: 3, gap: 20 },
              children: paths.map(path => ({
                type: 'container',
                children: [
                  { type: 'text', props: { content: path.title, size: 'large' } },
                  { type: 'text', props: { content: `Created: ${path.created}` } }
                ]
              }))
            }
      ]
    };
  }
}
```

**Ключевые моменты**:
- ✅ Extension оперирует **JSON структурой**
- ✅ Extension НЕ создает HTML
- ✅ Extension НЕ стилизует элементы
- ✅ Extension НЕ вешает обработчики DOM
- ✅ Extension только описывает СТРУКТУРУ + указывает команды

## Как это все работает вместе

1. **Server получает запрос GET /api/ui/render**
   
2. **Server вызывает engine.getState()**
   ```typescript
   const state = engine.getState();
   // { paths: [...], timeline: {...}, ... }
   ```

3. **Server вызывает activeExtension.renderUI(state)**
   ```typescript
   const description = await activeExtension.renderUI(state);
   // { type: 'container', children: [...] }
   ```

4. **Server отправляет description как JSON**
   ```typescript
   res.json(description);
   ```

5. **Браузер получает JSON и вызывает UIRenderer**
   ```typescript
   const description = await fetch('/api/ui/render').then(r => r.json());
   const html = uiRenderer.render(description);
   document.body.appendChild(html);
   ```

6. **UIRenderer создает HTML из JSON**
   ```typescript
   // From: { type: 'button', props: { label: 'Create' } }
   // To: <button>Create</button>
   ```

7. **User видит UI и кликает кнопку**
   ```
   Click → UIRenderer notifies → fetch('/api/command')
   ```

8. **Server получает команду и запускает engine.dispatch()**
   ```typescript
   engine.dispatch({ type: 'CREATE_PATH', payload: {...} });
   ```

9. **Engine запускает обработчики команды в модулях**
   ```typescript
   // В PathModule onCommand('CREATE_PATH', ...)
   api.setState({ ...state, paths: [...paths, newPath] });
   ```

10. **State изменился → Next render request вернет новую UIDescription**

## Почему это правильно?

✅ **Separation of Concerns**
- Extension: "что показать"
- UIRenderer: "как показать"

✅ **Multiple UIs**
- Один Extension → множество Renderers
- Web renderer → HTML
- Mobile renderer → SwiftUI
- Desktop renderer → Tauri UI

✅ **No Extension Coupling**
- Extension не знает про DOM
- Extension не знает про CSS
- Extension не знает про HTML
- Extension только возвращает JSON

✅ **Реактивность**
- State меняется → автоматический перендер
- UIRenderer интерпретирует новую UIDescription
    <div class="path-card">
      <h3>${path.title}</h3>
      <button onclick="sendCommand('DELETE_PATH', {id: '${path.id}'})"
              class="btn btn-danger">
        🗑️ Delete
      </button>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <div class="paths-grid">
          ${pathCardsHTML}
        </div>
      </body>
    </html>
  `;
}
```

#### Шаг 2: Добавить стиль для кнопки

```css
.btn-danger {
  background: #ef4444;
}

.btn-danger:hover {
  background: #dc2626;
}
```

#### Шаг 3: Тестировать

Открыть браузер и нажать кнопку удаления. Если команда `DELETE_PATH` зарегистрирована в Engine, она выполнится.

## Отладка UI проблем

### Проблема: Кнопка ничего не делает

1. Открыть DevTools (F12)
2. Нажать кнопку
3. Смотреть Console - должны быть логи от sendCommand()
4. Если логов нет - проверить HTML на ошибки
5. Если логи есть, но ошибка - проверить `/api/command` на сервере

```javascript
// Добавить в console
await sendCommand('CREATE_PATH', { title: 'Test' })
// Должен показать лог [UI] Sending command: CREATE_PATH
```

### Проблема: Вид некрасивый

1. Проверить CSS переменные в :root {}
2. Проверить grid - должен быть auto-fill
3. Проверить hover эффекты - должны быть transition

### Проблема: Состояние не обновляется

1. Проверить что location.reload() вызывается после команды
2. Смотреть Network вкладку в DevTools - должен быть новый запрос GET /api/ui/render
3. Проверить что Engine.setState() вызывается при выполнении команды

## Примеры расширений UI

### Пример 1: Табы для навигации

```typescript
async renderUI(props) {
  const { state, tabs } = props;
  
  const tabsHTML = tabs.map(tab => `
    <button class="tab" onclick="selectTab('${tab.id}')">
      ${tab.icon} ${tab.title}
    </button>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <nav class="tabs">
          ${tabsHTML}
        </nav>
        <!-- Content -->
      </body>
    </html>
  `;
}
```

### Пример 2: Поиск путей

```typescript
async renderUI(props) {
  const { state } = props;
  
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <input 
          id="search" 
          type="text" 
          placeholder="Search paths..."
          onkeyup="filterPaths(this.value)"
        >
        
        <div id="results" class="paths-grid">
          ${state.paths.map(p => `
            <div class="path-card" data-title="${p.title.toLowerCase()}">
              ${p.title}
            </div>
          `).join('')}
        </div>
        
        <script>
          function filterPaths(query) {
            const cards = document.querySelectorAll('.path-card');
            const q = query.toLowerCase();
            
            cards.forEach(card => {
              const title = card.dataset.title;
              card.style.display = title.includes(q) ? 'block' : 'none';
            });
          }
        </script>
      </body>
    </html>
  `;
}
```

## Следующие шаги

- Добавить delete/edit команды
- Добавить детальный просмотр пути
- Добавить поиск и фильтры
- Добавить экспорт/импорт
- Добавить настройки темы
