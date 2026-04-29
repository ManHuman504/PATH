# Visual Constructor Integration Guide

> 🎨 Architecture for integrating visual interface constructor into PATH# plugins

## Overview

This guide explains how to integrate a visual constructor (like Figma's design builder) into PATH# plugins. The visual constructor allows users to:

- Drag and drop UI components
- Configure properties visually
- Generate HTML/CSS code automatically
- Save designs as plugin templates
- Test designs in real-time

---

## Architecture

### System Overview

```
User Interface Layer
    ↓
Visual Constructor Plugin (UI Class)
    ↓
PluginAPI (Safe Access Layer)
    ↓
Core Systems
├─ Engine (State Management)
├─ EventBus (Event Handling)
├─ ModuleManager (Module Access)
└─ CommandBus (Command Dispatch)
```

### Data Flow

```
1. User opens Visual Constructor Plugin
   └─ Plugin renders design canvas

2. User drags components onto canvas
   └─ Constructor stores component tree in memory

3. User configures component properties
   └─ Constructor updates component metadata

4. User generates code
   └─ Constructor converts component tree → HTML/CSS/JS

5. User saves design
   └─ Constructor sends to PluginAPI
   └─ PluginAPI dispatches 'design:saved' command
   └─ Core system stores design template

6. Design can be used as plugin template
   └─ Other plugins can load and instantiate designs
```

---

## Phase 1: Basic Visual Constructor Plugin

### Component Tree Structure

```typescript
interface DesignComponent {
  id: string;                    // Unique identifier
  type: 'container' | 'button' | 'input' | 'text' | 'image' | 'custom';
  name: string;                  // User-friendly name
  props: ComponentProps;          // Component properties
  children: DesignComponent[];   // Nested components
  style: CSSProperties;          // CSS styling
}

interface ComponentProps {
  text?: string;
  placeholder?: string;
  value?: string;
  onClick?: string;              // Function reference
  className?: string;
  [key: string]: any;
}
```

### Constructor Plugin Template

```typescript
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class VisualConstructorPlugin implements IPlugin {
  id = 'visual-constructor';
  name = 'Visual Constructor';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Visual UI builder with drag-and-drop interface';
  author = 'PATH# Team';

  private pluginAPI: PluginAPI;
  private componentTree: DesignComponent[] = [];
  private selectedComponent: DesignComponent | null = null;
  private isDragging = false;

  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;
    console.log('[Visual Constructor] Initialized');

    // Listen for design requests from other plugins
    this.pluginAPI.onEvent('design:request', (data) => {
      this.handleDesignRequest(data);
    });

    // Listen for component library updates
    this.pluginAPI.onEvent('library:updated', () => {
      this.refreshComponentLibrary();
    });
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;

    return `
      <div id="visual-constructor" style="${this.getContainerStyles()}">
        
        <!-- Header -->
        <div style="${this.getHeaderStyles()}">
          <h2>Visual Constructor</h2>
          <div style="display: flex; gap: 10px;">
            <button onclick="generateCode()" 
              style="${this.getButtonStyles()}">
              📋 Generate Code
            </button>
            <button onclick="saveDesign()" 
              style="${this.getButtonStyles()}">
              💾 Save Design
            </button>
            <button onclick="previewDesign()" 
              style="${this.getButtonStyles()}">
              👁️ Preview
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 200px 1fr 300px; height: 100%; gap: 10px;">
          
          <!-- Component Library -->
          <div style="${this.getLibraryStyles()}">
            <h3>Components</h3>
            <div id="component-library">
              ${this.renderComponentLibrary()}
            </div>
          </div>

          <!-- Canvas Area -->
          <div 
            id="canvas" 
            style="${this.getCanvasStyles()}"
            ondrop="handleDrop(event)"
            ondragover="event.preventDefault()"
          >
            <div style="color: #999; text-align: center; padding: 20px;">
              Drag components here to build your UI
            </div>
            ${this.renderCanvas()}
          </div>

          <!-- Properties Panel -->
          <div style="${this.getPropertiesPanelStyles()}">
            <h3>Properties</h3>
            <div id="properties-panel">
              ${this.renderPropertiesPanel()}
            </div>
          </div>

        </div>
      </div>

      <script>
        // Make pluginAPI available globally for this plugin
        window.__constructor__ = {
          pluginAPI: window.__pluginAPI__,
          componentTree: [],
          selectedComponent: null
        };

        function generateCode() {
          const code = window.__constructor__.generateCode();
          console.log('Generated Code:');
          console.log(code);
          alert('Code generated! Check console.');
        }

        function saveDesign() {
          const design = window.__constructor__.componentTree;
          console.log('Saving design:', design);
          alert('Design saved!');
        }

        function previewDesign() {
          const html = window.__constructor__.renderHTML();
          const previewWindow = window.open();
          previewWindow.document.write(html);
        }

        function handleDrop(event) {
          event.preventDefault();
          const componentType = event.dataTransfer.getData('componentType');
          console.log('Dropped component:', componentType);
          // Add component to canvas
        }

        function selectComponent(componentId) {
          const comp = window.__constructor__.findComponent(componentId);
          window.__constructor__.selectedComponent = comp;
          console.log('Selected:', comp);
          // Update properties panel
        }
      </script>
    `;
  }

  private renderComponentLibrary(): string {
    const components = [
      { type: 'container', icon: '📦', label: 'Container' },
      { type: 'button', icon: '🔘', label: 'Button' },
      { type: 'input', icon: '⌨️', label: 'Input' },
      { type: 'text', icon: '📝', label: 'Text' },
      { type: 'image', icon: '🖼️', label: 'Image' },
    ];

    return components.map(comp => `
      <div 
        draggable="true"
        ondragstart="event.dataTransfer.setData('componentType', '${comp.type}')"
        style="
          padding: 10px;
          margin: 5px 0;
          background: #f0f0f0;
          border-radius: 4px;
          cursor: move;
          user-select: none;
        "
      >
        ${comp.icon} ${comp.label}
      </div>
    `).join('');
  }

  private renderCanvas(): string {
    // Render the visual components on canvas
    if (this.componentTree.length === 0) {
      return '';
    }

    return this.componentTree
      .map((comp, idx) => this.renderComponent(comp, idx))
      .join('');
  }

  private renderComponent(comp: DesignComponent, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    
    switch (comp.type) {
      case 'container':
        return `
          <div 
            data-component-id="${comp.id}"
            onclick="selectComponent('${comp.id}')"
            style="
              ${this.stylesToCSS(comp.style)}
              border: 1px dashed #ccc;
              padding: 10px;
              min-height: 50px;
            "
          >
            ${comp.children.map((c, i) => this.renderComponent(c, depth + 1)).join('')}
          </div>
        `;
      
      case 'button':
        return `
          <button 
            data-component-id="${comp.id}"
            onclick="selectComponent('${comp.id}')"
            style="${this.stylesToCSS(comp.style)}"
          >
            ${comp.props.text || 'Button'}
          </button>
        `;
      
      case 'input':
        return `
          <input 
            type="text"
            data-component-id="${comp.id}"
            onclick="selectComponent('${comp.id}')"
            placeholder="${comp.props.placeholder || 'Enter text'}"
            style="${this.stylesToCSS(comp.style)}"
          />
        `;
      
      case 'text':
        return `
          <p 
            data-component-id="${comp.id}"
            onclick="selectComponent('${comp.id}')"
            style="${this.stylesToCSS(comp.style)}"
          >
            ${comp.props.text || 'Text'}
          </p>
        `;
      
      default:
        return '';
    }
  }

  private renderPropertiesPanel(): string {
    if (!this.selectedComponent) {
      return '<p style="color: #999;">Select a component to edit</p>';
    }

    const comp = this.selectedComponent;

    return `
      <div style="font-size: 12px;">
        <div style="margin: 10px 0;">
          <label>Type:</label>
          <input type="text" value="${comp.type}" disabled style="width: 100%; padding: 4px;" />
        </div>

        <div style="margin: 10px 0;">
          <label>Name:</label>
          <input 
            type="text" 
            value="${comp.name}"
            onchange="updateComponentName(this.value)"
            style="width: 100%; padding: 4px;"
          />
        </div>

        ${comp.type === 'button' ? `
          <div style="margin: 10px 0;">
            <label>Text:</label>
            <input 
              type="text" 
              value="${comp.props.text || ''}"
              onchange="updateComponentProp('text', this.value)"
              style="width: 100%; padding: 4px;"
            />
          </div>
        ` : ''}

        ${comp.type === 'input' ? `
          <div style="margin: 10px 0;">
            <label>Placeholder:</label>
            <input 
              type="text"
              value="${comp.props.placeholder || ''}"
              onchange="updateComponentProp('placeholder', this.value)"
              style="width: 100%; padding: 4px;"
            />
          </div>
        ` : ''}

        <div style="margin: 10px 0;">
          <label>Width:</label>
          <input 
            type="text"
            value="${comp.style.width || '100%'}"
            onchange="updateComponentStyle('width', this.value)"
            style="width: 100%; padding: 4px;"
            placeholder="e.g., 100%, 200px"
          />
        </div>

        <div style="margin: 10px 0;">
          <label>Height:</label>
          <input 
            type="text"
            value="${comp.style.height || 'auto'}"
            onchange="updateComponentStyle('height', this.value)"
            style="width: 100%; padding: 4px;"
            placeholder="e.g., auto, 50px"
          />
        </div>

        <button 
          onclick="deleteComponent('${comp.id}')"
          style="
            width: 100%;
            padding: 8px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
          "
        >
          🗑️ Delete Component
        </button>
      </div>
    `;
  }

  // Code Generation
  private generateCode(): string {
    const html = this.generateHTML(this.componentTree);
    const css = this.generateCSS(this.componentTree);
    const js = this.generateJavaScript();

    return `
<!-- HTML -->
${html}

<!-- CSS -->
<style>
${css}
</style>

<!-- JavaScript -->
<script>
${js}
</script>
    `;
  }

  private generateHTML(components: DesignComponent[]): string {
    return components.map(comp => this.componentToHTML(comp)).join('');
  }

  private componentToHTML(comp: DesignComponent, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const classStr = comp.props.className ? ` class="${comp.props.className}"` : '';
    const styleStr = Object.entries(comp.style)
      .map(([k, v]) => `${this.camelToKebab(k)}: ${v}`)
      .join('; ');
    const style = styleStr ? ` style="${styleStr}"` : '';

    switch (comp.type) {
      case 'container':
        return `${indent}<div${classStr}${style}>
${comp.children.map((c, i) => this.componentToHTML(c, depth + 1)).join('\n')}
${indent}</div>`;
      
      case 'button':
        return `${indent}<button${classStr}${style}>${comp.props.text || 'Button'}</button>`;
      
      case 'input':
        return `${indent}<input type="text" placeholder="${comp.props.placeholder || ''}"${classStr}${style} />`;
      
      case 'text':
        return `${indent}<p${classStr}${style}>${comp.props.text || 'Text'}</p>`;
      
      default:
        return '';
    }
  }

  private generateCSS(components: DesignComponent[]): string {
    // Extract unique styles and generate CSS classes
    return `
      /* Generated CSS */
      div { box-sizing: border-box; }
      button { padding: 10px 20px; cursor: pointer; }
      input { padding: 8px; border: 1px solid #ccc; }
    `;
  }

  private generateJavaScript(): string {
    return `
      console.log('Component initialized');
      // Add event handlers here
    `;
  }

  // Style helpers
  private stylesToCSS(style: any): string {
    return Object.entries(style)
      .map(([k, v]) => `${this.camelToKebab(k)}: ${v};`)
      .join('');
  }

  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  // Style definitions
  private getContainerStyles(): string {
    return `
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    `;
  }

  private getHeaderStyles(): string {
    return `
      background: white;
      padding: 15px 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
  }

  private getLibraryStyles(): string {
    return `
      background: white;
      border-right: 1px solid #e0e0e0;
      padding: 10px;
      overflow-y: auto;
    `;
  }

  private getCanvasStyles(): string {
    return `
      background: white;
      border: 1px solid #e0e0e0;
      overflow: auto;
      padding: 20px;
    `;
  }

  private getPropertiesPanelStyles(): string {
    return `
      background: white;
      border-left: 1px solid #e0e0e0;
      padding: 10px;
      overflow-y: auto;
      font-size: 13px;
    `;
  }

  private getButtonStyles(): string {
    return `
      padding: 8px 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
  }

  private handleDesignRequest(data: any) {
    console.log('[Visual Constructor] Design request:', data);
  }

  private refreshComponentLibrary() {
    console.log('[Visual Constructor] Component library updated');
  }
}

export default VisualConstructorPlugin;
```

---

## Phase 2: Saving Designs as Templates

### Saving to PluginAPI

```typescript
async saveDesign(name: string, description: string) {
  try {
    const design = {
      id: `design-${Date.now()}`,
      name: name,
      description: description,
      componentTree: this.componentTree,
      generatedCode: this.generateCode(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save through PluginAPI
    await this.pluginAPI.dispatchCommand('design:save', {
      design: design
    });

    console.log('[Visual Constructor] Design saved:', design.id);
    
    // Emit event for other plugins
    this.pluginAPI.onEvent('design:saved', {
      designId: design.id,
      name: design.name
    });

  } catch (error) {
    console.error('[Visual Constructor] Failed to save design:', error);
  }
}
```

### Loading Saved Designs

```typescript
async loadDesign(designId: string) {
  try {
    const state = this.pluginAPI.getState();
    
    // Look for saved design in module state
    const designsModule = this.pluginAPI.getModule('designs');
    if (!designsModule) {
      console.warn('[Visual Constructor] Designs module not available');
      return;
    }

    const designState = this.pluginAPI.getModuleState('designs');
    const design = designState.designs?.find((d: any) => d.id === designId);

    if (!design) {
      throw new Error(`Design not found: ${designId}`);
    }

    // Load design into constructor
    this.componentTree = design.componentTree;
    console.log('[Visual Constructor] Design loaded:', designId);

  } catch (error) {
    console.error('[Visual Constructor] Failed to load design:', error);
  }
}
```

---

## Phase 3: Exporting Designs as Plugins

Once a design is saved, it can be exported as a standalone plugin:

```typescript
// ExportPlugin class
class DesignExporterPlugin implements IPlugin {
  id = 'design-exporter';
  name = 'Design Exporter';
  version = '1.0.0';
  class = PluginClass.Handler;

  async initialize(pluginAPI: PluginAPI) {
    // Listen for design export requests
    pluginAPI.onEvent('design:export', (designId) => {
      this.exportDesign(designId);
    });
  }

  async exportDesign(designId: string) {
    // Generate a new plugin file from design
    const code = `
import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from '@path/extensions';

export class ExportedDesignPlugin implements IPlugin {
  id = '${designId}';
  name = 'Design: ${designId}';
  version = '1.0.0';
  class = PluginClass.UI;

  async initialize(pluginAPI: PluginAPI) {
    console.log('Design plugin loaded');
  }

  async render(props: PluginRenderProps): Promise<string> {
    return \`
      <!-- GENERATED CODE FROM VISUAL CONSTRUCTOR -->
    \`;
  }
}

export default ExportedDesignPlugin;
    `;

    console.log('Generated plugin code:', code);
    // Download as file or save to storage
  }

  async render(props: PluginRenderProps): Promise<string> {
    return '<p>Design Exporter ready</p>';
  }
}
```

---

## Integration Workflow

### Step 1: Enable Visual Constructor Plugin

1. User navigates to http://localhost:3000
2. Selects "Visual Constructor" from plugin list
3. Constructor UI loads with blank canvas

### Step 2: Design Interface

1. User drags components from library onto canvas
2. Selects components to edit properties
3. Builds complete UI visually

### Step 3: Generate Code

1. User clicks "Generate Code"
2. Constructor outputs HTML/CSS/JavaScript
3. Code can be copied to clipboard

### Step 4: Save Design

1. User clicks "Save Design"
2. Design is stored in application state
3. Can be loaded again later

### Step 5: Export as Plugin

1. User clicks "Export as Plugin"
2. Constructor generates plugin file
3. Plugin can be added to extensions

---

## API Integration Points

### Commands for Constructor

```typescript
// Save design
await pluginAPI.dispatchCommand('design:save', { design });

// Load design
await pluginAPI.dispatchCommand('design:load', { designId });

// Export as plugin
await pluginAPI.dispatchCommand('design:export', { designId });

// Delete design
await pluginAPI.dispatchCommand('design:delete', { designId });
```

### Events from Constructor

```typescript
// When design is created
eventBus.on('design:created', (design) => {});

// When design is updated
eventBus.on('design:updated', (design) => {});

// When design is saved
eventBus.on('design:saved', (designId) => {});

// When design is exported
eventBus.on('design:exported', (pluginCode) => {});
```

---

## Benefits of This Architecture

1. **Modularity** - Constructor is just another plugin
2. **Extensibility** - Can add new component types easily
3. **Reusability** - Designs can be shared as plugins
4. **Safety** - PluginAPI isolates constructor from core
5. **Persistence** - Designs saved through command system
6. **Integration** - Works with existing module system

---

## Next Steps

1. Implement `DesignModule` to store designs
2. Create `ComponentLibraryPlugin` for component management
3. Add advanced styling options (gradients, shadows, etc.)
4. Create design templates gallery
5. Add real-time collaboration features
6. Integrate with design versioning system

---

## Related Documentation

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [PLUGIN_DEVELOPMENT_GUIDE.md](PLUGIN_DEVELOPMENT_GUIDE.md) - Plugin creation
- [PLUGIN_CLASS_SYSTEM.md](PLUGIN_CLASS_SYSTEM.md) - Plugin classification

---

**Last Updated**: January 29, 2024
**Version**: 1.0.0
