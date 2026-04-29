import { IPlugin, PluginRenderProps, PluginClass } from './pluginSystem';

/**
 * Welcome UI Plugin - Home/Landing page
 * Shows last 5 paths and quick actions
 */
export class WelcomeUIPlugin implements IPlugin {
  id = 'welcome-ui';
  name = 'Welcome';
  version = '1.0.0';
  class = PluginClass.UI;
  
  metadata = {
    name: 'Welcome Home',
    version: '1.0.0',
    class: PluginClass.UI,
    moduleId: 'welcome-module',
    requiredAPIs: ['state-v1', 'tabs-v1']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const paths = state.paths || [];
    const recentPaths = paths.slice(-5).reverse();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PATH# - Welcome</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg, #0d0d0d);
      color: var(--text, #e5e5e5);
      overflow: hidden;
    }

    .welcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px;
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .welcome-title {
      font-size: 72px;
      font-weight: 700;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #4a9eff 0%, #9d7bff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .welcome-subtitle {
      font-size: 20px;
      color: var(--text-muted, #8c8c8c);
    }

    .quick-actions {
      display: flex;
      gap: 20px;
      margin-bottom: 60px;
    }

    .action-btn {
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-btn-primary {
      background: #4a9eff;
      color: white;
    }

    .action-btn-primary:hover {
      background: #3d8de6;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(74, 158, 255, 0.3);
    }

    .action-btn-secondary {
      background: var(--panel, #1a1a1a);
      color: var(--text, #e5e5e5);
      border: 2px solid var(--border, #252525);
    }

    .action-btn-secondary:hover {
      border-color: #4a9eff;
      transform: translateY(-2px);
    }

    .recent-paths {
      width: 100%;
      max-width: 800px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--text, #e5e5e5);
    }

    .paths-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .path-card {
      background: var(--panel, #1a1a1a);
      border: 1px solid var(--border, #252525);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .path-card:hover {
      border-color: #4a9eff;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .path-card-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text, #e5e5e5);
    }

    .path-card-meta {
      display: flex;
      gap: 12px;
      font-size: 14px;
      color: var(--text-muted, #8c8c8c);
    }

    .path-card-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted, #8c8c8c);
    }

    .empty-state-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-state-text {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="welcome-container">
    <div class="welcome-header">
      <div class="welcome-title">PATH#</div>
      <div class="welcome-subtitle">Visualize your journey, one node at a time</div>
    </div>

    <div class="quick-actions">
      <button class="action-btn action-btn-primary" onclick="createNewPath()">
        <span>➕</span>
        <span>New Path</span>
      </button>
      <button class="action-btn action-btn-secondary" onclick="goToHub()">
        <span>🗂️</span>
        <span>View All Paths</span>
      </button>
    </div>

    ${recentPaths.length > 0 ? `
      <div class="recent-paths">
        <div class="section-title">Recent Paths</div>
        <div class="paths-grid">
          ${recentPaths.map((path: any) => `
            <div class="path-card" onclick="openPath('${path.id}')">
              <div class="path-card-title">${path.title || 'Untitled Path'}</div>
              <div class="path-card-meta">
                <span>
                  <span>📍</span>
                  <span>${(path.nodes || []).length} nodes</span>
                </span>
                <span>
                  <span>✅</span>
                  <span>${(path.nodes || []).filter((n: any) => n.completed).length}</span>
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="empty-state">
        <div class="empty-state-icon">🚀</div>
        <div class="empty-state-text">No paths yet. Create your first one!</div>
      </div>
    `}
  </div>

  <script>
    function createNewPath() {
      const title = prompt('Path name:');
      if (!title) return;
      
      fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CREATE_PATH',
          payload: { title }
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.state.paths) {
          const newPath = data.state.paths[data.state.paths.length - 1];
          if (newPath) {
            openPath(newPath.id);
          }
        }
      });
    }

    function openPath(pathId) {
      fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SET_ACTIVE_PATH',
          payload: { pathId }
        })
      })
      .then(() => fetch('/api/switch-to-node?pathId=' + pathId, { method: 'POST' }))
      .then(() => { window.location.href = '/api/ui/render'; });
    }

    function goToHub() {
      fetch('/api/plugins/select/hub-ui', { method: 'POST' })
        .then(() => { window.location.href = '/api/ui/render'; });
    }
  </script>
</body>
</html>
    `;
  }
}
