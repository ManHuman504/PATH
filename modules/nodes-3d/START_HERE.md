# 👋 Начните здесь!

## 🚀 3 простых шага до запуска

### 1️⃣ Установка (1 команда)

```powershell
cd "packages\nodes-3d" ; .\setup.ps1
```

Скрипт автоматически установит зависимости и соберет проект.

### 2️⃣ Запуск демо (1 команда)

```powershell
npx serve .
```

Откройте: **http://localhost:3000/demo.html**

### 3️⃣ Тестирование

- ✅ Нажмите "Add Random Node" - создайте ноду
- ✅ Перетащите ноду мышью
- ✅ Наведите на ноду - увидьте hover эффект
- ✅ Zoom колесом мыши
- ✅ Pan перетаскиванием фона

---

## 📖 Что читать дальше?

### Для быстрого старта
👉 [QUICKSTART.md](QUICKSTART.md) - подробные инструкции

### Для использования в коде
👉 [API.md](API.md) - справка по методам  
👉 [examples.ts](examples.ts) - примеры кода

### Для понимания архитектуры
👉 [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - обзор  
👉 [DEVELOPMENT.md](DEVELOPMENT.md) - детали

---

## 💻 Быстрая интеграция (копируй-вставляй)

```typescript
import { initPathEngine } from '@path/nodes-3d';

// Инициализация
const engine = initPathEngine(
  document.getElementById('viewport'),
  {
    callbacks: {
      onNodeClick: (node) => console.log('Clicked!', node)
    }
  }
);

// Создание ноды
const node = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div style="padding: 16px;">Hello World!</div>',
  color: 0x2196F3
});
```

---

## 🆘 Что-то не работает?

1. **Ошибка установки?** → Проверьте что Node.js установлен
2. **Ошибка сборки?** → Запустите `npm install` снова
3. **Демо не работает?** → Используйте локальный сервер, не открывайте файл напрямую
4. **Другие проблемы?** → Смотрите [COMMANDS.md](COMMANDS.md#troubleshooting)

---

## ✨ Готово!

После выполнения шагов выше у вас работающая демо-страница с интерактивными 3D-нодами!

**Следующий шаг**: Изучите [примеры](examples.ts) и начните создавать свои ноды 🚀

---

<div align="center">

**PathEngine 3D v1.0.0**  
Независимая система 3D-нод  

[Документация](README.md) • [API](API.md) • [Примеры](examples.ts)

</div>
