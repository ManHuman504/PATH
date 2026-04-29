# 🎨 UIBuilder - Шпаргалка по быстрому созданию интерфейсов

Скопируйте и адаптируйте эти примеры под себя!

---

## ⚡ Самая простая страница

```typescript
import { UIBuilder } from '@path/extensions';

const config = {
  title: 'My App',
  sections: [
    {
      type: 'form',
      title: 'Create Something',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          placeholder: 'Enter name',
          required: true
        }
      ],
      actions: [
        { label: 'Create', command: 'CREATE_ITEM', style: 'primary' }
      ]
    }
  ]
};

const html = new UIBuilder(config).render();
```

---

## 📊 Страница со статистикой

```typescript
const config = {
  title: 'Dashboard',
  sections: [
    {
      type: 'stats',
      items: [
        { label: 'Total', value: 42, icon: '📊' },
        { label: 'Active', value: 28, icon: '🟢' },
        { label: 'Done', value: 14, icon: '✅' }
      ]
    }
  ]
};
```

---

## 🎴 Страница с карточками

```typescript
const config = {
  title: 'Items',
  sections: [
    {
      type: 'cards',
      title: 'All Items',
      items: [
        { title: 'Item 1', icon: '📁', count: 5 },
        { title: 'Item 2', icon: '📁', count: 3 },
        { title: 'Item 3', icon: '📁', count: 8 }
      ]
    }
  ]
};
```

---

## 📋 Страница с таблицей

```typescript
const config = {
  title: 'Report',
  sections: [
    {
      type: 'table',
      title: 'Data',
      columns: ['Name', 'Value', 'Status'],
      items: [
        { name: 'A', value: 100, status: 'OK' },
        { name: 'B', value: 200, status: 'OK' }
      ]
    }
  ]
};
```

---

## 🔘 Страница с кнопками

```typescript
const config = {
  title: 'Actions',
  sections: [
    {
      type: 'buttons',
      actions: [
        { label: 'Save', command: 'SAVE', style: 'primary' },
        { label: 'Cancel', command: 'CANCEL', style: 'secondary' },
        { label: 'Delete', command: 'DELETE', style: 'danger' }
      ]
    }
  ]
};
```

---

## 📝 Полная форма

```typescript
const config = {
  title: 'Settings',
  sections: [
    {
      type: 'form',
      title: 'Edit Profile',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text', placeholder: 'your@email.com' },
        { name: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell about yourself' },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' }
          ]
        }
      ],
      actions: [
        { label: 'Save', command: 'UPDATE_PROFILE', style: 'primary' },
        { label: 'Reset', command: 'RESET_FORM', style: 'secondary' }
      ]
    }
  ]
};
```

---

## 📚 Комбинированная страница

```typescript
const config = {
  title: 'Complete Page',
  subtitle: 'With everything',
  sections: [
    // Статистика
    {
      type: 'stats',
      items: [
        { label: 'Total', value: 42, icon: '📊' },
        { label: 'Done', value: 28, icon: '✅' }
      ]
    },

    // Форма создания
    {
      type: 'form',
      title: 'Create New',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true }
      ],
      actions: [
        { label: 'Create', command: 'CREATE', style: 'primary' }
      ]
    },

    // Список элементов
    {
      type: 'cards',
      title: 'Items',
      items: [
        { title: 'Item 1', icon: '📁' },
        { title: 'Item 2', icon: '📁' }
      ]
    },

    // Дополнительная информация
    {
      type: 'list',
      title: 'Info',
      items: [
        { text: 'Feature 1', icon: '✅' },
        { text: 'Feature 2', icon: '✅' }
      ]
    }
  ]
};
```

---

## 💡 Динамическая конфигурация из состояния

```typescript
function buildUI(state: any) {
  return {
    title: 'Dynamic Page',
    sections: [
      {
        type: 'stats',
        items: [
          { label: 'Items', value: state.items.length, icon: '📊' }
        ]
      },
      {
        type: 'cards',
        items: state.items.map(item => ({
          title: item.name,
          icon: '📁',
          count: item.count
        }))
      }
    ]
  };
}
```

---

## 🎯 В расширении

```typescript
import { UIBuilder, UIConfig } from '@path/extensions';

export class MyExtension {
  async renderUI(props: { state: any }) {
    const config: UIConfig = {
      title: 'My UI',
      sections: [
        {
          type: 'form',
          fields: [
            { name: 'input', label: 'Input', type: 'text' }
          ],
          actions: [
            { label: 'Go', command: 'MY_COMMAND', style: 'primary' }
          ]
        }
      ]
    };

    return new UIBuilder(config).render();
  }
}
```

---

## 🎨 Правила маркирования

- **Иконки**: используйте эмодзи (📁, 🔹, ✅, 📊, 📝)
- **Цвета**: автоматически из темы (синий, серый, красный)
- **Размеры**: автоматически адаптируются
- **Отзывчивость**: работает на всех размерах

---

## 🚀 Быстрое редактирование

1. Скопируйте нужный пример
2. Измените названия и команды
3. Готово! Интерфейс создан без HTML/CSS

Никаких строк HTML кода!
