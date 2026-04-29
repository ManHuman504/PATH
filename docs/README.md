# Документация Path#

Добро пожаловать! Это полная документация системы Path#.

## 📚 Структура документации

### 📖 Начать отсюда

**⚠️ КРИТИЧЕСКИ ВАЖНО:** Path# про **фиксацию ПРОШЛОГО прогресса**, НЕ про планы:
- Notion = "я хочу / я планирую"  
- Path# = "я уже иду / я прошёл"

1. **[core/ENGINE.md](./core/ENGINE.md)** - Генерическое ядро (не знает про paths, nodes и т.д.)
2. **[core/ENGINE_API.md](./core/ENGINE_API.md)** - Единственный публичный API для модулей
3. **[modules/MODULES_OVERVIEW.md](./modules/MODULES_OVERVIEW.md)** - Модули как изолированные вкладки/страницы
4. **[decisions/ARCHITECTURE_DECISIONS.md](./decisions/ARCHITECTURE_DECISIONS.md)** - Архитектурные решения

### 🎨 UI и расширения

- **[extensions/EXTENSIONS.md](./extensions/EXTENSIONS.md)** - Как писать расширения
- **[ui/UI_SYSTEM.md](./ui/UI_SYSTEM.md)** - Текущий UI система

### 🌐 Сервер

- **[api/SERVER_API.md](./api/SERVER_API.md)** - REST API endpoints

---

## 🚀 Быстрый старт

### Для новых разработчиков

1. **Запустить приложение:**
   ```bash
   npm start
   ```

2. **Открыть в браузере:**
   ```
   http://localhost:3000
   ```

3. **Попробовать создать путь** в UI

4. **Прочитать [core/ENGINE.md](./core/ENGINE.md)** чтобы понять как это работало

### Хочу добавить новый модуль?

1. Прочитать [modules/MODULES_OVERVIEW.md](./modules/MODULES_OVERVIEW.md)
2. Создать файл в `packages/modules/src/`
3. Реализовать интерфейс IModule
4. Добавить в `apps/web/src/server.ts`

### Хочу создать UI расширение?

1. Прочитать [extensions/EXTENSIONS.md](./extensions/EXTENSIONS.md)
2. Создать класс с интерфейсом IExtension
3. Реализовать метод renderUI()
4. Добавить в `apps/web/src/server.ts`

---

## 🏛️ Архитектура Path#

### Микроядро (Microkernel Pattern)

```
┌─────────────────────────────────────┐
│    Браузер (HTML + JavaScript)      │
│  Отображает UI, отправляет команды  │
└──────────────────┬──────────────────┘
                   │ HTTP API
                   ↓
┌─────────────────────────────────────┐
│      Server (Express + Node.js)      │
│  Маршрутизирует запросы, рендерит UI │
└──────────────────┬──────────────────┘
                   │
                   ↓
    ┌──────────────────────────────────┐
    │   Engine (Генерическое ядро)     │
    │                                  │
    │  • dispatch(command) ← Команды   │
    │  • getState() / setState()        │
    │  • emitEvent() / onEvent() ← События
    └──────────────────┬───────────────┘
                       │
    ┌──────────────────────────────────┐
    │     Модули (Бизнес-логика)       │
    │                                  │
    │  • PathModule  ← Работает с путями
    │  • HomeModule  ← Слушает события
    │  • NodeModule  ← Минимальный
    │  • YearModule  ← Минимальный
    └──────────────────────────────────┘
```

### Полный цикл: Создание пути

```
1. Пользователь нажимает кнопку в браузере
2. JavaScript: fetch('/api/command') с { type: 'CREATE_PATH', payload: {...} }
3. Server получает POST запрос
4. Server: engine.dispatch({ type: 'CREATE_PATH', payload: {...} })
5. Engine вызывает обработчик команды в PathModule
6. PathModule: engine.setState({ paths: [...] })
7. PathModule: engine.emitEvent('path.created', {...})
8. HomeModule слушает событие и логирует результат
9. Server возвращает браузеру новое состояние
10. JavaScript: location.reload() обновляет страницу
11. Браузер запрашивает GET /api/ui/render
12. Server: extension.renderUI({ state, tabs, commands })
13. Extension возвращает HTML с новым путем
14. Браузер отображает обновленный UI
```

---

## 📋 Полный список документов

```
docs/
├─ core/
│  ├─ ENGINE.md              ← Как работает ядро
│  └─ ENGINE_API.md          ← Интерфейс для модулей
│
├─ modules/
│  └─ MODULES_OVERVIEW.md    ← Обзор всех модулей
│
├─ extensions/
│  └─ EXTENSIONS.md          ← Как писать расширения
│
├─ ui/
│  └─ UI_SYSTEM.md           ← Текущий UI и стили
│
├─ api/
│  └─ SERVER_API.md          ← REST API endpoints
│
├─ decisions/
│  └─ ARCHITECTURE_DECISIONS.md  ← Архитектурные решения
│
└─ README.md                 ← Этот файл
```

---

## 🎓 Примеры

### Пример: Создать новый путь (фронтенд)

```javascript
const response = await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'CREATE_PATH',
    payload: { title: 'My New Path' }
  })
});

const result = await response.json();
console.log('Path created:', result.state.paths);
```

### Пример: Регистрировать команду (модуль)

```typescript
class PathModule implements IModule {
  async register(api: EngineAPI) {
    api.onCommand('CREATE_PATH', (payload) => {
      const newPath = { 
        id: 'path_' + Math.random().toString(36),
        title: payload.title,
        created: new Date().toISOString()
      };
      
      api.setState({
        paths: [...api.getState().paths, newPath]
      });
      
      api.emitEvent('path.created', { path: newPath });
    });
  }
}
```

### Пример: Слушать события (модуль)

```typescript
class HomeModule implements IModule {
  async register(api: EngineAPI) {
    api.onEvent('path.created', (data) => {
      console.log('[HOME] Новый путь создан:', data.path.title);
    });
  }
}
```

---

## 🔍 Часто задаваемые вопросы

### Q: Почему Engine генерический?

**A:** Чтобы добавлять новые домены (Years, Nodes, Tags) без изменения ядра. Ядро остается чистым, все специфичное для домена в модулях.

Смотреть [decisions/ARCHITECTURE_DECISIONS.md](./decisions/ARCHITECTURE_DECISIONS.md#adr-001-microkernel-архитектура)

### Q: Как добавить новую команду (DELETE_PATH)?

**A:** 
1. Добавить обработчик в PathModule: `api.onCommand('DELETE_PATH', handler)`
2. Реализовать handler функцию (удалить из state)
3. Опционально: испустить событие `api.emitEvent('path.deleted', {...})`
4. Server автоматически узнает о новой команде
5. UI отправит команду через `/api/command`

### Q: Почему нет БД сейчас?

**A:** Это MVP (минимально жизнеспособный продукт). Состояние в памяти просто реализовать и быстро работает. После добавим persistence (файлы или БД).

Смотреть [decisions/ARCHITECTURE_DECISIONS.md](./decisions/ARCHITECTURE_DECISIONS.md#adr-005-состояние-в-памяти-в-данный-момент)

### Q: Как тестировать модули?

**A:** Смотреть [modules/MODULES_OVERVIEW.md](./modules/MODULES_OVERVIEW.md#тестирование)

### Q: Как отладить проблему?

**A:** 
1. Открыть браузер DevTools (F12)
2. Смотреть **Console** для ошибок JavaScript
3. Смотреть **Network** для проблем с API
4. Смотреть Server logs в терминале для Backend ошибок

---

## 📝 Принципы документирования

Эта документация следует правилам:

1. **Документация - источник истины** - Если код не соответствует документации, нужно исправить код
2. **Объяснение > Описание** - Объясняем ВЫ архитектуру, а не просто переписываем код
3. **Примеры для всего** - Каждый концепт должен иметь практический пример
4. **DO/DO NOT правила** - Явно говорим что можно и что нельзя делать
5. **Альтернативы и трейд-оффы** - Объясняем почему выбран данный подход

---

## 🚀 Следующие шаги в разработке

**✅ Реализовано:**
- Engine (генерический state machine)
- PathModule (создание путей)
- HomeModule (слушание событий)
- HTTP API (браузер-сервер коммуникация)
- UglyUIExtension (простой dark-mode UI)
- Полная документация

**⏭️ Следующие приоритеты:**
1. DELETE_PATH, UPDATE_PATH команды
2. Расширить UI (детали пути, редактирование)
3. NodeModule функциональность
4. YearModule функциональность
5. Persistence (сохранение в файл или БД)

**🎯 Долгосрочно:**
1. Тестовая suite (unit, integration tests)
2. WebSocket для real-time обновлений
3. Аутентификация и авторизация
4. Кросс-платформенное приложение (Electron, Native)
5. Marketplace для расширений

---

**Версия документации:** 2.0  
**Последнее обновление:** 2024-01-28  
**Состояние:** MVP ✅
