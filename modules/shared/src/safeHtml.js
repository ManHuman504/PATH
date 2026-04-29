/**
 * Safe HTML Rendering Utilities
 *
 * Защита от XSS и проблем с экранированием в inline событиях
 */
/**
 * Экранирует HTML специальные символы
 */
export function escapeHtml(text) {
    const map = {
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
export function escapeJs(text) {
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
export function dataAttr(name, value) {
    const escaped = escapeHtml(String(value));
    return `data-${name}="${escaped}"`;
}
/**
 * Создает несколько data-атрибутов из объекта
 */
export function dataAttrs(data) {
    return Object.entries(data)
        .map(([key, value]) => dataAttr(key, value))
        .join(' ');
}
/**
 * Создает элемент с action и данными (безопасно)
 *
 * @example
 * safeElement('button', 'open-path', { pathId: '123' }, 'Open Path')
 * // <button data-action="open-path" data-path-id="123">Open Path</button>
 */
export function safeElement(tag, action, data = {}, content = '', className = '') {
    const attrs = [];
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
export function safeCard(action, data, content, className = '') {
    return safeElement('div', action, data, content, className);
}
/**
 * Создает кнопку с action
 */
export function safeButton(action, label, data = {}, className = '') {
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
export function createActionHandler(actions) {
    return function (event) {
        const target = event.target;
        // Ищем ближайший элемент с data-action
        const actionElement = target.closest('[data-action]');
        if (!actionElement)
            return;
        const action = actionElement.dataset.action;
        if (!action)
            return;
        const handler = actions[action];
        if (!handler) {
            console.warn(`[ActionHandler] No handler for action: ${action}`);
            return;
        }
        // Предотвращаем default только если handler определен
        event.preventDefault();
        try {
            handler(actionElement, actionElement.dataset);
        }
        catch (error) {
            console.error(`[ActionHandler] Error in handler for action "${action}":`, error);
        }
    };
}
/**
 * Инициализирует action handler на элементе
 */
export function initActionHandler(element, actions) {
    const handler = createActionHandler(actions);
    element.addEventListener('click', handler);
    // Возвращает cleanup функцию
    return () => element.removeEventListener('click', handler);
}
/**
 * Проверяет HTML на наличие небезопасных паттернов
 */
export function lintHtml(html) {
    const issues = [];
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
export function debugActions() {
    const elements = document.querySelectorAll('[data-action]');
    console.group(`[ActionDebug] Found ${elements.length} actionable elements`);
    elements.forEach((el, index) => {
        const action = el.dataset.action;
        const data = { ...el.dataset };
        delete data.action;
        console.log(`${index + 1}. action="${action}"`, data, el);
    });
    console.groupEnd();
}
/**
 * Валидация: проверяет что все data-action имеют обработчики
 */
export function validateActions(container, handlers) {
    const elements = container.querySelectorAll('[data-action]');
    const missingHandlers = [];
    elements.forEach(el => {
        const action = el.dataset.action;
        if (action && !handlers[action]) {
            missingHandlers.push(action);
        }
    });
    return [...new Set(missingHandlers)];
}
