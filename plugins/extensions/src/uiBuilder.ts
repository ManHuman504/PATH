/**
 * UIBuilder - Декларативная система для создания UI из JSON
 * 
 * Позволяет создавать интерфейсы БЕЗ написания HTML/CSS кода
 * Просто описываете JSON и система генерирует HTML
 * 
 * @example
 * const ui = new UIBuilder({
 *   title: 'My Page',
 *   sections: [
 *     {
 *       type: 'cards',
 *       items: [
 *         { title: 'Card 1', icon: '📁' },
 *         { title: 'Card 2', icon: '🔹' }
 *       ]
 *     }
 *   ]
 * });
 * const html = ui.render();
 */

export interface UIComponent {
  type: 'cards' | 'form' | 'table' | 'stats' | 'list' | 'buttons' | 'debug';
  title?: string;
  items?: any[];
  fields?: UIField[];
  columns?: string[];
  actions?: UIAction[];
  className?: string;
}

export interface UIField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface UIAction {
  label: string;
  command: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface UIConfig {
  title: string;
  subtitle?: string;
  sections: UIComponent[];
  theme?: 'dark' | 'light';
}

/**
 * UIBuilder - конвертирует JSON в HTML
 */
export class UIBuilder {
  config: UIConfig;

  constructor(config: UIConfig) {
    this.config = config;
  }

  render(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${this.config.title}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${this.renderHeader()}
    ${this.renderSections()}
  </div>
  <script>${this.getClientScript()}</script>
</body>
</html>
    `;
  }

  private renderHeader(): string {
    return `
      <div class="header">
        <h1>${this.config.title}</h1>
        ${this.config.subtitle ? `<p class="subtitle">${this.config.subtitle}</p>` : ''}
      </div>
    `;
  }

  private renderSections(): string {
    return this.config.sections.map((section) => this.renderComponent(section)).join('\n');
  }

  private renderComponent(component: UIComponent): string {
    switch (component.type) {
      case 'cards':
        return this.renderCards(component);
      case 'form':
        return this.renderForm(component);
      case 'table':
        return this.renderTable(component);
      case 'stats':
        return this.renderStats(component);
      case 'list':
        return this.renderList(component);
      case 'buttons':
        return this.renderButtons(component);
      case 'debug':
        return this.renderDebug(component);
      default:
        return '';
    }
  }

  /**
   * Компонент: CARDS (карточки с информацией)
   * @example
   * {
   *   type: 'cards',
   *   title: 'Available Paths',
   *   items: [
   *     { title: 'Path 1', icon: '📁', description: 'My first path' },
   *     { title: 'Path 2', icon: '📁', description: 'Another path' }
   *   ]
   * }
   */
  private renderCards(component: UIComponent): string {
    const items = component.items || [];
    const cards = items
      .map(
        (item) => `
      <div class="card">
        ${item.icon ? `<div class="card-icon">${item.icon}</div>` : ''}
        <h3>${item.title}</h3>
        ${item.description ? `<p>${item.description}</p>` : ''}
        ${item.count !== undefined ? `<div class="card-count">${item.count}</div>` : ''}
      </div>
    `
      )
      .join('');

    return `
      <div class="section">
        ${component.title ? `<h2>${component.title}</h2>` : ''}
        <div class="cards-grid">
          ${cards}
        </div>
      </div>
    `;
  }

  /**
   * Компонент: FORM (форма для создания/редактирования)
   * @example
   * {
   *   type: 'form',
   *   title: 'Create New Path',
   *   fields: [
   *     { name: 'title', label: 'Title', type: 'text', placeholder: 'Path name', required: true },
   *     { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Details' }
   *   ],
   *   actions: [
   *     { label: 'Create', command: 'CREATE_PATH', style: 'primary' }
   *   ]
   * }
   */
  private renderForm(component: UIComponent): string {
    const fields = component.fields || [];
    const actions = component.actions || [];

    const formFields = fields
      .map((field) => {
        let inputHtml = '';

        if (field.type === 'textarea') {
          inputHtml = `<textarea 
            name="${field.name}" 
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
          ></textarea>`;
        } else if (field.type === 'select') {
          const options = field.options
            ?.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
            .join('');
          inputHtml = `<select 
            name="${field.name}"
            ${field.required ? 'required' : ''}
          >
            <option value="">-- Select ${field.label} --</option>
            ${options}
          </select>`;
        } else {
          inputHtml = `<input 
            type="${field.type}" 
            name="${field.name}" 
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
          />`;
        }

        return `
          <div class="form-group">
            <label>${field.label}${field.required ? ' *' : ''}</label>
            ${inputHtml}
          </div>
        `;
      })
      .join('');

    const actionButtons = actions
      .map(
        (action) => `
      <button 
        class="btn btn-${action.style || 'primary'}" 
        onclick="sendCommand('${action.command}')"
      >
        ${action.label}
      </button>
    `
      )
      .join('');

    return `
      <div class="section">
        ${component.title ? `<h2>${component.title}</h2>` : ''}
        <form id="dynamic-form" class="form">
          ${formFields}
          <div class="form-actions">
            ${actionButtons}
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Компонент: TABLE (таблица со списком)
   * @example
   * {
   *   type: 'table',
   *   title: 'All Nodes',
   *   columns: ['Title', 'Status', 'Created'],
   *   items: [
   *     { title: 'Node 1', status: 'Done', created: '2024-01-01' }
   *   ]
   * }
   */
  private renderTable(component: UIComponent): string {
    const columns = component.columns || [];
    const items = component.items || [];

    const headerRow = columns.map((col) => `<th>${col}</th>`).join('');
    const bodyRows = items
      .map((item) => {
        const cells = columns
          .map((col) => {
            const key = col.toLowerCase();
            return `<td>${item[key] || ''}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `
      <div class="section">
        ${component.title ? `<h2>${component.title}</h2>` : ''}
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>${headerRow}</tr>
            </thead>
            <tbody>
              ${bodyRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Компонент: STATS (статистика/счётчики)
   * @example
   * {
   *   type: 'stats',
   *   items: [
   *     { label: 'Total Paths', value: 5, icon: '📁' },
   *     { label: 'Total Nodes', value: 23, icon: '🔹' },
   *     { label: 'Completed', value: 12, icon: '✅' }
   *   ]
   * }
   */
  private renderStats(component: UIComponent): string {
    const items = component.items || [];
    const stats = items
      .map(
        (item) => `
      <div class="stat-item">
        <div class="stat-icon">${item.icon || '📊'}</div>
        <div class="stat-content">
          <div class="stat-label">${item.label}</div>
          <div class="stat-value">${item.value}</div>
        </div>
      </div>
    `
      )
      .join('');

    return `
      <div class="section stats-section">
        <div class="stats-grid">
          ${stats}
        </div>
      </div>
    `;
  }

  /**
   * Компонент: LIST (простой список)
   * @example
   * {
   *   type: 'list',
   *   title: 'Modules',
   *   items: [
   *     { text: 'Path Module', icon: '📁' },
   *     { text: 'Node Module', icon: '🔹' }
   *   ]
   * }
   */
  private renderList(component: UIComponent): string {
    const items = component.items || [];
    const listItems = items
      .map(
        (item) => `
      <li class="list-item">
        ${item.icon ? `<span class="list-icon">${item.icon}</span>` : ''}
        <span>${item.text}</span>
      </li>
    `
      )
      .join('');

    return `
      <div class="section">
        ${component.title ? `<h2>${component.title}</h2>` : ''}
        <ul class="list">
          ${listItems}
        </ul>
      </div>
    `;
  }

  /**
   * Компонент: BUTTONS (группа кнопок)
   * @example
   * {
   *   type: 'buttons',
   *   actions: [
   *     { label: 'Create Path', command: 'CREATE_PATH', style: 'primary' },
   *     { label: 'View Stats', command: 'VIEW_STATS', style: 'secondary' }
   *   ]
   * }
   */
  private renderButtons(component: UIComponent): string {
    const actions = component.actions || [];
    const buttons = actions
      .map(
        (action) => `
      <button 
        class="btn btn-${action.style || 'primary'}"
        onclick="sendCommand('${action.command}')"
      >
        ${action.label}
      </button>
    `
      )
      .join('');

    return `
      <div class="section buttons-section">
        ${component.title ? `<h2>${component.title}</h2>` : ''}
        <div class="button-group">
          ${buttons}
        </div>
      </div>
    `;
  }

  /**
   * Компонент: DEBUG (диагностика системы)
   */
  private renderDebug(component: UIComponent): string {
    return `
      <div class="section debug-section">
        ${component.title ? `<h2>${component.title}</h2>` : ''}
        <div class="debug-grid">
          <div class="debug-panel">
            <h3>API</h3>
            <div id="debug-api">Loading...</div>
          </div>
          <div class="debug-panel">
            <h3>Modules</h3>
            <ul id="debug-modules"></ul>
          </div>
          <div class="debug-panel">
            <h3>Events</h3>
            <ul id="debug-events"></ul>
          </div>
          <div class="debug-panel">
            <h3>Errors</h3>
            <ul id="debug-errors"></ul>
          </div>
        </div>
        <button class="btn btn-secondary" onclick="refreshDebug()">Refresh Diagnostics</button>
      </div>
    `;
  }

  private getStyles(): string {
    return `
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0f0f0f;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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

.subtitle {
  color: #888;
  font-size: 16px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2a2a2a;
}

/* CARDS */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.card:hover {
  border-color: #3a3a3a;
  background: #202020;
}

.card-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.card h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.card p {
  color: #888;
  font-size: 14px;
}

.card-count {
  margin-top: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #4a9eff;
}

/* FORM */
.form {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a9eff;
  background: #151515;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

/* BUTTONS */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #4a9eff;
  color: #000;
}

.btn-primary:hover {
  background: #6baeff;
}

.btn-secondary {
  background: #2a2a2a;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #3a3a3a;
}

.btn-danger {
  background: #ff4a4a;
  color: #fff;
}

.btn-danger:hover {
  background: #ff6a6a;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* DEBUG */
.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.debug-panel {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
}

.debug-panel h3 {
  margin-bottom: 8px;
  font-size: 13px;
}

.debug-panel ul {
  list-style: none;
  padding-left: 0;
  max-height: 180px;
  overflow: auto;
}

.debug-panel li {
  padding: 4px 0;
  border-bottom: 1px solid #222;
}

/* STATS */
.stats-section {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
}

.stat-label {
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #4a9eff;
}

/* TABLE */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.table thead {
  background: #111;
}

.table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #2a2a2a;
}

.table td {
  padding: 15px;
  border-bottom: 1px solid #2a2a2a;
}

.table tbody tr:hover {
  background: #151515;
}

/* LIST */
.list {
  list-style: none;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #2a2a2a;
}

.list-icon {
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header h1 {
    font-size: 24px;
  }

  .form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
    `;
  }

  private getClientScript(): string {
    return `
function sendCommand(command) {
  if (command.startsWith('NAVIGATE:')) {
    const target = command.substring('NAVIGATE:'.length);
    window.location.href = target;
    return;
  }

  if (command.startsWith('SELECT_INTERFACE:')) {
    const id = command.substring('SELECT_INTERFACE:'.length);
    fetch('/api/plugins/select/' + id, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          window.location.href = '/api/ui/render';
        } else {
          alert('Error: ' + (data.error || 'Failed to select interface'));
        }
      })
      .catch(e => alert('Error: ' + e.message));
    return;
  }
  const form = document.getElementById('dynamic-form');
  const payload = {};
  
  if (form) {
    new FormData(form).forEach((value, key) => {
      payload[key] = value;
    });
  }
  
  let commandType = command;
  if (payload.commandType) {
    commandType = payload.commandType;
    delete payload.commandType;
  }

  if (payload.payloadJson) {
    try {
      const extra = JSON.parse(payload.payloadJson);
      Object.assign(payload, extra);
    } catch (e) {
      alert('Invalid JSON in payload');
      return;
    }
    delete payload.payloadJson;
  }

  console.log('Sending command:', commandType, 'with payload:', payload);
  
  fetch('/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: commandType, payload })
  })
    .then(r => r.json())
    .then(data => {
      console.log('Response:', data);
      if (data.success) {
        alert('Command executed!');
        location.reload();
      } else {
        alert('Error: ' + data.error);
      }
    })
    .catch(e => alert('Error: ' + e.message));
}

// Auto-refresh state every 5 seconds
setInterval(() => {
  fetch('/api/state')
    .then(r => r.json())
    .then(data => console.log('Current state:', data))
    .catch(e => console.error('State error:', e));
}, 5000);

async function refreshDebug() {
  try {
    const [api, modules, events, errors] = await Promise.all([
      fetch('/api/documentation').then(r => r.json()),
      fetch('/api/modules').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
      fetch('/api/errors').then(r => r.json())
    ]);

    const apiEl = document.getElementById('debug-api');
    if (apiEl) {
      const version = api.api?.version || 'n/a';
      const caps = api.api?.capabilities?.join(', ') || 'no capabilities';
      apiEl.textContent = 'v' + version + ' | ' + caps;
    }

    const modEl = document.getElementById('debug-modules');
    if (modEl) {
      modEl.innerHTML = (modules.modules || [])
        .map(m => '<li>' + m.name + ' (' + m.id + ')</li>')
        .join('') || '<li>None</li>';
    }

    const evtEl = document.getElementById('debug-events');
    if (evtEl) {
      evtEl.innerHTML = (events || [])
        .slice(-10)
        .reverse()
        .map(e => '<li>' + e.type + '</li>')
        .join('') || '<li>None</li>';
    }

    const errEl = document.getElementById('debug-errors');
    if (errEl) {
      errEl.innerHTML = (errors || [])
        .slice(-10)
        .reverse()
        .map(e => '<li>' + e.message + '</li>')
        .join('') || '<li>None</li>';
    }
  } catch (e) {
    console.error('Debug refresh error', e);
  }
}

if (document.getElementById('debug-api')) {
  refreshDebug();
  setInterval(refreshDebug, 5000);
}
    `;
  }
}

export default UIBuilder;
