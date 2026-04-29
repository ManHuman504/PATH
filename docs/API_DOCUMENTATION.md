# PATH# Complete API Documentation

> 📚 Comprehensive API reference for developers building modules and plugins in PATH#

## Table of Contents

- [Plugin API (PluginAPI)](#plugin-api-pluginapi)
- [Module API (IModule)](#module-api-imodule)
- [Event Bus API](#event-bus-api)
- [Command System API](#command-system-api)
- [Module Management API](#module-management-api)
- [Plugin System Lifecycle](#plugin-system-lifecycle)

---

## Plugin API (PluginAPI)

The `PluginAPI` class provides a safe, isolated interface for plugins to interact with the PATH# core system. It's the primary way plugins access application state, dispatch commands, and listen to events.

### Overview

```typescript
class PluginAPI {
  // Core access
  getEngine(): Engine;
  getState(): AppState;
  
  // State inspection
  getPathCount(): number;
  getPaths(filter?: PathFilter): Path[];
  getCurrentNode(): Node | null;
  getModuleState(moduleName: string): ModuleState;
  
  // Commands
  dispatchCommand(name: string, params: any): Promise<void>;
  createPath(data: PathData): Promise<Path>;
  deleteNode(nodeId: string): Promise<void>;
  
  // Events
  onStateChanged(callback: (state: AppState) => void): void;
  onNodeSelected(callback: (node: Node) => void): void;
  onPathCreated(callback: (path: Path) => void): void;
  onEvent(eventName: string, callback: (data: any) => void): void;
  
  // Module access
  getModule(moduleName: string): Module | null;
  listModules(): Module[];
}
```

### Methods

#### `getEngine(): Engine`

Returns the core Engine instance (read-only access).

**Returns**: `Engine` - The application engine

**Example**:
```typescript
const engine = pluginAPI.getEngine();
console.log('Engine started:', engine.isRunning());
```

---

#### `getState(): AppState`

Returns the current application state snapshot.

**Returns**: `AppState` - Complete application state

**Signature**:
```typescript
interface AppState {
  paths: Path[];
  selectedNode: Node | null;
  modules: Record<string, ModuleState>;
  settings: Record<string, any>;
  timestamp: number;
}
```

**Example**:
```typescript
const state = pluginAPI.getState();
console.log(`Current paths: ${state.paths.length}`);
console.log(`Selected node: ${state.selectedNode?.name}`);
```

---

#### `getPathCount(): number`

Returns the total number of paths in the current state.

**Returns**: `number`

**Example**:
```typescript
const count = pluginAPI.getPathCount();
if (count === 0) {
  console.log('No paths yet');
}
```

---

#### `getPaths(filter?: PathFilter): Path[]`

Returns array of paths, optionally filtered.

**Parameters**:
- `filter?: PathFilter` - Optional filter criteria

**Returns**: `Path[]` - Array of matching paths

**PathFilter Options**:
```typescript
interface PathFilter {
  type?: string;
  owner?: string;
  status?: 'active' | 'completed' | 'archived';
  limit?: number;
}
```

**Example**:
```typescript
// Get all paths
const allPaths = pluginAPI.getPaths();

// Get active paths
const activePaths = pluginAPI.getPaths({ status: 'active' });

// Get first 10 paths
const firstTen = pluginAPI.getPaths({ limit: 10 });
```

---

#### `getCurrentNode(): Node | null`

Returns the currently selected node, or null if none selected.

**Returns**: `Node | null`

**Node Structure**:
```typescript
interface Node {
  id: string;
  name: string;
  description: string;
  parentPath: string;
  createdAt: Date;
  metadata: Record<string, any>;
}
```

**Example**:
```typescript
const node = pluginAPI.getCurrentNode();
if (node) {
  console.log(`Current node: ${node.name}`);
  console.log(`Parent path: ${node.parentPath}`);
}
```

---

#### `getModuleState(moduleName: string): ModuleState`

Returns the current state of a specific module.

**Parameters**:
- `moduleName: string` - Name of the module (e.g., 'paths', 'home', 'nodes')

**Returns**: `ModuleState` - Module-specific state

**Supported Modules**:
- `'paths'` - Path module state
- `'home'` - Home module state
- `'nodes'` - Node module state
- `'year'` - Year module state

**Example**:
```typescript
const pathsModuleState = pluginAPI.getModuleState('paths');
console.log('Paths module data:', pathsModuleState);

const homeModuleState = pluginAPI.getModuleState('home');
console.log('Home module data:', homeModuleState);
```

---

#### `dispatchCommand(name: string, params: any): Promise<void>`

Dispatches a command to be processed by the system or modules.

**Parameters**:
- `name: string` - Command name
- `params: any` - Command parameters

**Returns**: `Promise<void>`

**Common Commands**:
- `'createPath'` - Create a new path
- `'deletePath'` - Delete a path
- `'selectNode'` - Select a node
- `'updatePath'` - Update path properties

**Example**:
```typescript
// Create a new path
await pluginAPI.dispatchCommand('createPath', {
  name: 'My New Path',
  description: 'A test path',
  type: 'navigation'
});

// Delete a path
await pluginAPI.dispatchCommand('deletePath', {
  pathId: 'path-123'
});

// Select a node
await pluginAPI.dispatchCommand('selectNode', {
  nodeId: 'node-456'
});
```

---

#### `createPath(data: PathData): Promise<Path>`

Convenience method to create a new path.

**Parameters**:
- `data: PathData` - Path creation data

**Returns**: `Promise<Path>` - The created path

**PathData Interface**:
```typescript
interface PathData {
  name: string;
  description?: string;
  type?: string;
  color?: string;
  icon?: string;
}
```

**Example**:
```typescript
const newPath = await pluginAPI.createPath({
  name: 'Development Path',
  description: 'Path for development activities',
  type: 'development',
  color: '#3498db',
  icon: '🛠️'
});

console.log(`Created path: ${newPath.name} (ID: ${newPath.id})`);
```

---

#### `deleteNode(nodeId: string): Promise<void>`

Deletes a node by ID.

**Parameters**:
- `nodeId: string` - ID of the node to delete

**Returns**: `Promise<void>`

**Example**:
```typescript
try {
  await pluginAPI.deleteNode('node-123');
  console.log('Node deleted');
} catch (error) {
  console.error('Failed to delete node:', error);
}
```

---

#### `onStateChanged(callback: (state: AppState) => void): void`

Registers a callback that fires whenever application state changes.

**Parameters**:
- `callback: Function` - Function to call on state change

**Example**:
```typescript
pluginAPI.onStateChanged((newState) => {
  console.log('State updated');
  console.log(`Paths: ${newState.paths.length}`);
  console.log(`Selected: ${newState.selectedNode?.name}`);
});
```

---

#### `onNodeSelected(callback: (node: Node) => void): void`

Registers a callback that fires when a node is selected.

**Parameters**:
- `callback: Function` - Function to call with selected node

**Example**:
```typescript
pluginAPI.onNodeSelected((node) => {
  console.log(`Node selected: ${node.name}`);
  console.log(`Description: ${node.description}`);
});
```

---

#### `onPathCreated(callback: (path: Path) => void): void`

Registers a callback that fires when a new path is created.

**Parameters**:
- `callback: Function` - Function to call with new path

**Example**:
```typescript
pluginAPI.onPathCreated((path) => {
  console.log(`New path created: ${path.name}`);
  // Update UI, refresh list, etc.
});
```

---

#### `onEvent(eventName: string, callback: (data: any) => void): void`

Registers a listener for any custom event in the system.

**Parameters**:
- `eventName: string` - Name of the event to listen for
- `callback: Function` - Function to call when event fires

**Common Events**:
- `'engine:started'` - Engine started
- `'engine:stopped'` - Engine stopped
- `'path:created'` - Path created
- `'path:deleted'` - Path deleted
- `'node:selected'` - Node selected
- `'state:updated'` - State updated

**Example**:
```typescript
pluginAPI.onEvent('engine:started', () => {
  console.log('Application started');
});

pluginAPI.onEvent('path:created', (pathData) => {
  console.log(`Path created: ${pathData.name}`);
});

pluginAPI.onEvent('state:updated', (newState) => {
  // Re-render UI with new state
  updateUI(newState);
});
```

---

#### `getModule(moduleName: string): Module | null`

Returns a specific module instance.

**Parameters**:
- `moduleName: string` - Module name

**Returns**: `Module | null` - Module instance or null if not found

**Example**:
```typescript
const pathsModule = pluginAPI.getModule('paths');
if (pathsModule) {
  console.log('Paths module available');
  // Can access module-specific methods
}
```

---

#### `listModules(): Module[]`

Returns all available modules.

**Returns**: `Module[]` - Array of module instances

**Example**:
```typescript
const modules = pluginAPI.listModules();
console.log('Available modules:');
modules.forEach(m => {
  console.log(`  - ${m.name}`);
});
```

---

## Module API (IModule)

Modules are the core building blocks of PATH#. Use this API to create custom modules that integrate with the system.

### IModule Interface

```typescript
interface IModule {
  // Identification
  name: string;
  description?: string;
  version: string;
  
  // Lifecycle
  initialize(engine: Engine, eventBus: EventBus): Promise<void>;
  dispose?(): Promise<void>;
  
  // State
  getState(): ModuleState;
  setState(state: ModuleState): void;
  
  // UI
  getTabs?(): Tab[];
  renderTab?(tabId: string): string | Promise<string>;
}

interface ModuleState {
  [key: string]: any;
}

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content?: string;
}
```

### Creating a Custom Module

**Step 1: Define the module structure**

```typescript
import { IModule, Engine, EventBus } from '@path/core';

class CustomModule implements IModule {
  name = 'custom-module';
  description = 'My custom module';
  version = '1.0.0';

  private engine: Engine;
  private eventBus: EventBus;
  private state: any = {};

  async initialize(engine: Engine, eventBus: EventBus) {
    this.engine = engine;
    this.eventBus = eventBus;
    
    console.log(`[${this.name}] Initializing...`);
    
    // Initialize your module state
    this.state = {
      data: [],
      settings: {}
    };

    // Listen to application events
    this.eventBus.on('state:updated', (state) => {
      console.log(`[${this.name}] State updated`);
    });

    console.log(`[${this.name}] Ready`);
  }

  getState() {
    return this.state;
  }

  setState(state: any) {
    this.state = { ...this.state, ...state };
  }

  getTabs() {
    return [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️'
      }
    ];
  }

  async renderTab(tabId: string): Promise<string> {
    if (tabId === 'overview') {
      return `<h2>Module Overview</h2><p>${JSON.stringify(this.state)}</p>`;
    }
    
    if (tabId === 'settings') {
      return `<h2>Module Settings</h2><p>Configure module here</p>`;
    }
    
    return '<p>Unknown tab</p>';
  }
}

export default CustomModule;
```

**Step 2: Register the module**

```typescript
import { Engine, ModuleManager } from '@path/core';
import CustomModule from './customModule';

const engine = new Engine();
const moduleManager = engine.moduleManager;

const customModule = new CustomModule();
await moduleManager.registerModule(customModule);
```

---

## Event Bus API

The EventBus enables communication between different parts of the system through a pub/sub pattern.

### EventBus Methods

```typescript
class EventBus {
  // Publishing events
  publish(eventName: string, data?: any): void;
  emit(eventName: string, data?: any): void;
  
  // Subscribing to events
  subscribe(eventName: string, callback: Function): Unsubscribe;
  on(eventName: string, callback: Function): Unsubscribe;
  once(eventName: string, callback: Function): Unsubscribe;
  
  // Unsubscribing
  unsubscribe(eventName: string, callback: Function): void;
  off(eventName: string, callback: Function): void;
  
  // Event introspection
  listeners(eventName: string): Function[];
  hasListeners(eventName: string): boolean;
}

type Unsubscribe = () => void;
```

### Publishing Events

```typescript
// Publish event with data
eventBus.publish('user:login', {
  userId: '123',
  username: 'john'
});

// Publish event without data
eventBus.publish('app:reload');

// Shorthand
eventBus.emit('data:updated', newData);
```

### Subscribing to Events

```typescript
// Standard subscription
const unsubscribe = eventBus.on('user:login', (data) => {
  console.log(`User logged in: ${data.username}`);
});

// Subscribe once
eventBus.once('app:initialized', () => {
  console.log('App is ready');
});

// Unsubscribe
unsubscribe();
// or
eventBus.off('user:login', callbackFunction);
```

### Common System Events

```typescript
// Engine lifecycle
eventBus.on('engine:started', () => {});
eventBus.on('engine:stopped', () => {});

// Path operations
eventBus.on('path:created', (path) => {});
eventBus.on('path:updated', (path) => {});
eventBus.on('path:deleted', (pathId) => {});

// Node operations
eventBus.on('node:created', (node) => {});
eventBus.on('node:selected', (node) => {});
eventBus.on('node:updated', (node) => {});
eventBus.on('node:deleted', (nodeId) => {});

// State changes
eventBus.on('state:updated', (state) => {});
eventBus.on('state:loaded', (state) => {});

// Module events
eventBus.on('module:initialized', (moduleName) => {});
eventBus.on('module:registered', (module) => {});

// Plugin events
eventBus.on('plugin:loaded', (plugin) => {});
eventBus.on('plugin:activated', (plugin) => {});
eventBus.on('plugin:selected', (plugin) => {});
```

### Example: Event-Driven Plugin

```typescript
export class MonitoringPlugin implements IPlugin {
  id = 'monitoring-plugin';
  name = 'Monitoring Plugin';
  class = PluginClass.Handler;
  version = '1.0.0';

  async initialize(pluginAPI: PluginAPI) {
    // Listen to path creation
    pluginAPI.onEvent('path:created', (path) => {
      console.log(`📌 Path created: ${path.name}`);
      this.logAnalytics('path_created', { path });
    });

    // Listen to state updates
    pluginAPI.onStateChanged((state) => {
      console.log(`📊 State updated. Paths: ${state.paths.length}`);
    });

    // Listen to node selection
    pluginAPI.onNodeSelected((node) => {
      console.log(`✓ Node selected: ${node.name}`);
      this.logAnalytics('node_selected', { nodeId: node.id });
    });
  }

  private logAnalytics(event: string, data: any) {
    // Send to analytics service
    console.log(`[Analytics] ${event}:`, data);
  }

  async render(props: PluginRenderProps): Promise<string> {
    return `<h2>Monitoring Plugin</h2><p>Ready</p>`;
  }
}
```

---

## Command System API

Commands are the primary way to perform actions in PATH#. Use the Command API to dispatch commands and create custom command handlers.

### Command Structure

```typescript
interface Command {
  name: string;
  params?: any;
  timestamp?: number;
  source?: string;
}

interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

type CommandHandler = (params: any, context: CommandContext) => Promise<CommandResult>;

interface CommandContext {
  engine: Engine;
  eventBus: EventBus;
  moduleManager: ModuleManager;
}
```

### Dispatching Commands

```typescript
// From within a plugin
const result = await pluginAPI.dispatchCommand('createPath', {
  name: 'New Path',
  description: 'Description',
  type: 'custom'
});

if (result.success) {
  console.log('Path created:', result.data);
} else {
  console.error('Failed:', result.error);
}
```

### Creating Custom Command Handlers

```typescript
// In your module or plugin
class MyModule implements IModule {
  name = 'my-module';
  
  async initialize(engine: Engine, eventBus: EventBus) {
    // Register custom command handler
    engine.onCommand('customAction', async (params) => {
      console.log('Custom action received:', params);
      
      // Process the command
      const result = {
        success: true,
        data: { processed: true }
      };
      
      // Emit event for other parts of the app
      eventBus.publish('customAction:completed', result);
      
      return result;
    });
  }
}
```

### Common Built-in Commands

```typescript
// Path commands
await pluginAPI.dispatchCommand('createPath', pathData);
await pluginAPI.dispatchCommand('updatePath', { pathId, updates });
await pluginAPI.dispatchCommand('deletePath', { pathId });
await pluginAPI.dispatchCommand('listPaths', { filter });

// Node commands
await pluginAPI.dispatchCommand('createNode', nodeData);
await pluginAPI.dispatchCommand('updateNode', { nodeId, updates });
await pluginAPI.dispatchCommand('deleteNode', { nodeId });
await pluginAPI.dispatchCommand('selectNode', { nodeId });

// State commands
await pluginAPI.dispatchCommand('loadState', { stateName });
await pluginAPI.dispatchCommand('saveState', { stateName });
await pluginAPI.dispatchCommand('resetState', {});
```

---

## Module Management API

Manage the lifecycle and discovery of modules in your application.

### ModuleManager Interface

```typescript
class ModuleManager {
  // Registration
  registerModule(module: IModule): Promise<void>;
  unregisterModule(moduleName: string): Promise<void>;
  
  // Discovery
  getModule(moduleName: string): IModule | null;
  getModules(): IModule[];
  hasModule(moduleName: string): boolean;
  
  // State management
  getModuleState(moduleName: string): any;
  setModuleState(moduleName: string, state: any): void;
}
```

### Using Module Manager

```typescript
// Register a module
const customModule = new CustomModule();
await engine.moduleManager.registerModule(customModule);

// Get a module
const pathsModule = engine.moduleManager.getModule('paths');

// List all modules
const allModules = engine.moduleManager.getModules();
console.log('Available modules:', allModules.map(m => m.name));

// Check if module exists
if (engine.moduleManager.hasModule('custom')) {
  console.log('Custom module is registered');
}

// Get module state
const state = engine.moduleManager.getModuleState('paths');
console.log('Paths module state:', state);
```

---

## Plugin System Lifecycle

### Plugin Initialization Flow

```
1. Plugin Definition (IPlugin interface)
   └─ id, name, version, class, etc.

2. Plugin Creation
   └─ new PluginClass()

3. Plugin Registration
   └─ pluginManager.registerPlugin(plugin)

4. Plugin Initialization
   └─ plugin.initialize(pluginAPI)

5. Plugin Selection (at startup)
   └─ user selects UI plugin

6. Plugin Activation
   └─ plugin.render() called in browser

7. Plugin Runtime
   └─ listens to events
   └─ dispatches commands
   └─ updates state
```

### IPlugin Interface

```typescript
interface IPlugin {
  // Identification
  id: string;
  name: string;
  version: string;
  class: PluginClass;
  description?: string;
  author?: string;

  // Lifecycle
  initialize(pluginAPI: PluginAPI): Promise<void>;
  
  // Rendering
  render(props: PluginRenderProps): Promise<string>;
  
  // Optional
  dispose?(): Promise<void>;
}

enum PluginClass {
  UI = 'UI',
  Theme = 'THEME',
  Handler = 'HANDLER',
  Visualization = 'VISUALIZATION',
  Custom = 'CUSTOM'
}

interface PluginRenderProps {
  state: AppState;
  pluginAPI: PluginAPI;
}
```

### Creating a Complete Plugin

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class MyUIPlugin implements IPlugin {
  id = 'my-ui-plugin';
  name = 'My Custom UI';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'A custom user interface for PATH#';
  author = 'Your Name';

  private pluginAPI: PluginAPI;
  private eventUnsubscribe: (() => void)[] = [];

  async initialize(pluginAPI: PluginAPI) {
    console.log(`[${this.name}] Initializing...`);
    this.pluginAPI = pluginAPI;

    // Listen to state changes
    this.pluginAPI.onStateChanged((state) => {
      console.log(`[${this.name}] App state changed`);
      // Re-render if needed
    });

    // Listen to node selection
    this.pluginAPI.onNodeSelected((node) => {
      console.log(`[${this.name}] Node selected: ${node.name}`);
    });

    console.log(`[${this.name}] Ready`);
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    
    return `
      <div style="padding: 20px;">
        <h1>My Custom UI</h1>
        <p>Paths: ${state.paths.length}</p>
        <button onclick="createNewPath()">Create Path</button>
      </div>
      
      <script>
        async function createNewPath() {
          // Access pluginAPI from window scope
          const pluginAPI = window.__pluginAPI__;
          await pluginAPI.createPath({
            name: 'New Path',
            description: 'Created from my UI'
          });
        }
      </script>
    `;
  }

  async dispose() {
    console.log(`[${this.name}] Disposing...`);
    // Clean up event listeners
    this.eventUnsubscribe.forEach(fn => fn());
  }
}
```

---

## Best Practices

### 1. Error Handling

Always handle errors in async operations:

```typescript
try {
  const path = await pluginAPI.createPath({ name: 'Test' });
  console.log('Path created:', path);
} catch (error) {
  console.error('Failed to create path:', error);
  // Show error to user
}
```

### 2. Event Cleanup

Unsubscribe from events when plugin is disposed:

```typescript
class MyPlugin implements IPlugin {
  private unsubscribers: (() => void)[] = [];

  async initialize(pluginAPI: PluginAPI) {
    const unsub1 = pluginAPI.onStateChanged(...);
    const unsub2 = pluginAPI.onNodeSelected(...);
    
    this.unsubscribers.push(unsub1, unsub2);
  }

  async dispose() {
    this.unsubscribers.forEach(fn => fn());
  }
}
```

### 3. Performance

Cache state when possible:

```typescript
async render(props: PluginRenderProps) {
  // Access state from props (already cached)
  const { state } = props;
  
  // Don't call pluginAPI.getState() repeatedly
  // It's better to use onStateChanged for updates
}
```

### 4. Security

Always validate data from external sources:

```typescript
const input = userInput.trim();
if (!input || input.length > 255) {
  console.error('Invalid input');
  return;
}

await pluginAPI.createPath({
  name: input,
  description: 'User input'
});
```

### 5. Logging

Use consistent logging patterns:

```typescript
console.log(`[MyPlugin] Operation completed successfully`);
console.warn(`[MyPlugin] Warning: potential issue detected`);
console.error(`[MyPlugin] Error: failed to process`);
```

---

## API Response Examples

### GET /api/plugins/available (with filter)

**Request**:
```
GET /api/plugins/available?class=UI
```

**Response**:
```json
{
  "plugins": [
    {
      "id": "simple-plugin",
      "name": "Simple Plugin",
      "class": "UI",
      "version": "1.0.0",
      "description": "A simple UI plugin",
      "author": "PATH# Team",
      "isSelected": false
    },
    {
      "id": "animated-plugin",
      "name": "Animated Dashboard",
      "class": "UI",
      "version": "1.0.0",
      "description": "Dashboard with animations",
      "author": "PATH# Team",
      "isSelected": false
    }
  ]
}
```

### POST /api/plugins/select/:id

**Request**:
```json
POST /api/plugins/select/simple-plugin
Content-Type: application/json

{}
```

**Response**:
```json
{
  "success": true,
  "message": "Plugin selected",
  "selectedPluginId": "simple-plugin",
  "plugin": {
    "id": "simple-plugin",
    "name": "Simple Plugin",
    "class": "UI"
  }
}
```

### GET /api/state

**Response**:
```json
{
  "paths": [
    {
      "id": "path-1",
      "name": "My First Path",
      "description": "A test path",
      "nodes": [
        {
          "id": "node-1",
          "name": "Start",
          "description": "Starting point"
        }
      ]
    }
  ],
  "selectedNode": {
    "id": "node-1",
    "name": "Start"
  },
  "modules": {
    "paths": { ... },
    "home": { ... },
    "nodes": { ... }
  },
  "timestamp": 1674302400000
}
```

---

## Related Documentation

- [PLUGIN_CLASS_SYSTEM.md](PLUGIN_CLASS_SYSTEM.md) - Plugin classification system
- [PLUGIN_CLASS_IMPLEMENTATION.md](PLUGIN_CLASS_IMPLEMENTATION.md) - Implementation details
- [PLUGIN_DEVELOPMENT_GUIDE.md](PLUGIN_DEVELOPMENT_GUIDE.md) - Step-by-step plugin creation
- [MODULE_DEVELOPMENT_GUIDE.md](MODULE_DEVELOPMENT_GUIDE.md) - Creating custom modules
- [VISUAL_CONSTRUCTOR_INTEGRATION.md](VISUAL_CONSTRUCTOR_INTEGRATION.md) - Visual builder integration

---

## Support

For questions or issues with the API:
1. Check the examples in this documentation
2. Review working plugins in `plugins/extensions/src/examplePlugins.ts`
3. Check the TypeScript types in `plugins/extensions/src/interfaces.ts`

**Last Updated**: January 29, 2024
**Version**: 1.0.0
