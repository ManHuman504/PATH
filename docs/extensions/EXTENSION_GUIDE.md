# 📘 Полное руководство по созданию Extensions

## Концепция

**Extension** - это модульный компонент, который:
- Не имеет доступа к DOM и HTML
- Описывает UI через **JSON конфигурацию**
- Взаимодействует с Core только через HTTP API
- Может быть включено/отключено в runtime

```
┌─────────────────┐
│  Core Engine    │ ← Состояние, события, команды
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ Extension               │
│ - Знает про: state      │
│ - Не знает про: DOM     │
│ Возвращает: JSON config │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ UIBuilder               │
│ JSON → HTML + CSS + JS  │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Browser                 │
│ Отображает интерфейс    │
└─────────────────────────┘
```

---

## Интерфейс Extension

### Основная функция: `buildUIConfig()`

```typescript
export interface IUIExtension {
  /**
   * Уникальный ID расширения
   */
  id: string;

  /**
   * Название для пользователя
   */
  name: string;

  /**
   * Построить конфигурацию UI на основе состояния
   * @param props - Данные от Core
   * @returns JSON конфигурация для UIBuilder
   */
  buildUIConfig(props: {
    state: any;                         // Состояние приложения
    tabs: Array<{id: string; title: string; icon?: string}>;  // Вкладки модулей
    commands: string[];                 // Доступные команды
  }): Promise<UIConfig>;
}
```

### Что возвращает: UIConfig

```typescript
interface UIConfig {
  title: string;              // Заголовок страницы
  subtitle?: string;          // Подзаголовок
  sections: UISection[];      // Разделы со компонентами
}

interface UISection {
  type: 'stats' | 'form' | 'cards' | 'table' | 'list' | 'buttons';
  title?: string;             // Заголовок раздела
  items?: any[];              // Данные для компонента
  fields?: UIField[];         // Для form
  columns?: string[];         // Для table
  actions?: UIAction[];       // Кнопки действий
}
```

---

## Пример 1: Простое расширение

Самый базовый пример - расширение которое просто показывает статистику:

```typescript
// myExtension.ts
import { IUIExtension, UIConfig } from '@path/extensions';

export class MyExtension implements IUIExtension {
  id = 'my-extension';
  name = 'My Custom UI';

  async buildUIConfig(props) {
    const { state } = props;

    // Просто возвращаем JSON конфигурацию!
    const config: UIConfig = {
      title: 'My App',
      subtitle: 'Custom interface',
      sections: [
        {
          type: 'stats',
          items: [
            { label: 'Paths', value: state.paths.length, icon: '📁' },
            { label: 'Nodes', value: state.nodes.length, icon: '📝' },
            { label: 'Done', value: state.completed, icon: '✅' }
          ]
        }
      ]
    };

    return config;
  }
}
```

**Это всё!** Никакого HTML, никакого CSS, никакого JavaScript.

---

## Пример 2: С формой для создания

```typescript
export class CreateExtension implements IUIExtension {
  id = 'create-extension';
  name = 'Create Form UI';

  async buildUIConfig(props) {
    const { state } = props;

    return {
      title: 'Create New Path',
      sections: [
        {
          type: 'form',
          title: 'New Path',
          fields: [
            {
              name: 'title',
              label: 'Path Name',
              type: 'text',
              placeholder: 'Enter path name',
              required: true
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'What is this path about?'
            }
          ],
          actions: [
            {
              label: 'Create',
              command: 'CREATE_PATH',  // ← Команда для отправки
              style: 'primary'
            }
          ]
        },
        {
          type: 'cards',
          title: 'Existing Paths',
          items: state.paths.map(p => ({
            title: p.title,
            icon: '📁',
            count: p.nodes.length
          }))
        }
      ]
    };
  }
}
```

---

## Пример 3: Многовкладочный интерфейс

```typescript
export class TabbedExtension implements IUIExtension {
  id = 'tabbed-extension';
  name = 'Tabbed Interface';

  async buildUIConfig(props) {
    const { state, tabs } = props;

    // Динамически создаём вкладки на основе модулей
    const sections = tabs.map(tab => {
      if (tab.id === 'home') {
        return {
          type: 'stats',
          title: 'Home Stats',
          items: [
            { label: 'Total Paths', value: state.home.totalPaths, icon: '📊' }
          ]
        };
      } else if (tab.id === 'path') {
        return {
          type: 'cards',
          title: 'All Paths',
          items: state.paths.map(p => ({
            title: p.title,
            icon: '📁'
          }))
        };
      }
      return null;
    }).filter(Boolean);

    return {
      title: 'Path# Pro',
      sections
    };
  }
}
```

---

## Пример 4: Интерактивная таблица

```typescript
export class DataExtension implements IUIExtension {
  id = 'data-extension';
  name = 'Data View';

  async buildUIConfig(props) {
    const { state } = props;

    return {
      title: 'Data Management',
      sections: [
        {
          type: 'table',
          title: 'All Items',
          columns: ['Name', 'Type', 'Status', 'Created'],
          items: state.nodes.map(node => ({
            name: node.title,
            type: 'Task',
            status: node.completed ? '✅ Done' : '⏳ Active',
            created: new Date(node.createdAt).toLocaleDateString()
          }))
        },
        {
          type: 'buttons',
          actions: [
            { label: 'Refresh', command: 'REFRESH', style: 'secondary' },
            { label: 'Export', command: 'EXPORT', style: 'primary' },
            { label: 'Delete All', command: 'DELETE_ALL', style: 'danger' }
          ]
        }
      ]
    };
  }
}
```

---

## Пример 5: Extension с динамической логикой

```typescript
export class SmartExtension implements IUIExtension {
  id = 'smart-extension';
  name = 'Smart Dashboard';

  async buildUIConfig(props) {
    const { state, commands } = props;

    // Логика: показываем разные UI в зависимости от состояния
    const isEmpty = state.paths.length === 0;

    if (isEmpty) {
      // Пустое состояние - показываем приветствие
      return {
        title: 'Welcome!',
        subtitle: 'Create your first path',
        sections: [
          {
            type: 'form',
            title: 'Get Started',
            fields: [
              {
                name: 'title',
                label: 'Path Name',
                type: 'text',
                required: true
              }
            ],
            actions: [
              { label: 'Create First Path', command: 'CREATE_PATH', style: 'primary' }
            ]
          }
        ]
      };
    } else {
      // Есть данные - показываем полный интерфейс
      const totalDone = state.paths.reduce((sum, p) => 
        sum + p.nodes.filter(n => n.completed).length, 0
      );

      return {
        title: 'Dashboard',
        sections: [
          {
            type: 'stats',
            items: [
              { label: 'Total Paths', value: state.paths.length, icon: '📊' },
              { label: 'Total Tasks', value: state.nodes.length, icon: '📝' },
              { label: 'Completed', value: totalDone, icon: '✅' }
            ]
          },
          {
            type: 'cards',
            title: 'Your Paths',
            items: state.paths.map(p => ({
              title: p.title,
              icon: '📁',
              count: p.nodes.length
            }))
          }
        ]
      };
    }
  }
}
```

---

## Тестирование вашего Extension

### 1. В коде (TypeScript)

```typescript
const ext = new MyExtension();
const config = await ext.buildUIConfig({
  state: { paths: [], nodes: [] },
  tabs: [{ id: 'home', title: 'Home' }],
  commands: ['CREATE_PATH', 'DELETE_PATH']
});

console.log(JSON.stringify(config, null, 2));
// ↓ Должен быть валидный JSON
```

### 2. На сервере

```bash
# 1. Импортируйте ваше расширение в extensionManager.ts
import { MyExtension } from './myExtension';

# 2. Зарегистрируйте его
const ext = new MyExtension();
this.registerExtension(ext);

# 3. Установите активным
this.setActiveExtension(ext.id);

# 4. Запустите сервер
npm run dev

# 5. Откройте браузер
# http://localhost:3000
```

### 3. Проверяйте JSON endpoint

```bash
# Получите JSON конфигурацию вашего расширения
curl http://localhost:3000/api/ui/config

# Должны увидеть ваш JSON конфиг
```

---

## Типичные компоненты

### STATS - Показать метрики

```typescript
{
  type: 'stats',
  items: [
    { label: 'Total', value: 42, icon: '📊' },
    { label: 'Active', value: 28, icon: '🟢' },
    { label: 'Done', value: 14, icon: '✅' }
  ]
}
```

### FORM - Ввод данных

```typescript
{
  type: 'form',
  title: 'Create Something',
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'desc', label: 'Description', type: 'textarea' },
    { name: 'type', label: 'Type', type: 'select', 
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    }
  ],
  actions: [
    { label: 'Save', command: 'SAVE', style: 'primary' },
    { label: 'Cancel', command: 'CANCEL', style: 'secondary' }
  ]
}
```

### CARDS - Сетка элементов

```typescript
{
  type: 'cards',
  title: 'Items',
  items: [
    { title: 'Item 1', icon: '📁', count: 5 },
    { title: 'Item 2', icon: '📁', count: 3 }
  ]
}
```

### TABLE - Таблица данных

```typescript
{
  type: 'table',
  title: 'Data',
  columns: ['Name', 'Value', 'Status'],
  items: [
    { name: 'A', value: 100, status: 'OK' },
    { name: 'B', value: 200, status: 'ERROR' }
  ]
}
```

### LIST - Простой список

```typescript
{
  type: 'list',
  title: 'Features',
  items: [
    { text: 'Feature 1', icon: '✅' },
    { text: 'Feature 2', icon: '✅' }
  ]
}
```

### BUTTONS - Группа кнопок

```typescript
{
  type: 'buttons',
  actions: [
    { label: 'Save', command: 'SAVE', style: 'primary' },
    { label: 'Delete', command: 'DELETE', style: 'danger' }
  ]
}
```

---

## Команды и действия

Когда пользователь нажимает кнопку в UI, отправляется команда на сервер:

```
Браузер → POST /api/command → Server → Engine → Command Handler
```

Ваше расширение описывает какие команды доступны, но **не обрабатывает их**.

Обработку команд делают **Modules** через EventBus.

```typescript
// В вашем расширении
actions: [
  { label: 'Create', command: 'CREATE_PATH', style: 'primary' }
]

// На сервере
// POST /api/command
// { "type": "CREATE_PATH", "payload": { "title": "My Path" } }

// В PathModule
api.addCommandHandler('CREATE_PATH', async (payload) => {
  // Обработка команды
  api.getEventBus().emit('path.created', { ... });
});
```

---

## Ошибки и отладка

### Проблема: JSON не валидный

```typescript
// ❌ НЕПРАВИЛЬНО - возвращает undefined
const config = {
  title: 'Test',
  sections: [
    {
      type: 'form',
      fields: [
        { name: undefined, label: 'Name' }  // ← undefined!
      ]
    }
  ]
};

// ✅ ПРАВИЛЬНО - проверяем значения
const fields = state.items?.map(item => ({
  name: item.id || 'default',
  label: item.name || 'Untitled'
})) || [];
```

### Проблема: Команда не отправляется

Проверьте что:
1. ✅ `command` полe совпадает с зарегистрированной командой
2. ✅ Модуль подписан на эту команду через `api.addCommandHandler()`
3. ✅ Смотрите console браузера (F12) ошибки

### Отладка

```bash
# 1. Смотрите JSON конфигурацию
curl http://localhost:3000/api/ui/config | jq

# 2. Смотрите логи сервера
npm run dev
# ← Там будут ошибки при рендере

# 3. Смотрите console браузера
# F12 → Console
```

---

## Лучшие практики

✅ **ДА:**
- Возвращайте JSON конфигурацию
- Используйте `state` для данных
- Динамически генерируйте UI на основе состояния
- Проверяйте что данные существуют (null-safety)
- Используйте иконки эмодзи для красоты

❌ **НЕТ:**
- Не пишите HTML
- Не пишите CSS
- Не используйте прямой доступ к DOM
- Не создавайте массивы с undefined
- Не забывайте про null checks

---

## Чек-лист для новых Extensions

- [ ] Класс имплементирует `IUIExtension`
- [ ] Есть уникальный `id`
- [ ] Есть понятное `name`
- [ ] Метод `buildUIConfig()` возвращает `UIConfig`
- [ ] JSON конфигурация валидна
- [ ] Все поля в items имеют значения (не undefined)
- [ ] Правильно используется `state`
- [ ] Все команды зарегистрированы в модулях
- [ ] Протестировано в браузере
- [ ] Нет ошибок в console браузера

---

## Примеры из репозитория

- **UglyUIExtension** - `plugins/extensions/src/uglyUIExtension.ts`
- **UIBuilder** - `plugins/extensions/src/uiBuilder.ts`
- **Типы** - `plugins/extensions/src/interfaces.ts`

Все примеры выше работают с текущей системой!
