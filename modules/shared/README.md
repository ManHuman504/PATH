# packages/shared

Общие типы и утилиты

---

## 🛡️ Safe HTML Rendering System

Система защиты от проблем с экранированием и XSS атак при генерации HTML.

### ⚡ Быстрый старт

```typescript
import { initActionHandler, safeCard, safeButton } from '@path/shared';

// 1. Создай HTML с data-action вместо onclick
const html = `
  <div id="app">
    ${items.map(item => 
      safeCard('open-item', { itemId: item.id }, item.title, 'card')
    ).join('')}
    ${safeButton('create', 'Create New', {}, 'btn-primary')}
  </div>
`;

// 2. Вставь HTML
document.body.innerHTML = html;

// 3. Инициализируй обработчики (ОДИН РАЗ)
const app = document.getElementById('app')!;
initActionHandler(app, {
  'open-item': (el, data) => openItem(data.itemId!),
  'create': () => openModal()
});
```

### 🎯 Главное правило

```typescript
// ❌ НИКОГДА НЕ ДЕЛАЙ ТАК
`<button onclick="doSomething('${dynamicData}')">Click</button>`

// ✅ ВСЕГДА ДЕЛАЙ ТАК
safeButton('do-something', 'Click', { data: dynamicData })
```

### 📚 Основные функции

- `safeElement()` - создает элемент с data-action
- `safeCard()` - быстрый способ создать кликабельный div
- `safeButton()` - создает кнопку с действием
- `initActionHandler()` - инициализирует event delegation
- `escapeHtml()` / `escapeJs()` - экранирование
- `dataAttrs()` - создает data-* атрибуты

### 📖 Документация

- [Полное руководство](../../docs/SAFE_RENDERING_GUIDE.md)
- [Примеры использования](./src/actionSystem.example.ts)

