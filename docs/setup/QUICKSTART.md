# 🚀 Quick Start — Path# MVP

**Установите, запустите, тестируйте!**

---

## ⚡ 5 минут до первого запуска

### 1. Установить зависимости (2 мин)

```bash
cd /path/to/PATH#
npm install
```

### 2. Запустить веб-приложение (1 мин)

```bash
cd apps/web
npm run dev
```

### 3. Открыть в браузере (1 мин)

Откройте: **http://localhost:3000**

### 4. Первая команда (1 мин)

На вкладке **Nodes**:
1. Введите название пути: "My First Path"
2. Нажмите "Создать путь"
3. Смотрите Event Log внизу

✅ **Готово!**

---

## 📍 Что где находится

| Что хочу | Куда | Файл |
|---------|------|------|
| Отредактировать Core логику | `engine/core/` | `src/engine.ts` |
| Добавить модуль | `modules/modules/` | `src/newModule.ts` |
| Добавить расширение | `plugins/extensions/` | `src/newExtension.ts` |
| Изменить UI | `apps/web/` | `public/index.html` |
| Добавить API endpoint | `apps/web/` | `src/server.ts` |
| Смотреть примеры | `docs/` | `EXAMPLES.md` |

---

## 🧪 Быстрое тестирование

### Core (без UI)

```bash
cd engine/core
npx ts-node src/demo.ts
```

Выведет в консоль: создание пути, нод, связей, отметить выполненные.

### API через curl

```bash
# Создать путь
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"CREATE_PATH","payload":{"title":"Test"}}'

# Получить состояние
curl http://localhost:3000/api/state
```

### UI в браузере

1. Home вкладка → включить модули
2. Nodes вкладка → создать путь и ноды
3. Year вкладка → отметить выполненными
4. Смотрите Event Log внизу

---

## 📚 Документация

```
README.md            ← Обзор проекта
SETUP.md             ← Подробные инструкции
docs/ARCHITECTURE.md ← Как всё устроено
docs/EXAMPLES.md     ← Примеры кода
docs/API.md          ← Все методы и endpoint'ы
MVP_CHECKLIST.md     ← Что было сделано
PROJECT_SUMMARY.md   ← Финальный обзор
```

**Начните с:** [SETUP.md](./SETUP.md)

---

## ❓ FAQ

### Q: Как создать новый путь?
**A:** Home вкладка → Nodes вкладка → "Создать путь" форма → "Создать путь" кнопка

### Q: Как добавить ноду?
**A:** Nodes вкладка → выбрать путь → "Добавить ноду" форма → "Добавить ноду" кнопка

### Q: Как отметить ноду выполненной?
**A:** Year вкладка → ввести Path ID и Node ID → "Отметить выполненной" кнопка

### Q: Где смотреть события?
**A:** Event Log в конце страницы (автоматически обновляется каждые 2 секунды)

### Q: Как изменить модули?
**A:** Home вкладка → кнопки "Активировать / Деактивировать"

### Q: Как изменить UI?
**A:** Home вкладка → кнопки "Включить / Отключить" расширения

### Q: Где находится код Core?
**A:** `engine/core/src/engine.ts`

### Q: Как добавить новый модуль?
**A:** `modules/modules/src/newModule.ts` → реализовать `IModule` → экспортировать в `index.ts`

### Q: Как добавить новое расширение?
**A:** `plugins/extensions/src/newExtension.ts` → реализовать `IExtension` → экспортировать в `index.ts`

---

## 🔧 Диагностика

### Порт 3000 занят

```bash
# Найти процесс
lsof -i :3000

# Завершить
kill -9 <PID>
```

### npm install не работает

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript ошибки

```bash
npm run build --workspaces
```

Проверит все пакеты на ошибки.

---

## 🎯 Что дальше

1. ✅ Запустите MVP
2. 📚 Читайте [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. 👨‍💻 Измените что-нибудь в коде
4. 🧪 Запустите тесты / демо
5. 🚀 Расширяйте функциональность

---

## 📞 Помощь

- **Архитектура** → [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Примеры кода** → [docs/EXAMPLES.md](./docs/EXAMPLES.md)
- **API документация** → [docs/API.md](./docs/API.md)
- **Подробный гайд** → [SETUP.md](./SETUP.md)
- **Чеклист** → [MVP_CHECKLIST.md](./MVP_CHECKLIST.md)

---

**Статус:** 🚀 MVP Ready  
**Версия:** 0.1.0  
**Язык:** TypeScript  
**Лицензия:** MIT

**Начните прямо сейчас:**
```bash
npm install
cd apps/web && npm run dev
```

Откройте http://localhost:3000 ✨
