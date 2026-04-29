# 🎨 UIBuilder - Декларативная система для создания интерфейсов

**Создавайте интерфейсы БЕЗ написания HTML/CSS кода!**

UIBuilder позволяет описывать интерфейсы как простой JSON, и система автоматически генерирует красивый HTML.

---

## 📌 Основная идея

### Было (ПЛОХО - хардкод HTML):
```typescript
// ❌ Много HTML кода, сложно менять
const html = `
  <div class="container">
    <h1>Title</h1>
    <div class="cards-grid">
      <div class="card">
        <div class="card-icon">📁</div>
        <h3>Card Title</h3>
      </div>
    </div>
  </div>
`;
```

### Теперь (ХОРОШО - JSON конфигурация):
```typescript
// ✅ Просто JSON конфигурация, видно что находится
const config = {
  title: 'My Page',
  sections: [
    {
      type: 'cards',
      items: [
        { title: 'Card Title', icon: '📁' }
      ]
    }
  ]
};

const ui = new UIBuilder(config);
const html = ui.render();
```

---

## 🚀 Быстрый старт

### 1. Импортируйте UIBuilder

```typescript
import { UIBuilder, UIConfig } from '@path/extensions';
```

### 2. Создайте JSON конфигурацию

```typescript
const config: UIConfig = {
  title: 'My Application',
  subtitle: 'Optional subtitle',
  theme: 'dark',
  sections: [
    // Добавляйте компоненты сюда
  ]
};
```

### 3. Рендеринг в HTML

```typescript
const builder = new UIBuilder(config);
const html = builder.render();
```

---

## 📦 Доступные компоненты

### 1. 📊 STATS - Статистика и счётчики

Показывает ключевые метрики на главной странице.

```typescript
{
  type: 'stats',
  items: [
    { 
      label: 'Total Paths', 
      value: 5, 
      icon: '📁' 
    },
    { 
      label: 'Completed', 
      value: 3, 
      icon: '✅' 
    },
    { 
      label: 'In Progress', 
      value: 2, 
      icon: '🔄' 
    }
  ]
}
```

**Результат**:
- Красивая сетка с 4 элементами
- Большой значение (value) как основное число
- Иконка и метка для каждого элемента
- Автоматическая отзывчивость (responsive)

---

### 2. 📝 FORM - Формы для создания/редактирования

Создавайте формы без написания HTML!

```typescript
{
  type: 'form',
  title: 'Create New Path',
  fields: [
    {
      name: 'title',
      label: 'Path Title',
      type: 'text',
      placeholder: 'Enter path name',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'What will you do?',
      required: false
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Learning', value: 'learning' },
        { label: 'Work', value: 'work' },
        { label: 'Personal', value: 'personal' }
      ],
      required: true
    }
  ],
  actions: [
    { label: 'Create', command: 'CREATE_PATH', style: 'primary' },
    { label: 'Cancel', command: 'CANCEL', style: 'secondary' }
  ]
}
```

**Доступные типы полей**:
- `text` - обычное текстовое поле
- `textarea` - многострочный текст
- `number` - числовое значение
- `select` - выпадающий список

**Стили кнопок**:
- `primary` - главная кнопка (синяя)
- `secondary` - второстепенная (серая)
- `danger` - опасная операция (красная)

---

### 3. 🎴 CARDS - Карточки информации

Отображает элементы в виде красивых карточек.

```typescript
{
  type: 'cards',
  title: 'Your Paths',
  items: [
    {
      title: 'Learn TypeScript',
      icon: '📁',
      description: '5 nodes completed',
      count: 5
    },
    {
      title: 'Master React',
      icon: '📁',
      description: '3 nodes in progress',
      count: 3
    }
  ]
}
```

**Параметры элемента**:
- `title` - название карточки
- `icon` - эмодзи или символ
- `description` - описание (опционально)
- `count` - большое число в углу (опционально)

**Особенности**:
- Автоматически перетекают в сетку
- Hover эффект
- Кликабельные

---

### 4. 📋 TABLE - Таблицы со списком данных

Отображение табличных данных.

```typescript
{
  type: 'table',
  title: 'All Nodes',
  columns: ['Title', 'Status', 'Created', 'Completed'],
  items: [
    { 
      title: 'Node 1', 
      status: 'Done', 
      created: '2024-01-01', 
      completed: true 
    },
    { 
      title: 'Node 2', 
      status: 'In Progress', 
      created: '2024-01-02', 
      completed: false 
    }
  ]
}
```

**Параметры**:
- `columns` - названия колонок (используются как ключи для items)
- `items` - массив объектов с данными

---

### 5. 📝 LIST - Простой список элементов

Список с иконками.

```typescript
{
  type: 'list',
  title: 'Available Modules',
  items: [
    { text: 'Path Module', icon: '📁' },
    { text: 'Node Module', icon: '🔹' },
    { text: 'Home Module', icon: '🏠' },
    { text: 'Timeline Module', icon: '📅' }
  ]
}
```

---

### 6. 🔘 BUTTONS - Группа кнопок

Набор кнопок действия.

```typescript
{
  type: 'buttons',
  actions: [
    { label: 'Create Path', command: 'CREATE_PATH', style: 'primary' },
    { label: 'View Stats', command: 'VIEW_STATS', style: 'secondary' },
    { label: 'Delete All', command: 'DELETE_ALL', style: 'danger' }
  ]
}
```

---

## 🎯 Полный пример - Страница Path#

```typescript
import { UIBuilder, UIConfig } from '@path/extensions';

const homePageConfig: UIConfig = {
  title: 'Path# - Track Your Progress',
  subtitle: 'Фиксируй ПРОШЛОЕ, не будущее',
  theme: 'dark',
  sections: [
    // 1. Статистика вверху
    {
      type: 'stats',
      items: [
        { label: 'Paths', value: 12, icon: '📁' },
        { label: 'Nodes', value: 45, icon: '🔹' },
        { label: 'Completed', value: 28, icon: '✅' },
        { label: 'Progress', value: '62%', icon: '📊' }
      ]
    },

    // 2. Форма для создания
    {
      type: 'form',
      title: 'Start New Path',
      fields: [
        {
          name: 'title',
          label: 'What will you do?',
          type: 'text',
          placeholder: 'e.g., Learn TypeScript',
          required: true
        },
        {
          name: 'description',
          label: 'Details (optional)',
          type: 'textarea',
          placeholder: 'More info about this path'
        }
      ],
      actions: [
        { label: '➕ Create', command: 'CREATE_PATH', style: 'primary' }
      ]
    },

    // 3. Список существующих путей
    {
      type: 'cards',
      title: 'Your Paths',
      items: [
        // Динамически генерируется из state
      ]
    },

    // 4. Модули
    {
      type: 'list',
      title: 'Modules',
      items: [
        { text: 'Path Module', icon: '📁' },
        { text: 'Node Module', icon: '🔹' }
      ]
    }
  ]
};

// Рендеринг
const builder = new UIBuilder(homePageConfig);
const html = builder.render();
```

---

## 💡 Как использовать в расширении

```typescript
import { UIBuilder, UIConfig } from '@path/extensions';

export class MyUIExtension {
  id = 'my-ui';
  name = 'My Custom UI';

  async renderUI(props: { state: any; tabs: any[]; commands: string[] }): Promise<string> {
    const { state, tabs, commands } = props;

    // Генерируем конфиг из state
    const config: UIConfig = {
      title: 'My Page',
      sections: [
        {
          type: 'cards',
          items: state.paths.map(p => ({
            title: p.title,
            icon: '📁',
            count: p.nodes.length
          }))
        }
      ]
    };

    // Рендеринг
    const builder = new UIBuilder(config);
    return builder.render();
  }
}
```

---

## 🎨 Стили и темы

### Встроенные цвета

- **Primary**: #4a9eff (синий)
- **Background**: #0f0f0f (чёрный)
- **Card**: #1a1a1a (тёмный серый)
- **Border**: #2a2a2a (серый)
- **Text**: #e0e0e0 (светлый)

### Темы (планируется)

```typescript
const config: UIConfig = {
  title: 'My Page',
  theme: 'dark', // или 'light'
  sections: []
};
```

---

## 📱 Отзывчивость (Responsive Design)

UIBuilder автоматически адаптируется к размеру экрана:

- **Desktop** (> 768px): Полная ширина, несколько колонок
- **Tablet** (< 768px): 2 колонки для грид
- **Mobile** (< 480px): 1 колонка, полная ширина кнопок

Вам ничего не нужно делать - работает из коробки!

---

## 🚀 Как создать свой компонент

Если вам нужен новый тип компонента, добавьте в UIBuilder:

```typescript
// 1. Добавьте тип в UIComponent
export interface UIComponent {
  type: '...' | 'mycomponent';
  // параметры
}

// 2. Добавьте метод рендеринга
private renderMyComponent(component: UIComponent): string {
  return `<div class="my-component">...</div>`;
}

// 3. Добавьте в switch в renderComponent()
case 'mycomponent':
  return this.renderMyComponent(component);
```

---

## 🔄 Взаимодействие с API

Все кнопки и формы автоматически отправляют команды на `/api/command`:

```typescript
// Когда пользователь кликает на кнопку или отправляет форму:
fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',  // команда
    payload: {            // данные из формы
      title: 'My Path'
    }
  })
});
```

Все происходит автоматически - вам просто указать `command` в действии!

---

## ✅ Преимущества UIBuilder

✅ **Без HTML кода** - только JSON конфигурация  
✅ **Типизировано** - TypeScript интерфейсы  
✅ **Отзывчиво** - работает на всех размерах  
✅ **Легко менять** - просто обновите JSON  
✅ **Переиспользуемо** - один компонент для разных данных  
✅ **Декларативно** - видно что на странице  
✅ **Автоматическое взаимодействие** - формы и кнопки работают  

---

## 📚 Больше примеров

### Создание пути с валидацией

```typescript
{
  type: 'form',
  title: 'Create Path',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true
    }
  ],
  actions: [
    { label: 'Create', command: 'CREATE_PATH', style: 'primary' }
  ]
}
```

### Статистика проекта

```typescript
{
  type: 'stats',
  items: [
    { label: 'Files', value: 1234, icon: '📄' },
    { label: 'Folders', value: 45, icon: '📁' },
    { label: 'Size', value: '2.3GB', icon: '💾' }
  ]
}
```

### Таблица результатов

```typescript
{
  type: 'table',
  title: 'Results',
  columns: ['Name', 'Score', 'Date'],
  items: [
    { name: 'Task 1', score: '95', date: '2024-01-01' },
    { name: 'Task 2', score: '87', date: '2024-01-02' }
  ]
}
```

---

**Вопросы?** Посмотрите на реализацию в [plugins/extensions/src/uiBuilder.ts](plugins/extensions/src/uiBuilder.ts)

**Готовы создавать?** Посмотрите как это используется в [plugins/extensions/src/uglyUIExtension.ts](plugins/extensions/src/uglyUIExtension.ts)
