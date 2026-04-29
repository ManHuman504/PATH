/**
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ СИСТЕМЫ БЕЗОПАСНОГО РЕНДЕРИНГА (BROWSER ONLY)
 * 
 * Этот файл показывает как правильно использовать новую систему
 * 
 * @deprecated Этот файл содержит примеры для браузера и не используется в build
 */

import { 
  safeElement, 
  safeCard, 
  safeButton,
  initActionHandler,
  dataAttrs,
  lintHtml,
  debugActions,
  validateActions
} from './safeHtml';

// Для Node.js: эти функции доступны только в браузере
declare const document: any;
declare const window: any;
declare const confirm: (msg: string) => boolean;

// ============================================================================
// ПЛОХО ❌ - Старый небезопасный способ
// ============================================================================

function renderPathCard_OLD_UNSAFE(path: any): string {
  // ПРОБЛЕМА: onclick с динамическими данными может сломаться
  return `
    <div class="path-card" onclick="openPath('${path.id}')">
      <h3>${path.title}</h3>
    </div>
  `;
}

// ============================================================================
// ХОРОШО ✅ - Новый безопасный способ
// ============================================================================

function renderPathCard_NEW_SAFE(path: any): string {
  // Используем data-атрибуты вместо inline событий
  return `
    <div class="path-card" ${dataAttrs({ action: 'open-path', pathId: path.id })}>
      <h3>${path.title}</h3>
    </div>
  `;
}

// ============================================================================
// ЕЩЕ ЛУЧШЕ ✅✅ - С helper функциями
// ============================================================================

function renderPathCard_BEST(path: any): string {
  return safeCard(
    'open-path',
    { pathId: path.id },
    `<h3>${path.title}</h3>`,
    'path-card'
  );
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ - Один раз при загрузке плагина
// ============================================================================

function initializePlugin() {
  // 1. Рендерим контент с безопасными data-action атрибутами
  const paths = [
    { id: '123', title: 'Path 1' },
    { id: '456', title: "Path with 'quotes'" },
    { id: '789', title: 'Path with <HTML>' }
  ];
  
  const html = `
    <div id="paths-container">
      ${paths.map(p => renderPathCard_BEST(p)).join('')}
      ${safeButton('create-path', 'Create New Path', {}, 'btn btn-primary')}
    </div>
  `;
  
  // 2. Проверяем HTML на проблемы (dev mode)
  if (process.env.NODE_ENV === 'development') {
    const issues = lintHtml(html);
    if (issues.length > 0) {
      console.warn('[SafeHTML] Issues found:', issues);
    }
  }
  
  // 3. Вставляем HTML
  document.body.innerHTML = html;
  
  // 4. Инициализируем обработчики (event delegation)
  const container = document.getElementById('paths-container')!;
  
  const actions = {
    'open-path': (el: HTMLElement, data: DOMStringMap) => {
      console.log('Opening path:', data.pathId);
      window.location.href = `/path/${data.pathId}`;
    },
    
    'create-path': (el: HTMLElement, data: DOMStringMap) => {
      console.log('Creating new path');
      openModal();
    },
    
    'delete-path': (el: HTMLElement, data: DOMStringMap) => {
      if (confirm(`Delete path ${data.pathId}?`)) {
        deletePath(data.pathId!);
      }
    }
  };
  
  // Инициализируем один обработчик для всех действий
  const cleanup = initActionHandler(container, actions);
  
  // 5. Валидация - проверяем что все действия имеют обработчики
  if (process.env.NODE_ENV === 'development') {
    const missing = validateActions(container, actions);
    if (missing.length > 0) {
      console.error('[ActionSystem] Missing handlers for actions:', missing);
    }
  }
  
  // 6. Debug - показать все доступные действия
  if (process.env.NODE_ENV === 'development') {
    (window as any).debugActions = debugActions;
    console.log('💡 Run debugActions() in console to see all actions');
  }
  
  // Возвращаем cleanup для удаления обработчиков при unmount
  return cleanup;
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ПРИМЕРЫ
// ============================================================================

// Пример: Комплексная карточка с несколькими действиями
function renderComplexCard(item: any): string {
  return `
    <div class="item-card" ${dataAttrs({ itemId: item.id })}>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="actions">
        ${safeButton('edit', 'Edit', { itemId: item.id }, 'btn-edit')}
        ${safeButton('delete', 'Delete', { itemId: item.id }, 'btn-delete')}
        ${safeButton('share', 'Share', { itemId: item.id }, 'btn-share')}
      </div>
    </div>
  `;
}

// Пример: Динамическое добавление элементов (после рендера)
function addPathCardDynamically(path: any) {
  const container = document.getElementById('paths-container')!;
  
  // Создаем HTML безопасно
  const html = renderPathCard_BEST(path);
  
  // Вставляем
  container.insertAdjacentHTML('beforeend', html);
  
  // Обработчики уже работают благодаря event delegation! 
  // Ничего дополнительно делать не нужно 🎉
}

// Пример: Рендер списка с разными типами действий
function renderMixedList(items: any[]): string {
  return `
    <div class="list">
      ${items.map(item => {
        if (item.type === 'path') {
          return safeCard('open-path', { pathId: item.id }, item.title, 'list-item');
        } else if (item.type === 'note') {
          return safeCard('open-note', { noteId: item.id }, item.title, 'list-item');
        } else {
          return safeCard('open-generic', { id: item.id }, item.title, 'list-item');
        }
      }).join('')}
    </div>
  `;
}

// Заглушки для примера
function openModal() { console.log('Modal opened'); }
function deletePath(id: string) { console.log('Delete path:', id); }

// ============================================================================
// ИТОГО: ПРЕИМУЩЕСТВА НОВОЙ СИСТЕМЫ
// ============================================================================

/**
 * ✅ Безопасность: невозможны XSS и проблемы с экранированием
 * ✅ Производительность: один обработчик вместо N обработчиков
 * ✅ Простота: не нужно думать об экранировании кавычек
 * ✅ Валидация: автоматическая проверка что все действия обработаны
 * ✅ Отладка: встроенные debug утилиты
 * ✅ Динамика: новые элементы автоматически получают обработчики
 * ✅ Читаемость: явное разделение данных и логики
 */
