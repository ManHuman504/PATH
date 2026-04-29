# 🛡️ Система Безопасного Рендеринга - Руководство

## 🎯 Главное Правило

**НИКОГДА не используй inline события (onclick, onload и т.д.) с динамическими данными!**

---

## ✅ Checklist для Разработчика

### Перед рендерингом HTML

- [ ] Используешь `data-action` вместо `onclick`?
- [ ] Используешь `data-*` атрибуты для передачи ID/данных?
- [ ] Используешь helper функции (`safeElement`, `safeCard`, `safeButton`)?
- [ ] Экранируешь HTML специальные символы через `escapeHtml()`?

### Перед созданием обработчиков

- [ ] Используешь event delegation вместо прямых слушателей?
- [ ] Один обработчик на родительский контейнер?
- [ ] Все действия зарегистрированы в `actions` объекте?
- [ ] Используешь `initActionHandler()` для инициализации?

### При разработке (dev mode)

- [ ] Запускаешь `lintHtml()` для проверки небезопасных паттернов?
- [ ] Проверяешь `validateActions()` - все ли действия имеют обработчики?
- [ ] Используешь `debugActions()` для отладки?

---

## 🚫 НИКОГДА НЕ ДЕЛАЙ ТАК

```typescript
// ❌ ПЛОХО - Inline событие с динамическими данными
const html = `<button onclick="openPath('${path.id}')">Open</button>`;

// ❌ ПЛОХО - Может сломаться если path.title содержит кавычки
const html = `<div onclick="handleClick('${path.title}')">Click</div>`;

// ❌ ПЛОХО - Проблемы с экранированием
const html = `<div onclick="doSomething('${user.input}')">Do</div>`;

// ❌ ПЛОХО - javascript: протокол
const html = `<a href="javascript:openPath('${id}')">Open</a>`;
```

---

## ✅ ВСЕГДА ДЕЛАЙ ТАК

```typescript
// ✅ ХОРОШО - data-action + event delegation
const html = safeButton('open-path', 'Open', { pathId: path.id });

// ✅ ХОРОШО - Безопасная карточка
const html = safeCard('open-path', { pathId: path.id }, path.title);

// ✅ ХОРОШО - Явные data-атрибуты
const html = `<div ${dataAttrs({ action: 'click', id: item.id })}>...</div>`;

// ✅ ХОРОШО - Event delegation на контейнере
initActionHandler(container, {
  'open-path': (el, data) => openPath(data.pathId!)
});
```

---

## 📋 Быстрый Старт (Copy-Paste Template)

```typescript
import { initActionHandler, safeCard, safeButton } from '@path/shared/safeHtml';

// 1. Рендер с безопасными элементами
function render(items: any[]): string {
  return `
    <div id="container">
      ${items.map(item => safeCard(
        'open-item',
        { itemId: item.id },
        item.title,
        'item-card'
      )).join('')}
      
      ${safeButton('create-new', 'Create New', {}, 'btn-create')}
    </div>
  `;
}

// 2. Вставка HTML
document.body.innerHTML = render(myItems);

// 3. Инициализация обработчиков (один раз!)
const container = document.getElementById('container')!;
const cleanup = initActionHandler(container, {
  'open-item': (el, data) => {
    console.log('Opening item:', data.itemId);
    window.location.href = `/item/${data.itemId}`;
  },
  
  'create-new': (el, data) => {
    console.log('Creating new item');
    openModal();
  },
  
  'delete-item': (el, data) => {
    if (confirm('Delete?')) {
      deleteItem(data.itemId!);
    }
  }
});

// 4. Cleanup при unmount
return cleanup;
```

---

## 🔍 Отладка

### В консоли браузера:

```javascript
// Показать все действия на странице
debugActions();

// Проверить что все действия обработаны
validateActions(document.body, actions);
```

### В коде (dev mode):

```typescript
if (process.env.NODE_ENV === 'development') {
  const issues = lintHtml(generatedHtml);
  if (issues.length) {
    console.warn('HTML Issues:', issues);
  }
  
  const missing = validateActions(container, actions);
  if (missing.length) {
    console.error('Missing handlers:', missing);
  }
}
```

---

## 🎓 Почему Это Важно

### Проблема 1: Экранирование
```typescript
const title = "User's \"Special\" Path";
const bad = `<div onclick="open('${title}')">...`; // ❌ Сломается!
// Результат: <div onclick="open('User's "Special" Path')">
//                                     ↑ Незакрытая строка!
```

### Решение:
```typescript
const good = safeCard('open', { id: path.id }, title); // ✅ Работает!
// Результат: <div data-action="open" data-id="123">User's "Special" Path</div>
```

### Проблема 2: XSS Атака
```typescript
const userInput = "<img src=x onerror='alert(1)'>";
const bad = `<div onclick="handle('${userInput}')">...`; // ❌ XSS!
```

### Решение:
```typescript
const good = safeCard('handle', { value: userInput }, '...'); // ✅ Безопасно!
// escapeHtml() автоматически экранирует
```

---

## 📊 Сравнение Подходов

| Критерий | Старый (onclick) | Новый (data-action) |
|----------|------------------|---------------------|
| Безопасность | ❌ Уязвим к XSS | ✅ Безопасен |
| Экранирование | ❌ Нужно вручную | ✅ Автоматически |
| Производительность | ❌ N обработчиков | ✅ 1 обработчик |
| Динамика | ❌ Нужен rebind | ✅ Работает сразу |
| Отладка | ❌ Сложно | ✅ debugActions() |
| Валидация | ❌ Нет | ✅ validateActions() |

---

## 🚀 Миграция Существующего Кода

### Шаг 1: Найди все inline события
```bash
# В терминале
grep -r "onclick=" packages/
grep -r "onload=" packages/
```

### Шаг 2: Замени каждый случай

**Было:**
```typescript
`<div onclick="handleClick('${id}')">...</div>`
```

**Стало:**
```typescript
safeCard('handle-click', { id }, '...')
```

### Шаг 3: Добавь обработчик
```typescript
initActionHandler(container, {
  'handle-click': (el, data) => handleClick(data.id!)
});
```

---

## 💡 Полезные Советия

1. **Один контейнер - один handler**: Не нужно создавать handler для каждого элемента
2. **data-* всегда безопасны**: Браузер автоматически экранирует их
3. **Используй TypeScript**: Типизируй `ActionType` для автодополнения
4. **Dev mode полезен**: Включай проверки в development
5. **Документируй actions**: Каждое действие - это часть API плагина

---

## 📚 Дополнительные Ресурсы

- `safeHtml.ts` - Основные утилиты
- `actionSystem.example.ts` - Примеры использования
- Этот файл - Полное руководство

---

## ❓ FAQ

**Q: Можно ли смешивать старый и новый подход?**  
A: Можно, но не рекомендуется. Лучше мигрировать полностью.

**Q: Работает ли с React/Vue/другими фреймворками?**  
A: Это для vanilla JS/TS. Фреймворки имеют свои механизмы.

**Q: Что делать с существующими плагинами?**  
A: Постепенно мигрировать при рефакторинге.

**Q: Нужно ли это для статичного HTML?**  
A: Если нет динамических данных - можно использовать onclick, но data-action все равно чище.

---

## 🎉 Заключение

Используй эту систему в **каждом новом плагине**.  
Она защитит от 99% проблем с событиями и экранированием.

**Главное помни: data-action + event delegation = ❤️**
