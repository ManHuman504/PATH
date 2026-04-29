/**
 * Example Plugins - Full control over HTML/CSS/JavaScript
 */

import { IPlugin, PluginAPI, PluginRenderProps, PluginClass } from './pluginSystem';

/**
 * Simple Plugin - Basic example
 */
export class SimplePlugin implements IPlugin {
  id = 'simple-plugin';
  name = 'Simple Plugin';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Minimal plugin example';
  author = 'PATH# Team';
  metadata = {
    name: 'Simple Plugin',
    version: '1.0.0',
    class: PluginClass.UI,
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1']
  };

  async init(api: PluginAPI): Promise<void> {
    api.log('Simple plugin initialized');
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const pathCount = state.paths?.length || 0;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple Plugin</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
              margin-top: 0;
            }
            .stat {
              display: inline-block;
              margin: 10px 20px 10px 0;
              padding: 15px 20px;
              background: #f0f0f0;
              border-radius: 6px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Simple Plugin</h1>
            <p>This is a basic plugin with full HTML/CSS control.</p>
            <div class="stat">
              <div class="stat-value">${pathCount}</div>
              <div class="stat-label">Paths</div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

/**
 * Animated Plugin - With CSS animations and transitions
 */
export class AnimatedPlugin implements IPlugin {
  id = 'animated-plugin';
  name = 'Animated Dashboard';
  version = '2.0.0';
  class = PluginClass.UI;
  description = 'Plugin with animations and interactivity';
  author = 'PATH# Team';
  metadata = {
    name: 'Animated Dashboard',
    version: '2.0.0',
    class: PluginClass.UI,
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1']
  };

  private stateUnsubscribe: (() => void) | null = null;

  async init(api: PluginAPI): Promise<void> {
    api.log('Animated plugin initialized');
    this.stateUnsubscribe = api.onStateChange((state) => {
      api.log('State changed in plugin');
    });
  }

  async cleanup(): Promise<void> {
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const paths = state.paths || [];
    const totalNodes = paths.reduce((sum: number, p: any) => sum + (p.nodes?.length || 0), 0);
    const completedNodes = paths.reduce((sum: number, p: any) => 
      sum + (p.nodes?.filter((n: any) => n.completed)?.length || 0), 0
    );

    const pathItems = paths
      .map((p: any, idx: number) => {
        const completed = p.nodes?.filter((n: any) => n.completed)?.length || 0;
        const total = p.nodes?.length || 0;
        const percent = total > 0 ? (completed / total * 100) : 0;
        return `
        <div class="path-card" style="animation-delay: ${idx * 0.1}s">
          <div class="path-header">
            <h3>${p.title}</h3>
            <span class="path-count">${total}</span>
          </div>
          <p>${p.description || 'No description'}</p>
          <div class="path-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Animated Dashboard</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
            }

            .header {
              color: white;
              margin-bottom: 40px;
              animation: slideDown 0.6s ease-out;
            }

            .header h1 {
              font-size: 36px;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            }

            .stat-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              animation: popIn 0.5s ease-out;
            }

            .stat-card:nth-child(2) {
              animation-delay: 0.1s;
            }

            .stat-card:nth-child(3) {
              animation-delay: 0.2s;
            }

            .stat-value {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 5px;
            }

            .stat-label {
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .paths-section {
              margin-bottom: 40px;
            }

            .section-title {
              color: white;
              font-size: 24px;
              margin-bottom: 20px;
              animation: slideLeft 0.6s ease-out;
            }

            .paths-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
            }

            .path-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              transition: all 0.3s ease;
              animation: slideUp 0.5s ease-out;
              cursor: pointer;
            }

            .path-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            }

            .path-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }

            .path-header h3 {
              color: #333;
              font-size: 18px;
            }

            .path-count {
              background: #667eea;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }

            .path-card p {
              color: #666;
              font-size: 14px;
              margin-bottom: 15px;
              line-height: 1.5;
            }

            .progress-bar {
              width: 100%;
              height: 6px;
              background: #e5e7eb;
              border-radius: 3px;
              overflow: hidden;
            }

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #764ba2);
              transition: width 0.3s ease;
            }

            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes slideLeft {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }

            @keyframes popIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }

            @media (max-width: 768px) {
              .header h1 {
                font-size: 28px;
              }

              .stats-grid {
                grid-template-columns: 1fr;
              }

              .paths-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Animated Dashboard</h1>
              <p>Beautiful plugin with CSS animations</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${paths.length}</div>
                <div class="stat-label">Total Paths</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${totalNodes}</div>
                <div class="stat-label">Total Nodes</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${completedNodes}</div>
                <div class="stat-label">Completed</div>
              </div>
            </div>

            <div class="paths-section">
              <h2 class="section-title">📁 Your Paths</h2>
              <div class="paths-grid">
                ${pathItems || '<p style="color: white;">No paths yet</p>'}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

/**
 * Interactive Plugin - With JavaScript and form handling
 */
export class InteractivePlugin implements IPlugin {
  id = 'interactive-plugin';
  name = 'Interactive UI';
  version = '2.1.0';
  class = PluginClass.UI;
  description = 'Plugin with forms and JavaScript interactions';
  author = 'PATH# Team';
  metadata = {
    name: 'Interactive UI',
    version: '2.1.0',
    class: PluginClass.UI,
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1']
  };

  async init(api: PluginAPI): Promise<void> {
    api.log('Interactive plugin initialized');
  }

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const paths = state.paths || [];

    const pathsHtml = paths
      .map((p: any) => `
        <div class="path-item">
          <div class="path-info">
            <h3>${p.title}</h3>
            <p>${p.description || 'No description'}</p>
          </div>
          <span class="path-badge">${p.nodes?.length || 0} nodes</span>
        </div>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interactive UI</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f9fafb;
              padding: 20px;
            }

            .container {
              max-width: 1000px;
              margin: 0 auto;
            }

            .header {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .header h1 {
              color: #1f2937;
              margin-bottom: 5px;
            }

            .form-section {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .form-group {
              margin-bottom: 15px;
            }

            .form-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: 500;
              color: #374151;
              font-size: 14px;
            }

            .form-group input,
            .form-group textarea {
              width: 100%;
              padding: 10px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              font-family: inherit;
              font-size: 14px;
              transition: all 0.3s;
            }

            .form-group input:focus,
            .form-group textarea:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-group textarea {
              resize: vertical;
              min-height: 100px;
            }

            .form-actions {
              display: flex;
              gap: 10px;
              margin-top: 20px;
            }

            button {
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s;
            }

            .btn-primary {
              background: #3b82f6;
              color: white;
            }

            .btn-primary:hover {
              background: #2563eb;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }

            .btn-secondary {
              background: #e5e7eb;
              color: #374151;
            }

            .btn-secondary:hover {
              background: #d1d5db;
            }

            .paths-list {
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .paths-list h2 {
              margin-bottom: 15px;
              color: #1f2937;
            }

            .path-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              margin-bottom: 10px;
              transition: all 0.3s;
            }

            .path-item:hover {
              background: #f9fafb;
              border-color: #3b82f6;
            }

            .path-info h3 {
              color: #1f2937;
              font-size: 16px;
              margin-bottom: 5px;
            }

            .path-info p {
              color: #6b7280;
              font-size: 14px;
            }

            .path-badge {
              background: #dbeafe;
              color: #1e40af;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }

            .feedback {
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 20px;
              display: none;
            }

            .feedback.show {
              display: block;
            }

            .feedback.success {
              background: #d1fae5;
              color: #065f46;
              border: 1px solid #6ee7b7;
            }

            .feedback.error {
              background: #fee2e2;
              color: #991b1b;
              border: 1px solid #fca5a5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Interactive Plugin</h1>
              <p>Full HTML/CSS/JavaScript control</p>
            </div>

            <div id="feedback" class="feedback"></div>

            <div class="form-section">
              <h2>📝 Create New Path</h2>
              <form onsubmit="handleCreatePath(event)">
                <div class="form-group">
                  <label>Path Name *</label>
                  <input type="text" id="pathTitle" placeholder="Enter path name" required>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea id="pathDescription" placeholder="Optional description"></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary">Create Path</button>
                  <button type="reset" class="btn-secondary">Clear</button>
                </div>
              </form>
            </div>

            <div class="paths-list">
              <h2>📂 Existing Paths (${paths.length})</h2>
              ${pathsHtml || '<p style="color: #6b7280;">No paths yet. Create one above!</p>'}
            </div>
          </div>

          <script>
            async function handleCreatePath(e) {
              e.preventDefault();

              const title = document.getElementById('pathTitle').value;
              const description = document.getElementById('pathDescription').value;
              const feedbackEl = document.getElementById('feedback');

              try {
                const response = await fetch('/api/command', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'CREATE_PATH',
                    payload: { title, description }
                  })
                });

                const result = await response.json();

                if (result.success) {
                  feedbackEl.textContent = 'Path created successfully!';
                  feedbackEl.className = 'feedback success show';
                  document.querySelector('form').reset();

                  setTimeout(() => {
                    location.reload();
                  }, 1500);
                } else {
                  feedbackEl.textContent = 'Error: ' + (result.error || 'Unknown error');
                  feedbackEl.className = 'feedback error show';
                }
              } catch (error) {
                feedbackEl.textContent = 'Network error: ' + error.message;
                feedbackEl.className = 'feedback error show';
              }
            }

            setTimeout(() => {
              const feedback = document.getElementById('feedback');
              if (feedback.classList.contains('show')) {
                feedback.classList.remove('show');
              }
            }, 5000);
          </script>
        </body>
      </html>
    `;
  }
}

/**
 * Data Visualization Plugin - Advanced plugin with charts
 */
export class DataVisualizationPlugin implements IPlugin {
  id = 'dataviz-plugin';
  name = 'Data Visualization';
  version = '2.2.0';
  class = PluginClass.Visualization;
  description = 'Plugin with charts and data visualization';
  author = 'PATH# Team';
  metadata = {
    name: 'Data Visualization',
    version: '2.2.0',
    class: PluginClass.Visualization,
    requiredAPIs: ['state-v1', 'events-v1', 'modules-v1']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const paths = state.paths || [];

    const stats = {
      totalPaths: paths.length,
      totalNodes: paths.reduce((sum: number, p: any) => sum + (p.nodes?.length || 0), 0),
      completedNodes: paths.reduce(
        (sum: number, p: any) => sum + (p.nodes?.filter((n: any) => n.completed)?.length || 0),
        0
      ),
      avgNodesPerPath:
        paths.length > 0
          ? Math.round(
              paths.reduce((sum: number, p: any) => sum + (p.nodes?.length || 0), 0) / paths.length
            )
          : 0
    };

    const completionRate =
      stats.totalNodes > 0
        ? Math.round((stats.completedNodes / stats.totalNodes) * 100)
        : 0;

    const pathListHtml = paths
      .map((p: any) => `
        <div class="path-item">
          <div class="path-name">${p.title}</div>
          <span class="path-count">${p.nodes?.length || 0}</span>
        </div>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Data Visualization</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(to bottom, #1f2937, #111827);
              color: white;
              min-height: 100vh;
              padding: 20px;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
            }

            .header {
              margin-bottom: 40px;
            }

            .header h1 {
              font-size: 32px;
              margin-bottom: 10px;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            }

            .stat-box {
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              padding: 20px;
              backdrop-filter: blur(10px);
              transition: all 0.3s;
            }

            .stat-box:hover {
              background: rgba(255, 255, 255, 0.15);
              border-color: rgba(59, 130, 246, 0.5);
              transform: translateY(-2px);
            }

            .stat-value {
              font-size: 36px;
              font-weight: bold;
              color: #60a5fa;
              margin-bottom: 8px;
            }

            .stat-label {
              font-size: 14px;
              opacity: 0.8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .chart-section {
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 40px;
              backdrop-filter: blur(10px);
            }

            .chart-title {
              font-size: 20px;
              margin-bottom: 20px;
            }

            .progress-ring {
              width: 200px;
              height: 200px;
              margin: 0 auto 20px;
            }

            .completion-text {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              color: #60a5fa;
            }

            .path-list {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              max-height: 400px;
              overflow-y: auto;
            }

            .path-item {
              padding: 15px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .path-item:last-child {
              border-bottom: none;
            }

            .path-name {
              flex: 1;
            }

            .path-count {
              background: #3b82f6;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Data Visualization</h1>
              <p>Advanced plugin with charts and analytics</p>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${stats.totalPaths}</div>
                <div class="stat-label">Total Paths</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${stats.totalNodes}</div>
                <div class="stat-label">Total Nodes</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${stats.completedNodes}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${completionRate}%</div>
                <div class="stat-label">Completion Rate</div>
              </div>
            </div>

            <div class="chart-section">
              <h2 class="chart-title">📈 Completion Progress</h2>
              <svg class="progress-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#60a5fa" stroke-width="8"
                        stroke-dasharray="${(completionRate / 100) * 251.2} 251.2"
                        stroke-dashoffset="0"
                        transform="rotate(-90 50 50)"
                        style="transition: stroke-dasharray 0.5s ease"/>
              </svg>
              <div class="completion-text">${completionRate}% Complete</div>
            </div>

            <div class="chart-section">
              <h2 class="chart-title">📂 Paths Overview (${paths.length})</h2>
              <div class="path-list">
                ${pathListHtml || '<div style="padding: 20px; text-align: center; opacity: 0.6;">No paths yet</div>'}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
