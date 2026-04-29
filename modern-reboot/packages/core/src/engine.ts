import { EventBus } from './eventBus';
import { historyManager } from './historyManager';

/**
 * Публичный API для модулей и расширений
 * Модули и расширения не имеют доступа к приватным данным Engine
 */
export interface EngineAPI {
  onCommand(commandType: string, handler: (payload: any) => void | Promise<void>): void;
  emitEvent(eventType: string, data: any): void;
  getState(): Record<string, any>;
  setState(update: Record<string, any>): void;
  registerTab(tab: UITab): void;
  getTabs(): UITab[];
  getAvailableCommands(): string[];
  getEventBus(): EventBus;
  getApiInfo(): { version: string; capabilities: string[] };
}

/**
 * Интерфейс для модулей
 */
export interface IModule {
  id: string;
  name: string;
  version: string;
  metadata: {
    name: string;
    version: string;
    priority: number;
    dependencies: string[];
  };
  register(api: EngineAPI): Promise<void>;
  dispose?(): Promise<void>;
}

/**
 * Описание вкладки UI для расширений
 */
export interface UITab {
  id: string;
  title: string;
  moduleId: string;
  commands: string[];
  icon?: string;
}

/**
 * Микрокернель Engine - максимально абстрактный
 * Не знает о конкретной структуре данных (paths, nodes и т.д.)
 * Всё добавляется через модули
 */
export class Engine implements EngineAPI {
  private state: Record<string, any> = {};
  private eventBus = new EventBus();
  private commandHandlers: Map<string, ((payload: any) => void | Promise<void>)[]> = new Map();
  private modules: IModule[] = [];
  private failedModules: Array<{ id: string; name: string; error: unknown }> = [];
  private tabs: UITab[] = [];
  private apiInfo = {
    version: '1.0.0',
    capabilities: ['state-v1', 'events-v1', 'commands-v1', 'tabs-v1', 'modules-v1']
  };
  public api = this.apiInfo;
  private debugMode = process.env.DEBUG_MODE === 'true';

  private setFullState(nextState: Record<string, any>): void {
    this.state = { ...nextState };
    this.eventBus.emit('state:changed', this.getState());
    if (this.debugMode) {
      console.log(`[Engine][Debug] Full state replaced`);
    }
  }

  constructor() {
    if (this.debugMode) {
      console.log('[Engine][Debug] API capabilities:', this.apiInfo);
    }
  }

  /**
   * Регистрировать модуль
   */
  async registerModule(module: IModule): Promise<void> {
    console.log(`[Engine] Registering module: ${module.name}`);
    try {
      await module.register(this);
      this.modules.push(module);
      console.log(`[Engine] Module registered: ${module.id}`);
    } catch (error) {
      console.error(`[Engine] Failed to register module: ${module.name}`, error);
      this.failedModules.push({ id: module.id, name: module.name, error });
    }
  }

  /**
   * Регистрировать список модулей с учётом приоритета и зависимостей
   */
  async registerModules(modules: IModule[]): Promise<void> {
    const sorted = [...modules].sort(
      (a, b) => (b.metadata?.priority ?? 0) - (a.metadata?.priority ?? 0)
    );

    console.log(
      `[Engine] Loading modules in order: ${sorted
        .map(m => `${m.name}(${m.metadata?.priority ?? 0})`)
        .join(', ')}`
    );

    const registeredIds = new Set<string>();

    for (const module of sorted) {
      const dependencies = module.metadata?.dependencies ?? [];
      const missing = dependencies.filter(dep => !registeredIds.has(dep));

      if (missing.length > 0) {
        const error = `Missing dependencies: ${missing.join(', ')}`;
        console.warn(`[Engine] Skipping module ${module.name}. ${error}`);
        this.failedModules.push({ id: module.id, name: module.name, error });
        continue;
      }

      await this.registerModule(module);
      if (!this.failedModules.find(m => m.id === module.id)) {
        registeredIds.add(module.id);
      }
    }
  }

  /**
   * Отключить модуль и убрать его вкладки
   */
  async unregisterModule(moduleId: string): Promise<void> {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) {
      return;
    }

    if (module.dispose) {
      try {
        await module.dispose();
      } catch (error) {
        console.error(`[Engine] Error during module dispose: ${moduleId}`, error);
      }
    }

    this.modules = this.modules.filter(m => m.id !== moduleId);
    this.tabs = this.tabs.filter(tab => tab.moduleId !== moduleId);
  }

  /**
   * Выполнить команду
   */
  async dispatch(command: { type: string; payload: any }): Promise<void> {
    console.log(`[Engine] Dispatching command: ${command.type}`);
    if (this.debugMode) {
      console.log(`[Engine][Debug] Command payload:`, command.payload);
    }

    if (command.type === 'UNDO') {
      const result = historyManager.undo();
      if (result) {
        const state = historyManager.getState();
        if (this.debugMode) {
          console.log('[Engine][Debug] Undo completed', state);
        }
      }
      return;
    }

    if (command.type === 'REDO') {
      const result = historyManager.redo();
      if (result) {
        const state = historyManager.getState();
        if (this.debugMode) {
          console.log('[Engine][Debug] Redo completed', state);
        }
      }
      return;
    }
    
    const handlers = this.commandHandlers.get(command.type) || [];
    if (handlers.length === 0) {
      console.warn(`[Engine] No handlers for command: ${command.type}`);
      return;
    }

    const beforeState = JSON.parse(JSON.stringify(this.state));

    for (const handler of handlers) {
      try {
        await handler(command.payload);
      } catch (error) {
        console.error(`[Engine] Error in command handler:`, error);
      }
    }

    const afterState = JSON.parse(JSON.stringify(this.state));
    historyManager.push({
      type: command.type as any,
      timestamp: Date.now(),
      pathId: command.payload?.pathId || 'global',
      data: { before: beforeState, after: afterState },
      undo: () => this.setFullState(beforeState),
      redo: () => this.setFullState(afterState)
    });
  }

  /**
   * Регистрировать обработчик команды
   */
  onCommand(commandType: string, handler: (payload: any) => void | Promise<void>): void {
    if (!this.commandHandlers.has(commandType)) {
      this.commandHandlers.set(commandType, []);
    }
    this.commandHandlers.get(commandType)!.push(handler);
  }

  /**
   * Отправить событие (для подписки модулей/расширений)
   */
  emitEvent(eventType: string, data: any): void {
    console.log(`[Engine] Event: ${eventType}`);
    if (this.debugMode) {
      console.log(`[Engine][Debug] Event data:`, data);
    }
    this.eventBus.emit(eventType, data);
  }

  /**
   * Получить состояние (только для чтения)
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Обновить состояние (используется модулями)
   */
  setState(update: Record<string, any>): void {
    this.state = { ...this.state, ...update };
    this.eventBus.emit('state:changed', this.getState());
    if (this.debugMode) {
      console.log(`[Engine][Debug] State updated:`, update);
    }
  }

  /**
   * Регистрировать вкладку UI
   */
  registerTab(tab: UITab): void {
    this.tabs.push(tab);
    console.log(`[Engine] Tab registered: ${tab.id}`);
  }

  /**
   * Получить все вкладки
   */
  getTabs(): UITab[] {
    return this.tabs;
  }

  /**
   * Получить список доступных команд
   */
  getAvailableCommands(): string[] {
    return Array.from(this.commandHandlers.keys());
  }

  /**
   * Получить EventBus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  getApiInfo(): { version: string; capabilities: string[] } {
    return { ...this.apiInfo, capabilities: [...this.apiInfo.capabilities] };
  }

  /**
   * Получить список модулей
   */
  getModules(): IModule[] {
    return this.modules;
  }

  /**
   * Получить список модулей, которые не смогли загрузиться
   */
  getFailedModules(): Array<{ id: string; name: string; error: unknown }> {
    return this.failedModules;
  }

  /**
   * Алиас для совместимости с PluginAPI
   */
  async executeCommand(type: string, payload?: any): Promise<void> {
    return this.dispatch({ type, payload: payload || {} });
  }
}

export default Engine;
