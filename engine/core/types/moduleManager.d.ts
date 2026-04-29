import { IModule } from './interfaces';
/**
 * Module Manager — регистрация, активация, деактивация модулей
 */
export declare class ModuleManager {
    private modules;
    private activeModuleIds;
    register(module: IModule): void;
    activate(moduleId: string, engine: any): Promise<void>;
    deactivate(moduleId: string, engine: any): Promise<void>;
    isActive(moduleId: string): boolean;
    getActiveModules(): IModule[];
}
