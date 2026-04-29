/**
 * Safe HTML Rendering Utilities
 *
 * Защита от XSS и проблем с экранированием в inline событиях
 */
/**
 * Экранирует HTML специальные символы
 */
export declare function escapeHtml(text: string): string;
/**
 * Экранирует строку для использования в JavaScript (внутри кавычек)
 */
export declare function escapeJs(text: string): string;
/**
 * Создает безопасный data-атрибут
 */
export declare function dataAttr(name: string, value: string | number | boolean): string;
/**
 * Создает несколько data-атрибутов из объекта
 */
export declare function dataAttrs(data: Record<string, string | number | boolean>): string;
/**
 * Тип для действий (actions) элементов
 */
export type ActionType = 'click' | 'submit' | 'delete' | 'edit' | 'create' | 'open' | 'close' | string;
/**
 * Создает элемент с action и данными (безопасно)
 *
 * @example
 * safeElement('button', 'open-path', { pathId: '123' }, 'Open Path')
 * // <button data-action="open-path" data-path-id="123">Open Path</button>
 */
export declare function safeElement(tag: string, action: ActionType, data?: Record<string, any>, content?: string, className?: string): string;
/**
 * Создает кликабельный div с action и данными
 */
export declare function safeCard(action: ActionType, data: Record<string, any>, content: string, className?: string): string;
/**
 * Создает кнопку с action
 */
export declare function safeButton(action: ActionType, label: string, data?: Record<string, any>, className?: string): string;
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
export declare function createActionHandler(actions: Record<ActionType, (element: HTMLElement, data: DOMStringMap) => void>): (event: MouseEvent) => void;
/**
 * Инициализирует action handler на элементе
 */
export declare function initActionHandler(element: HTMLElement, actions: Record<ActionType, (element: HTMLElement, data: DOMStringMap) => void>): () => void;
/**
 * Проверяет HTML на наличие небезопасных паттернов
 */
export declare function lintHtml(html: string): string[];
/**
 * Debug: показывает все действия на странице
 */
export declare function debugActions(): void;
/**
 * Валидация: проверяет что все data-action имеют обработчики
 */
export declare function validateActions(container: HTMLElement, handlers: Record<string, any>): string[];
