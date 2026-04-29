# Path# — платформа для фиксации ПРОШЛОГО прогресса

## ✅ ПРОЕКТ ПОЛНОСТЬЮ РАБОЧИЙ - PHASE 5 COMPLETE ✨

**Статус**: v5.0.0 Production Ready на localhost:3000  
**Последние обновления**: 30 января 2026  
**Phase 5**: ✅ Complete Settings System + Modern Light Theme  

### Documentation Files
1. **[SETTINGS_SYSTEM.md](SETTINGS_SYSTEM.md)** - Settings system reference
2. **[LIGHT_THEME_GUIDE.md](LIGHT_THEME_GUIDE.md)** - Design guide with color palette
3. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details
4. **[USER_GUIDE.md](USER_GUIDE.md)** - Updated with settings usage
5. **[PHASE5_LIGHT_THEME_COMPLETE.md](PHASE5_LIGHT_THEME_COMPLETE.md)** - Phase 5 report
6. **[LIGHT_THEME_TEST_CHECKLIST.md](LIGHT_THEME_TEST_CHECKLIST.md)** - QA checklist

[📖 **Full Phase 5 Report →**](PHASE5_LIGHT_THEME_COMPLETE.md) | [📚 **All 5 Phases Summary →**](DEVELOPMENT_SUMMARY.md)

## Что такое Path#?

**Path#** отличается от Notion, Todoist и подобных систем тем, что:

- **Notion** = "я хочу / я планирую" → фокус на БУДУЩЕЕ
- **Path#** = "я уже иду / я прошёл" → фокус на ПРОШЛОЕ

Path# для людей, которые:
- Реально что-то делают
- Выгорают, потому что не видят прогресса
- Теряют ощущение пути

Path# решает через структурированную фиксацию шагов, даже микрошагов.
Результат = след, а не обещание.

Это монорепозиторий для MVP платформы "Path#". Здесь находится microkernel (Core), модули, расширения и простой веб-frontend для демо.

- **Core** (`engine/core`): микроядро с Engine, EventBus, ModuleManager, ExtensionManager
- **Modules** (`modules/modules`): логические подсистемы (Home, Node, Year)
- **Plugins/Extensions** (`plugins/extensions`): UI-плагины (HubUIPlugin, NodeUIPlugin) и fallback UglyUI
- **Web App** (`apps/web`): простой веб-интерфейс на Express + vanilla JS
- **Shared** (`modules/shared`): общие утилиты

Смотри папку [docs/](./docs):

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — архитектура microkernel
- [docs/EXAMPLES.md](./docs/EXAMPLES.md) — примеры использования Core
- [docs/API.md](./docs/API.md) — полная API документация

## MVP Definition of Done

✅ Core работает без UI (можно дергать из скриптов)
✅ Модули активируются/деактивируются (HomeModule, NodeModule, YearModule)
✅ Web-демо с вкладками и формами
✅ События логируются в консоль и в браузер
✅ Расширения можно переключать (UglyUI ↔ NiceUI)
✅ Сохранение/загрузка состояния в JSON

## Контрибьютинг

1. Каждый новый шаг = минимальный рабочий результат
2. TypeScript strict mode
3. Никакой UI-логики в Core
4. Все действия через команды (dispatch)
5. Логировать в консоль

---

**Статус:** MVP 🚀
**Язык:** TypeScript 5.3
**Платформа:** Node.js + Web (Express)
**Лицензия:** MIT

