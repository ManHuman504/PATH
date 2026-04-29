/**
 * Plugin System - Professional plugin architecture
 * 
 * Similar to Figma plugins:
 * - Plugins written in TypeScript/JavaScript
 * - Full control over HTML/CSS/JavaScript
 * - Access Core only through API (isolated)
 * - Runtime loading and execution
 * - Hot reload support
 */

/**
 * Plugin Classes - Defines plugin type/category
 */
export enum PluginClass {
  UI = 'UI',                    // UI/Interface plugins
  Extension = 'EXTENSION',      // Extension plugins (adds features to existing UI)
  Theme = 'THEME',              // Theme/styling plugins
  Handler = 'HANDLER',          // Data handling plugins
  Visualization = 'VISUALIZATION', // Data visualization
  Custom = 'CUSTOM'             // Custom plugins
}

/**
 * Plugin Interface - What every plugin must implement
 */
export interface IPlugin {
  /**
   * Unique plugin identifier
   */
  id: string;

  /**
   * Plugin name for UI
   */
  name: string;

  /**
   * Plugin version
   */
  version: string;

  /**
   * Plugin class/type - defines what kind of plugin this is
   * Used for plugin selection and categorization
   */
  class: PluginClass;

  /**
   * Plugin description
   */
  description?: string;

  /**
   * Plugin author
   */
  author?: string;

  /**
   * Plugin metadata for capability checks
   */
  metadata?: {
    name: string;
    version: string;
    class: PluginClass;
    moduleId?: string;            // For Extension plugins: which module they extend
    requiredAPIs: string[];
  };

  /**
   * Initialize plugin when loaded
   * @param api - Access to Core functionality
   */
  init?(api: PluginAPI): Promise<void>;

  /**
   * Render UI - return complete HTML string
   * Plugin has FULL control over HTML/CSS/JS
   * 
   * @param props - State and metadata
   * @returns Complete HTML page
   */
  render(props: PluginRenderProps): Promise<string>;

  /**
   * Cleanup when plugin unloaded
   */
  cleanup?(): Promise<void>;
}

/**
 * Props passed to render() method
 */
export interface PluginRenderProps {
  state: any;
  tabs: Array<{ id: string; title: string; icon?: string }>;
  commands: string[];
  context?: PluginSandbox;
}

const WATCHDOG_FRAME_MS = 16;
const WATCHDOG_STRIKES = 2;

const readonlyProxyCache = new WeakMap<object, any>();

function createReadonlyProxy<T extends object>(value: T): T {
  if (readonlyProxyCache.has(value)) {
    return readonlyProxyCache.get(value);
  }

  const proxy = new Proxy(value, {
    get(target, prop, receiver) {
      const result = Reflect.get(target, prop, receiver);
      if (result && typeof result === 'object') {
        return createReadonlyProxy(result);
      }
      return result;
    },
    set() {
      throw new Error('Readonly state: mutation is not allowed');
    },
    defineProperty() {
      throw new Error('Readonly state: mutation is not allowed');
    },
    deleteProperty() {
      throw new Error('Readonly state: mutation is not allowed');
    }
  });

  readonlyProxyCache.set(value, proxy);
  return proxy;
}

function toReadonlyState<T>(value: T): T {
  if (!value || typeof value !== 'object') {
    return value;
  }
  return createReadonlyProxy(value as object) as T;
}

export interface PluginSandbox {
  console: Console;
  setTimeout: (handler: () => void, timeout?: number) => number;
  clearTimeout: (id: number) => void;
  setInterval: (handler: () => void, timeout?: number) => number;
  clearInterval: (id: number) => void;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

class PluginResourceTracker {
  private timeouts = new Set<number>();
  private intervals = new Set<number>();
  private rafs = new Set<number>();
  private abortControllers = new Set<AbortController>();

  getSandbox(): PluginSandbox {
    return {
      console,
      setTimeout: (handler, timeout) => {
        const id = setTimeout(handler, timeout) as unknown as number;
        this.timeouts.add(id);
        return id;
      },
      clearTimeout: (id) => {
        clearTimeout(id);
        this.timeouts.delete(id);
      },
      setInterval: (handler, timeout) => {
        const id = setInterval(handler, timeout) as unknown as number;
        this.intervals.add(id);
        return id;
      },
      clearInterval: (id) => {
        clearInterval(id);
        this.intervals.delete(id);
      },
      requestAnimationFrame: (callback) => {
        const id = requestAnimationFrame(callback);
        this.rafs.add(id);
        return id;
      },
      cancelAnimationFrame: (handle) => {
        cancelAnimationFrame(handle);
        this.rafs.delete(handle);
      },
      fetch: (input, init = {}) => {
        const controller = new AbortController();
        this.abortControllers.add(controller);
        const mergedInit: RequestInit = { ...init, signal: controller.signal };
        return fetch(input, mergedInit);
      }
    };
  }

  dispose(): void {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();

    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    this.rafs.forEach(id => cancelAnimationFrame(id));
    this.rafs.clear();

    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }
}

/**
 * API that Core provides to plugins
 * Plugins ONLY access Core through this API
 */
export class PluginAPI {
  private unsubscribeHandlers: Array<() => void> = [];
  private cleanupHandlers: Array<() => void> = [];

  constructor(
    private engine: any,
    private eventBus: any,
    private moduleManager: any,
    private pluginId: string,
    private resourceTracker: PluginResourceTracker
  ) {}

  /**
   * Get current application state
   */
  getState(): any {
    return toReadonlyState(this.engine.getState());
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: any) => void): () => void {
    const handler = () => callback(this.getState());
    this.eventBus.on('state:changed', handler);
    
    // Return unsubscribe function
    const unsubscribe = () => this.eventBus.off('state:changed', handler);
    this.unsubscribeHandlers.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Execute a command
   */
  async executeCommand(type: string, payload?: any): Promise<any> {
    return this.engine.executeCommand(type, payload);
  }

  /**
   * Get available commands
   */
  getCommands(): string[] {
    return this.engine.getAvailableCommands();
  }

  /**
   * Listen to events from EventBus
   */
  onEvent(event: string, callback: (data: any) => void): () => void {
    this.eventBus.on(event, callback);
    
    // Return unsubscribe function
    const unsubscribe = () => this.eventBus.off(event, callback);
    this.unsubscribeHandlers.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Get list of active tabs (from modules)
   */
  getTabs(): Array<{ id: string; title: string; icon?: string }> {
    if (this.moduleManager?.getTabs) {
      return this.moduleManager.getTabs();
    }
    if (this.engine?.getTabs) {
      return this.engine.getTabs();
    }
    return [];
  }

  /**
   * Get list of loaded modules
   */
  getModules(): any[] {
    if (this.moduleManager?.getLoadedModules) {
      return this.moduleManager.getLoadedModules();
    }
    if (this.engine?.getModules) {
      return this.engine.getModules();
    }
    return [];
  }

  /**
   * Log message (for debugging)
   */
  log(message: string, data?: any): void {
    console.log(`[Plugin] ${message}`, data || '');
  }

  /**
   * Log error
   */
  error(message: string, error?: any): void {
    console.error(`[Plugin Error] ${message}`, error || '');
  }

  registerCleanup(handler: () => void): void {
    this.cleanupHandlers.push(handler);
  }

  getSandbox(): PluginSandbox {
    return this.resourceTracker.getSandbox();
  }

  dispose(): void {
    this.unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
    this.unsubscribeHandlers = [];
    this.cleanupHandlers.forEach(handler => handler());
    this.cleanupHandlers = [];
  }
}

/**
 * Plugin Manager - Loads, manages, and executes plugins
 */
export class PluginManager {
  private plugins = new Map<string, IPlugin>();
  private loadedPlugins = new Map<string, PluginAPI>();
  private activePluginId: string | null = null;
  private pluginHealth = new Map<string, { slowCount: number; disabled: boolean; lastMs: number }>();
  private pluginResources = new Map<string, PluginResourceTracker>();

  constructor(
    private engine: any,
    private eventBus: any,
    private moduleManager: any
  ) {}

  /**
   * Register a plugin
   */
  registerPlugin(plugin: IPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already registered: ${plugin.id}`);
    }

    if (!plugin.metadata) {
      plugin.metadata = {
        name: plugin.name,
        version: plugin.version,
        class: plugin.class,
        requiredAPIs: []
      };
      this.log(`⚠️ Plugin metadata missing for ${plugin.id}. Defaults applied.`);
    }

    this.plugins.set(plugin.id, plugin);
    this.log(`✅ Plugin registered: ${plugin.name} (${plugin.id})`);
  }

  /**
   * Load a plugin (initialize it)
   */
  async loadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (this.loadedPlugins.has(pluginId)) {
      this.log(`Plugin already loaded: ${pluginId}`);
      return;
    }

    if (plugin.metadata?.requiredAPIs?.length) {
      const engineCapabilities: string[] = this.engine?.api?.capabilities || [];
      const missing = plugin.metadata.requiredAPIs.filter(c => !engineCapabilities.includes(c));
      if (missing.length > 0) {
        throw new Error(`Missing required APIs: ${missing.join(', ')}`);
      }
    }

    // Create API for this plugin
    const resourceTracker = new PluginResourceTracker();
    this.pluginResources.set(pluginId, resourceTracker);
    const api = new PluginAPI(this.engine, this.eventBus, this.moduleManager, pluginId, resourceTracker);
    this.loadedPlugins.set(pluginId, api);

    // Initialize plugin
    if (plugin.init) {
      try {
        await plugin.init(api);
        this.log(`✅ Plugin initialized: ${pluginId}`);
      } catch (error) {
        this.error(`Failed to initialize plugin: ${pluginId}`, error);
        this.loadedPlugins.delete(pluginId);
        throw error;
      }
    }

    this.log(`✅ Plugin loaded: ${pluginId}`);
  }

  /**
   * Unload a plugin (cleanup)
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (this.loadedPlugins.has(pluginId)) {
      const api = this.loadedPlugins.get(pluginId);
      api?.dispose();
      this.pluginResources.get(pluginId)?.dispose();
      this.pluginResources.delete(pluginId);
      if (plugin.cleanup) {
        try {
          await plugin.cleanup();
        } catch (error) {
          this.error(`Error cleaning up plugin: ${pluginId}`, error);
        }
      }

      this.loadedPlugins.delete(pluginId);
    }

    if (this.activePluginId === pluginId) {
      this.activePluginId = null;
    }

    this.log(`✅ Plugin unloaded: ${pluginId}`);
  }

  /**
   * Set active plugin
   */
  setActivePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    this.activePluginId = pluginId;
    this.log(`✅ Active plugin set: ${pluginId}`);
  }

  /**
   * Get active plugin ID
   */
  getActivePluginId(): string | null {
    return this.activePluginId;
  }

  /**
   * Get active plugin
   */
  getActivePlugin(): IPlugin | null {
    if (!this.activePluginId) {
      return null;
    }

    return this.plugins.get(this.activePluginId) || null;
  }

  /**
   * Render active plugin
   */
  async renderActive(props: PluginRenderProps): Promise<string> {
    const plugin = this.getActivePlugin();

    if (!plugin) {
      return '<h1>No active plugin</h1>';
    }

    const health = this.pluginHealth.get(plugin.id) || { slowCount: 0, disabled: false, lastMs: 0 };
    if (health.disabled) {
      return `<h1>Plugin disabled</h1><p>Plugin ${plugin.name} was disabled due to performance issues.</p>`;
    }

    try {
      const sandbox = this.pluginResources.get(plugin.id)?.getSandbox();
      const safeProps = { ...props, state: toReadonlyState(props.state), context: sandbox };
      const start = Date.now();
      const html = await plugin.render(safeProps);
      const elapsed = Date.now() - start;
      health.lastMs = elapsed;

      if (elapsed > WATCHDOG_FRAME_MS) {
        health.slowCount += 1;
        this.log(`⚠️ Plugin ${plugin.id} exceeded frame budget: ${elapsed}ms (strike ${health.slowCount})`);
        if (health.slowCount >= WATCHDOG_STRIKES) {
          health.disabled = true;
          this.pluginHealth.set(plugin.id, health);
          return `<h1>Plugin disabled</h1><p>Plugin ${plugin.name} exceeded performance budget and was disabled.</p>`;
        }
      } else {
        health.slowCount = 0;
      }

      this.pluginHealth.set(plugin.id, health);
      return html;
    } catch (error) {
      this.error(`Failed to render plugin: ${plugin.id}`, error);
      return `<h1>Error rendering plugin</h1><p>${error}</p>`;
    }
  }

  /**
   * Get list of registered plugins
   */
  getPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get list of loaded plugins
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }

  /**
   * Unload all plugins
   */
  async unloadAll(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys());

    for (const pluginId of pluginIds) {
      await this.unloadPlugin(pluginId);
    }

    this.activePluginId = null;
  }

  /**
   * Render all Extension plugins for the given module
   * Used to inject extensions into UI plugins
   */
  async renderExtensionsForModule(moduleId: string, props: PluginRenderProps): Promise<string> {
    this.log(`renderExtensionsForModule: looking for extensions for moduleId="${moduleId}"`);
    const extensions: string[] = [];
    
    for (const [pluginId, plugin] of this.plugins) {
      this.log(`  Checking plugin: ${pluginId}, class=${plugin.class}, moduleId=${plugin.metadata?.moduleId}`);
      if (plugin.class === PluginClass.Extension && plugin.metadata?.moduleId === moduleId) {
        this.log(`    ✅ MATCH! Rendering extension: ${pluginId}`);
        try {
          const html = await plugin.render(props);
          if (html && html.trim()) {
            extensions.push(html);
            this.log(`    ✅ Extension rendered, length: ${html.length} chars`);
          }
        } catch (error) {
          this.error(`Failed to render extension: ${pluginId}`, error);
        }
      }
    }
    
    this.log(`renderExtensionsForModule: total extensions found: ${extensions.length}`);
    return extensions.join('\n');
  }

  private log(message: string): void {
    console.log(`[PluginManager] ${message}`);
  }

  private error(message: string, error?: any): void {
    console.error(`[PluginManager] ${message}`, error || '');
  }
}

/**
 * Plugin Factory - Helper for creating plugins
 */
export class PluginFactory {
  /**
   * Create a simple plugin that returns HTML
   */
  static createSimple(config: {
    id: string;
    name: string;
    version: string;
    class: PluginClass;
    description?: string;
    author?: string;
    render: (props: PluginRenderProps) => Promise<string>;
  }): IPlugin {
    return {
      id: config.id,
      name: config.name,
      version: config.version,
      class: config.class,
      description: config.description,
      author: config.author,
      render: config.render
    };
  }

  /**
   * Create a plugin with lifecycle hooks
   */
  static create(config: {
    id: string;
    name: string;
    version: string;
    class: PluginClass;
    description?: string;
    author?: string;
    init?: (api: PluginAPI) => Promise<void>;
    render: (props: PluginRenderProps) => Promise<string>;
    cleanup?: () => Promise<void>;
  }): IPlugin {
    return config;
  }
}
