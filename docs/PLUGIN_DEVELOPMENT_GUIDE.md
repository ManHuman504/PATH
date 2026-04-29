# Plugin Development Guide

> 🎨 Step-by-step guide to creating custom plugins for PATH#

## Table of Contents

- [Quick Start](#quick-start)
- [Basic Plugin Structure](#basic-plugin-structure)
- [Plugin Templates](#plugin-templates)
- [Common Patterns](#common-patterns)
- [Testing Your Plugin](#testing-your-plugin)
- [Publishing Your Plugin](#publishing-your-plugin)

---

## Quick Start

### 1. Create a Basic UI Plugin

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class MyFirstPlugin implements IPlugin {
  // Identification
  id = 'my-first-plugin';
  name = 'My First Plugin';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'My first custom plugin';
  author = 'Your Name';

  private pluginAPI: PluginAPI;

  // Initialize when plugin is loaded
  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;
    console.log('[MyFirstPlugin] Initialized');
  }

  // Render the UI
  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;

    return `
      <div style="padding: 20px; font-family: Arial;">
        <h1>Welcome to My Plugin</h1>
        <p>Total paths: ${state.paths.length}</p>
      </div>
    `;
  }
}

export default MyFirstPlugin;
```

### 2. Register Your Plugin

Add to `packages/extensions/src/examplePlugins.ts`:

```typescript
import MyFirstPlugin from './myFirstPlugin';

// In the initialization code:
const myFirstPlugin = new MyFirstPlugin();
pluginManager.registerPlugin(myFirstPlugin);
```

### 3. Test It

1. Run `npm run dev`
2. Open http://localhost:3000
3. Select your plugin from the UI interface
4. Your plugin should render!

---

## Basic Plugin Structure

### Minimal Plugin

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class MinimalPlugin implements IPlugin {
  id = 'minimal-plugin';
  name = 'Minimal Plugin';
  version = '1.0.0';
  class = PluginClass.UI;

  async initialize(pluginAPI: PluginAPI) {
    // Nothing needed here for basic plugin
  }

  async render(props: PluginRenderProps): Promise<string> {
    return '<h1>Hello World</h1>';
  }
}

export default MinimalPlugin;
```

### Complete Plugin with Features

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class CompletePlugin implements IPlugin {
  // 1. Identification (required)
  id = 'complete-plugin';
  name = 'Complete Plugin';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'A complete example plugin';
  author = 'Your Name';

  // 2. Private properties
  private pluginAPI: PluginAPI;
  private eventListeners: (() => void)[] = [];

  // 3. Initialize (required)
  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;

    // Set up event listeners
    this.eventListeners.push(
      this.pluginAPI.onStateChanged(() => this.onStateChanged())
    );

    console.log(`[${this.name}] Initialized`);
  }

  // 4. Lifecycle hooks (optional)
  async dispose() {
    // Clean up
    this.eventListeners.forEach(fn => fn());
    console.log(`[${this.name}] Disposed`);
  }

  // 5. Render method (required)
  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    return this.buildHTML(state);
  }

  // 6. Private helper methods
  private buildHTML(state: any): string {
    return `
      <div style="padding: 20px;">
        <h1>${this.name}</h1>
        <p>Paths: ${state.paths.length}</p>
      </div>
    `;
  }

  private onStateChanged() {
    console.log(`[${this.name}] State changed`);
    // Update UI, refresh data, etc.
  }
}

export default CompletePlugin;
```

---

## Plugin Templates

### Template 1: Simple UI Plugin

Use this for creating a basic interface:

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class SimpleUITemplate implements IPlugin {
  id = 'simple-ui-template';
  name = 'Simple UI Template';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Template for creating simple UIs';

  private pluginAPI: PluginAPI;

  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;

    const pathsHTML = state.paths
      .map(path => `<li>${path.name}</li>`)
      .join('');

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 20px;
        max-width: 800px;
      ">
        <h1>Paths</h1>
        <ul>${pathsHTML}</ul>
      </div>
    `;
  }
}

export default SimpleUITemplate;
```

### Template 2: Interactive Plugin with State

Use this for plugins that respond to user actions:

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class InteractiveTemplate implements IPlugin {
  id = 'interactive-template';
  name = 'Interactive Template';
  version = '1.0.0';
  class = PluginClass.UI;

  private pluginAPI: PluginAPI;
  private localState = { pathName: '' };

  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;

    // Listen for state changes from other parts of app
    this.pluginAPI.onPathCreated((path) => {
      console.log('Path created:', path.name);
      // Update UI
    });
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;

    return `
      <div style="padding: 20px;">
        <h1>Create New Path</h1>
        
        <input 
          type="text" 
          id="pathName" 
          placeholder="Path name"
          style="padding: 8px; margin: 10px 0; width: 100%; max-width: 300px;"
        />
        
        <button 
          onclick="createPath()"
          style="
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          Create Path
        </button>

        <hr />

        <h2>Existing Paths (${state.paths.length})</h2>
        <ul>
          ${state.paths.map(p => `<li>${p.name}</li>`).join('')}
        </ul>
      </div>

      <script>
        async function createPath() {
          const input = document.getElementById('pathName');
          const name = input.value.trim();

          if (!name) {
            alert('Please enter a path name');
            return;
          }

          try {
            const pluginAPI = window.__pluginAPI__;
            await pluginAPI.createPath({
              name: name,
              description: 'Created from interactive plugin'
            });
            input.value = '';
            console.log('Path created successfully');
          } catch (error) {
            console.error('Failed to create path:', error);
            alert('Error: ' + error.message);
          }
        }
      </script>
    `;
  }
}

export default InteractiveTemplate;
```

### Template 3: Data Visualization Plugin

Use this for displaying data in charts or graphs:

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class VisualizationTemplate implements IPlugin {
  id = 'visualization-template';
  name = 'Visualization Template';
  version = '1.0.0';
  class = PluginClass.Visualization;

  private pluginAPI: PluginAPI;

  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const pathCount = state.paths.length;
    const nodeCount = state.paths.reduce((total, path) => {
      return total + (path.nodes?.length || 0);
    }, 0);

    return `
      <div style="padding: 20px;">
        <h1>Statistics</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          ">
            <div style="font-size: 32px; font-weight: bold;">${pathCount}</div>
            <div>Paths</div>
          </div>

          <div style="
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          ">
            <div style="font-size: 32px; font-weight: bold;">${nodeCount}</div>
            <div>Nodes</div>
          </div>
        </div>
      </div>
    `;
  }
}

export default VisualizationTemplate;
```

### Template 4: Handler Plugin

Use this for background operations (don't render UI):

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class HandlerTemplate implements IPlugin {
  id = 'handler-template';
  name = 'Handler Template';
  version = '1.0.0';
  class = PluginClass.Handler;
  description = 'A handler plugin for background tasks';

  private pluginAPI: PluginAPI;

  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;

    // Set up background event handlers
    this.pluginAPI.onPathCreated((path) => {
      this.handlePathCreated(path);
    });

    this.pluginAPI.onStateChanged((state) => {
      this.handleStateChanged(state);
    });
  }

  async render(props: PluginRenderProps): Promise<string> {
    // Handler plugins might not have UI
    // But they can still return HTML if needed
    return `
      <div style="padding: 20px;">
        <h1>Handler Plugin Active</h1>
        <p>This plugin is running in the background</p>
      </div>
    `;
  }

  private handlePathCreated(path: any) {
    console.log(`[Handler] Path created: ${path.name}`);
    // Perform some action
    // Send notification, log to analytics, etc.
  }

  private handleStateChanged(state: any) {
    console.log(`[Handler] State changed. Paths: ${state.paths.length}`);
    // React to state changes
  }
}

export default HandlerTemplate;
```

---

## Common Patterns

### Pattern 1: Accessing Application State

```typescript
async render(props: PluginRenderProps): Promise<string> {
  const { state, pluginAPI } = props;

  // From render props (recommended - already cached)
  console.log('Paths:', state.paths);
  console.log('Selected node:', state.selectedNode);

  // From pluginAPI (for use in event handlers)
  const pathCount = pluginAPI.getPathCount();
  const allPaths = pluginAPI.getPaths();

  return `<p>Paths: ${pathCount}</p>`;
}
```

### Pattern 2: Listening to Events

```typescript
async initialize(pluginAPI: PluginAPI) {
  this.pluginAPI = pluginAPI;

  // Listen to state changes
  const unsub1 = pluginAPI.onStateChanged((state) => {
    console.log('State changed');
    // Refresh UI
  });

  // Listen to node selection
  const unsub2 = pluginAPI.onNodeSelected((node) => {
    console.log('Selected:', node.name);
  });

  // Listen to path creation
  const unsub3 = pluginAPI.onPathCreated((path) => {
    console.log('Path created:', path.name);
  });

  // Store unsubscribers for cleanup
  this.unsubscribers = [unsub1, unsub2, unsub3];
}

async dispose() {
  // Clean up all listeners
  this.unsubscribers.forEach(fn => fn());
}
```

### Pattern 3: Dispatching Commands

```typescript
async handleCreatePath() {
  try {
    const path = await this.pluginAPI.createPath({
      name: 'New Path',
      description: 'Created by plugin',
      type: 'custom',
      color: '#3498db'
    });

    console.log('Path created:', path.id);
    // Update UI or show success message
  } catch (error) {
    console.error('Failed to create path:', error);
    // Show error to user
  }
}
```

### Pattern 4: Working with Modules

```typescript
async initialize(pluginAPI: PluginAPI) {
  this.pluginAPI = pluginAPI;

  // Get a specific module
  const pathsModule = pluginAPI.getModule('paths');
  if (pathsModule) {
    console.log('Paths module available');
  }

  // Get all modules
  const modules = pluginAPI.listModules();
  modules.forEach(m => {
    console.log('Module:', m.name);
  });
}
```

### Pattern 5: Custom Events

```typescript
async initialize(pluginAPI: PluginAPI) {
  this.pluginAPI = pluginAPI;

  // Listen to any custom event
  pluginAPI.onEvent('custom:myEvent', (data) => {
    console.log('Custom event received:', data);
  });
}
```

---

## Testing Your Plugin

### Manual Testing

1. **Add to example plugins**:

```typescript
// In packages/extensions/src/examplePlugins.ts
import MyNewPlugin from './myNewPlugin';

export { MyNewPlugin };
```

2. **Register in server.ts**:

```typescript
import { MyNewPlugin } from '@path/extensions';

// In initializeModules():
const myNewPlugin = new MyNewPlugin();
await pluginManager.registerPlugin(myNewPlugin);
```

3. **Test in browser**:
   - Run `npm run dev`
   - Open http://localhost:3000
   - Select your plugin
   - Check browser console for logs

### API Testing

Test your plugin's API usage:

```typescript
// Test file: test-my-plugin.ts
import { MyNewPlugin } from '@path/extensions';
import { PluginAPI } from '@path/extensions';

async function testPlugin() {
  const plugin = new MyNewPlugin();
  // Can't test without full Engine/EventBus setup
  // Use manual testing in browser instead
}
```

### Browser Console Testing

Once your plugin is loaded in the browser:

```javascript
// In browser console (plugin must be loaded)
const pluginAPI = window.__pluginAPI__;

// Test API calls
pluginAPI.getPathCount();  // Should return number
pluginAPI.getCurrentNode();  // Should return Node or null
pluginAPI.getPaths();  // Should return array

// Test commands
await pluginAPI.createPath({ name: 'Test' });

// Test events
pluginAPI.onStateChanged((state) => {
  console.log('State:', state);
});
```

---

## Plugin Checklist

Before publishing your plugin:

- [ ] Plugin has unique `id`
- [ ] Plugin implements `IPlugin` interface
- [ ] Plugin has `initialize()` method
- [ ] Plugin has `render()` method
- [ ] Plugin properly cleans up in `dispose()`
- [ ] TypeScript compiles without errors
- [ ] All event listeners are unsubscribed
- [ ] Error handling for async operations
- [ ] Logging with consistent format: `[PluginName]`
- [ ] HTML is properly escaped (if rendering user input)
- [ ] CSS styles are scoped (use inline styles or namespaced classes)
- [ ] Documentation included in plugin

---

## Common Mistakes to Avoid

### ❌ Not cleaning up event listeners

```typescript
// BAD
async initialize(pluginAPI: PluginAPI) {
  pluginAPI.onStateChanged(() => {
    // Memory leak if not unsubscribed
  });
}
```

### ✅ Properly unsubscribe

```typescript
// GOOD
private unsubscribers: (() => void)[] = [];

async initialize(pluginAPI: PluginAPI) {
  this.unsubscribers.push(
    pluginAPI.onStateChanged(() => { ... })
  );
}

async dispose() {
  this.unsubscribers.forEach(fn => fn());
}
```

---

### ❌ Not handling errors

```typescript
// BAD
async createPath() {
  await this.pluginAPI.createPath({ name: 'Test' });  // What if it fails?
}
```

### ✅ Handle errors properly

```typescript
// GOOD
async createPath() {
  try {
    await this.pluginAPI.createPath({ name: 'Test' });
    console.log('[MyPlugin] Path created');
  } catch (error) {
    console.error('[MyPlugin] Failed to create path:', error);
    // Show error to user
  }
}
```

---

### ❌ Hardcoding HTML without escaping

```typescript
// BAD
const userInput = '<img src=x onerror="alert(1)">';
return `<div>${userInput}</div>`;  // XSS vulnerability!
```

### ✅ Escape or sanitize input

```typescript
// GOOD
const userInput = '<img src=x onerror="alert(1)">';
const escaped = document.createElement('div');
escaped.textContent = userInput;
return `<div>${escaped.innerHTML}</div>`;
```

---

## Related Documentation

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [PLUGIN_CLASS_SYSTEM.md](PLUGIN_CLASS_SYSTEM.md) - Plugin classification
- [MODULE_DEVELOPMENT_GUIDE.md](MODULE_DEVELOPMENT_GUIDE.md) - Creating modules
- [examplePlugins.ts](../packages/extensions/src/examplePlugins.ts) - Working examples

---

**Last Updated**: January 29, 2024
**Version**: 1.0.0
