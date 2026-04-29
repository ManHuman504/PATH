# 🎨 PathEngine 3D - Независимая система 3D-нод

> Современная система графических нод на базе Three.js с гибридным рендерингом (WebGL + HTML)

## 📋 Что было создано

Полностью независимый модуль для работы с 3D-нодами, который:
- ✅ Не зависит от старой системы нод
- ✅ Использует современный стек (Three.js + TypeScript)
- ✅ Поддерживает гибридный рендеринг (3D меши + HTML контент)
- ✅ Имеет полную систему интерактивности
- ✅ Готов к интеграции в основное приложение

---

## 🚀 Быстрый старт

### 1. Установка и сборка

```powershell
# Перейдите в папку модуля
cd "packages\nodes-3d"

# Запустите автоматическую установку (Windows)
.\setup.ps1

# Или вручную:
npm install
npm run build
```

### 2. Запуск демо

```powershell
# Запустите локальный сервер
npx serve .

# Откройте в браузере
# http://localhost:3000/demo.html
```

### 3. Использование в коде

```typescript
import { initPathEngine } from '@path/nodes-3d';

const engine = initPathEngine(
  document.getElementById('viewport'),
  {
    callbacks: {
      onNodeClick: (node) => console.log('Clicked:', node)
    }
  }
);

// Создаём ноду
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>My Node</div>'
});
```

---

## 📁 Структура модуля

```
packages/nodes-3d/
├── 📂 src/                      Исходный код
│   ├── index.ts                Entry point
│   ├── PathViewport.ts         Главный viewport
│   ├── PathNode.ts             Класс ноды
│   ├── InteractionSystem.ts    Интерактивность
│   └── shaders/
│       └── gridShader.ts       Шейдеры фона
│
├── 📂 dist/                    Скомпилированные файлы (после сборки)
│
├── 📄 package.json             Конфигурация и зависимости
├── 📄 tsconfig.json            Настройки TypeScript
│
├── 📖 README.md                Основная документация
├── 📖 QUICKSTART.md            Быстрый старт
├── 📖 DEVELOPMENT.md           Руководство разработчика
├── 📖 API.md                   Справка по API
├── 📖 CHANGELOG.md             История изменений
├── 📖 CHECKLIST.md             Чеклист проверки
│
├── 🎮 demo.html                Демо-страница
├── 💻 examples.ts              Примеры использования
│
├── ⚙️ setup.ps1               Скрипт установки (Windows)
├── ⚙️ setup.sh                Скрипт установки (Linux/Mac)
└── 🚫 .gitignore              Игнорируемые файлы
```

---

## ✨ Реализованные функции

### 🎯 Core Engine
- ✅ PathViewport с Three.js интеграцией
- ✅ WebGL рендерер для 3D-графики
- ✅ CSS2D рендерер для HTML-слоя
- ✅ Единый цикл анимации с delta time
- ✅ Автоматическая адаптация размеров

### 🌌 Бесконечный фон
- ✅ Процедурная генерация через шейдеры
- ✅ Точечная сетка + линии
- ✅ Реакция на позицию камеры
- ✅ Интерактивность с курсором
- ✅ Плавная анимация

### 🎮 Управление
- ✅ OrbitControls (pan + zoom)
- ✅ Damping для плавности
- ✅ Ограничения зума
- ✅ Отключено вращение

### 📦 Система нод
- ✅ Гибридный рендеринг (3D + HTML)
- ✅ Трансформации (position, rotation, scale)
- ✅ Кастомный HTML-контент
- ✅ Изменение цвета и видимости
- ✅ Правильное управление памятью

### 🖱️ Интерактивность
- ✅ Raycasting для детекции
- ✅ Hover эффекты
- ✅ Click события
- ✅ Drag & Drop в 3D
- ✅ Callback система

---

## 📚 Документация

| Документ | Описание |
|----------|----------|
| [README.md](README.md) | Обзор и основная информация |
| [QUICKSTART.md](QUICKSTART.md) | Инструкции по быстрому старту |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Полное руководство разработчика |
| [API.md](API.md) | Справка по API и типам |
| [CHANGELOG.md](CHANGELOG.md) | История изменений и roadmap |
| [CHECKLIST.md](CHECKLIST.md) | Чеклист проверки готовности |
| [examples.ts](examples.ts) | Примеры кода |

---

## 🔧 Команды

```powershell
# Установка зависимостей
npm install

# Сборка модуля
npm run build

# Режим разработки (watch)
npm run dev

# Запуск демо
npx serve .
# Откройте http://localhost:3000/demo.html
```

---

## 🎯 Основные компоненты

### PathViewport
Главный класс управления viewport. Интегрирует Three.js сцену, рендереры, контролы и систему интерактивности.

**Ключевые методы:**
- `createNode()` - создание нод
- `removeNode()` - удаление нод
- `getNodes()` - получение всех нод
- `focusOnNode()` - центрирование камеры
- `dispose()` - очистка ресурсов

### PathNode
Класс интерактивной ноды с гибридным рендерингом: 3D-меш для корпуса + HTML-контент через CSS2DObject.

**Ключевые методы:**
- `setTransform()` - изменение позиции/вращения/масштаба
- `setHTML()` - обновление HTML-контента
- `setColor()` - изменение цвета корпуса
- `setVisible()` - показать/скрыть
- `getPosition()` - получить позицию

### InteractionSystem
Система обработки интерактивности: raycasting, hover, click, drag & drop.

**События:**
- `onNodeHover` - наведение на ноду
- `onNodeClick` - клик на ноду
- `onNodeDragStart/Drag/End` - перетаскивание

---

## 💡 Примеры использования

### Базовая инициализация

```typescript
import { initPathEngine } from '@path/nodes-3d';

const engine = initPathEngine(
  document.getElementById('viewport')
);
```

### Создание нод

```typescript
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: `
    <div style="padding: 16px;">
      <h3>My Node</h3>
      <p>Custom HTML content</p>
    </div>
  `,
  width: 250,
  height: 120,
  color: 0x2196F3
});
```

### Обработка событий

```typescript
const engine = initPathEngine(container, {
  callbacks: {
    onNodeClick: (node) => {
      console.log('Clicked:', node);
      engine.focusOnNode(node, true);
    },
    
    onNodeDragEnd: (node) => {
      const pos = node.getPosition();
      console.log('New position:', pos);
    }
  }
});
```

---

## 🛠️ Технический стек

- **Three.js** r160 - 3D-графика и рендеринг
- **TypeScript** 5.3+ - Строгая типизация
- **WebGL 2.0** - Аппаратное ускорение
- **CSS3** - Стилизация HTML-слоя

---

## 🔄 Следующие шаги

### Для тестирования
1. Запустите `.\setup.ps1` (или `npm install && npm run build`)
2. Откройте demo.html через локальный сервер
3. Протестируйте создание нод, drag & drop, hover эффекты
4. Изучите примеры в [examples.ts](examples.ts)

### Для интеграции
1. Импортируйте модуль в основное приложение
2. Инициализируйте viewport в нужном контейнере
3. Создайте ноды с кастомным контентом
4. Подключите обработчики событий

### Для разработки
1. Изучите [DEVELOPMENT.md](DEVELOPMENT.md)
2. Ознакомьтесь с архитектурой в [API.md](API.md)
3. Используйте `npm run dev` для watch mode
4. Следуйте паттернам из [examples.ts](examples.ts)

---

## 📋 Roadmap

### v1.1 - Коннекторы
- [ ] Система связей между нодами
- [ ] Визуализация связей
- [ ] Интерактивное создание связей

### v1.2 - Расширенная функциональность
- [ ] Сохранение/загрузка сцены
- [ ] Undo/Redo система
- [ ] Мультиселект нод

### v2.0 - Полная интеграция
- [ ] Замена старой системы нод
- [ ] Миграционные утилиты
- [ ] Синхронизация с PATH Engine

---

## 🐛 Известные ограничения

1. Нет системы связей между нодами (планируется в v1.1)
2. Нет сериализации сцены (планируется в v1.2)
3. Производительность при >1000 нод не оптимизирована
4. Accessibility не реализовано

---

## 📄 Лицензия

MIT

---

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте [CHECKLIST.md](CHECKLIST.md)
2. Изучите [QUICKSTART.md](QUICKSTART.md)
3. Смотрите примеры в [examples.ts](examples.ts)
4. Читайте документацию в [API.md](API.md)

---

<div align="center">

**✨ PathEngine 3D готов к использованию! ✨**

[Документация](README.md) • [API](API.md) • [Примеры](examples.ts) • [Roadmap](CHANGELOG.md)

**Version**: 1.0.0 | **Status**: ✅ Ready for testing

</div>
