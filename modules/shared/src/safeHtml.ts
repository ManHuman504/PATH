/**
 * Safe HTML Rendering Utilities
 * 
 * Защита от XSS и проблем с экранированием в inline событиях
 */

/**
 * Экранирует HTML специальные символы
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Экранирует строку для использования в JavaScript (внутри кавычек)
 */
export function escapeJs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Создает безопасный data-атрибут
 */
export function dataAttr(name: string, value: string | number | boolean): string {
  const escaped = escapeHtml(String(value));
  return `data-${name}="${escaped}"`;
}

/**
 * Создает несколько data-атрибутов из объекта
 */
export function dataAttrs(data: Record<string, string | number | boolean>): string {
  return Object.entries(data)
    .map(([key, value]) => dataAttr(key, value))
    .join(' ');
}

/**
 * Тип для действий (actions) элементов
 */
export type ActionType = 
  | 'click' 
  | 'submit' 
  | 'delete' 
  | 'edit' 
  | 'create'
  | 'open'
  | 'close'
  | string;

/**
 * Создает элемент с action и данными (безопасно)
 * 
 * @example
 * safeElement('button', 'open-path', { pathId: '123' }, 'Open Path')
 * // <button data-action="open-path" data-path-id="123">Open Path</button>
 */
export function safeElement(
  tag: string,
  action: ActionType,
  data: Record<string, any> = {},
  content: string = '',
  className: string = ''
): string {
  const attrs: string[] = [];
  
  // Action всегда первым
  attrs.push(`data-action="${escapeHtml(action)}"`);
  
  // Все остальные data-атрибуты
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      attrs.push(dataAttr(key, value));
    }
  });
  
  // CSS класс если есть
  if (className) {
    attrs.push(`class="${escapeHtml(className)}"`);
  }
  
  const attrsString = attrs.join(' ');
  const escapedContent = escapeHtml(content);
  
  return `<${tag} ${attrsString}>${escapedContent}</${tag}>`;
}

/**
 * Создает кликабельный div с action и данными
 */
export function safeCard(
  action: ActionType,
  data: Record<string, any>,
  content: string,
  className: string = ''
): string {
  return safeElement('div', action, data, content, className);
}

/**
 * Создает кнопку с action
 */
export function safeButton(
  action: ActionType,
  label: string,
  data: Record<string, any> = {},
  className: string = ''
): string {
  return safeElement('button', action, data, label, className);
}

/**
 * Event Delegation Handler
 * 
 * Универсальный обработчик для всех data-action элементов
 * 
 * @example
 * const handler = createActionHandler({
 *   'open-path': (el, data) => openPath(data.pathId),
 *   'delete-item': (el, data) => deleteItem(data.itemId)
 * });
 * 
 * document.body.addEventListener('click', handler);
 */
export function createActionHandler(
  actions: Record<ActionType, (element: HTMLElement, data: DOMStringMap) => void>
): (event: MouseEvent) => void {
  return function(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Ищем ближайший элемент с data-action
    const actionElement = target.closest('[data-action]') as HTMLElement;
    
    if (!actionElement) return;
    
    const action = actionElement.dataset.action;
    if (!action) return;
    
    const handler = actions[action];
    if (!handler) {
      console.warn(`[ActionHandler] No handler for action: ${action}`);
      return;
    }
    
    // Предотвращаем default только если handler определен
    event.preventDefault();
    
    try {
      handler(actionElement, actionElement.dataset);
    } catch (error) {
      console.error(`[ActionHandler] Error in handler for action "${action}":`, error);
    }
  };
}

/**
 * Инициализирует action handler на элементе
 */
export function initActionHandler(
  element: HTMLElement,
  actions: Record<ActionType, (element: HTMLElement, data: DOMStringMap) => void>
): () => void {
  const handler = createActionHandler(actions);
  element.addEventListener('click', handler);
  
  // Возвращает cleanup функцию
  return () => element.removeEventListener('click', handler);
}

/**
 * Проверяет HTML на наличие небезопасных паттернов
 */
export function lintHtml(html: string): string[] {
  const issues: string[] = [];
  
  // Проверка на inline onclick/onload и т.д.
  const inlineEventPattern = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
  const matches = html.match(inlineEventPattern);
  if (matches) {
    issues.push(`Found ${matches.length} inline event handlers (onclick, onload, etc.)`);
    matches.slice(0, 3).forEach(match => {
      issues.push(`  Example: ${match.trim()}`);
    });
  }
  
  // Проверка на javascript: в href
  if (html.includes('href="javascript:') || html.includes("href='javascript:")) {
    issues.push('Found javascript: protocol in href attributes');
  }
  
  // Проверка на потенциальные незакрытые строки в атрибутах
  const suspiciousQuotes = /=["'][^"']*${[^}]*}[^"']*["']/g;
  if (suspiciousQuotes.test(html)) {
    issues.push('Found template literals in attribute values (potential escaping issue)');
  }
  
  return issues;
}

/**
 * Debug: показывает все действия на странице
 */
export function debugActions(): void {
  const elements = document.querySelectorAll('[data-action]');
  console.group(`[ActionDebug] Found ${elements.length} actionable elements`);
  elements.forEach((el, index) => {
    const action = (el as HTMLElement).dataset.action;
    const data = { ...(el as HTMLElement).dataset };
    delete data.action;
    console.log(`${index + 1}. action="${action}"`, data, el);
  });
  console.groupEnd();
}

/**
 * Валидация: проверяет что все data-action имеют обработчики
 */
export function validateActions(
  container: HTMLElement,
  handlers: Record<string, any>
): string[] {
  const elements = container.querySelectorAll('[data-action]');
  const missingHandlers: string[] = [];
  
  elements.forEach(el => {
    const action = (el as HTMLElement).dataset.action;
    if (action && !handlers[action]) {
      missingHandlers.push(action);
    }
  });
  
  return [...new Set(missingHandlers)];
}
