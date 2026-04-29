/**
 * Общие утилиты и константы
 */

export const APP_NAME = 'Path#';
export const VERSION = '0.1.0';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Система безопасного рендеринга HTML
 * Защита от XSS и проблем с экранированием
 */
export * from './safeHtml';

/**
 * Core data types (Node, Path, Achievement)
 */
export * from './types';

/**
 * Path Sequences - Unified Data Model
 * Двусторонняя синхронизация визуального и текстового редакторов
 */
export * from './sequenceModel';

/**
 * Helper утилиты для безопасной разработки модулей
 * Предотвращение конфликтов и ошибок при работе с core
 */
export * from './helpers';
