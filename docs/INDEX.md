# 📚 Path# Документация

Полное руководство по проекту Path#. Выберите нужный раздел:

---

## 🚀 Быстрый старт

- [Введение](../00_START_HERE.md) - С чего начать?
- [Quickstart](setup/QUICKSTART.md) - Быстрый запуск (5 минут)
- [Установка](setup/SETUP.md) - Полная инструкция установки
- [Визуальный обзор](../VISUAL_OVERVIEW.md) - Диаграммы архитектуры

---

## 📖 Основная документация

### Архитектура и дизайн
- [Master Brief (Конституция проекта)](master-brief.md) - **8 основных принципов** - начните отсюда!
- [Архитектура](ARCHITECTURE.md) - Общий дизайн системы
- [API движка](core/ENGINE_API.md) - Public API Core
- [Модули](modules/MODULES_OVERVIEW.md) - Архитектура модулей

### 🔌 Professional Plugin System (НОВОЕ!)
- [Архитектура плагинов](extensions/ARCHITECTURE_PLUGINS.md) - Как работает система
- [Руководство разработчика](extensions/PROFESSIONAL_PLUGINS.md) - Полный гайд
- [Быстрая справка](extensions/PLUGINS_QUICK_REFERENCE.md) - Шпаргалка
- [Примеры плагинов](../plugins/extensions/src/examplePlugins.ts) - 4 готовых примера
- [Plugin Class System](../PLUGIN_CLASS_SYSTEM.md) - Классификация плагинов (**НОВОЕ!**)
- [Plugin Class Implementation](../PLUGIN_CLASS_IMPLEMENTATION.md) - Реализация выбора интерфейса (**НОВОЕ!**)

### 📚 Complete API Documentation (**PHASE 4B - НОВОЕ!**)
- [Complete API Documentation](API_DOCUMENTATION.md) - **Полный справочник API (как в Figma)**
  - PluginAPI - все методы с примерами
  - Module API - как создавать модули
  - Event Bus API - pub/sub система
  - Command System API - система команд
  - Module Management API - управление модулями
  - Plugin System Lifecycle
- [Plugin Development Guide](PLUGIN_DEVELOPMENT_GUIDE.md) - **Пошаговое руководство по разработке плагинов**
  - Quick Start
  - Basic Plugin Structure
  - Plugin Templates (UI, Interactive, Visualization, Handler)
  - Common Patterns
  - Testing Your Plugin
  - Best Practices & Common Mistakes
- [Visual Constructor Integration](VISUAL_CONSTRUCTOR_INTEGRATION.md) - **Архитектура визуального конструктора**
  - System Architecture
  - Component Tree Structure
  - Phase 1: Basic Constructor
  - Phase 2: Saving Designs
  - Phase 3: Exporting as Plugins
  - Integration Workflow
  - API Integration Points

### Расширения и UI
- [Система расширений (старая)](extensions/EXTENSIONS.md) - JSON-based подход
- [Extension Guide](extensions/EXTENSION_GUIDE.md) - Как создавать Extensions
- [Plugin System](extensions/PLUGIN_SYSTEM.md) - Система плагинов для компонентов
- [Extension API](api/EXTENSION_API.md) - REST API для Extensions
- [UI Builder](ui/UI_BUILDER.md) - JSON-based UI система
- [UI Builder Quick](ui/UIBUILDER_QUICK.md) - Шпаргалка по UIBuilder

### Функциональность
- [Модуль пути (Path)](modules/PATH_MODULE.md) - Работа с путями
- [Домашняя страница (Home)](modules/HOME_MODULE.md) - Главный экран
- [API сервера](api/SERVER_API.md) - REST API

---

## 🔍 Справочная информация

- [Быстрая справка](reference/QUICK_SUMMARY.md) - 5 минут на всё
- [Команды и события](reference/COMMANDS_AND_EVENTS_REFERENCE.md) - Полный список
- [Краткая справка](reference/QUICK_REFERENCE.md) - Шпаргалка

---

## 🛠️ Аудит и проверка качества

### Результаты проверки кода
- [Карта реального состояния кода](audit/CODE_REALITY_MAP.md) - Что реально в коде
- [Расхождения документации и кода](audit/CODE_VS_DOCS_AUDIT.md) - 9 найденных проблем
- [План исправления](audit/CORRECTION_PLAN.md) - Как исправить документацию
- [Чек-лист скорректированных файлов](audit/CORRECTED_FILES_CHECKLIST.md) - Что исправлено

### Анализ незавершённого кода
- [Недоделанные и неиспользованные функции](INCOMPLETE_UNUSED_FEATURES.md) ⚠️ **ВАЖНО**
  - 5 критических проблем
  - 3 серьёзных проблемы
  - 1 второстепенная проблема
  - Оценки времени для исправлений

---

## 📋 Решения и планы

- [Рекомендации](RECOMMENDATIONS.md) - 3 варианта действий
- [Контрольный список MVP](../MVP_CHECKLIST.md) - Что должно быть в v0
- [Шпаргалка](../CHEATSHEET.md) - Команды и сокращения

---

## 🎯 Решения и архитектурные решения

- [Архитектурные решения](decisions/ARCHITECTURE_DECISIONS.md) - Почему так сделано

---

## 📊 Структура проекта

```
PATH#/
├── apps/
│   └── web/                    # Веб-приложение
├── engine/
│   └── core/                   # Ядро системы
├── modules/
│   ├── modules/                # Модули функциональности
│   ├── nodes-3d/               # 3D visualizer module
│   └── shared/                 # Общие утилиты
├── plugins/
│   └── extensions/             # Система расширений
├── docs/                       # 📍 Вы здесь
│   ├── core/                   # Документация ядра
│   ├── modules/                # Документация модулей
│   ├── extensions/             # Документация расширений
│   ├── ui/                     # UI документация
│   ├── api/                    # API справочник
│   ├── audit/                  # Результаты аудита
│   ├── setup/                  # Инструкции установки
│   ├── reference/              # Справочная информация
│   ├── decisions/              # Архитектурные решения
│   └── master-brief.md         # ГЛАВНЫЙ ДОКУМЕНТ (начните здесь!)
├── README.md                   # Главная README
└── package.json
```

---

## 🔴 КРИТИЧЕСКОЕ ВНИМАНИЕ

**Обязательно прочитайте перед изменением кода:**

1. [Master Brief](master-brief.md) - **8 неизменяемых принципов**
2. [Недоделанные функции](INCOMPLETE_UNUSED_FEATURES.md) - Что сломано и почему
3. [План исправлений](audit/CORRECTION_PLAN.md) - Как правильно исправить

---

## 📝 Быстрые ссылки

- **Проблема**: Extension.renderUI() возвращает HTML, а не JSON → см. [CODE_REALITY_MAP.md](audit/CODE_REALITY_MAP.md)
- **Проблема**: Модули не изолированы → см. [CODE_VS_DOCS_AUDIT.md](audit/CODE_VS_DOCS_AUDIT.md)
- **Проблема**: NodeModule пуст → см. [INCOMPLETE_UNUSED_FEATURES.md](INCOMPLETE_UNUSED_FEATURES.md)
- **Нужен план**: Где начать с исправлений → см. [RECOMMENDATIONS.md](RECOMMENDATIONS.md)

---

**Версия документации**: 2.0  
**Последнее обновление**: 2024  
**Статус**: ✅ Синхронизировано с кодом v0
