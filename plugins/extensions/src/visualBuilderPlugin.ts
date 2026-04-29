import { IPlugin, PluginClass, PluginRenderProps } from './pluginSystem';

export class VisualBuilderPlugin implements IPlugin {
  id = 'visual-builder-plugin';
  name = 'Visual UI Builder';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Drag-and-drop builder for UIBuilder JSON';
  author = 'PATH# Team';
  metadata = {
    name: 'Visual UI Builder',
    version: '1.0.0',
    class: PluginClass.UI,
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const initialConfig = {
      title: 'PATH# UI',
      subtitle: 'Built with Visual Builder',
      theme: 'dark',
      sections: [
        {
          type: 'stats',
          items: [
            { label: 'Total Paths', value: props.state?.paths?.length || 0, icon: '📁' },
            { label: 'Total Nodes', value: 0, icon: '🔹' },
            { label: 'Completed', value: 0, icon: '✅' }
          ]
        }
      ]
    };

    const safeConfig = JSON.stringify(initialConfig).replace(/</g, '\\u003c');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual UI Builder</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
    }
    .layout {
      display: grid;
      grid-template-columns: 240px 1fr 320px;
      height: 100vh;
    }
    .panel {
      padding: 16px;
      border-right: 1px solid #222;
      overflow: auto;
    }
    .panel h2 {
      font-size: 14px;
      margin: 0 0 12px 0;
      color: #9fb3c8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .palette-item, .canvas-item {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: grab;
    }
    .palette-item:hover {
      border-color: #4a9eff;
    }
    .canvas {
      padding: 16px;
    }
    .canvas-drop {
      border: 2px dashed #2a2a2a;
      border-radius: 10px;
      padding: 16px;
      min-height: 200px;
    }
    .canvas-item.active {
      border-color: #4a9eff;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .btn {
      background: #2a2a2a;
      color: #e0e0e0;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn.primary { background: #4a9eff; color: #000; }
    textarea, input {
      width: 100%;
      background: #111;
      border: 1px solid #2a2a2a;
      color: #e0e0e0;
      padding: 8px;
      border-radius: 6px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    }
    iframe {
      width: 100%;
      height: 60vh;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      background: #111;
    }
    .label {
      font-size: 11px;
      color: #9aa5b1;
      margin: 10px 0 6px;
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="panel" id="palette">
      <h2>Components</h2>
      <div class="palette-item" draggable="true" data-type="stats">Stats</div>
      <div class="palette-item" draggable="true" data-type="cards">Cards</div>
      <div class="palette-item" draggable="true" data-type="list">List</div>
      <div class="palette-item" draggable="true" data-type="table">Table</div>
      <div class="palette-item" draggable="true" data-type="form">Form</div>
      <div class="palette-item" draggable="true" data-type="buttons">Buttons</div>
      <div class="palette-item" draggable="true" data-type="debug">Debug</div>
    </div>

    <div class="canvas">
      <div class="toolbar">
        <button class="btn primary" onclick="addComponent('stats')">Add Stats</button>
        <button class="btn" onclick="addComponent('form')">Add Form</button>
        <button class="btn" onclick="addComponent('list')">Add List</button>
        <button class="btn" onclick="removeSelected()">Remove Selected</button>
        <button class="btn" onclick="updatePreview()">Update Preview</button>
      </div>
      <div class="label">Canvas</div>
      <div id="canvas" class="canvas-drop"></div>
      <div class="label">Preview</div>
      <iframe id="preview"></iframe>
    </div>

    <div class="panel">
      <h2>Properties</h2>
      <div class="label">UI Title</div>
      <input id="ui-title" placeholder="Title" />
      <div class="label">UI Subtitle</div>
      <input id="ui-subtitle" placeholder="Subtitle" />

      <div class="label">Selected Component JSON</div>
      <textarea id="component-json" rows="10"></textarea>
      <div class="toolbar">
        <button class="btn primary" onclick="applyComponentJson()">Apply</button>
      </div>

      <div class="label">Full UI JSON</div>
      <textarea id="full-json" rows="12" readonly></textarea>
    </div>
  </div>

  <script>
    const initialConfig = ${safeConfig};
    let config = JSON.parse(JSON.stringify(initialConfig));
    let selectedIndex = -1;

    const canvas = document.getElementById('canvas');
    const titleInput = document.getElementById('ui-title');
    const subtitleInput = document.getElementById('ui-subtitle');
    const componentJson = document.getElementById('component-json');
    const fullJson = document.getElementById('full-json');
    const preview = document.getElementById('preview');

    titleInput.value = config.title;
    subtitleInput.value = config.subtitle || '';

    function createComponent(type) {
      if (type === 'stats') return { type: 'stats', items: [{ label: 'Stat', value: 0, icon: '📊' }] };
      if (type === 'cards') return { type: 'cards', title: 'Cards', items: [{ title: 'Card', icon: '📦', description: 'Example' }] };
      if (type === 'list') return { type: 'list', title: 'List', items: [{ text: 'Item', icon: '•' }] };
      if (type === 'table') return { type: 'table', title: 'Table', columns: ['name'], items: [{ name: 'Row' }] };
      if (type === 'form') return { type: 'form', title: 'Form', fields: [{ name: 'title', label: 'Title', type: 'text' }], actions: [{ label: 'Submit', command: 'CREATE_PATH', style: 'primary' }] };
      if (type === 'buttons') return { type: 'buttons', actions: [{ label: 'Action', command: 'CREATE_PATH', style: 'primary' }] };
      if (type === 'debug') return { type: 'debug', title: 'Diagnostics' };
      return { type };
    }

    function renderCanvas() {
      canvas.innerHTML = '';
      config.sections.forEach((section, index) => {
        const div = document.createElement('div');
        div.className = 'canvas-item' + (index === selectedIndex ? ' active' : '');
        div.textContent = section.type + (section.title ? ' — ' + section.title : '');
        div.onclick = () => selectIndex(index);
        canvas.appendChild(div);
      });
      fullJson.value = JSON.stringify(config, null, 2);
    }

    function selectIndex(index) {
      selectedIndex = index;
      const section = config.sections[selectedIndex];
      componentJson.value = JSON.stringify(section, null, 2);
      renderCanvas();
    }

    function addComponent(type) {
      config.sections.push(createComponent(type));
      renderCanvas();
    }

    function removeSelected() {
      if (selectedIndex < 0) return;
      config.sections.splice(selectedIndex, 1);
      selectedIndex = -1;
      componentJson.value = '';
      renderCanvas();
    }

    function applyComponentJson() {
      if (selectedIndex < 0) return;
      try {
        const parsed = JSON.parse(componentJson.value);
        config.sections[selectedIndex] = parsed;
        renderCanvas();
      } catch (e) {
        alert('Invalid JSON');
      }
    }

    titleInput.addEventListener('input', () => {
      config.title = titleInput.value;
      renderCanvas();
    });
    subtitleInput.addEventListener('input', () => {
      config.subtitle = subtitleInput.value;
      renderCanvas();
    });

    document.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', item.dataset.type);
      });
    });

    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      if (type) addComponent(type);
    });

    async function updatePreview() {
      try {
        const res = await fetch('/api/ui/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        const html = await res.text();
        preview.srcdoc = html;
      } catch (e) {
        console.error(e);
      }
    }

    renderCanvas();
    updatePreview();
  </script>
</body>
</html>
    `;
  }
}

export default VisualBuilderPlugin;
