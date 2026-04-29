import { IExtension } from './interfaces';
/**
 * Extension Manager — регистрация, включение, отключение расширений
 */
export declare class ExtensionManager {
    private extensions;
    private enabledExtensionIds;
    register(extension: IExtension): void;
    enable(extensionId: string, context: any): Promise<void>;
    disable(extensionId: string, context: any): Promise<void>;
    isEnabled(extensionId: string): boolean;
    getEnabledExtensions(): IExtension[];
    getExtension(extensionId: string): IExtension | undefined;
    getAllExtensions(): IExtension[];
}
