/**
 * Event Bus для обмена событиями между Core и модулями/расширениями
 */
export type EventHandler<T = any> = (event: T) => void;
export declare class EventBus {
    private handlers;
    private events;
    private eventTypes;
    subscribe<T>(eventType: string, handler: EventHandler<T>): () => void;
    emit<T>(eventType: string, event: T): void;
    on<T>(eventType: string, handler: EventHandler<T>): () => void;
    clear(): void;
    getEvents(): Array<{
        type: string;
        data: any;
        timestamp: string;
    }>;
    getEventTypes(): string[];
}
