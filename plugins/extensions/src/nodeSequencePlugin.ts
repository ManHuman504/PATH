import { IPlugin, PluginRenderProps, PluginClass } from './pluginSystem';
// import { Sequence, sequenceToText, parseTextToSequence } from '@path/shared';

/**
 * Node Sequence Plugin - Единая система последовательностей
 * Синхронизирует визуальные ноды и текстовый редактор
 * Формат текста: "название - название - название"
 */
export class NodeSequencePlugin implements IPlugin {
  id = 'node-sequence';
  name = 'Sequence Editor';
  version = '1.0.0';
  class = PluginClass.Extension;
  description = 'Bidirectional sequence synchronization between visual and text editors';
  author = 'PATH# Team';
  metadata = {
    name: 'Sequence Editor',
    version: '1.0.0',
    class: PluginClass.Extension,
    moduleId: 'node-module',
    requiredAPIs: ['state-v1', 'commands-v1']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const currentPathId = state.activePathId || state.currentPathId || null;
    
    if (!currentPathId) {
      return ''; // Плагин не активен без пути
    }

    // Check if plugin is enabled in settings
    const settings = state.settings || {};
    const sequenceSettings = settings.modules_plugins?.sequence_editor || {};
    if (sequenceSettings.enabled === false) {
      return ''; // Плагин отключен в настройках
    }

    return `
<div id="sequence-plugin-container" style="
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 1px solid rgba(74, 158, 255, 0.3);
  z-index: 999;
  font-family: Arial, sans-serif;
">
  <!-- Header/Toggle Button -->
  <div id="sequence-header" style="
    padding: 12px 18px;
    background: rgba(74, 158, 255, 0.1);
    border-bottom: 1px solid rgba(74, 158, 255, 0.2);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  ">
    <div style="color: #4a9eff; font-size: 12px; font-weight: 600; text-transform: uppercase;">
      ⚡ Sequences: название - название - название
    </div>
    <div id="sequence-toggle-btn" style="
      background: none;
      border: none;
      color: #888;
      font-size: 16px;
      cursor: pointer;
      padding: 4px 8px;
    ">▼</div>
  </div>
  
  <!-- Content Panel (initially hidden) -->
  <div id="sequence-content" style="
    display: none;
    padding: 16px 18px;
    height: 220px;
    overflow-y: auto;
    background: #1a1a1a;
  ">
    <textarea id="sequence-input" style="
      width: 100%;
      height: 180px;
      background: #0d0d0d;
      color: #e5e5e5;
      border: 1px solid rgba(74, 158, 255, 0.2);
      border-radius: 4px;
      padding: 12px;
      font-family: monospace;
      font-size: 13px;
      resize: none;
      box-sizing: border-box;
    " placeholder="название - название - название"></textarea>
    <div id="sequence-status" style="
      font-size: 11px;
      color: #888;
      margin-top: 8px;
    ">Ready</div>
  </div>
</div>

<script>
(function() {
  // Find elements
  const container = document.getElementById('sequence-plugin-container');
  const header = document.getElementById('sequence-header');
  const toggle = document.getElementById('sequence-toggle-btn');
  const content = document.getElementById('sequence-content');
  const input = document.getElementById('sequence-input');
  const status = document.getElementById('sequence-status');

  if (!container || !header || !toggle || !content || !input || !status) {
    console.error('[SequencePlugin] Elements not found');
    return;
  }

  let isOpen = false;

  // Toggle function
  function togglePanel() {
    isOpen = !isOpen;
    content.style.display = isOpen ? 'block' : 'none';
    toggle.textContent = isOpen ? '▲' : '▼';
    console.log('[SequencePlugin] Toggle:', isOpen);
  }

  // Add click listeners
  header.addEventListener('click', togglePanel);
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // Handle input
  let debounce = null;
  input.addEventListener('input', (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const text = e.target.value.trim();
      if (text.length === 0) return;
      
      console.log('[SequencePlugin] Input:', text);
      status.textContent = 'Processing...';
      
      // Trigger sequence creation
      createSequence(text);
    }, 800);
  });

  async function createSequence(text) {
    try {
      const titles = text.split('-').map(t => t.trim()).filter(t => t);
      if (titles.length === 0) {
        status.textContent = 'Empty sequence';
        return;
      }

      status.textContent = 'Creating ' + titles.length + ' nodes...';

      const colors = ['#4a9eff', '#9d7bff', '#4fd1c5', '#f6ad55', '#f56565', '#68d391', '#fbd38d'];
      const pathId = window.currentPathId || '${currentPathId}';
      let prevNodeId = null;

      for (let i = 0; i < titles.length; i++) {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'CREATE_NODE',
            payload: {
              pathId: pathId,
              title: titles[i],
              position: { x: 150, y: 150 + (i * 140) },
              color: colors[i % colors.length]
            }
          })
        });

        const data = await res.json();
        if (data.success && data.state.paths) {
          const path = data.state.paths.find(p => p.id === pathId);
          if (path && path.nodes.length > 0) {
            const newNode = path.nodes[path.nodes.length - 1];
            
            if (prevNodeId && i > 0) {
              await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'ADD_CONNECTION',
                  payload: { pathId: pathId, fromNodeId: prevNodeId, toNodeId: newNode.id }
                })
              });
            }
            prevNodeId = newNode.id;
          }
        }
      }

      status.textContent = 'Done! Reloading...';
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error('[SequencePlugin] Error:', err);
      status.textContent = 'Error: ' + err.message;
    }
  }

  console.log('[SequencePlugin] Initialized');
})();
</script>
    `;
  }
}

export default NodeSequencePlugin;
