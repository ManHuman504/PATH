# 🔌 Plugin System - Система создания пользовательских компонентов

## Концепция

**Plugin** - это код который:
- Добавляет новый тип компонента UI
- Регистрируется в UIBuilder
- Может использоваться в любом Extension

```
┌──────────────────┐
│  Your Extension  │
│  buildUIConfig() │
└────────┬─────────┘
         │
         ↓ JSON конфиг с type: 'my-component'
         │
┌────────┴──────────────────┐
│  UIBuilder                 │
│  1. Парсит JSON            │
│  2. Вызывает нужный plugin │
│  3. Получает HTML          │
└────────┬──────────────────┘
         │
         ↓ HTML
         │
┌────────┴──────────────┐
│  Browser             │
│  Отображает элемент  │
└──────────────────────┘
```

---

## Встроенные компоненты

UIBuilder имеет 6 встроенных типов:
- `stats` - метрики и счётчики
- `form` - формы ввода данных
- `cards` - сетка карточек
- `table` - таблицы
- `list` - простые списки
- `buttons` - группы кнопок

---

## Создание своего компонента

### Шаг 1: Создайте класс Plugin

```typescript
// customComponentPlugin.ts

export class CustomComponentPlugin {
  /**
   * Тип компонента - должен быть уникален
   */
  type = 'custom-banner';

  /**
   * Генерировать HTML для компонента
   */
  render(section: any): string {
    const { title, message, icon } = section;

    return `
      <div class="custom-banner">
        <div class="custom-banner__icon">${icon || '⭐'}</div>
        <h2>${title || 'Notice'}</h2>
        <p>${message || 'Custom content'}</p>
      </div>
    `;
  }

  /**
   * CSS стили для компонента
   */
  getStyles(): string {
    return `
      .custom-banner {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        margin: 20px 0;
      }
      .custom-banner__icon {
        font-size: 48px;
        margin-bottom: 10px;
      }
      .custom-banner h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }
      .custom-banner p {
        margin: 0;
        opacity: 0.9;
      }
    `;
  }

  /**
   * JavaScript обработчики (опционально)
   */
  getScripts(): string {
    return `
      // Ваш JavaScript код здесь
      console.log('Custom banner rendered');
    `;
  }
}
```

### Шаг 2: Зарегистрируйте в UIBuilder

```typescript
// uiBuilder.ts (в конструкторе или методе регистрации)

import { CustomComponentPlugin } from './customComponentPlugin';

class UIBuilder {
  private plugins = new Map();

  constructor(config: UIConfig) {
    this.config = config;
    
    // Зарегистрируйте встроенные компоненты
    this.registerBuiltinComponents();
    
    // Зарегистрируйте ваши плагины
    this.registerPlugin(new CustomComponentPlugin());
  }

  registerPlugin(plugin: any) {
    this.plugins.set(plugin.type, plugin);
  }

  renderSection(section: UISection): string {
    const plugin = this.plugins.get(section.type);
    
    if (!plugin) {
      console.warn(`Unknown component type: ${section.type}`);
      return '';
    }

    return plugin.render(section);
  }
}
```

### Шаг 3: Используйте в Extension

```typescript
// myExtension.ts

export class MyExtension implements IUIExtension {
  id = 'my-extension';
  name = 'My Extension';

  async buildUIConfig(props) {
    return {
      title: 'Page with Custom Component',
      sections: [
        {
          type: 'custom-banner',  // ← Ваш тип компонента
          title: 'Welcome!',
          message: 'This is a custom component',
          icon: '🎉'
        },
        {
          type: 'form',  // Встроенный компонент
          fields: [
            { name: 'name', label: 'Name', type: 'text' }
          ],
          actions: [
            { label: 'Submit', command: 'SUBMIT', style: 'primary' }
          ]
        }
      ]
    };
  }
}
```

---

## Пример 1: Банер с кнопкой

```typescript
export class AlertBannerPlugin {
  type = 'alert-banner';

  render(section: any) {
    const { message, type = 'info', title } = section;
    
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    return `
      <div style="background: ${colors[type]}; 
                  color: white; 
                  padding: 16px; 
                  border-radius: 6px; 
                  margin: 16px 0;">
        ${title ? `<strong>${title}</strong><br>` : ''}
        ${message}
      </div>
    `;
  }

  getStyles() {
    return `
      .alert-banner {
        animation: slideIn 0.3s ease-out;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }
}
```

Использование:
```typescript
sections: [
  {
    type: 'alert-banner',
    title: 'Success!',
    message: 'Your path was created',
    type: 'success'
  }
]
```

---

## Пример 2: Карточка с действиями

```typescript
export class ActionCardPlugin {
  type = 'action-card';

  render(section: any) {
    const { items = [] } = section;

    return items.map(item => `
      <div class="action-card">
        <div class="action-card__icon">${item.icon || '📦'}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button 
          onclick="sendCommand('${item.command}', ${JSON.stringify(item.payload || {})})"
          class="action-card__button">
          ${item.buttonLabel || 'Action'}
        </button>
      </div>
    `).join('');
  }

  getStyles() {
    return `
      .action-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin: 12px;
        display: inline-block;
        width: 200px;
        text-align: center;
        transition: all 0.3s;
      }
      .action-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }
      .action-card__icon {
        font-size: 40px;
        margin-bottom: 10px;
      }
      .action-card__button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }
      .action-card__button:hover {
        background: #2563eb;
      }
    `;
  }
}
```

Использование:
```typescript
sections: [
  {
    type: 'action-card',
    items: [
      {
        icon: '📁',
        title: 'Create Path',
        description: 'Start a new path tracking',
        command: 'CREATE_PATH',
        buttonLabel: 'Create'
      },
      {
        icon: '📊',
        title: 'View Stats',
        description: 'See your progress',
        command: 'VIEW_STATS',
        buttonLabel: 'View'
      }
    ]
  }
]
```

---

## Пример 3: Timeline компонент

```typescript
export class TimelinePlugin {
  type = 'timeline';

  render(section: any) {
    const { items = [] } = section;

    return `
      <div class="timeline">
        ${items.map((item, idx) => `
          <div class="timeline-item ${item.active ? 'active' : ''}">
            <div class="timeline-item__marker"></div>
            <div class="timeline-item__content">
              <h4>${item.title}</h4>
              <p>${item.description}</p>
              <small>${item.date || ''}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getStyles() {
    return `
      .timeline {
        position: relative;
        padding: 20px 0;
      }
      .timeline::before {
        content: '';
        position: absolute;
        left: 24px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e5e7eb;
      }
      .timeline-item {
        position: relative;
        padding: 0 0 20px 80px;
      }
      .timeline-item__marker {
        position: absolute;
        left: 12px;
        top: 5px;
        width: 24px;
        height: 24px;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 50%;
      }
      .timeline-item.active .timeline-item__marker {
        background: #3b82f6;
        border-color: #3b82f6;
      }
      .timeline-item__content h4 {
        margin: 0 0 5px 0;
      }
    `;
  }
}
```

Использование:
```typescript
sections: [
  {
    type: 'timeline',
    items: [
      {
        title: 'Started',
        description: 'Project initialized',
        date: '2024-01-01',
        active: true
      },
      {
        title: 'Development',
        description: 'Building features',
        date: '2024-01-15'
      },
      {
        title: 'Launch',
        description: 'Going live',
        date: '2024-02-01'
      }
    ]
  }
]
```

---

## Пример 4: Chart компонент

```typescript
export class ChartPlugin {
  type = 'chart';

  render(section: any) {
    const { title, data = [], type = 'bar' } = section;
    const max = Math.max(...data.map(d => d.value));
    
    if (type === 'bar') {
      return `
        <div class="chart">
          ${title ? `<h3>${title}</h3>` : ''}
          <div class="chart-bars">
            ${data.map(item => `
              <div class="chart-bar-item">
                <div class="chart-bar" 
                     style="height: ${(item.value / max) * 100}%;"
                     title="${item.label}: ${item.value}">
                </div>
                <label>${item.label}</label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  getStyles() {
    return `
      .chart {
        padding: 20px;
      }
      .chart h3 {
        margin-top: 0;
      }
      .chart-bars {
        display: flex;
        align-items: flex-end;
        gap: 20px;
        height: 200px;
      }
      .chart-bar-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .chart-bar {
        width: 100%;
        background: linear-gradient(180deg, #3b82f6, #1e40af);
        border-radius: 4px 4px 0 0;
        transition: all 0.3s;
      }
      .chart-bar:hover {
        background: linear-gradient(180deg, #60a5fa, #3b82f6);
      }
      .chart-bar-item label {
        font-size: 12px;
        text-align: center;
      }
    `;
  }
}
```

Использование:
```typescript
sections: [
  {
    type: 'chart',
    title: 'Progress',
    type: 'bar',
    data: [
      { label: 'Jan', value: 20 },
      { label: 'Feb', value: 35 },
      { label: 'Mar', value: 45 },
      { label: 'Apr', value: 50 }
    ]
  }
]
```

---

## Регистрация плагинов

### В UIBuilder

```typescript
// uiBuilder.ts

export class UIBuilder {
  private plugins = new Map();

  constructor(config: UIConfig) {
    this.config = config;
    this.initializePlugins();
  }

  private initializePlugins() {
    // Встроенные компоненты
    this.registerBuiltinComponents();
    
    // Ваши плагины
    this.registerPlugin(new CustomComponentPlugin());
    this.registerPlugin(new AlertBannerPlugin());
    this.registerPlugin(new ActionCardPlugin());
    this.registerPlugin(new TimelinePlugin());
    this.registerPlugin(new ChartPlugin());
  }

  registerPlugin(plugin: any) {
    if (!plugin.type) {
      throw new Error('Plugin must have a type property');
    }
    this.plugins.set(plugin.type, plugin);
  }

  render(): string {
    let html = this.renderHeader();
    let styles = this.collectStyles();
    let scripts = this.collectScripts();

    for (const section of this.config.sections) {
      const plugin = this.plugins.get(section.type);
      if (plugin) {
        html += plugin.render(section);
      } else {
        console.warn(`Unknown component type: ${section.type}`);
      }
    }

    html += `<style>${styles}</style>`;
    html += `<script>${scripts}</script>`;
    html += this.renderFooter();

    return html;
  }

  private collectStyles(): string {
    let css = this.getDefaultStyles();
    
    for (const plugin of this.plugins.values()) {
      if (plugin.getStyles) {
        css += plugin.getStyles();
      }
    }
    
    return css;
  }

  private collectScripts(): string {
    let js = this.getDefaultScripts();
    
    for (const plugin of this.plugins.values()) {
      if (plugin.getScripts) {
        js += plugin.getScripts();
      }
    }
    
    return js;
  }
}
```

---

## Чек-лист для плагина

- [ ] Класс имеет свойство `type`
- [ ] Метод `render(section)` возвращает строку HTML
- [ ] HTML корректный и не содержит ошибок синтаксиса
- [ ] Метод `getStyles()` возвращает CSS
- [ ] CSS использует класс-префиксы (`.my-component`)
- [ ] Опционально: `getScripts()` для JavaScript логики
- [ ] Плагин зарегистрирован в UIBuilder
- [ ] Тестировано в браузере
- [ ] Работает с разными размерами экрана
- [ ] Документировано как использовать

---

## Лучшие практики

✅ **ДА:**
- Используйте уникальные имена классов в CSS
- Тестируйте разные варианты данных (пусто, много, мало)
- Возвращайте валидный HTML
- Используйте `getStyles()` для CSS (не встраивайте в HTML)
- Документируйте параметры section

❌ **НЕТ:**
- Не используйте глобальные стили
- Не создавайте сложные JavaScript логики (используйте sendCommand)
- Не забывайте про null-safety (проверяйте что items есть)
- Не пишите в консоль много логов

---

## Интеграция с Extension

```typescript
import { CustomComponentPlugin } from './plugins/customComponentPlugin';

// В вашем Extension
async buildUIConfig(props) {
  // UIBuilder автоматически зарегистрирует плагины
  // Вы просто используете type в JSON
  
  return {
    title: 'My Page',
    sections: [
      {
        type: 'custom-banner',  // ← Ваш плагин
        title: 'Welcome',
        message: 'Using custom component!'
      }
    ]
  };
}
```

---

## Примеры плагинов в репозитории

Смотрите:
- `plugins/extensions/src/uiBuilder.ts` - встроенные компоненты
- Создавайте новые файлы в `plugins/extensions/src/plugins/`

Готовые плагины для использования:
- `CustomComponentPlugin` - базовый пример
- `AlertBannerPlugin` - банеры сообщений
- `ActionCardPlugin` - карточки с кнопками
- `TimelinePlugin` - временная линия
- `ChartPlugin` - графики данных
