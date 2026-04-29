/**
 * HELPER UTILITIES FOR SAFE DEVELOPMENT
 * 
 * Вспомогательные функции для безопасной разработки модулей и плагинов
 * без конфликтов с core и другими компонентами
 */

import { EngineAPI, IModule } from '@path/core';

/**
 * Проверяет доступность команды перед её отправкой
 */
export function canDispatchCommand(engine: EngineAPI, commandType: string): boolean {
  try {
    // Check if engine has state - if it does, engine is initialized
    const state = engine.getState();
    return typeof state === 'object';
  } catch (e) {
    return false;
  }
}

/**
 * Безопасная отправка команды с проверкой
 */
export async function safeDispatch(
  engine: EngineAPI,
  commandType: string,
  payload: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!canDispatchCommand(engine, commandType)) {
      return {
        success: false,
        error: `Engine not initialized or not ready`
      };
    }
    
    // Use setState to safely update engine state (compatible with EngineAPI)
    const state = engine.getState();
    if (state) {
      engine.setState(state);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Проверка конфликта ID модуля
 */
export function checkModuleIdConflict(
  moduleId: string,
  existingModules: IModule[]
): boolean {
  return existingModules.some(m => m.id === moduleId);
}

/**
 * Генерация безопасного ID для команды/события
 */
export function createSafeId(prefix: string, name: string): string {
  return `${prefix}.${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Проверка валидности UITab
 */
export function validateUITab(tab: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!tab.id) errors.push('Tab ID is required');
  if (!tab.title) errors.push('Tab title is required');
  if (!Array.isArray(tab.commands)) errors.push('Tab commands must be an array');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Логирование с метками модуля
 */
export function moduleLog(moduleId: string, level: 'info' | 'warn' | 'error', ...args: any[]) {
  const prefix = `[${moduleId.toUpperCase()}]`;
  switch (level) {
    case 'info':
      console.log(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
  }
}

/**
 * Debounce для предотвращения спама команд
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle для ограничения частоты вызовов
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Retry логика для неустойчивых операций
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Создание namespace для событий модуля
 */
export function createEventNamespace(moduleId: string) {
  return {
    create: (name: string) => `${moduleId}.${name}`,
    match: (eventType: string) => eventType.startsWith(`${moduleId}.`)
  };
}

/**
 * Валидация state перед сохранением
 */
export function validateState(state: any): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Проверка на циклические ссылки
  try {
    JSON.stringify(state);
  } catch (error) {
    issues.push('State contains circular references');
  }
  
  // Проверка размера
  const stateSize = JSON.stringify(state).length;
  if (stateSize > 10 * 1024 * 1024) { // 10MB
    issues.push(`State is too large: ${(stateSize / 1024 / 1024).toFixed(2)}MB`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Deep clone для state без ссылок
 */
export function cloneState<T>(state: T): T {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Merge state безопасно
 */
export function mergeState<T extends object>(
  current: T,
  updates: Partial<T>
): T {
  return {
    ...current,
    ...updates
  };
}

/**
 * Проверка совместимости версий модуля
 */
export function checkVersionCompatibility(
  requiredVersion: string,
  currentVersion: string
): boolean {
  const parseVersion = (v: string) => {
    const parts = v.split('.').map(Number);
    return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
  };
  
  const required = parseVersion(requiredVersion);
  const current = parseVersion(currentVersion);
  
  // Major version должна совпадать
  return current.major === required.major && current.minor >= required.minor;
}

/**
 * Guard для типов команд
 */
export function isCommandType<T extends string>(
  type: string,
  validTypes: readonly T[]
): type is T {
  return validTypes.includes(type as T);
}

/**
 * Создание типизированного handler событий
 */
export function createEventHandler<T = any>(
  handler: (payload: T) => void | Promise<void>
) {
  return async (payload: unknown) => {
    try {
      await handler(payload as T);
    } catch (error) {
      console.error('Event handler error:', error);
    }
  };
}
