// Minimal plugin interfaces for local development. These mirror the engine's contract
export type PluginClass = 'UI' | 'EXTENSION' | 'VISUALIZATION' | 'CUSTOM';

export interface PluginRenderProps {
  state: any;
  tabs: Array<{ id: string; title: string; icon?: string }>;
  commands: string[];
  context?: any; // sandboxed helpers
}

export interface PluginAPI {
  getState(): any;
  onEvent(event: string, callback: (d: any) => void): () => void;
  executeCommand(type: string, payload?: any): Promise<any>;
  log(msg: string, data?: any): void;
  registerCleanup(fn: () => void): void;
}

export interface IPlugin {
  id: string;
  name: string;
  version: string;
  class: PluginClass;
  metadata?: any;
  init?(api: PluginAPI): Promise<void>;
  render(props: PluginRenderProps): Promise<string> | string;
  cleanup?(): Promise<void>;
}