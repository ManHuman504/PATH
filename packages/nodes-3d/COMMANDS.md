# 🚀 PathEngine 3D - Команды быстрого запуска

## Установка и сборка

```powershell
# Перейдите в папку модуля
cd "c:\Users\feeloowe\Documents\PATH# backups\last stable\5\PATH#\packages\nodes-3d"

# ВАРИАНТ 1: Автоматическая установка (рекомендуется)
.\setup.ps1

# ВАРИАНТ 2: Ручная установка
npm install
npm run build
```

## Запуск демо

```powershell
# Запустите локальный сервер
npx serve .

# Откройте в браузере:
# http://localhost:3000/demo.html
```

## Альтернативные способы запуска

### Python HTTP Server
```powershell
python -m http.server 8080
# http://localhost:8080/demo.html
```

### VS Code Live Server
1. Установите расширение "Live Server"
2. Откройте demo.html
3. Нажмите "Go Live"

## Разработка

```powershell
# Watch mode (автоматическая перекомпиляция)
npm run dev

# Ручная сборка
npm run build

# Проверка типов
npx tsc --noEmit
```

## Быстрая проверка

```powershell
# Проверить структуру
Get-ChildItem src -Recurse -Include *.ts

# Проверить dist после сборки
Get-ChildItem dist

# Проверить зависимости
npm list three
```

## Интеграция в проект

```typescript
// В вашем main.ts или index.ts
import { initPathEngine } from '@path/nodes-3d';

// Инициализация
const container = document.getElementById('viewport');
const engine = initPathEngine(container);

// Создание ноды
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>My Node</div>'
});
```

## Полезные команды

```powershell
# Очистка node_modules и переустановка
Remove-Item -Recurse -Force node_modules
npm install

# Очистка dist и пересборка
Remove-Item -Recurse -Force dist
npm run build

# Обновление зависимостей
npm update

# Проверка устаревших пакетов
npm outdated
```

## Документация

| Команда | Файл |
|---------|------|
| Обзор проекта | `code PROJECT_OVERVIEW.md` |
| Быстрый старт | `code QUICKSTART.md` |
| API справка | `code API.md` |
| Примеры | `code examples.ts` |
| Чеклист | `code CHECKLIST.md` |

## Troubleshooting

### Ошибка: "Cannot find module 'three'"
```powershell
npm install
```

### Ошибка компиляции TypeScript
```powershell
Remove-Item -Recurse -Force dist
npm run build
```

### CORS ошибка при открытии HTML
```powershell
# НЕ открывайте файл напрямую!
# Используйте локальный сервер:
npx serve .
```

### Модуль не работает
```powershell
# 1. Проверьте консоль браузера (F12)
# 2. Убедитесь что сборка прошла успешно
# 3. Проверьте что файлы dist/ созданы
Get-ChildItem dist
```

---

## 🎯 Готово к использованию!

После выполнения команд выше у вас будет:
- ✅ Установленные зависимости
- ✅ Скомпилированный модуль в dist/
- ✅ Работающее демо
- ✅ Готовность к разработке

Следующий шаг: Откройте `demo.html` и протестируйте систему!
