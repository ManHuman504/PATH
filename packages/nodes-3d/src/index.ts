/**
 * @path/nodes-3d - Entry Point
 * Основной файл экспорта для модуля 3D-системы нод
 */

import { PathViewport, PathViewportConfig } from './PathViewport';
import { PathNode, PathNodeConfig } from './PathNode';
import { InteractionCallbacks } from './InteractionSystem';
import { PathEngine, PathEngineOptions } from './PathEngine';
import { PathVisualizer, PathVisualizerOptions } from './engine/PathVisualizer';

export { PathViewport, PathNode, PathEngine, PathVisualizer };
export type { PathViewportConfig, PathNodeConfig, InteractionCallbacks, PathEngineOptions, PathVisualizerOptions };

/**
 * Функция инициализации PathEngine
 * Создает и возвращает настроенный viewport
 * 
 * @param container - HTML-элемент контейнера для viewport
 * @param config - Конфигурация viewport
 * @returns Экземпляр PathViewport
 * 
 * @example
 * ```typescript
 * const container = document.getElementById('app');
 * const engine = initPathEngine(container, {
 *   background: 0x0a0a0f,
 *   callbacks: {
 *     onNodeClick: (node) => console.log('Node clicked:', node)
 *   }
 * });
 * 
 * // Создаем ноду
 * const node = engine.createNode({
 *   position: { x: 0, y: 0, z: 0 },
 *   html: '<div>Hello World</div>'
 * });
 * ```
 */
export function initPathEngine(
  container: HTMLElement,
  config?: PathViewportConfig
): PathViewport {
  if (!container) {
    throw new Error('Container element is required for initPathEngine');
  }
  
  // Устанавливаем стили контейнера
  container.style.position = container.style.position || 'relative';
  container.style.width = container.style.width || '100%';
  container.style.height = container.style.height || '100%';
  container.style.overflow = 'hidden';
  
  // Создаем и возвращаем viewport
  const viewport = new PathViewport(container, config);
  
  return viewport;
}

/**
 * Версия модуля
 */
export const VERSION = '1.0.0';
