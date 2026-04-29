import { EventBus } from './eventBus';
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
    getApiInfo(): {
        version: string;
        capabilities: string[];
    };
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
export declare class Engine implements EngineAPI {
    private state;
    private eventBus;
    private commandHandlers;
    private modules;
    private failedModules;
    private tabs;
    private apiInfo;
    api: {
        version: string;
        capabilities: string[];
    };
    private debugMode;
    /**
     * Регистрировать модуль
     */
    registerModule(module: IModule): Promise<void>;
    /**
     * Регистрировать список модулей с учётом приоритета и зависимостей
     */
    registerModules(modules: IModule[]): Promise<void>;
    /**
     * Отключить модуль и убрать его вкладки
     */
    unregisterModule(moduleId: string): Promise<void>;
    /**
     * Выполнить команду
     */
    dispatch(command: {
        type: string;
        payload: any;
    }): Promise<void>;
    /**
     * Регистрировать обработчик команды
     */
    onCommand(commandType: string, handler: (payload: any) => void | Promise<void>): void;
    /**
     * Отправить событие (для подписки модулей/расширений)
     */
    emitEvent(eventType: string, data: any): void;
    /**
     * Получить состояние (только для чтения)
     */
    getState(): Record<string, any>;
    /**
     * Обновить состояние (используется модулями)
     */
    setState(update: Record<string, any>): void;
    /**
     * Регистрировать вкладку UI
     */
    registerTab(tab: UITab): void;
    /**
     * Получить все вкладки
     */
    getTabs(): UITab[];
    /**
     * Получить список доступных команд
     */
    getAvailableCommands(): string[];
    /**
     * Получить EventBus
     */
    getEventBus(): EventBus;
    getApiInfo(): {
        version: string;
        capabilities: string[];
    };
    /**
     * Получить список модулей
     */
    getModules(): IModule[];
    /**
     * Получить список модулей, которые не смогли загрузиться
     */
    getFailedModules(): Array<{
        id: string;
        name: string;
        error: unknown;
    }>;
    /**
     * Алиас для совместимости с PluginAPI
     */
    executeCommand(type: string, payload?: any): Promise<void>;
}
export default Engine;
