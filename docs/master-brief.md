# Path# Master Brief - Краткая справка

Этот документ содержит **ключевые принципы** из Master Brief. Все разработчики должны придерживаться этих правил при создании кода и документации.

---

## 1. ⏰ Path# фиксирует ПРОШЛОЕ, не будущее

### Суть
- Path# = "я иду" (present continuous) или "я прошёл" (past)
- НЕ "я хочу" (future desires) или "я планирую" (future plans)

### Различие с Notion/Todoist
| Path# | Notion | Todoist |
|-------|--------|---------|
| Фиксирует ваш путь **сейчас** | Список задач на будущее | Checklist на будущее |
| "Я уже на этом пути" | "Я хочу выучить Python" | "TODO: Learn Python" |
| Состояние (Present/Past) | Планы (Future) | Планы (Future) |

### Следствие
❌ **НЕ добавляем**:
- Поля для "будущих целей"
- Команды для "возможных операций"
- Модули "на будущее"

✅ **Добавляем только**:
- То, что используется **СЕЙЧАС**
- Когда появится сценарий → добавим в тот момент
- Например: `timeline` в state? Только если есть сценарий, требующий его

---

## 2. 🔲 Модули как ИЗОЛИРОВАННЫЕ СТРАНИЦЫ/ВКЛАДКИ

### Архитектура
- **Только ОДИН модуль активен одновременно**
- Каждый модуль = отдельная страница (PathPage, HomePage, NodePage, YearPage)
- Неактивный модуль:
  - ❌ Не рендерится
  - ❌ Не выполняет вычисления
  - ❌ Не держит состояние в памяти

### Переход между модулями
```
User clicks "Node" tab
    ↓
NodeModule becomes active (UI renders for it)
PathModule becomes inactive (NOT RENDERING, state only in Engine)
```

### НЕ "модульная логика"
❌ **Неправильная модель**: Модули как куски логики, которые работают параллельно
✅ **Правильная модель**: Модули как страницы, только одна активна

---

## 3. 🧠 Core ПОЛНОСТЬЮ ГЕНЕРИЧЕСКИЙ

### Engine НЕ знает
❌ О путях, нодах, годах
❌ О структуре данных
❌ О бизнес-логике
❌ О UI

### Engine только
✅ State machine (хранит `Record<string, any>`)
✅ Command dispatcher (`dispatch(command)`)
✅ Event bus (эмиттит события)
✅ API для модулей (EngineAPI)

### Пример: CREATE_PATH
```
Engine: "Есть команда CREATE_PATH"
        (Engine НЕ знает что это такое, только запускает обработчик)
        
PathModule: "Я знаю как создать путь - добавлю в state.paths"
```

---

## 4. 🎨 UI ДЕКЛАРАТИВНЫЙ (JSON), НЕ ИМПЕРАТИВНЫЙ (HTML)

### Архитектура
```
PathModule.renderUI(state)
    ↓ (returns)
UIDescription { type: 'button', props: {...} }
    ↓
UIRenderer.render(description)
    ↓ (creates)
HTML <button>...</button>
    ↓
Browser
```

### Ключевое правило
❌ **Extension НЕ производит HTML**
❌ **Extension НЕ имеет доступа к DOM**
❌ **Extension НЕ знает о CSS**

✅ **Extension производит JSON description**
✅ **UIRenderer интерпретирует JSON → платформа-зависимый UI**
✅ **Один Extension → множество renderers (Web, Mobile, Desktop)**

### UIDescription интерфейс
```typescript
interface UIDescription {
  type: 'container' | 'button' | 'text' | 'input' | 'grid' | ...;
  children?: UIDescription[];
  props?: Record<string, any>;
  handlers?: { onClick?: string; onSubmit?: string; };
}
```

---

## 5. 📄 .path FILE как АБСТРАКЦИЯ СОСТОЯНИЯ

### Суть
.path файл хранит **PathState**, не реализацию

### Пример
```json
{
  "paths": [
    { "id": "p1", "title": "Learning", "nodes": [...] },
    { "id": "p2", "title": "Work", "nodes": [...] }
  ]
}
```

### Важно
- File format НЕ должен менять на протяжении версий (v0, v1, v10)
- Разные модули могут интерпретировать одну структуру по-разному
- File = абстракция, реализация деталь

---

## 6. ⚠️ КРИТИЧЕСКОЕ ПРАВИЛО: "НЕ ДОБАВЛЯТЬ НА БУДУЩЕЕ"

### Логика
```
Функция нужна в ЖИВОМ СЦЕНАРИИ → Добавляем
Функция НЕ нужна сейчас → НЕ добавляем (хотя бы "может быть полезно")
```

### Почему
- Неиспользуемый код = вредный код
- Техдолг создается мгновенно
- Если не используется → не тестируется → сломается потом
- Когда сценарий появится → добавим и протестируем

### Примеры ✅ / ❌

| Сценарий | Добавлять? | Почему |
|----------|-----------|--------|
| "UPDATE_PATH может понадобиться" | ❌ | Сценария нет |
| "DELETE_PATH может быть удобно" | ❌ | Сценария нет |
| "timeline для будущего" | ❌ | Не нужна сейчас |
| "generic Node helper для всех модулей" | ❌ | Сценария нет, может быть не подойдет |
| "CREATE_PATH нужна сейчас" | ✅ | Сценарий есть |
| "Логирование events для отладки" | ✅ | Сценарий есть |

---

## 7. 🔌 Extensions только через PUBLIC API

### Правило
Extensions **должны** использовать только EngineAPI
Extensions **НЕ должны** иметь доступ к приватным деталям Engine

### Почему
- Engine остается стабильным
- Extensions не ломаются при рефакторинге
- Контракт ясен

---

## 8. 🏗️ Архитектура МИКРОКЕРНЕЛЬ

```
┌─────────────────┐
│   Browser       │
│   (UI Renderer) │
└────────┬────────┘
         │ HTTP API
    ┌────▼──────────────┐
    │  Server (Express) │
    └────────┬──────────┘
             │
    ┌────────▼────────────────────┐
    │  CORE (Engine)              │
    │  - dispatch(command)        │
    │  - getState()               │
    │  - emitEvent()              │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │  Modules (register via API) │
    │  - PathModule               │
    │  - HomeModule               │
    │  - NodeModule               │
    │  - YearModule               │
    └─────────────────────────────┘
```

---

## Часто задаваемые вопросы

### Q: Почему не добавить UPDATE_PATH, DELETE_PATH?
A: Пока нет сценария. Когда пользователь захочет редактировать/удалять пути, тогда добавим.

### Q: Почему модули не могут работать параллельно?
A: Изоляция = простота. Если одна вкладка активна, не нужно синхронизировать состояние между модулями.

### Q: Почему Extension не может вернуть HTML?
A: Потому что мы хотим множественные UI (web, mobile, desktop). JSON description позволяет разным renderers создать нужный UI.

### Q: Как Engine остается генерическим если他 управляет модулями?
A: Engine не знает что модули делают. Модули регистрируют обработчики команд через API, а Engine только их запускает.

### Q: Что если в будущем понадобится база данных?
A: Добавим. Сейчас в памяти достаточно. Когда масштабирование понадобится - протестируем БД и добавим в сценарии её использования.

---

## Переход документации на Master Brief

Все файлы документации были переработаны чтобы:

✅ Убрать "Будущие планы" где нет сценариев
✅ Переписать описание модулей как "вкладки", не "куски логики"
✅ Подчеркнуть JSON/Declarative UI, не HTML
✅ Убрать future state fields (timeline, users, achievements)
✅ Привести все примеры в соответствие с Master Brief

### Отредактированные файлы
- [README.md](README.md)
- [docs/core/ENGINE.md](docs/core/ENGINE.md)
- [docs/core/ENGINE_API.md](docs/core/ENGINE_API.md)
- [docs/modules/MODULES_OVERVIEW.md](docs/modules/MODULES_OVERVIEW.md)
- [docs/modules/PATH_MODULE.md](docs/modules/PATH_MODULE.md)
- [docs/modules/HOME_MODULE.md](docs/modules/HOME_MODULE.md)
- [docs/extensions/EXTENSIONS.md](docs/extensions/EXTENSIONS.md)
- [docs/ui/UI_SYSTEM.md](docs/ui/UI_SYSTEM.md)

---

**Версия**: Master Brief Alignment v1.0
**Последнее обновление**: 2024-01-29
**Автор**: GitHub Copilot (по Master Brief)

---

## Правило №1 Памяти 🧠

Когда стоит вопрос: "Добавить ли функцию?", вспомни:

> **"Функция, которая не участвует в ЖИВОМ СЦЕНАРИИ — вредна"**

Эта цитата из Master Brief - ключ ко всему дизайну Path#.
