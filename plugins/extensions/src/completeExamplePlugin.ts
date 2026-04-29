import { IPlugin, PluginClass, PluginAPI, PluginRenderProps } from './pluginSystem';

/**
 * Complete Example Plugin
 * 
 * Demonstrates all available PluginAPI methods:
 * - State access (getState, getModules, getTabs)
 * - Event listening (onStateChange, onEvent)
 * - Commands (executeCommand, getCommands)
 * - Module access (getModules)
 * 
 * This plugin shows:
 * - Real-time stats from application state
 * - Event monitoring
 * - Module introspection
 * - Available commands
 */
export class CompleteExamplePlugin implements IPlugin {
  id = 'complete-example-plugin';
  name = 'Complete Example Plugin';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Complete example showing all PluginAPI methods';
  author = 'PATH# Team';
  metadata = {
    name: 'Complete Example Plugin',
    version: '1.0.0',
    class: PluginClass.UI,
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1']
  };

  private pluginAPI!: PluginAPI;
  private eventLog: Array<{ timestamp: string; message: string }> = [];
  private eventUnsubscribers: (() => void)[] = [];
  private stats = {
    stateChanges: 0,
    eventsReceived: 0
  };

  /**
   * Initialize the plugin
   * Set up event listeners and initial state
   */
  async initialize(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;
    console.log('[CompleteExamplePlugin] Initializing...');

    // 1. Listen to state changes
    const unsubState = this.pluginAPI.onStateChange((state: any) => {
      this.stats.stateChanges++;
      this.logEvent(`State updated`);
      console.log('[CompleteExamplePlugin] State changed:', state);
    });

    // 2. Listen to engine events
    const unsubEngine = this.pluginAPI.onEvent('engine:started', () => {
      this.stats.eventsReceived++;
      this.logEvent('Engine started');
    });

    // 3. Listen to any other events
    const unsubGeneric = this.pluginAPI.onEvent('state:changed', () => {
      this.stats.eventsReceived++;
      this.logEvent('State change event received');
    });

    // Store unsubscribers for cleanup
    this.eventUnsubscribers = [unsubState, unsubEngine, unsubGeneric];

    // Log available modules
    const modules = this.pluginAPI.getModules();
    this.logEvent(`Available modules: ${modules.length} found`);
    console.log('[CompleteExamplePlugin] Available modules:', modules);

    // Log available commands
    const commands = this.pluginAPI.getCommands();
    this.logEvent(`Available commands: ${commands.join(', ')}`);
    console.log('[CompleteExamplePlugin] Available commands:', commands);

    // Log available tabs
    const tabs = this.pluginAPI.getTabs();
    this.logEvent(`Available tabs: ${tabs.length} found`);
    console.log('[CompleteExamplePlugin] Available tabs:', tabs);

    console.log('[CompleteExamplePlugin] Ready');
  }

  /**
   * Clean up on plugin disposal
   */
  async dispose() {
    console.log('[CompleteExamplePlugin] Disposing...');
    // Unsubscribe from all events
    this.eventUnsubscribers.forEach(fn => fn());
    this.eventLog = [];
  }

  async init(api: PluginAPI): Promise<void> {
    await this.initialize(api);
  }

  async cleanup(): Promise<void> {
    await this.dispose();
  }

  /**
   * Render the plugin UI
   */
  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;

    // Get various data from API
    const currentState = this.pluginAPI.getState();
    const modules = this.pluginAPI.getModules();
    const commands = this.pluginAPI.getCommands();
    const tabs = this.pluginAPI.getTabs();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            background: #f5f5f5;
            padding: 20px;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 28px;
          }

          h2 {
            color: #555;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 20px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .card h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .card .value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
          }

          .card .subtitle {
            color: #999;
            font-size: 12px;
            margin-top: 8px;
          }

          .list {
            background: white;
            border-radius: 8px;
            padding: 0;
            overflow: hidden;
            margin-bottom: 30px;
          }

          .list-item {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .list-item:last-child {
            border-bottom: none;
          }

          .list-item-name {
            font-weight: 500;
            color: #333;
          }

          .list-item-description {
            color: #999;
            font-size: 13px;
            margin-top: 4px;
          }

          .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
          }

          .button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
            margin: 5px;
          }

          .button:hover {
            background: #764ba2;
          }

          .event-log {
            background: white;
            border-radius: 8px;
            padding: 0;
            overflow: hidden;
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 30px;
          }

          .event-log-item {
            padding: 10px 20px;
            border-bottom: 1px solid #eee;
            font-size: 12px;
            font-family: 'Monaco', monospace;
            color: #666;
          }

          .event-log-item:last-child {
            border-bottom: none;
          }

          .event-log-time {
            color: #999;
            margin-right: 10px;
          }

          .section {
            margin-bottom: 40px;
          }

          .divider {
            height: 1px;
            background: #eee;
            margin: 40px 0;
          }

          .code-block {
            background: #f5f5f5;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Monaco', monospace;
            font-size: 12px;
            color: #333;
            overflow-x: auto;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <h1>🎨 Complete Example Plugin</h1>
          <p style="color: #999; margin-bottom: 30px;">
            Demonstrates all PluginAPI methods with real-time monitoring
          </p>

          <!-- Statistics Cards -->
          <div class="section">
            <h2>📊 Statistics</h2>
            <div class="grid">
              <div class="card">
                <h3>State Changes</h3>
                <div class="value">${this.stats.stateChanges}</div>
                <div class="subtitle">Tracked by plugin</div>
              </div>
              <div class="card">
                <h3>Events Received</h3>
                <div class="value">${this.stats.eventsReceived}</div>
                <div class="subtitle">Total monitored</div>
              </div>
              <div class="card">
                <h3>Modules</h3>
                <div class="value">${modules.length}</div>
                <div class="subtitle">Loaded modules</div>
              </div>
              <div class="card">
                <h3>Commands</h3>
                <div class="value">${commands.length}</div>
                <div class="subtitle">Available commands</div>
              </div>
            </div>
          </div>

          <!-- Modules List -->
          <div class="section">
            <h2>🔌 Loaded Modules (${modules.length})</h2>
            <div class="list">
              ${modules.length > 0 ? modules.map((module: any) => `
                <div class="list-item">
                  <div>
                    <div class="list-item-name">${module.name || 'Unknown'}</div>
                    <div class="list-item-description">v${module.version || '1.0.0'}</div>
                  </div>
                  <div class="badge">${module.type || 'module'}</div>
                </div>
              `).join('') : '<div style="padding: 20px; color: #999;">No modules loaded</div>'}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
              Uses pluginAPI.getModules()
            </p>
          </div>

          <!-- Available Commands -->
          <div class="section">
            <h2>⚙️ Available Commands (${commands.length})</h2>
            <div class="list">
              ${commands.length > 0 ? commands.map((cmd: string) => `
                <div class="list-item">
                  <div>
                    <div class="list-item-name">${cmd}</div>
                  </div>
                  <button 
                    class="button" 
                    style="margin: 0; padding: 6px 12px; font-size: 12px;"
                    onclick="executeCommand('${cmd}')"
                  >
                    Execute
                  </button>
                </div>
              `).join('') : '<div style="padding: 20px; color: #999;">No commands available</div>'}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
              Uses pluginAPI.getCommands() and pluginAPI.executeCommand()
            </p>
          </div>

          <!-- Available Tabs -->
          <div class="section">
            <h2>📋 Available Tabs (${tabs.length})</h2>
            <div class="list">
              ${tabs.length > 0 ? tabs.map((tab: any) => `
                <div class="list-item">
                  <div>
                    <div class="list-item-name">${tab.icon || '📌'} ${tab.title}</div>
                    <div class="list-item-description">ID: ${tab.id}</div>
                  </div>
                </div>
              `).join('') : '<div style="padding: 20px; color: #999;">No tabs available</div>'}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
              Uses pluginAPI.getTabs()
            </p>
          </div>

          <!-- Event Log -->
          <div class="section">
            <h2>📝 Event Log (Latest ${Math.min(this.eventLog.length, 10)} events)</h2>
            <div class="event-log">
              ${this.eventLog.length > 0 ? this.eventLog.slice(-10).reverse().map(log => `
                <div class="event-log-item">
                  <span class="event-log-time">${log.timestamp}</span>
                  ${log.message}
                </div>
              `).join('') : '<div style="padding: 20px; color: #999;">No events yet</div>'}
            </div>
          </div>

          <!-- Current State -->
          <div class="section">
            <h2>🔍 Current Application State</h2>
            <div class="code-block">
${JSON.stringify(currentState, null, 2).substring(0, 500)}...
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
              Uses pluginAPI.getState()
            </p>
          </div>

          <!-- API Methods Summary -->
          <div class="divider"></div>

          <div class="section">
            <h2>📖 PluginAPI Methods Used</h2>
            <div style="background: white; border-radius: 8px; padding: 20px;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div>
                  <strong style="color: #667eea;">State Access</strong>
                  <div style="color: #999; font-size: 12px; margin-top: 8px;">
                    • getState()<br/>
                    • getModules()<br/>
                    • getTabs()
                  </div>
                </div>
                <div>
                  <strong style="color: #667eea;">Commands</strong>
                  <div style="color: #999; font-size: 12px; margin-top: 8px;">
                    • getCommands()<br/>
                    • executeCommand()
                  </div>
                </div>
                <div>
                  <strong style="color: #667eea;">Event Listeners</strong>
                  <div style="color: #999; font-size: 12px; margin-top: 8px;">
                    • onStateChange()<br/>
                    • onEvent()
                  </div>
                </div>
                <div>
                  <strong style="color: #667eea;">Logging</strong>
                  <div style="color: #999; font-size: 12px; margin-top: 8px;">
                    • log()<br/>
                    • error()
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script>
          // Make pluginAPI available to window
          window.__examplePlugin__ = {
            pluginAPI: window.__pluginAPI__
          };

          async function executeCommand(commandName) {
            try {
              const pluginAPI = window.__examplePlugin__.pluginAPI;
              console.log('Executing command:', commandName);
              const result = await pluginAPI.executeCommand(commandName);
              console.log('Command result:', result);
              pluginAPI.log('Command executed: ' + commandName, result);
              alert('Command executed! Check console for result.');
            } catch (error) {
              console.error('Error executing command:', error);
              alert('Error: ' + error.message);
            }
          }
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Helper: Log event for display
   */
  private logEvent(message: string) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.eventLog.push({
      timestamp: time,
      message: message
    });
    // Keep only last 100 events
    if (this.eventLog.length > 100) {
      this.eventLog.shift();
    }
  }
}

export default CompleteExamplePlugin;
