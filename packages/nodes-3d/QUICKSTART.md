# 🚀 Быстрый старт - PathEngine 3D

## Шаг 1: Установка зависимостей

```powershell
cd "c:\Users\feeloowe\Documents\PATH# backups\last stable\5\PATH#\packages\nodes-3d"
npm install
```

## Шаг 2: Сборка модуля

```powershell
npm run build
```

После сборки в папке `dist/` появятся скомпилированные файлы:
- `index.js` - основной модуль
- `index.d.ts` - TypeScript типы
- Все остальные скомпилированные файлы

## Шаг 3: Тестирование

### Вариант A: Простой локальный сервер (Python)

```powershell
# Из папки nodes-3d
python -m http.server 8080
```

Откройте: http://localhost:8080/demo.html

### Вариант B: Live Server (VS Code)

1. Установите расширение "Live Server" в VS Code
2. Откройте файл `demo.html`
3. Нажмите "Go Live" в статус-баре

### Вариант C: Node.js сервер

```powershell
npx serve .
```

## Шаг 4: Интеграция в основное приложение

После успешного тестирования, интегрируйте в основное приложение:

```typescript
// В вашем основном приложении
import { initPathEngine } from '@path/nodes-3d';

const container = document.getElementById('viewport');
const engine = initPathEngine(container, {
  background: 0x0a0a0f,
  callbacks: {
    onNodeClick: (node) => {
      console.log('Node clicked:', node);
    },
    onNodeDrag: (node, position) => {
      console.log('Node dragged to:', position);
    }
  }
});

// Создание нод
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>My Node</div>'
});
```

## Команды разработки

```powershell
# Сборка проекта
npm run build

# Разработка с watch mode
npm run dev

# Очистка (если нужно пересобрать)
Remove-Item -Recurse -Force dist
npm run build
```

## Структура созданных файлов

```
packages/nodes-3d/
├── src/
│   ├── index.ts              ✅ Entry point
│   ├── PathViewport.ts       ✅ Главный viewport
│   ├── PathNode.ts           ✅ Класс ноды
│   ├── InteractionSystem.ts  ✅ Интерактивность
│   └── shaders/
│       └── gridShader.ts     ✅ Шейдеры фона
├── dist/                     📦 После сборки
├── demo.html                 🎮 Демо-страница
├── package.json              ⚙️ Конфигурация
├── tsconfig.json             ⚙️ TypeScript настройки
├── README.md                 📖 Документация
├── DEVELOPMENT.md            📚 Руководство разработчика
└── QUICKSTART.md             🚀 Этот файл
```

## Возможные проблемы

### Ошибка: Cannot find module 'three'

**Решение**: Убедитесь, что зависимости установлены:
```powershell
npm install
```

### Ошибка: CORS при открытии demo.html

**Решение**: Используйте локальный сервер (см. Шаг 3), не открывайте файл напрямую через `file://`

### TypeScript ошибки компиляции

**Решение**: Проверьте версию TypeScript:
```powershell
npx tsc --version  # должно быть >= 5.3
```

### Модуль не работает в браузере

**Решение**: 
1. Проверьте консоль браузера (F12)
2. Убедитесь, что сборка прошла успешно
3. Проверьте, что three.js загружен

## Примеры использования

### Создание нескольких нод

```typescript
// Создаем 5 нод в случайных позициях
for (let i = 0; i < 5; i++) {
  engine.createNode({
    position: {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: 0
    },
    html: `<div style="padding: 12px;">
      <h3>Node ${i + 1}</h3>
      <p>Random node</p>
    </div>`,
    color: Math.random() * 0xffffff
  });
}
```

### Динамическое обновление контента

```typescript
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div id="dynamic">Loading...</div>'
});

// Обновление через 2 секунды
setTimeout(() => {
  node.setHTML('<div>Updated!</div>');
}, 2000);
```

### Подписка на события

```typescript
const engine = initPathEngine(container, {
  callbacks: {
    onNodeDragEnd: (node) => {
      const pos = node.getPosition();
      console.log(`Node moved to: x=${pos.x}, y=${pos.y}`);
      
      // Сохранение позиции
      saveNodePosition(node, pos);
    }
  }
});
```

## Следующие шаги

1. ✅ Протестировать базовую функциональность
2. ⭐ Добавить систему коннекторов между нодами
3. ⭐ Реализовать сохранение/загрузку сцены
4. ⭐ Интегрировать с основной системой PATH

## Поддержка

При возникновении проблем:
1. Проверьте консоль браузера
2. Убедитесь, что все зависимости установлены
3. Проверьте версии Three.js и TypeScript
4. Смотрите примеры в [DEVELOPMENT.md](DEVELOPMENT.md)

---

**Готово к использованию!** 🎉

Модуль полностью независимый и изолированный от старой системы нод.
