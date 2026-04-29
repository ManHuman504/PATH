import { IPlugin, PluginRenderProps, PluginClass } from './pluginSystem';

export class Nodes3DUIPlugin implements IPlugin {
  id = 'nodes-3d-ui';
  name = '3D Nodes Editor';
  version = '2.0.0';
  class = PluginClass.UI;
  description = 'Isolated 3D Visualization Component';
  author = 'PATH# Team';
  metadata = {
    name: '3D Nodes Editor',
    version: '2.0.0',
    class: PluginClass.UI,
    moduleId: 'node-module',
    requiredAPIs: [],
    dependencies: ['path-module']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const currentPathId = state.activePathId || state.currentPathId;
    
    console.log('[Nodes3DUIPlugin] Render requested');
    console.log('[Nodes3DUIPlugin] State keys:', Object.keys(state));
    console.log('[Nodes3DUIPlugin] activePathId:', state.activePathId);
    console.log('[Nodes3DUIPlugin] currentPathId:', state.currentPathId);
    
    // Safety check
    if (!currentPathId) {
        console.log('[Nodes3DUIPlugin] No path selected');
        return `<div style="padding: 20px; color: #fff;">Please select a map/path to view.</div>`;
    }

    // Loose equality check for ID (string vs number)
    const currentPath = state.paths?.find((p: any) => p.id == currentPathId);
    
    if (currentPath) {
        console.log(`[Nodes3DUIPlugin] Found path: "${currentPath.title || currentPath.name}" (ID: ${currentPath.id})`);
        console.log(`[Nodes3DUIPlugin] Node count: ${currentPath.nodes?.length || 0}`);
    } else {
        console.log(`[Nodes3DUIPlugin] Path not found for ID: ${currentPathId}`);
        console.log('[Nodes3DUIPlugin] Available paths:', state.paths?.map((p: any) => `${p.id} (${typeof p.id})`).join(', '));
    }

    const nodes = currentPath?.nodes || [];
    const safeNodes = JSON.stringify(nodes).replace(/"/g, '&quot;');
    
    return `
      <style>
        #path-visualizer-container, #path-visualizer-container * {
          outline: none !important;
          box-shadow: none !important;
        }
        body { margin: 0; padding: 0; overflow: hidden; }
      </style>
      <div id="path-visualizer-container" style="width: 100%; height: 100%; position: relative; background: #0a0a0f; overflow: hidden; border: none !important;">
         <!-- Toolbar overlay -->
         <div id="pv-toolbar" style="position: absolute; top: 20px; left: 20px; z-index: 101; display: flex; gap: 12px; align-items: center;">
            <button onclick="window.location.href='/?reset=1'" style="
              background: rgba(30, 30, 35, 0.9);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #fff;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-family: 'Inter', sans-serif;
              font-size: 13px;
              backdrop-filter: blur(8px);
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(50,50,60,1)'" onmouseout="this.style.background='rgba(30,30,35,0.9)'">
              ← Back to Hub
            </button>
            <div style="
              color: rgba(255, 255, 255, 0.5);
              font-family: 'Inter', sans-serif;
              font-size: 13px;
              background: rgba(0,0,0,0.4);
              padding: 8px 12px;
              border-radius: 8px;
            ">${(currentPath?.title || currentPath?.name) || 'Untitled Path'}</div>
         </div>
      </div>

      <!-- Import Map to resolve bare modules in the browser -->
      <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/",
          "@tweenjs/tween.js": "https://unpkg.com/@tweenjs/tween.js@25.0.0/dist/tween.esm.js"
        }
      }
      </script>

      <script type="module">
        console.log('[3D] initializing script...');
        // Import from the built output. Adjust path if your deployment differs.
        import { PathVisualizer } from '/modules/nodes-3d/dist/engine/PathVisualizer.js?v=${Date.now()}'; 
        
        const container = document.getElementById('path-visualizer-container');
        if (container) {
           try {
             console.log('[3D] Creating PathVisualizer instance...');
             
             // Basic config
             const viz = new PathVisualizer({
               container: container,
               gridSpacing: 50,
               fov: 50
             });
             
             // Hydrate nodes with clean design
             const nodesData = ${JSON.stringify(nodes)};
             console.log('[3D] Loaded nodes data:', nodesData.length);
             
             nodesData.forEach(n => {
                console.log('[3D] Adding node:', n.id);
                try {
                  viz.addNode({
                    id: n.id,
                    x: n.position?.x || 0,
                    y: n.position?.y || 0,
                    label: n.title || 'Node',
                    htmlContent: \`
                      <div style="height: 100%; display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-weight: 600; font-size: 15px; color: #00ff96;">\${n.title || 'New Node'}</div>
                        <div style="font-size: 13px; opacity: 0.7; color: #a0a0a0;">\${n.description || 'No description'}</div>
                        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 10px; opacity: 0.4; font-family: monospace;">ID: \${String(n.id).slice(-6)}</span>
                          \${n.completed ? '<span style="color: #00ff96; font-size: 10px;">⬤ Done</span>' : ''}
                        </div>
                      </div>
                    \`
                  });
                } catch (e) {
                  console.error('[3D] Error adding node ' + n.id, e);
                }
             });
             
             // Setup connections
             nodesData.forEach(n => {
                if (n.connections && Array.isArray(n.connections)) {
                   n.connections.forEach(conn => {
                      const targetId = typeof conn === 'string' ? conn : (conn.targetId || conn.id);
                      if (targetId) viz.addConnection(n.id, targetId);
                   });
                }
             });
             
             // Auto-focus on loaded nodes
             console.log('[3D] Focusing on nodes...');
             viz.focusOnNodes();
             
             console.log('[3D] Initialization complete');
             
           } catch (err) {
             console.error('[3D] Failed to init PathVisualizer:', err);
             // Display error explicitly to user
             const errDiv = document.createElement('div');
             errDiv.style.position = 'absolute';
             errDiv.style.top = '50%';
             errDiv.style.left = '50%';
             errDiv.style.transform = 'translate(-50%, -50%)';
             errDiv.style.color = '#ff4444';
             errDiv.style.background = 'rgba(0,0,0,0.8)';
             errDiv.style.padding = '20px';
             errDiv.style.border = '1px solid #ff4444';
             errDiv.style.zIndex = '9999';
             errDiv.innerHTML = '<h3>3D Engine Error</h3><pre>' + err.message + '</pre>';
             container.appendChild(errDiv);
           }
        } else {
           console.error('[3D] Container not found!');
        }
      </script>
      <!-- Global Error Handler -->
      <script>
        window.addEventListener('error', function(e) {
            console.error('[Global Error]', e.message, e.filename, e.lineno);
            const container = document.getElementById('path-visualizer-container');
            if (container && !document.getElementById('global-error-overlay')) {
                 const errDiv = document.createElement('div');
                 errDiv.id = 'global-error-overlay';
                 errDiv.style.position = 'absolute';
                 errDiv.style.bottom = '10px';
                 errDiv.style.left = '10px';
                 errDiv.style.color = '#ffaa00';
                 errDiv.style.background = 'rgba(0,0,0,0.8)';
                 errDiv.style.padding = '10px';
                 errDiv.style.zIndex = '9999';
                 errDiv.style.fontSize = '12px';
                 errDiv.innerHTML = 'Last Error: ' + e.message;
                 container.appendChild(errDiv);
            }
        });
      </script>
    `;
  }
}

export default Nodes3DUIPlugin;
