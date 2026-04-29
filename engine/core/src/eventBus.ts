/**
 * Event Bus для обмена событиями между Core и модулями/расширениями
 */

export type EventHandler<T = any> = (event: T) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private events: Array<{ type: string; data: any; timestamp: string }> = [];
  private eventTypes: Set<string> = new Set();

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Возвращаем функцию для отписки
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  emit<T>(eventType: string, event: T): void {
    this.eventTypes.add(eventType);
    this.events.push({ type: eventType, data: event, timestamp: new Date().toISOString() });
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  // Alias for subscribe (backwards compatibility)
  on<T>(eventType: string, handler: EventHandler<T>): () => void {
    return this.subscribe(eventType, handler);
  }

  clear(): void {
    this.handlers.clear();
    this.events = [];
    this.eventTypes.clear();
  }

  getEvents(): Array<{ type: string; data: any; timestamp: string }> {
    return [...this.events];
  }

  getEventTypes(): string[] {
    return Array.from(this.eventTypes);
  }
}
