import { EventBus } from './eventBus';
import { ModuleManager } from './moduleManager';
import { ExtensionManager } from './extensionManager';
import { Command } from './commands';
import { ICoreState } from './types';
/**
 * Engine — микроядро Path#
 * Хранит состояние, выполняет команды, публикует события
 */
export declare class Engine {
    private state;
    private eventBus;
    private moduleManager;
    private extensionManager;
    getEventBus(): EventBus;
    getModuleManager(): ModuleManager;
    getExtensionManager(): ExtensionManager;
    /**
     * Публичный API для выполнения команд
     */
    dispatch(command: Command): void;
    /**
     * Получить текущее состояние (read-only для внешних подписчиков)
     */
    getState(): Readonly<ICoreState>;
    /**
     * Обработчики команд
     */
    private handleCreatePath;
    private handleDeletePath;
    private handleAddNode;
    private handleUpdateNode;
    private handleDeleteNode;
    private handleConnectNodes;
    private handleDisconnectNodes;
    private handleCompleteNode;
    /**
     * Утилиты
     */
    private generateId;
    /**
     * Сохранение/загрузка состояния (JSON)
     */
    save(filePath: string): void;
    load(filePath: string): void;
}
