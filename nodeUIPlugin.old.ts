// LEGACY file archived to packages/legacy/nodeUIPlugin.old.ts
// Original file content preserved in legacy folder.

// import { IPlugin, PluginRenderProps, PluginClass } from './pluginSystem';

export class NodeUIPlugin implements IPlugin {
  id = 'node-ui';
  name = 'Nodes Editor';
  version = '1.0.0';
  class = PluginClass.UI;
  description = 'Node editor interface - displays and manages nodes for a path';
  author = 'PATH# Team';
  metadata = {
    name: 'Nodes Editor',
    version: '1.0.0',
    class: PluginClass.UI,
    moduleId: 'node-module', // Привязан к NodeModule
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1']
  };

  async render(props: PluginRenderProps): Promise<string> {
    const { state } = props;
    const currentPathId = state.activePathId || state.currentPathId || null;
    
    // Validation: ноды должны работать только с активным путем
    if (!currentPathId) {
      return this.renderErrorState('No Path Selected', 'Please select a path first to manage nodes.');
    }

    const paths = state.paths || [];
    const currentPath = paths.find((p: any) => p.id === currentPathId);
    
    // Проверка что путь существует
    if (!currentPath) {
      return this.renderErrorState('Path Not Found', 'The selected path no longer exists. Going back to Hub...');
    }

    const nodes = currentPath?.nodes || [];

    const nodeCards = nodes
      .map((node: any) => {
        const title = node.title || 'Untitled Node';
        const description = node.description || 'No description';
        return `
          <div class="node-card" data-node-id="${node.id}">
            <div class="node-card-content">
              <div class="node-title">${title}</div>
              <div class="node-description">${description}</div>
              <div class="node-meta">${new Date(node.createdAt).toLocaleDateString()}</div>
            </div>
            <button class="node-actions-btn">⋯</button>
          </div>
        `;
      })
      .join('');

    const stateJson = JSON.stringify(state).replace(/</g, '\\u003c');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Node Editor - PATH Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0d0d;
      --sidebar: #141414;
      --panel: #1a1a1a;
      --text: #e5e5e5;
      --text-muted: #8c8c8c;
      --text-subtle: #5a5a5a;
      --accent: #4a9eff;
      --accent-soft: #3b7ec9;
      --border: #252525;
      --border-subtle: #1f1f1f;
      --card-bg: #1a1a1a;
      --card-hover: #202020;
      --radius: 10px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(circle at 50% 20%, rgba(74, 158, 255, 0.05) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    .app {
      display: grid;
      grid-template-columns: 220px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      padding: 32px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .sidebar-header {
      padding: 12px 16px 32px;
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.5px;
    }

    .nav-item {
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
      padding: 10px 16px;
      border-radius: var(--radius);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    
    .nav-item svg {
      width: 18px;
      height: 18px;
      stroke-width: 2;
      opacity: 0.7;
      transition: opacity 0.15s ease;
    }

    .nav-item.active {
      color: var(--text);
      background-color: var(--panel);
      padding: 10px 20px;
      margin-left: -4px;
    }
    
    .nav-item.active svg {
      opacity: 1;
    }

    .nav-item:not(.active):hover {
      background-color: var(--panel);
      color: var(--text);
    }

    .main {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .topbar {
      min-height: 80px;
      display: flex;
      flex-direction: column;
      padding: 16px 40px;
      border-bottom: 1px solid var(--border);
      background: var(--sidebar);
      gap: 12px;
    }

    .topbar-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .topbar-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .topbar-title {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .topbar-path {
      font-size: 16px;
      color: var(--text);
      font-weight: 600;
    }

    .topbar-actions {
      display: flex;
      gap: 12px;
    }

    .topbar-progress {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      max-width: 600px;
    }

    .progress-bar-wrapper {
      position: relative;
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
    }

    .progress-bar {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #4a9eff 0%, #9d7bff 100%);
      border-radius: 12px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 12px rgba(74, 158, 255, 0.4);
    }

    .progress-text {
      font-size: 11px;
      font-weight: 700;
      color: var(--text);
      min-width: 35px;
      text-align: right;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text-muted);
      overflow-x: auto;
      scrollbar-width: none;
      white-space: nowrap;
    }

    .breadcrumb::-webkit-scrollbar {
      display: none;
    }

    .breadcrumb-item {
      white-space: nowrap;
      color: var(--text-muted);
      transition: color 0.15s ease;
    }

    .breadcrumb-item:hover {
      color: var(--accent);
    }

    .breadcrumb-separator {
      color: rgba(255, 255, 255, 0.2);
      user-select: none;
    }

    .workspace {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .canvas-wrapper {
      display: flex;
      flex: 1;
      position: relative;
    }

    .content-browser {
      width: 300px;
      height: 100%;
      background: linear-gradient(180deg, #0f0f0f 0%, #141414 100%);
      border-right: 1px solid rgba(74, 158, 255, 0.1);
      display: flex;
      flex-direction: column;
      z-index: 5;
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.3);
      transition: margin-left 0.3s ease;
      position: relative;
    }

    .content-browser.collapsed {
      margin-left: -300px;
    }

    .content-browser-toggle {
      position: absolute;
      right: -32px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 64px;
      background: #1a1a1a;
      border: 1px solid rgba(74, 158, 255, 0.2);
      border-left: none;
      border-radius: 0 8px 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease, right 0.3s ease;
      z-index: 100;
    }

    .content-browser.collapsed .content-browser-toggle {
      right: -332px; /* -300px (ширина панели) + -32px */
    }

    .content-browser-toggle:hover {
      background: #252525;
    }

    .content-browser-toggle svg {
      width: 16px;
      height: 16px;
      stroke: var(--accent);
      transition: transform 0.3s ease;
    }

    .content-browser.collapsed .content-browser-toggle svg {
      transform: rotate(180deg);
    }

    .content-browser-header {
      padding: 16px 12px 12px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      background: rgba(26, 26, 26, 0.5);
      backdrop-filter: blur(10px);
    }

    .content-browser-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .content-browser-search {
      width: 100%;
      background: rgba(26, 26, 26, 0.8);
      border: 1px solid rgba(74, 158, 255, 0.2);
      border-radius: 10px;
      padding: 10px 36px 10px 12px;
      color: var(--text);
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: all 0.3s ease;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(140,140,140,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>');
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
    }

    .content-browser-search::placeholder {
      color: var(--text-subtle);
      font-style: italic;
    }

    .content-browser-search:focus {
      border-color: var(--accent);
      background-color: rgba(26, 26, 26, 1);
      box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
    }

    .content-browser-list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px;
    }

    .content-browser-list::-webkit-scrollbar {
      width: 8px;
    }

    .content-browser-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .content-browser-list::-webkit-scrollbar-thumb {
      background: rgba(74, 158, 255, 0.2);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    .content-browser-list::-webkit-scrollbar-thumb:hover {
      background: rgba(74, 158, 255, 0.35);
      background-clip: padding-box;
    }

    .content-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      margin-bottom: 3px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      color: var(--text-muted);
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border: 1px solid transparent;
      position: relative;
    }

    .content-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: var(--accent);
      border-radius: 0 3px 3px 0;
      transition: height 0.2s ease;
    }

    .content-item:hover {
      background: rgba(74, 158, 255, 0.08);
      color: var(--text);
      transform: translateX(2px);
      border-color: rgba(74, 158, 255, 0.15);
    }

    .content-item:hover::before {
      height: 70%;
    }

    .content-item.active {
      background: rgba(74, 158, 255, 0.15);
      color: var(--accent);
      border-color: rgba(74, 158, 255, 0.3);
      font-weight: 600;
    }

    .content-item.active::before {
      height: 100%;
    }

    .content-item.highlighted {
      background: rgba(74, 158, 255, 0.25);
      color: var(--text);
      animation: pulse 1s ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .content-item-icon {
      flex-shrink: 0;
      font-size: 16px;
      width: 20px;
      text-align: center;
      filter: grayscale(0.3);
      transition: filter 0.2s ease;
    }

    .content-item:hover .content-item-icon {
      filter: grayscale(0);
    }

    .content-item-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .content-create-group-btn {
      width: calc(100% - 16px);
      padding: 10px 12px;
      margin: 8px 8px 4px;
      background: rgba(74, 158, 255, 0.1);
      border: 1px dashed rgba(74, 158, 255, 0.3);
      border-radius: 10px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .content-create-group-btn:hover {
      background: rgba(74, 158, 255, 0.15);
      border-color: var(--accent);
      transform: translateY(-1px);
    }

    .content-group {
      margin-bottom: 6px;
    }

    .content-group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(74, 158, 255, 0.12);
      border: 1px solid rgba(74, 158, 255, 0.25);
      cursor: pointer;
      user-select: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      transition: all 0.2s ease;
    }

    .content-group-header:hover {
      background: rgba(74, 158, 255, 0.18);
      border-color: rgba(74, 158, 255, 0.4);
    }

    .content-group-toggle {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .content-group-toggle.expanded {
      transform: rotate(90deg);
    }

    .content-group-children {
      padding-left: 12px;
      margin-top: 4px;
      border-left: 2px solid rgba(74, 158, 255, 0.15);
      margin-left: 16px;
      display: none;
    }

    .content-group-children.expanded {
      display: block;
    }

    .content-group-children .content-item {
      margin-bottom: 2px;
    }

    .content-item.drag-over {
      background: rgba(74, 158, 255, 0.25);
      border-color: var(--accent);
      border-style: dashed;
    }

    .content-browser-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-subtle);
      font-size: 13px;
      text-align: center;
      padding: 32px 20px;
      gap: 8px;
    }

    .content-browser-empty::before {
      content: '📭';
      font-size: 48px;
      opacity: 0.3;
      margin-bottom: 8px;
    }

    /* Floating text formatting toolbar */
    .text-format-toolbar {
      position: fixed;
      display: none;
      background: #1a1a1a;
      border: 1px solid rgba(74, 158, 255, 0.3);
      border-radius: 8px;
      padding: 4px;
      gap: 2px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      flex-direction: row;
      align-items: center;
    }

    .text-format-toolbar.visible {
      display: flex;
    }

    .text-format-btn {
      background: transparent;
      border: none;
      color: var(--text);
      padding: 6px 10px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
    }

    .text-format-btn:hover {
      background: rgba(74, 158, 255, 0.15);
    }

    .text-format-btn.active {
      background: var(--accent);
      color: white;
    }

    .text-format-separator {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 4px;
    }

    .canvas {
      position: relative;
      flex: 1;
      overflow: hidden;
      background-color: var(--bg);
    }

    .world {
      position: absolute;
      inset: 0;
      transform: translate(0, 0) scale(1);
      transform-origin: top left;
      width: 20000px;
      height: 20000px;
      background-color: var(--bg);
      background-image:
        radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 24px 24px;
      background-position: 0 0;
    }

    .connections {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .connection-path {
      fill: none;
      stroke: rgba(255, 255, 255, 0.35);
      stroke-width: 2;
    }

    .connection-path.temp {
      stroke-dasharray: 6 4;
      stroke: rgba(255, 255, 255, 0.5);
    }

    .text-object {
      user-select: none;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      pointer-events: auto;
      cursor: grab;
    }

    .shape-object {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
      pointer-events: auto;
      cursor: grab;
    }

    .object-resize-handle {
      position: absolute;
      right: -6px;
      bottom: -6px;
      width: 12px;
      height: 12px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.3);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      cursor: se-resize;
    }

    .nodes-layer {
      position: relative;
      pointer-events: auto;
    }

    .node {
      position: absolute;
      width: 220px;
      min-height: 90px;
      background: #2a2a2a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 14px 16px 18px;
      color: #0d0d0d;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
      cursor: grab;
      user-select: none;
      pointer-events: auto;
      transition: border-color 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
    }

    .node.completed {
      border-color: #68d391;
      border-width: 2px;
      opacity: 0.6;
      box-shadow: 0 12px 24px rgba(104, 211, 145, 0.3);
    }

    .node.achievement-earned {
      border-color: #f6ad55;
      border-width: 2px;
      box-shadow: 0 12px 24px rgba(246, 173, 85, 0.25);
    }

    .node:active {
      cursor: grabbing;
    }

    .node-view-btn {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.85);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      pointer-events: auto;
      z-index: 10;
      transition: all 0.15s ease;
    }

    .node-view-btn:hover {
      background: rgba(0, 0, 0, 0.35);
      color: rgba(255, 255, 255, 1);
    }

    .node-resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      cursor: nwse-resize;
      pointer-events: auto;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .node:hover .node-resize-handle {
      opacity: 1;
    }

    .node-resize-handle::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      border-right: 2px solid rgba(255, 255, 255, 0.4);
      border-bottom: 2px solid rgba(255, 255, 255, 0.4);
    }

    .node-title {
      font-size: 14px;
      font-weight: 600;
      color: #0d0d0d;
    }

    .node-title-input {
      width: 100%;
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 14px;
      font-weight: 600;
      outline: none;
    }

    .node-port {
      position: absolute;
      right: -8px;
      top: 50%;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent);
      border: 2px solid var(--panel);
      transform: translateY(-50%);
      cursor: crosshair;
      pointer-events: auto;
    }

    .context-menu,
    .color-menu {
      position: absolute;
      display: none;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(20, 20, 20, 0.95);
      border: 1px solid var(--border);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
      z-index: 20;
      opacity: 0;
      transform: translateY(6px) scale(0.98);
      transition: opacity 0.15s ease, transform 0.15s ease;
      pointer-events: none;
    }

    .context-menu.open,
    .color-menu.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .context-menu button {
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 13px;
      text-align: left;
      padding: 6px 8px;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .context-menu button:hover {
      background: rgba(74, 158, 255, 0.15);
    }

    .context-menu button.has-submenu::after {
      content: '▶';
      font-size: 10px;
      margin-left: 12px;
    }

    .color-submenu {
      position: fixed;
      display: none;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 6px;
      padding: 12px;
      width: 200px;
      border-radius: 12px;
      background: rgba(20, 20, 20, 0.95);
      border: 1px solid var(--border);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
      z-index: 21;
      pointer-events: auto;
    }

    .selection-box {
      position: absolute;
      border: 2px solid #4a9eff;
      background: rgba(74, 158, 255, 0.15);
      pointer-events: none;
      z-index: 10;
    }

    .color-submenu.open {
      display: flex;
    }

    .color-swatch {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }

    .color-swatch:hover {
      transform: scale(1.1);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .color-picker-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      background: linear-gradient(135deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #00ffff 75%, #0000ff 100%);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .color-picker-btn::after {
      content: '🎨';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.3);
    }

    .color-picker-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .color-picker-modal.open {
      display: flex;
    }

    .achievement-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .achievement-modal.open {
      display: flex;
    }

    .achievement-modal-content {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      width: 420px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .achievement-modal-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .achievement-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .achievement-field label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .achievement-field input,
    .achievement-field textarea {
      background: #111;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      color: var(--text);
      font-size: 13px;
      outline: none;
    }

    .achievement-field textarea {
      resize: vertical;
      min-height: 70px;
    }

    .achievement-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .achievement-actions button {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      cursor: pointer;
    }

    .achievement-actions .primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #0d0d0d;
    }

    .color-picker-content {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      width: 300px;
    }

    .color-picker-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .color-slider-group {
      margin-bottom: 16px;
    }

    .color-slider-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .color-slider {
      width: 100%;
      height: 8px;
      -webkit-appearance: none;
      appearance: none;
      background: linear-gradient(90deg, #000, #fff);
      border-radius: 4px;
      outline: none;
    }

    .color-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: #fff;
      border: 2px solid var(--accent);
      border-radius: 50%;
      cursor: pointer;
    }

    .color-preview {
      width: 100%;
      height: 60px;
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 16px;
    }

    .color-picker-actions {
      display: flex;
      gap: 8px;
    }

    .color-picker-actions button {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .color-picker-actions .cancel {
      background: var(--card-bg);
      color: var(--text);
    }

    .color-picker-actions .apply {
      background: var(--accent);
      color: white;
    }

    .achievement-toast {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(20, 20, 20, 0.95);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      z-index: 120;
    }

    .achievement-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .achievement-toast-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(74, 158, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      overflow: hidden;
    }

    .achievement-toast-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .achievement-toast-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }

    .achievement-toast-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    .confetti-particle {
      position: absolute;
      pointer-events: none;
      z-index: 110;
    }

    @keyframes confettiFall {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
      }
      25% {
        opacity: 1;
      }
      100% {
        transform: translate(var(--tx), var(--ty)) rotate(var(--rotation));
        opacity: 0;
      }
    }

    .text-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .text-modal.open {
      display: flex;
    }

    .text-modal-content {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    }

    .text-modal-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }

    .text-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .text-input-group label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .text-input-group textarea {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      color: var(--text);
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
    }

    .text-input-group textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    .text-settings-group {
      display: flex;
      gap: 12px;
    }

    .text-setting {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .text-setting label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .text-setting select {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text);
      font-size: 14px;
      cursor: pointer;
    }

    .text-setting select:focus {
      outline: none;
      border-color: var(--accent);
    }

    .text-colors {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .text-color-label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .text-color-swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .text-color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.15s ease, opacity 0.15s ease;
      position: relative;
    }

    .text-color-swatch:hover {
      transform: scale(1.1);
    }

    .text-color-swatch.active::after {
      content: '✓';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      text-shadow: 0 0 3px rgba(0,0,0,0.5);
    }

    .text-modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .text-modal-actions button {
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .text-modal-actions .text-cancel {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
    }

    .text-modal-actions .text-cancel:hover {
      border-color: var(--text-muted);
      color: var(--text);
    }

    .text-modal-actions .text-create {
      background: var(--accent);
      color: white;
      border: none;
    }

    .text-modal-actions .text-create:hover {
      background: var(--accent-soft);
    }

    .color-menu {
      flex-direction: row;
      flex-wrap: wrap;
      width: 180px;
    }

    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
    }

    .toolbar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      z-index: 50;
    }

    .toolbar-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      position: relative;
    }

    .toolbar-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.95);
    }

    .toolbar-btn.active {
      background: var(--accent);
      color: white;
    }

    .toolbar-separator {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 4px;
    }

    .shapes-submenu {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      flex-direction: row;
      gap: 4px;
      padding: 8px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(12px);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 50;
    }

    .shapes-submenu.open {
      display: flex;
    }

    .shape-btn {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .shape-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.95);
    }

    .nav-buttons {
      position: fixed;
      top: 80px;
      right: 24px;
      display: none;
      flex-direction: column;
      gap: 8px;
      z-index: 40;
    }

    .nav-buttons.visible {
      display: flex;
    }

    .nav-btn {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .nav-btn:hover {
      background: rgba(30, 30, 30, 0.98);
      color: var(--accent);
      transform: scale(1.05);
    }

    .edit-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .edit-modal-backdrop.open {
      opacity: 1;
    }

    .edit-modal {
      background: var(--panel);
      border-radius: 16px;
      border: 1px solid var(--border);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
      transform: scale(0.95) translateY(20px);
      transition: transform 0.2s ease;
    }

    .edit-modal-backdrop.open .edit-modal {
      transform: scale(1) translateY(0);
    }

    .edit-modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .edit-modal-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .edit-modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-modal-close:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
    }

    .edit-modal-content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .edit-form-group {
      margin-bottom: 20px;
    }

    .edit-form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .edit-form-input,
    .edit-form-textarea {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text);
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .edit-form-textarea {
      min-height: 120px;
      resize: vertical;
    }

    .edit-form-input:focus,
    .edit-form-textarea:focus {
      border-color: var(--accent);
    }

    .edit-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .edit-modal-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
      border: none;
    }

    .edit-modal-btn.cancel {
      background: transparent;
      color: var(--text-muted);
    }

    .edit-modal-btn.cancel:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
    }

    .edit-modal-btn.save {
      background: var(--accent);
      color: white;
    }

    .edit-modal-btn.save:hover {
      background: var(--accent-soft);
    }

    .content {
      flex: 1;
      padding: 40px 60px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .nodes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .nodes-title {
      font-size: 22px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.5px;
    }

    .nodes-count {
      font-size: 12px;
      color: var(--text-subtle);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .nodes-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .node-card {
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 20px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      position: relative;
    }

    .node-card:hover {
      border-color: var(--border);
      background-color: var(--card-hover);
    }

    .node-card-content {
      flex: 1;
    }

    .node-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
      word-break: break-word;
    }

    .node-description {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 10px;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .node-meta {
      font-size: 11px;
      color: var(--text-subtle);
      font-weight: 500;
    }

    .node-actions-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--text-subtle);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .node-actions-btn:hover {
      background: var(--panel);
      color: var(--text);
    }

    .add-node-btn {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 11px 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
    }

    .add-node-btn:hover {
      background: var(--accent-soft);
    }

    .back-btn {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
    }

    .back-btn:hover {
      background: var(--panel);
      color: var(--text);
      border-color: var(--border);
    }

    .empty-state {
      text-align: center;
      padding: 60px 24px;
      color: var(--text-subtle);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state-text {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 20px;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      width: 100%;
      max-width: 440px;
      color: var(--text);
    }

    .modal h3 {
      margin-bottom: 28px;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }

    .modal input,
    .modal textarea {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 11px 14px;
      color: var(--text);
      margin-bottom: 14px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      transition: all 0.15s ease;
    }
    
    .modal input:focus,
    .modal textarea:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--panel);
    }

    .modal textarea {
      min-height: 80px;
      resize: vertical;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .modal-actions button {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 13px;
      border-radius: var(--radius);
      padding: 9px 16px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
    }

    .modal-actions button:hover {
      background: var(--panel);
      color: var(--text);
    }

    .modal-actions button.primary {
      background: var(--accent);
      color: white;
      border: none;
    }

    .modal-actions button.primary:hover {
      background: var(--accent-soft);
    }

    @media (max-width: 960px) {
      .app {
        grid-template-columns: 1fr;
      }

      .sidebar {
        flex-direction: row;
        padding: 8px;
        border-bottom: 1px solid var(--border);
        border-right: none;
      }
      
      .sidebar-header {
        display: none;
      }

      .content {
        padding: 24px;
      }

      .nodes-container {
        grid-template-columns: 1fr;
      }
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 40px;
      text-align: center;
      gap: 20px;
    }

    .error-icon {
      font-size: 64px;
      opacity: 0.3;
    }

    .error-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }

    .error-text {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 400px;
    }

    .error-button {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 11px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
      margin-top: 12px;
    }

    .error-button:hover {
      background: var(--accent-soft);
    }
  </style>

</head>
<body>
  <div class="workspace">
    <header class="topbar">
      <div class="topbar-row">
        <div class="topbar-left">
          <div class="topbar-title">NODE WORKSPACE</div>
          <div class="topbar-path" id="path-title">Loading...</div>
        </div>
        <div class="topbar-actions">
          <button class="back-btn" id="back-home">← Back to Hub</button>
        </div>
      </div>
      <div class="topbar-row">
        <div class="topbar-progress">
          <div class="progress-bar-wrapper">
            <div class="progress-bar" id="progress-bar" style="width: 0%;"></div>
          </div>
          <div class="progress-text" id="progress-text">0%</div>
        </div>
        <div class="breadcrumb" id="breadcrumb">
          <span class="breadcrumb-item">No nodes yet</span>
        </div>
      </div>
    </header>

    <div class="canvas-wrapper">
      <div class="content-browser" id="content-browser">
        <button class="content-browser-toggle" id="content-browser-toggle" title="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="content-browser-header">
          <div class="content-browser-title">Content</div>
          <input type="text" class="content-browser-search" id="content-search" placeholder="Search..." />
        </div>
        <button class="content-create-group-btn" id="create-group-btn">
          <span>📦</span>
          <span>Create Group</span>
        </button>
        <div class="content-browser-list" id="content-list">
          <div class="content-browser-empty">No elements yet</div>
        </div>
      </div>

      <div class="canvas" id="canvas">
        <div class="world" id="world">
          <svg class="connections" id="connections"></svg>
          <div class="nodes-layer" id="nodes-layer"></div>
        </div>

      <div class="context-menu" id="context-menu">
        <button id="create-node">Create Node</button>
        <button id="add-button">Add View Button</button>
        <button id="create-achievement" style="display: none;">Create Achievement</button>
        <button id="edit-achievement" style="display: none;">Edit Achievement</button>
        <button id="delete-achievement" style="display: none;">Delete Achievement</button>
        <button id="undo-achievement" style="display: none;">Undo Achievement</button>
        <button id="colors-menu" class="has-submenu" style="display: none;">Colors</button>
        <button id="delete-node" style="display: none;">Delete Node</button>
        <button id="pin-node" style="display: none;">Pin/Unpin</button>
        <button id="copy-node" style="display: none;">Copy</button>
        <button id="paste-node" style="display: none;">Paste</button>
      </div>

      <div class="context-menu" id="text-context-menu">
        <button id="text-font-menu" class="has-submenu">Font</button>
        <button id="text-bold">Bold</button>
        <button id="text-italic">Italic</button>
        <button id="text-strikethrough">Strikethrough</button>
        <button id="text-color-menu" class="has-submenu">Text Color</button>
      </div>

      <div class="text-format-toolbar" id="text-format-toolbar">
        <button class="text-format-btn" id="format-bold" title="Bold (Ctrl+B)">B</button>
        <button class="text-format-btn" id="format-italic" title="Italic (Ctrl+I)"><i>I</i></button>
        <button class="text-format-btn" id="format-strike" title="Strikethrough">S̶</button>
        <div class="text-format-separator"></div>
        <button class="text-format-btn" id="format-font" title="Font">Aa</button>
        <button class="text-format-btn" id="format-color" title="Color">🎨</button>
      </div>

      <div class="color-submenu" id="text-color-submenu">
        <div class="color-swatch" data-color="#000000" style="background: #000000;"></div>
        <div class="color-swatch" data-color="#4a9eff" style="background: #4a9eff;"></div>
        <div class="color-swatch" data-color="#9d7bff" style="background: #9d7bff;"></div>
        <div class="color-swatch" data-color="#4fd1c5" style="background: #4fd1c5;"></div>
        <div class="color-swatch" data-color="#f6ad55" style="background: #f6ad55;"></div>
        <div class="color-swatch" data-color="#f56565" style="background: #f56565;"></div>
        <div class="color-swatch" data-color="#68d391" style="background: #68d391;"></div>
        <div class="color-swatch" data-color="#ffffff" style="background: #ffffff; border: 1px solid #ccc;"></div>
      </div>

      <div class="color-submenu" id="font-submenu">
        <button data-font="Inter">Inter</button>
        <button data-font="Arial">Arial</button>
        <button data-font="Georgia">Georgia</button>
        <button data-font="Courier New">Courier New</button>
        <button data-font="Times New Roman">Times New Roman</button>
        <button data-font="Comic Sans MS">Comic Sans MS</button>
      </div>

      <div class="color-submenu" id="color-submenu">
        <div class="color-swatch" data-color="#4a9eff" style="background: #4a9eff;"></div>
        <div class="color-swatch" data-color="#9d7bff" style="background: #9d7bff;"></div>
        <div class="color-swatch" data-color="#4fd1c5" style="background: #4fd1c5;"></div>
        <div class="color-swatch" data-color="#f6ad55" style="background: #f6ad55;"></div>
        <div class="color-swatch" data-color="#f56565" style="background: #f56565;"></div>
        <div class="color-swatch" data-color="#68d391" style="background: #68d391;"></div>
        <div class="color-picker-btn" id="color-picker-btn"></div>
      </div>

      <div class="color-picker-modal" id="color-picker-modal">
        <div class="color-picker-content">
          <div class="color-picker-title">Custom Color</div>
          <div class="color-preview" id="color-preview" style="background: #ffffff;"></div>
          <div class="color-slider-group">
            <div class="color-slider-label"><span>Red</span><span id="r-value">255</span></div>
            <input type="range" class="color-slider" id="r-slider" min="0" max="255" value="255" style="background: linear-gradient(90deg, #000, #f00);">
          </div>
          <div class="color-slider-group">
            <div class="color-slider-label"><span>Green</span><span id="g-value">255</span></div>
            <input type="range" class="color-slider" id="g-slider" min="0" max="255" value="255" style="background: linear-gradient(90deg, #000, #0f0);">
          </div>
          <div class="color-slider-group">
            <div class="color-slider-label"><span>Blue</span><span id="b-value">255</span></div>
            <input type="range" class="color-slider" id="b-slider" min="0" max="255" value="255" style="background: linear-gradient(90deg, #000, #00f);">
          </div>
          <div class="color-picker-actions">
            <button class="cancel" id="color-picker-cancel">Cancel</button>
            <button class="apply" id="color-picker-apply">Apply</button>
          </div>
        </div>
      </div>

      <div class="achievement-modal" id="achievement-modal">
        <div class="achievement-modal-content">
          <div class="achievement-modal-title">Create Achievement</div>
          <div class="achievement-field">
            <label>Title</label>
            <input id="achievement-title" placeholder="Achievement title" />
          </div>
          <div class="achievement-field">
            <label>Description</label>
            <textarea id="achievement-description" placeholder="Short description"></textarea>
          </div>
          <div class="achievement-field">
            <label>Icon / Image URL</label>
            <input id="achievement-icon" placeholder="Emoji or image URL" />
          </div>
          <div class="achievement-field">
            <label>Difficulty (0-10)</label>
            <input id="achievement-difficulty" type="number" min="0" max="10" value="0" />
          </div>
          <div class="achievement-actions">
            <button id="achievement-cancel">Cancel</button>
            <button class="primary" id="achievement-create">Create</button>
          </div>
        </div>
      </div>

      <div class="achievement-toast" id="achievement-toast">
        <div class="achievement-toast-icon" id="achievement-toast-icon">🏆</div>
        <div class="achievement-toast-body">
          <div class="achievement-toast-title" id="achievement-toast-title">Achievement Unlocked</div>
          <div class="achievement-toast-sub" id="achievement-toast-sub">Source</div>
        </div>
      </div>

      <div class="text-modal" id="text-modal">
        <div class="text-modal-content">
          <div class="text-modal-title">Create Text</div>
          <div class="text-input-group">
            <label>Text</label>
            <textarea id="text-input" placeholder="Enter text..." rows="3"></textarea>
          </div>
          <div class="text-settings-group">
            <div class="text-setting">
              <label>Font</label>
              <select id="text-font">
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Comic Sans MS', cursive">Comic Sans</option>
              </select>
            </div>
            <div class="text-setting">
              <label>Size</label>
              <select id="text-size">
                <option value="12">12px</option>
                <option value="14" selected>14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="24">24px</option>
                <option value="32">32px</option>
                <option value="48">48px</option>
              </select>
            </div>
          </div>
          <div class="text-colors">
            <div class="text-color-label">Color</div>
            <div class="text-color-swatches">
              <div class="text-color-swatch" data-color="#000000" style="background: #000000;"></div>
              <div class="text-color-swatch" data-color="#4a9eff" style="background: #4a9eff;"></div>
              <div class="text-color-swatch active" data-color="#9d7bff" style="background: #9d7bff;"></div>
              <div class="text-color-swatch" data-color="#4fd1c5" style="background: #4fd1c5;"></div>
              <div class="text-color-swatch" data-color="#f6ad55" style="background: #f6ad55;"></div>
              <div class="text-color-swatch" data-color="#f56565" style="background: #f56565;"></div>
              <div class="text-color-swatch" data-color="#68d391" style="background: #68d391;"></div>
              <div class="text-color-swatch" data-color="#ffffff" style="background: #ffffff; border: 1px solid rgba(255,255,255,0.3);"></div>
            </div>
          </div>
          <div class="text-modal-actions">
            <button class="text-cancel" id="text-cancel">Cancel</button>
            <button class="text-create" id="text-create">Create</button>
          </div>
        </div>
      </div>

      <div class="color-menu" id="color-menu"></div>

      <div class="toolbar">
        <button class="toolbar-btn" id="tool-undo" title="Undo (Ctrl+Z)">↶</button>
        <button class="toolbar-btn" id="tool-redo" title="Redo (Ctrl+Y)">↷</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn active" id="tool-cursor" title="Cursor (V)">↖</button>
        <button class="toolbar-btn" id="tool-select" title="Select (S)">⬚</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" id="tool-shapes" title="Shapes">▢</button>
        <button class="toolbar-btn" id="tool-text" title="Text (T)">T</button>
      </div>

      <div class="shapes-submenu" id="shapes-submenu">
        <button class="shape-btn" data-shape="rect" title="Rectangle">▭</button>
        <button class="shape-btn" data-shape="circle" title="Circle">●</button>
        <button class="shape-btn" data-shape="triangle" title="Triangle">▲</button>
        <button class="shape-btn" data-shape="star" title="Star">★</button>
      </div>

      <div class="nav-buttons" id="nav-buttons">
        <button class="nav-btn" id="nav-to-last" title="Go to last created node">📍</button>
        <button class="nav-btn" id="nav-to-center" title="Go to center">🎯</button>
      </div>
    </div>

    <div class="edit-modal-backdrop" id="edit-modal-backdrop">
      <div class="edit-modal">
        <div class="edit-modal-header">
          <div class="edit-modal-title">Edit Node Details</div>
          <button class="edit-modal-close" id="close-modal">&times;</button>
        </div>
        <div class="edit-modal-content">
          <div class="edit-form-group">
            <label class="edit-form-label">Title</label>
            <input type="text" class="edit-form-input" id="edit-title" placeholder="Node title">
          </div>
          <div class="edit-form-group">
            <label class="edit-form-label">Description</label>
            <textarea class="edit-form-textarea" id="edit-description" placeholder="Add description, notes, or any details..."></textarea>
          </div>
        </div>
        <div class="edit-modal-footer">
          <button class="edit-modal-btn cancel" id="cancel-edit">Cancel</button>
          <button class="edit-modal-btn save" id="save-edit">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <script id="app-state" type="application/json">${stateJson}</script>
  <script>
    const state = JSON.parse(document.getElementById('app-state').textContent || '{}');
    const urlPathId = new URLSearchParams(window.location.search).get('pathId');
    const currentPathId = state.activePathId || state.currentPathId || urlPathId || null;
    const paths = state.paths || [];
    const currentPath = paths.find(p => p.id === currentPathId);

    console.log('[NodeUI] State:', state);
    console.log('[NodeUI] currentPathId:', currentPathId);
    console.log('[NodeUI] currentPath:', currentPath);
    console.log('[NodeUI] paths count:', paths.length);

    const palette = [
      '#4a9eff', '#9d7bff', '#4fd1c5', '#f6ad55', '#f56565', '#68d391',
      '#fbd38d', '#a0aec0', '#90cdf4', '#feb2b2', '#d6bcfa', '#81e6d9'
    ];

    const canvas = document.getElementById('canvas');
    const world = document.getElementById('world');
    const nodesLayer = document.getElementById('nodes-layer');
    const connections = document.getElementById('connections');
    const contentBrowser = document.getElementById('content-browser');
    const contentBrowserToggle = document.getElementById('content-browser-toggle');
    const contentSearch = document.getElementById('content-search');
    const contentList = document.getElementById('content-list');
    const contextMenu = document.getElementById('context-menu');
    const colorMenu = document.getElementById('color-menu');
    const colorSubmenu = document.getElementById('color-submenu');
    const colorPickerModal = document.getElementById('color-picker-modal');
    const colorPickerBtn = document.getElementById('color-picker-btn');
    const colorPreview = document.getElementById('color-preview');
    const rSlider = document.getElementById('r-slider');
    const gSlider = document.getElementById('g-slider');
    const bSlider = document.getElementById('b-slider');
    const rValue = document.getElementById('r-value');
    const gValue = document.getElementById('g-value');
    const bValue = document.getElementById('b-value');
    const colorPickerCancel = document.getElementById('color-picker-cancel');
    const colorPickerApply = document.getElementById('color-picker-apply');
    const textModal = document.getElementById('text-modal');
    const textInput = document.getElementById('text-input');
    const textFont = document.getElementById('text-font');
    const textSize = document.getElementById('text-size');
    const textCancel = document.getElementById('text-cancel');
    const textCreate = document.getElementById('text-create');
    const createNodeBtn = document.getElementById('create-node');
    const addButtonBtn = document.getElementById('add-button');
    const createAchievementBtn = document.getElementById('create-achievement');
    const editAchievementBtn = document.getElementById('edit-achievement');
    const deleteAchievementBtn = document.getElementById('delete-achievement');
    const undoAchievementBtn = document.getElementById('undo-achievement');
    const colorsMenuBtn = document.getElementById('colors-menu');
    const deleteNodeBtn = document.getElementById('delete-node');
    const pinNodeBtn = document.getElementById('pin-node');
    const copyNodeBtn = document.getElementById('copy-node');
    const pasteNodeBtn = document.getElementById('paste-node');
    const achievementModal = document.getElementById('achievement-modal');
    const achievementTitleInput = document.getElementById('achievement-title');
    const achievementDescriptionInput = document.getElementById('achievement-description');
    const achievementIconInput = document.getElementById('achievement-icon');
    const achievementDifficultyInput = document.getElementById('achievement-difficulty');
    const achievementCancelBtn = document.getElementById('achievement-cancel');
    const achievementCreateBtn = document.getElementById('achievement-create');
    const achievementToast = document.getElementById('achievement-toast');
    const achievementToastIcon = document.getElementById('achievement-toast-icon');
    const achievementToastTitle = document.getElementById('achievement-toast-title');
    const achievementToastSub = document.getElementById('achievement-toast-sub');
    const editModalBackdrop = document.getElementById('edit-modal-backdrop');
    const editTitle = document.getElementById('edit-title');
    const editDescription = document.getElementById('edit-description');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveEditBtn = document.getElementById('save-edit');
    const navButtons = document.getElementById('nav-buttons');
    const navToLastBtn = document.getElementById('nav-to-last');
    const navToCenterBtn = document.getElementById('nav-to-center');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const breadcrumb = document.getElementById('breadcrumb');

    const camera = { x: -9000, y: -9000, zoom: 1 };
    const nodeSize = { width: 220, height: 90 };
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let dragNodeId = null;
    let dragOffset = { x: 0, y: 0 };
    let linkFromNode = null;
    let linkCursor = { x: 0, y: 0 };
    let contextPosition = { x: 0, y: 0 };
    let clickStart = { x: 0, y: 0 };
    let clickMoved = false;
    const clickThreshold = 6;
    let editingNodeId = null;
    let selectedNodeId = null;
    let contextNodeId = null;
    let achievementNodeId = null;
    let copiedNode = null;
    let resizeNodeId = null;
    let resizeStart = { x: 0, y: 0, width: 0, height: 0 };
    let dragTextId = null;
    let dragShapeId = null;
    let resizeTextId = null;
    let resizeShapeId = null;
    let dragTextOffset = { x: 0, y: 0 };
    let dragShapeOffset = { x: 0, y: 0 };
    let objectResizeStart = { x: 0, y: 0, width: 0, height: 0, size: 0 };
    let lastCreatedNodeId = null;
    let rightClickStart = { x: 0, y: 0, time: 0 };
    let rightClickMoved = false;
    let currentTool = 'cursor'; // cursor, select, shapes, text
    let customColor = '#ffffff';
    let selectionStart = null;
    let selectedNodes = [];
    let selectionBox = null;
    let colorSubmenuTimeout = null;
    let textColor = '#9d7bff';
    let editingTextId = null;
    let editingTextInput = null;
    let editingNodeTextId = null;
    
    // Undo/Redo система (последние 25 действий)
    let undoStack = [];
    let redoStack = [];
    const MAX_UNDO_STACK = 25;
    
    // Загрузить текстовые объекты и фигуры из localStorage
    let textObjects = [];
    let shapeObjects = [];
    let contentGroups = [];
    try {
      const savedTexts = localStorage.getItem('textObjects_' + currentPathId);
      const savedShapes = localStorage.getItem('shapeObjects_' + currentPathId);
      const savedGroups = localStorage.getItem('contentGroups_' + currentPathId);
      if (savedTexts) textObjects = JSON.parse(savedTexts);
      if (savedShapes) shapeObjects = JSON.parse(savedShapes);
      if (savedGroups) contentGroups = JSON.parse(savedGroups);
    } catch (e) {
      console.error('[NodeUI] Error loading saved objects:', e);
    }

    function saveTextObjects() {
      if (!currentPathId) return;
      localStorage.setItem('textObjects_' + currentPathId, JSON.stringify(textObjects));
    }

    function saveShapeObjects() {
      if (!currentPathId) return;
      localStorage.setItem('shapeObjects_' + currentPathId, JSON.stringify(shapeObjects));
    }

    function saveContentGroups() {
      if (!currentPathId) return;
      localStorage.setItem('contentGroups_' + currentPathId, JSON.stringify(contentGroups));
    }

    // Undo/Redo система
    function pushUndoState(action) {
      const state = {
        action: action,
        nodes: JSON.parse(JSON.stringify(nodes)),
        textObjects: JSON.parse(JSON.stringify(textObjects)),
        shapeObjects: JSON.parse(JSON.stringify(shapeObjects)),
        contentGroups: JSON.parse(JSON.stringify(contentGroups))
      };
      undoStack.push(state);
      if (undoStack.length > MAX_UNDO_STACK) {
        undoStack.shift();
      }
      redoStack = [];
    }

    function undo() {
      if (undoStack.length === 0) return;
      
      const currentState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        textObjects: JSON.parse(JSON.stringify(textObjects)),
        shapeObjects: JSON.parse(JSON.stringify(shapeObjects)),
        contentGroups: JSON.parse(JSON.stringify(contentGroups))
      };
      redoStack.push(currentState);
      if (redoStack.length > MAX_UNDO_STACK) {
        redoStack.shift();
      }
      
      const prevState = undoStack.pop();
      nodes = prevState.nodes;
      textObjects = prevState.textObjects;
      shapeObjects = prevState.shapeObjects;
      contentGroups = prevState.contentGroups;
      
      saveNodes();
      saveTextObjects();
      saveShapeObjects();
      saveContentGroups();
      render();
    }

    function redo() {
      if (redoStack.length === 0) return;
      
      const currentState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        textObjects: JSON.parse(JSON.stringify(textObjects)),
        shapeObjects: JSON.parse(JSON.stringify(shapeObjects)),
        contentGroups: JSON.parse(JSON.stringify(contentGroups))
      };
      undoStack.push(currentState);
      
      const nextState = redoStack.pop();
      nodes = nextState.nodes;
      textObjects = nextState.textObjects;
      shapeObjects = nextState.shapeObjects;
      contentGroups = nextState.contentGroups;
      
      saveNodes();
      saveTextObjects();
      saveShapeObjects();
      saveContentGroups();
      render();
    }

    let nodes = (currentPath?.nodes || []).map((node) => ({
      ...node,
      position: node.position || { x: 0, y: 0 },
      color: node.color || '#4a9eff',
      connections: Array.isArray(node.connections) ? node.connections : [],
      size: node.size || { width: 220, height: 90 },
      description: node.description || '',
      hasButton: node.hasButton || false,
      pinned: node.pinned || false,
      completed: node.completed || false,
      achievement: node.achievement || null,
      textStyle: node.textStyle || { 
        fontFamily: 'Inter', 
        bold: false, 
        italic: false, 
        strikethrough: false, 
        color: '#ffffff' 
      }
    }));

    console.log('[NodeUI] Loaded nodes:', nodes.length, nodes);

    if (nodes.length === 0 && currentPathId) {
      createNodeAt({ x: 10000, y: 10000 });
    } else if (nodes.length > 0) {
      lastCreatedNodeId = nodes[nodes.length - 1].id;
    }

    function updatePathTitle() {
      const titleEl = document.getElementById('path-title');
      if (currentPath) {
        titleEl.textContent = currentPath.title || 'Untitled Path';
      } else {
        titleEl.textContent = 'Path not found';
      }
    }

    function notifyPathOpened() {
      if (!currentPathId || state.activePathId === currentPathId) {
        return;
      }

      fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SET_ACTIVE_PATH', payload: { pathId: currentPathId } })
      }).catch(e => console.error('Error setting active path:', e));
    }

    function applyCamera() {
      world.style.transform = 'translate(' + camera.x + 'px, ' + camera.y + 'px) scale(' + camera.zoom + ')';
    }

    function worldFromClient(x, y) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (x - rect.left - camera.x) / camera.zoom,
        y: (y - rect.top - camera.y) / camera.zoom
      };
    }

    function renderContentBrowser() {
      const searchTerm = contentSearch.value.toLowerCase().trim();
      
      // Собираем все элементы
      const allItems = [];
      const itemsInGroups = new Set();

      // Добавляем элементы из групп
      contentGroups.forEach(group => {
        group.items.forEach(itemRef => {
          itemsInGroups.add(itemRef.type + '_' + itemRef.id);
        });
      });

      (nodes || []).forEach((node) => {
        const title = node.title || 'Untitled';
        const description = node.description || '';
        
        if (!searchTerm || 
            title.toLowerCase().includes(searchTerm) || 
            description.toLowerCase().includes(searchTerm)) {
          allItems.push({
            id: node.id,
            type: 'node',
            icon: '⭕',
            label: title,
            inGroup: itemsInGroups.has('node_' + node.id)
          });
        }
      });

      (textObjects || []).forEach((textObj) => {
        const text = (textObj.text || '').trim();
        const preview = text.substring(0, 30) + (text.length > 30 ? '...' : '');
        const label = preview || 'Text';
        
        if (!searchTerm || text.toLowerCase().includes(searchTerm)) {
          allItems.push({
            id: textObj.id,
            type: 'text',
            icon: '📝',
            label: label,
            inGroup: itemsInGroups.has('text_' + textObj.id)
          });
        }
      });

      (shapeObjects || []).forEach((shapeObj) => {
        const label = shapeObj.type || 'Shape';
        
        if (!searchTerm || label.toLowerCase().includes(searchTerm)) {
          allItems.push({
            id: shapeObj.id,
            type: 'shape',
            icon: '⬛',
            label: label,
            inGroup: itemsInGroups.has('shape_' + shapeObj.id)
          });
        }
      });

      if (!allItems.length && !contentGroups.length) {
        contentList.innerHTML = searchTerm 
          ? '<div class="content-browser-empty">No matches</div>'
          : '<div class="content-browser-empty">No elements yet</div>';
        return;
      }

      // Рендерим группы и элементы вне групп
      let html = '';
      
      // Группы
      contentGroups.forEach(group => {
        const isExpanded = group.expanded !== false;
        html += '<div class="content-group" data-group-id="' + group.id + '">';
        html += '<div class="content-group-header" data-action="toggle-group">';
        html += '<span class="content-group-toggle' + (isExpanded ? ' expanded' : '') + '">▶</span>';
        html += '<span>📦 ' + group.name + ' (' + group.items.length + ')</span>';
        html += '</div>';
        html += '<div class="content-group-children' + (isExpanded ? ' expanded' : '') + '">';
        
        group.items.forEach(itemRef => {
          const item = allItems.find(i => i.type === itemRef.type && i.id === itemRef.id);
          if (item) {
            const isActive = (item.type === 'node' && item.id === selectedNodeId) ||
                            (item.type === 'text' && item.id === dragTextId) ||
                            (item.type === 'shape' && item.id === dragShapeId);
            const activeClass = isActive ? ' active' : '';
            html += '<div class="content-item' + activeClass + '" data-content-id="' + item.id + '" data-content-type="' + item.type + '" draggable="true">';
            html += '<span class="content-item-icon">' + item.icon + '</span>';
            html += '<span class="content-item-label">' + item.label + '</span>';
            html += '</div>';
          }
        });
        
        html += '</div></div>';
      });

      // Элементы вне групп
      allItems.forEach((item) => {
        if (!item.inGroup) {
          const isActive = (item.type === 'node' && item.id === selectedNodeId) ||
                          (item.type === 'text' && item.id === dragTextId) ||
                          (item.type === 'shape' && item.id === dragShapeId);
          const activeClass = isActive ? ' active' : '';
          html += '<div class="content-item' + activeClass + '" data-content-id="' + item.id + '" data-content-type="' + item.type + '" draggable="true">';
          html += '<span class="content-item-icon">' + item.icon + '</span>';
          html += '<span class="content-item-label">' + item.label + '</span>';
          html += '</div>';
        }
      });

      contentList.innerHTML = html || '<div class="content-browser-empty">No matches</div>';
    }

    function renderNodes() {
      nodesLayer.innerHTML = nodes.map((node) => {
        const width = node.size?.width || 220;
        const height = node.size?.height || 90;
        const hasButton = node.hasButton || false;
        const completed = node.completed || false;
        const achievement = node.achievement || null;
        const isAchievementEarned = achievement && achievement.unlocked && !completed;
        const textStyle = node.textStyle || {};
        
        let classes = 'node';
        if (completed) classes += ' completed';
        if (isAchievementEarned) classes += ' achievement-earned';
        
        let titleStyle = 'font-family: ' + (textStyle.fontFamily || 'Inter') + ';';
        titleStyle += 'color: ' + (textStyle.color || '#ffffff') + ';';
        if (textStyle.bold) titleStyle += 'font-weight: bold;';
        if (textStyle.italic) titleStyle += 'font-style: italic;';
        if (textStyle.strikethrough) titleStyle += 'text-decoration: line-through;';
        
        return (
          '<div class="' + classes + '" data-node-id="' + node.id + '" style="background: ' + node.color + '; width: ' + width + 'px; min-height: ' + height + 'px; transform: translate(' + node.position.x + 'px, ' + node.position.y + 'px);">' +
            '<div class="node-title" data-role="title" style="' + titleStyle + '">' + (node.title || 'Untitled') + '</div>' +
            (hasButton ? '<button class="node-view-btn" data-role="view">👁️ View</button>' : '') +
            '<div class="node-port" data-role="port"></div>' +
            '<div class="node-resize-handle" data-role="resize"></div>' +
          '</div>'
        );
      }).join('');
    }

    function buildPath(from, to) {
      const dx = Math.abs(to.x - from.x);
      const controlOffset = Math.max(80, dx * 0.5);
      const c1 = { x: from.x + controlOffset, y: from.y };
      const c2 = { x: to.x - controlOffset, y: to.y };
      return 'M ' + from.x + ' ' + from.y + ' C ' + c1.x + ' ' + c1.y + ', ' + c2.x + ' ' + c2.y + ', ' + to.x + ' ' + to.y;
    }

    function renderConnections() {
      const worldWidth = 20000;
      const worldHeight = 20000;
      connections.setAttribute('width', worldWidth);
      connections.setAttribute('height', worldHeight);
      connections.setAttribute('viewBox', '0 0 ' + worldWidth + ' ' + worldHeight);

      let pathsMarkup = '';
      nodes.forEach((node) => {
        const nodeWidth = node.size?.width || 220;
        const nodeHeight = node.size?.height || 90;
        const from = {
          x: node.position.x + nodeWidth,
          y: node.position.y + nodeHeight / 2
        };
        (node.connections || []).forEach((targetId) => {
          const target = nodes.find(n => n.id === targetId);
          if (!target) return;
          const targetHeight = target.size?.height || 90;
          const to = {
            x: target.position.x,
            y: target.position.y + targetHeight / 2
          };
          pathsMarkup += '<path class="connection-path" d="' + buildPath(from, to) + '" />';
        });
      });

      if (linkFromNode) {
        const nodeWidth = linkFromNode.size?.width || 220;
        const nodeHeight = linkFromNode.size?.height || 90;
        const from = {
          x: linkFromNode.position.x + nodeWidth,
          y: linkFromNode.position.y + nodeHeight / 2
        };
        pathsMarkup += '<path class="connection-path temp" d="' + buildPath(from, linkCursor) + '" />';
      }

      connections.innerHTML = pathsMarkup;
    }

    function renderTextObjects() {
      let existingTexts = world.querySelectorAll('.text-object');
      existingTexts.forEach(el => el.remove());
      
      textObjects.forEach(textObj => {
        const textEl = document.createElement('div');
        textEl.className = 'text-object';
        textEl.dataset.textId = textObj.id;
        textEl.style.position = 'absolute';
        textEl.style.left = textObj.x + 'px';
        textEl.style.top = textObj.y + 'px';
        textEl.style.color = textObj.color;
        textEl.style.fontSize = textObj.size + 'px';
        textEl.style.fontFamily = textObj.font;
        textEl.style.whiteSpace = 'pre-wrap';
        textEl.textContent = textObj.text;
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'object-resize-handle';
        textEl.appendChild(resizeHandle);
        world.appendChild(textEl);
      });
    }

    function renderShapeObjects() {
      let existingShapes = world.querySelectorAll('.shape-object');
      existingShapes.forEach(el => el.remove());
      
      shapeObjects.forEach(shapeObj => {
        const shapeEl = document.createElement('div');
        shapeEl.className = 'shape-object';
        shapeEl.dataset.shapeId = shapeObj.id;
        shapeEl.style.position = 'absolute';
        shapeEl.style.left = shapeObj.x + 'px';
        shapeEl.style.top = shapeObj.y + 'px';
        shapeEl.style.width = shapeObj.width + 'px';
        shapeEl.style.height = shapeObj.height + 'px';
        
        let svgContent = '';
        const fill = shapeObj.color || '#4a9eff';
        const stroke = 'rgba(255,255,255,0.3)';
        
        if (shapeObj.type === 'rect') {
          svgContent = '<svg width="' + shapeObj.width + '" height="' + shapeObj.height + '" xmlns="http://www.w3.org/2000/svg"><rect width="' + shapeObj.width + '" height="' + shapeObj.height + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2" rx="8"/></svg>';
        } else if (shapeObj.type === 'circle') {
          const r = Math.min(shapeObj.width, shapeObj.height) / 2;
          const cx = shapeObj.width / 2;
          const cy = shapeObj.height / 2;
          svgContent = '<svg width="' + shapeObj.width + '" height="' + shapeObj.height + '" xmlns="http://www.w3.org/2000/svg"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/></svg>';
        } else if (shapeObj.type === 'triangle') {
          const points = (shapeObj.width / 2) + ',0 ' + shapeObj.width + ',' + shapeObj.height + ' 0,' + shapeObj.height;
          svgContent = '<svg width="' + shapeObj.width + '" height="' + shapeObj.height + '" xmlns="http://www.w3.org/2000/svg"><polygon points="' + points + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/></svg>';
        } else if (shapeObj.type === 'star') {
          const cx = shapeObj.width / 2;
          const cy = shapeObj.height / 2;
          const outerR = Math.min(shapeObj.width, shapeObj.height) / 2;
          const innerR = outerR * 0.4;
          let points = [];
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            points.push(x + ',' + y);
          }
          svgContent = '<svg width="' + shapeObj.width + '" height="' + shapeObj.height + '" xmlns="http://www.w3.org/2000/svg"><polygon points="' + points.join(' ') + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/></svg>';
        }
        
        shapeEl.innerHTML = svgContent;
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'object-resize-handle';
        shapeEl.appendChild(resizeHandle);
        world.appendChild(shapeEl);
      });
    }

    function render() {
      renderNodes();
      renderConnections();
      renderTextObjects();
      renderShapeObjects();
      renderContentBrowser();
      updateProgress();
      updateBreadcrumb();
      checkNodeVisibility();
    }

    function updateProgress() {
      const totalNodes = nodes.length;
      const completedNodes = nodes.filter(n => n.completed).length;
      const percentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
      
      progressBar.style.width = percentage + '%';
      progressText.textContent = percentage + '%';
    }

    function updateBreadcrumb() {
      if (nodes.length === 0) {
        breadcrumb.innerHTML = '<span class="breadcrumb-item">No nodes yet</span>';
        return;
      }

      // Взять последние 5 нод (в порядке создания)
      const recentNodes = nodes.slice(-5);
      
      breadcrumb.innerHTML = recentNodes.map((node, index) => {
        const title = node.title || 'Untitled';
        const separator = index < recentNodes.length - 1 ? '<span class="breadcrumb-separator">→</span>' : '';
        return '<span class="breadcrumb-item">' + title + '</span>' + separator;
      }).join('');
    }

    function checkNodeVisibility() {
      if (nodes.length === 0) {
        navButtons.classList.remove('visible');
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const viewportWidth = rect.width;
      const viewportHeight = rect.height;

      let anyVisible = false;
      for (const node of nodes) {
        const nodeWidth = node.size?.width || 220;
        const nodeHeight = node.size?.height || 90;
        
        const screenX = node.position.x * camera.zoom + camera.x;
        const screenY = node.position.y * camera.zoom + camera.y;
        
        if (screenX + nodeWidth * camera.zoom >= 0 && 
            screenX <= viewportWidth &&
            screenY + nodeHeight * camera.zoom >= 0 && 
            screenY <= viewportHeight) {
          anyVisible = true;
          break;
        }
      }

      if (!anyVisible) {
        navButtons.classList.add('visible');
      } else {
        navButtons.classList.remove('visible');
      }
    }

    function navigateToNode(nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      const rect = canvas.getBoundingClientRect();
      const targetX = rect.width / 2 - node.position.x * camera.zoom;
      const targetY = rect.height / 2 - node.position.y * camera.zoom;
      
      camera.x = targetX;
      camera.y = targetY;
      applyCamera();
      checkNodeVisibility();
    }

    function navigateToPoint(x, y) {
      const rect = canvas.getBoundingClientRect();
      const targetX = rect.width / 2 - x * camera.zoom;
      const targetY = rect.height / 2 - y * camera.zoom;

      camera.x = targetX;
      camera.y = targetY;
      applyCamera();
      checkNodeVisibility();
    }

    function navigateToCenter() {
      const rect = canvas.getBoundingClientRect();
      camera.x = rect.width / 2 - 10000 * camera.zoom;
      camera.y = rect.height / 2 - 10000 * camera.zoom;
      applyCamera();
      checkNodeVisibility();
    }

    function openContextMenu(x, y, nodeId) {
      contextNodeId = nodeId || null;
      const rect = canvas.getBoundingClientRect();
      closeColorSubmenu();
      
      if (nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        const hasAchievement = node && node.achievement;
        
        createNodeBtn.style.display = 'none';
        addButtonBtn.style.display = 'block';
        colorsMenuBtn.style.display = 'block';
        deleteNodeBtn.style.display = 'block';
        pinNodeBtn.style.display = 'block';
        copyNodeBtn.style.display = 'block';
        pasteNodeBtn.style.display = copiedNode ? 'block' : 'none';
        
        // Show achievement options based on whether node has achievement
        createAchievementBtn.style.display = hasAchievement ? 'none' : 'block';
        editAchievementBtn.style.display = hasAchievement ? 'block' : 'none';
        deleteAchievementBtn.style.display = hasAchievement ? 'block' : 'none';
        undoAchievementBtn.style.display = (hasAchievement && node.achievement.unlocked) ? 'block' : 'none';
      } else {
        createNodeBtn.style.display = 'block';
        addButtonBtn.style.display = 'none';
        colorsMenuBtn.style.display = 'none';
        deleteNodeBtn.style.display = 'none';
        pinNodeBtn.style.display = 'none';
        copyNodeBtn.style.display = 'none';
        pasteNodeBtn.style.display = copiedNode ? 'block' : 'none';
        createAchievementBtn.style.display = 'none';
        editAchievementBtn.style.display = 'none';
        deleteAchievementBtn.style.display = 'none';
        undoAchievementBtn.style.display = 'none';
      }
      
      contextMenu.style.display = 'flex';
      contextMenu.style.left = (x - rect.left) + 'px';
      contextMenu.style.top = (y - rect.top) + 'px';
      requestAnimationFrame(() => contextMenu.classList.add('open'));
    }

    function closeContextMenu() {
      contextMenu.classList.remove('open');
      contextMenu.style.display = 'none';
      contextNodeId = null;
      closeColorSubmenu();
    }

    function openColorSubmenu() {
      clearTimeout(colorSubmenuTimeout);
      const colorsBtn = document.getElementById('colors-menu');
      const canvasRect = canvas.getBoundingClientRect();
      const btnRect = colorsBtn.getBoundingClientRect();
      colorSubmenu.style.left = (btnRect.right - canvasRect.left + 8) + 'px';
      colorSubmenu.style.top = (btnRect.top - canvasRect.top) + 'px';
      colorSubmenu.classList.add('open');
    }

    function closeColorSubmenu() {
      colorSubmenuTimeout = setTimeout(() => {
        colorSubmenu.classList.remove('open');
      }, 300);
    }

    function openColorMenu(x, y, nodeId) {
      const rect = canvas.getBoundingClientRect();
      colorMenu.innerHTML = palette.map((color) => (
        '<button class="color-swatch" data-node-id="' + nodeId + '" data-color="' + color + '" style="background: ' + color + ';"></button>'
      )).join('');
      colorMenu.style.display = 'flex';
      colorMenu.style.left = (x - rect.left) + 'px';
      colorMenu.style.top = (y - rect.top) + 'px';
      requestAnimationFrame(() => colorMenu.classList.add('open'));
    }

    function closeColorMenu() {
      colorMenu.classList.remove('open');
      colorMenu.style.display = 'none';
    }

    async function createNodeAt(position) {
      if (!currentPathId) {
        console.error('[NodeUI] Cannot create node: currentPathId is null');
        return null;
      }
      pushUndoState('create-node');
      console.log('[NodeUI] Creating node at', position, 'for path', currentPathId);
      const payload = { pathId: currentPathId, title: 'New Node', position, color: palette[0] };
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CREATE_NODE', payload })
      });
      const data = await response.json();
      console.log('[NodeUI] Create node response:', data);
      if (data.success) {
        const updatedPath = (data.state.paths || []).find(p => p.id === currentPathId);
        nodes = (updatedPath?.nodes || []).map((node) => ({
          ...node,
          position: node.position || { x: 0, y: 0 },
          color: node.color || '#4a9eff',
          connections: Array.isArray(node.connections) ? node.connections : [],
          size: node.size || { width: 220, height: 90 },
          description: node.description || '',
          hasButton: node.hasButton || false,
          pinned: node.pinned || false,
          completed: node.completed || false,
          achievement: node.achievement || null
        }));
        if (nodes.length > 0) {
          lastCreatedNodeId = nodes[nodes.length - 1].id;
        }
        render();
        return lastCreatedNodeId;
      }
      return null;
    }

    async function updateNodePosition(nodeId, position) {
      if (!currentPathId) return;
      pushUndoState('update-node-position');
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UPDATE_NODE_POSITION', payload: { pathId: currentPathId, nodeId, position } })
      });
    }

    async function updateNodeTitle(nodeId, title) {
      if (!currentPathId) return;
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UPDATE_NODE_TITLE', payload: { pathId: currentPathId, nodeId, title } })
      });
    }

    async function updateNodeColor(nodeId, color) {
      if (!currentPathId) return;
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UPDATE_NODE_COLOR', payload: { pathId: currentPathId, nodeId, color } })
      });
      nodes = nodes.map((node) => node.id === nodeId ? { ...node, color } : node);
      render();
    }

    async function addConnection(fromNodeId, toNodeId) {
      if (!currentPathId) return;
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ADD_CONNECTION', payload: { pathId: currentPathId, fromNodeId, toNodeId } })
      });
      nodes = nodes.map((node) => {
        if (node.id === fromNodeId && !node.connections.includes(toNodeId)) {
          return { ...node, connections: [...node.connections, toNodeId] };
        }
        return node;
      });
      renderConnections();
    }

    async function updateNodeDetails(nodeId, details) {
      if (!currentPathId) return;
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UPDATE_NODE', payload: { pathId: currentPathId, nodeId, updates: details } })
      });
      nodes = nodes.map((node) => node.id === nodeId ? { ...node, ...details } : node);
      render();
    }

    async function updateNodeSize(nodeId, size) {
      if (!currentPathId) return;
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UPDATE_NODE', payload: { pathId: currentPathId, nodeId, updates: { size } } })
      });
      nodes = nodes.map((node) => node.id === nodeId ? { ...node, size } : node);
      render();
    }

    async function saveNodes() {
      // Сохранить изменения стилей текста для всех нод
      if (!currentPathId) return;
      for (const node of nodes) {
        if (node.textStyle) {
          await updateNodeDetails(node.id, { textStyle: node.textStyle });
        }
      }
    }

    function openEditModal(nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      editingNodeId = nodeId;
      editTitle.value = node.title || '';
      editDescription.value = node.description || '';
      editModalBackdrop.style.display = 'flex';
      requestAnimationFrame(() => editModalBackdrop.classList.add('open'));
    }

    function closeEditModal() {
      editModalBackdrop.classList.remove('open');
      setTimeout(() => {
        editModalBackdrop.style.display = 'none';
        editingNodeId = null;
      }, 200);
    }

    function saveEditModal() {
      if (!editingNodeId) return;
      const title = editTitle.value.trim() || 'Untitled';
      const description = editDescription.value.trim();
      updateNodeDetails(editingNodeId, { title, description });
      closeEditModal();
    }

    async function deleteNode(nodeId) {
      if (!currentPathId || !nodeId) return;
      pushUndoState('delete-node');
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_NODE', payload: { pathId: currentPathId, nodeId } })
      });
      nodes = nodes.filter(n => n.id !== nodeId);
      render();
    }

    async function togglePin(nodeId) {
      if (!nodeId) return;
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const isPinned = node.pinned || false;
      await updateNodeDetails(nodeId, { pinned: !isPinned });
      console.log('Node', isPinned ? 'unpinned' : 'pinned');
    }

    function copyNode(nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      copiedNode = { ...node };
      console.log('Node copied');
    }

    async function pasteNode() {
      if (!copiedNode || !currentPathId) return;
      const position = {
        x: contextPosition.x + 50,
        y: contextPosition.y + 50
      };
      const payload = {
        pathId: currentPathId,
        title: copiedNode.title + ' (copy)',
        position,
        color: copiedNode.color,
        description: copiedNode.description || ''
      };
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CREATE_NODE', payload })
      });
      const data = await response.json();
      if (data.success) {
        const updatedPath = (data.state.paths || []).find(p => p.id === currentPathId);
        nodes = (updatedPath?.nodes || []).map((node) => ({
          ...node,
          position: node.position || { x: 0, y: 0 },
          color: node.color || '#4a9eff',
          connections: Array.isArray(node.connections) ? node.connections : [],
          size: node.size || { width: 220, height: 90 },
          description: node.description || '',
          hasButton: node.hasButton || false,
          pinned: node.pinned || false,
          completed: node.completed || false,
          achievement: node.achievement || null
        }));
        render();
      }
    }

    async function addViewButton(nodeId) {
      if (!nodeId) return;
      await updateNodeDetails(nodeId, { hasButton: true });
      console.log('View button added');
    }

    // Achievement functions
    function openAchievementModal(nodeId, isEdit = false) {
      achievementNodeId = nodeId;
      achievementModal.style.display = 'flex';
      
      const node = nodes.find(n => n.id === nodeId);
      
      if (isEdit && node && node.achievement) {
        // Edit mode - pre-fill with existing data
        achievementTitleInput.value = node.achievement.title || '';
        achievementDescriptionInput.value = node.achievement.description || '';
        achievementIconInput.value = node.achievement.icon || '🏆';
        achievementDifficultyInput.value = String(node.achievement.difficulty || 5);
        document.querySelector('.achievement-modal-title').textContent = 'Edit Achievement';
      } else {
        // Create mode
        achievementTitleInput.value = '';
        achievementDescriptionInput.value = '';
        achievementIconInput.value = '🏆';
        achievementDifficultyInput.value = '5';
        document.querySelector('.achievement-modal-title').textContent = 'Create Achievement';
      }
      
      achievementTitleInput.focus();
    }

    async function createAchievement() {
      const title = achievementTitleInput.value.trim();
      const description = achievementDescriptionInput.value.trim();
      const icon = achievementIconInput.value.trim() || '🏆';
      const difficulty = parseInt(achievementDifficultyInput.value) || 5;

      if (!title || !achievementNodeId) return;

      const node = nodes.find(n => n.id === achievementNodeId);
      const isEdit = node && node.achievement;

      const achievementData = {
        title,
        description,
        icon,
        difficulty,
        unlocked: isEdit ? node.achievement.unlocked : false,
        ...(isEdit && node.achievement.id ? { id: node.achievement.id } : {}),
        ...(isEdit && node.achievement.unlockedAt ? { unlockedAt: node.achievement.unlockedAt } : {})
      };

      // Save achievement to node
      await updateNodeDetails(achievementNodeId, { achievement: achievementData });
      
      achievementModal.style.display = 'none';
      console.log(isEdit ? 'Achievement updated:' : 'Achievement created:', achievementData);
      
      // If achievement is unlocked, update the saved file too
      if (achievementData.unlocked && achievementData.id) {
        try {
          await fetch('/api/achievements/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: achievementData.id,
              title: achievementData.title,
              description: achievementData.description,
              icon: achievementData.icon,
              difficulty: achievementData.difficulty,
              unlocked: true,
              pathId: currentPath.id,
              nodeId: achievementNodeId,
              unlockedAt: achievementData.unlockedAt,
              archived: false
            })
          });
        } catch (e) {
          console.error('Failed to update achievement file:', e);
        }
      }
    }

    function createConfetti(nodeElement) {
      if (!nodeElement) {
        console.log('No node element for confetti');
        return;
      }
      
      console.log('Creating confetti from node element:', nodeElement);
      
      const rect = nodeElement.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const startX = rect.left + rect.width / 2 - canvasRect.left;
      const startY = rect.top - canvasRect.top;
      
      console.log('Confetti start position:', { startX, startY });
      
      const colors = ['#4a9eff', '#9d7bff', '#4fd1c5', '#f6ad55', '#f56565', '#68d391', '#fbd38d', '#feb2b2'];
      const particleCount = 40;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        const size = Math.random() * 10 + 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.opacity = '1';
        
        const horizontalSpread = (Math.random() - 0.5) * 200;
        const upwardForce = -(Math.random() * 80 + 40);
        const gravity = 300;
        const tx = horizontalSpread;
        const ty = upwardForce + gravity;
        const rotation = Math.random() * 720 - 360;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.setProperty('--rotation', rotation + 'deg');
        
        world.appendChild(particle);
        
        requestAnimationFrame(() => {
          particle.style.animation = 'confettiFall 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        });
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 1500);
      }
      
      console.log('Created', particleCount, 'confetti particles');
    }

    function showAchievementToast(achievement) {
      achievementToastIcon.textContent = achievement.icon || '🏆';
      achievementToastTitle.textContent = achievement.title || 'Achievement Unlocked!';
      achievementToastSub.textContent = achievement.description || '';
      
      achievementToast.classList.remove('show');
      achievementToast.style.display = 'flex';
      
      requestAnimationFrame(() => {
        achievementToast.classList.add('show');
      });
      
      setTimeout(() => {
        achievementToast.classList.remove('show');
        setTimeout(() => {
          achievementToast.style.display = 'none';
        }, 200);
      }, 3000);
    }

    async function unlockAchievement(nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || !node.achievement || node.achievement.unlocked) return;

      // Mark achievement as unlocked
      const updatedAchievement = { ...node.achievement, unlocked: true };
      await updateNodeDetails(nodeId, { achievement: updatedAchievement });

      // Save to achievements file via API
      const achievementData = {
        id: currentPathId + '_' + nodeId,
        ...updatedAchievement,
        pathId: currentPathId,
        nodeId: nodeId,
        unlockedAt: new Date().toISOString(),
        archived: false
      };
      
      try {
        await fetch('/api/achievements/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(achievementData)
        });
      } catch (error) {
        console.error('Failed to save achievement:', error);
      }

      // Show toast (confetti is shown in toggleCompleted)
      showAchievementToast(updatedAchievement);
      console.log('Achievement unlocked:', updatedAchievement);
    }

    async function toggleCompleted(nodeId) {
      if (!nodeId) return;
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const isCompleted = node.completed || false;
      
      // Get node element BEFORE any updates
      const nodeElement = document.querySelector('[data-node-id="' + nodeId + '"]');
      
      // Show confetti when completing node with achievement
      if (!isCompleted && node.achievement) {
        if (nodeElement) {
          console.log('Creating confetti for node:', nodeId, 'element:', nodeElement);
          createConfetti(nodeElement);
        } else {
          console.log('Node element not found for confetti:', nodeId);
        }
      }
      
      await updateNodeDetails(nodeId, { completed: !isCompleted });
      
      // Unlock achievement on first completion and show toast
      if (!isCompleted && node.achievement && !node.achievement.unlocked) {
        await unlockAchievement(nodeId);
      }
      
      console.log('Node', isCompleted ? 'uncompleted' : 'completed');
    }

    // Initialize immediately - don't wrap in DOMContentLoaded
    updatePathTitle();
    notifyPathOpened();
    applyCamera();
    render();

    // Setup tool cursor as active by default
    document.getElementById('tool-cursor')?.classList.add('active');

      document.getElementById('back-home').addEventListener('click', () => {
        fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'CLEAR_ACTIVE_PATH', payload: {} })
        }).then(() => fetch('/api/plugins/select/hub-ui', { method: 'POST' }))
          .then(() => { window.location.href = '/api/ui/render'; })
          .catch(() => { window.location.href = '/api/ui/render'; });
      });

      canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const worldPosBefore = worldFromClient(event.clientX, event.clientY);
        
        const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
        camera.zoom = Math.max(0.1, Math.min(3, camera.zoom * zoomDelta));
        
        const worldPosAfter = {
          x: (mouseX - camera.x) / camera.zoom,
          y: (mouseY - camera.y) / camera.zoom
        };
        
        camera.x += (worldPosAfter.x - worldPosBefore.x) * camera.zoom;
        camera.y += (worldPosAfter.y - worldPosBefore.y) * camera.zoom;
        
        applyCamera();
        checkNodeVisibility();
      });

      canvas.addEventListener('mousedown', (event) => {
        console.log('[NodeUI] mousedown event:', {
          target: event.target,
          targetClass: event.target.className,
          button: event.button,
          closest_node: event.target.closest('.node'),
          clientX: event.clientX,
          clientY: event.clientY
        });
        
        if (event.target.closest('.context-menu') || event.target.closest('.color-menu') || event.target.closest('.color-submenu') || event.target.closest('.color-picker-modal')) {
          console.log('[NodeUI] Click on menu, ignoring');
          return;
        }
        
        // Правая кнопка - для контекстного меню
        if (event.button === 2) {
          console.log('[NodeUI] Right button mousedown');
          rightClickStart = { x: event.clientX, y: event.clientY, time: Date.now() };
          rightClickMoved = false;
          return;
        }
        
        // Левая кнопка
        console.log('[NodeUI] Left button mousedown, currentTool:', currentTool);
        clickStart = { x: event.clientX, y: event.clientY };
        clickMoved = false;
        closeContextMenu();
        closeColorMenu();

        // Select tool - начинаем выделение зоной (ВСЕГДА приоритет)
        if (currentTool === 'select') {
          console.log('[NodeUI] ✅ SELECT TOOL: Starting selection box');
          selectionStart = worldFromClient(event.clientX, event.clientY);
          selectedNodes = [];
          // Убираем предыдущее выделение
          document.querySelectorAll('.node').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
          });
          return; // ВАЖНО: выходим и не обрабатываем клик по ноде
        }

        // Обработка кликов на ноде (только если НЕ select tool)
        const nodeElement = event.target.closest('.node');
        if (nodeElement) {
          console.log('[NodeUI] Clicked on node:', nodeElement.dataset.nodeId);
          const nodeId = nodeElement.dataset.nodeId;
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;

          // Проверяем клик на различные части ноды
          const role = event.target.dataset.role;
          
          // Клик на resize handle - начинаем изменение размера
          if (role === 'resize') {
            console.log('[NodeUI] Starting resize for node:', nodeId);
            resizeNodeId = nodeId;
            const worldPos = worldFromClient(event.clientX, event.clientY);
            resizeStart = {
              x: worldPos.x,
              y: worldPos.y,
              width: node.size?.width || 220,
              height: node.size?.height || 90
            };
            return;
          }
          
          // Клик на port - начинаем создание связи
          if (role === 'port') {
            console.log('[NodeUI] Starting connection from node:', nodeId);
            linkFromNode = node;
            const nodeWidth = node.size?.width || 220;
            const nodeHeight = node.size?.height || 90;
            linkCursor = {
              x: node.position.x + nodeWidth,
              y: node.position.y + nodeHeight / 2
            };
            render();
            return;
          }
          
          // Клик на кнопку View
          if (role === 'view') {
            console.log('[NodeUI] View button clicked for node:', nodeId);
            // Здесь можно добавить логику открытия детального вида
            return;
          }
          
          // Обычный клик на ноду - начинаем перетаскивание
          console.log('[NodeUI] Starting drag for node:', nodeId);
          dragNodeId = nodeId;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          dragOffset = {
            x: worldPos.x - node.position.x,
            y: worldPos.y - node.position.y
          };
          return;
        }
        
        // Только cursor инструмент позволяет панорамировать
        if (currentTool === 'cursor') {
          console.log('[NodeUI] Starting pan');
          isPanning = true;
          panStart = { x: event.clientX - camera.x, y: event.clientY - camera.y };
        }
      });

      window.addEventListener('mousemove', (event) => {
        if (resizeTextId) {
          const textObj = textObjects.find(t => String(t.id) === String(resizeTextId));
          if (!textObj) return;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          const dx = worldPos.x - objectResizeStart.x;
          const dy = worldPos.y - objectResizeStart.y;
          const delta = Math.max(dx, dy);
          const nextSize = Math.max(8, Math.round(objectResizeStart.size + delta));
          textObj.size = nextSize;
          renderTextObjects();
          return;
        }

        if (resizeShapeId) {
          const shapeObj = shapeObjects.find(s => String(s.id) === String(resizeShapeId));
          if (!shapeObj) return;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          const newWidth = Math.max(20, objectResizeStart.width + (worldPos.x - objectResizeStart.x));
          const newHeight = Math.max(20, objectResizeStart.height + (worldPos.y - objectResizeStart.y));
          shapeObj.width = newWidth;
          shapeObj.height = newHeight;
          renderShapeObjects();
          return;
        }

        if (dragTextId) {
          const textObj = textObjects.find(t => String(t.id) === String(dragTextId));
          if (!textObj) return;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          textObj.x = worldPos.x - dragTextOffset.x;
          textObj.y = worldPos.y - dragTextOffset.y;
          renderTextObjects();
          return;
        }

        if (dragShapeId) {
          const shapeObj = shapeObjects.find(s => String(s.id) === String(dragShapeId));
          if (!shapeObj) return;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          shapeObj.x = worldPos.x - dragShapeOffset.x;
          shapeObj.y = worldPos.y - dragShapeOffset.y;
          renderShapeObjects();
          return;
        }

        if (resizeNodeId) {
          const node = nodes.find(n => n.id === resizeNodeId);
          if (!node) return;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          const newWidth = Math.max(150, resizeStart.width + (worldPos.x - resizeStart.x));
          const newHeight = Math.max(60, resizeStart.height + (worldPos.y - resizeStart.y));
          node.size = { width: newWidth, height: newHeight };
          render();
          return;
        }

        if (dragNodeId) {
          const node = nodes.find(n => n.id === dragNodeId);
          if (!node) return;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          node.position = {
            x: worldPos.x - dragOffset.x,
            y: worldPos.y - dragOffset.y
          };
          render();
          return;
        }

        if (linkFromNode) {
          linkCursor = worldFromClient(event.clientX, event.clientY);
          renderConnections();
          return;
        }

        // Рисование rubber band selection
        if (selectionStart) {
          const currentWorld = worldFromClient(event.clientX, event.clientY);
          const x = Math.min(selectionStart.x, currentWorld.x);
          const y = Math.min(selectionStart.y, currentWorld.y);
          const width = Math.abs(currentWorld.x - selectionStart.x);
          const height = Math.abs(currentWorld.y - selectionStart.y);
          
          let selectionBox = document.getElementById('selection-box');
          if (!selectionBox) {
            selectionBox = document.createElement('div');
            selectionBox.id = 'selection-box';
            selectionBox.className = 'selection-box';
            world.appendChild(selectionBox);
          }
          selectionBox.style.left = x + 'px';
          selectionBox.style.top = y + 'px';
          selectionBox.style.width = width + 'px';
          selectionBox.style.height = height + 'px';
          return;
        }

        if (isPanning) {
          camera.x = event.clientX - panStart.x;
          camera.y = event.clientY - panStart.y;
          applyCamera();
          checkNodeVisibility();
          if (Math.abs(event.clientX - clickStart.x) > clickThreshold || Math.abs(event.clientY - clickStart.y) > clickThreshold) {
            clickMoved = true;
          }
        }
      });

      window.addEventListener('mouseup', (event) => {
        if (resizeTextId) {
          resizeTextId = null;
          saveTextObjects();
          return;
        }

        if (resizeShapeId) {
          resizeShapeId = null;
          saveShapeObjects();
          return;
        }

        if (dragTextId) {
          dragTextId = null;
          saveTextObjects();
        }

        if (dragShapeId) {
          dragShapeId = null;
          saveShapeObjects();
        }

        if (resizeNodeId) {
          const nodeId = resizeNodeId;
          const node = nodes.find(n => n.id === nodeId);
          resizeNodeId = null;
          if (node && node.size) {
            updateNodeSize(nodeId, node.size);
          }
          return;
        }

        if (dragNodeId) {
          const nodeId = dragNodeId;
          const node = nodes.find(n => n.id === nodeId);
          dragNodeId = null;
          if (node) {
            updateNodePosition(nodeId, node.position);
          }
        }

        // Завершение rubber band selection
        if (selectionStart) {
          const currentWorld = worldFromClient(event.clientX, event.clientY);
          const x1 = Math.min(selectionStart.x, currentWorld.x);
          const y1 = Math.min(selectionStart.y, currentWorld.y);
          const x2 = Math.max(selectionStart.x, currentWorld.x);
          const y2 = Math.max(selectionStart.y, currentWorld.y);
          
          // Найти все ноды в зоне выделения
          selectedNodes = nodes.filter(node => {
            const nodeWidth = node.size?.width || 220;
            const nodeHeight = node.size?.height || 90;
            return (
              node.position.x < x2 &&
              node.position.x + nodeWidth > x1 &&
              node.position.y < y2 &&
              node.position.y + nodeHeight > y1
            );
          }).map(n => n.id);
          
          // Визуально выделить найденные ноды
          console.log('[NodeUI] Selected nodes:', selectedNodes.length);
          document.querySelectorAll('.node').forEach(el => {
            const nodeId = el.dataset.nodeId;
            if (selectedNodes.includes(nodeId)) {
              el.style.outline = '3px solid #4a9eff';
              el.style.outlineOffset = '2px';
            } else {
              el.style.outline = '';
              el.style.outlineOffset = '';
            }
          });
          
          // Удалить selection box
          const selectionBox = document.getElementById('selection-box');
          if (selectionBox) {
            selectionBox.remove();
          }
          
          selectionStart = null;
          
          // Переключить на cursor после выделения
          if (selectedNodes.length > 0) {
            currentTool = 'cursor';
            document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('tool-cursor')?.classList.add('active');
          }
          
          render();
          return;
        }

        if (linkFromNode) {
          const targetNode = event.target.closest('.node');
          if (targetNode) {
            const toNodeId = targetNode.dataset.nodeId;
            if (toNodeId && toNodeId !== linkFromNode.id) {
              addConnection(linkFromNode.id, toNodeId);
            }
          } else {
            // Создать новую ноду на пустом месте
            const worldPos = worldFromClient(event.clientX, event.clientY);
            createNodeAt(worldPos).then((newNodeId) => {
              if (newNodeId) {
                addConnection(linkFromNode.id, newNodeId);
              }
            });
          }
          linkFromNode = null;
          renderConnections();
        }

        isPanning = false;
      });

      createNodeBtn.addEventListener('click', () => {
        closeContextMenu();
        createNodeAt(contextPosition);
      });

      addButtonBtn.addEventListener('click', () => {
        if (contextNodeId) {
          addViewButton(contextNodeId);
        }
        closeContextMenu();
      });

      deleteNodeBtn.addEventListener('click', () => {
        if (contextNodeId) {
          deleteNode(contextNodeId);
        }
        closeContextMenu();
      });

      pinNodeBtn.addEventListener('click', () => {
        if (contextNodeId) {
          togglePin(contextNodeId);
        }
        closeContextMenu();
      });

      copyNodeBtn.addEventListener('click', () => {
        if (contextNodeId) {
          copyNode(contextNodeId);
        }
        closeContextMenu();
      });

      pasteNodeBtn.addEventListener('click', () => {
        pasteNode();
        closeContextMenu();
      });

      createAchievementBtn.addEventListener('click', () => {
        if (contextNodeId) {
          openAchievementModal(contextNodeId);
        }
        closeContextMenu();
      });

      editAchievementBtn.addEventListener('click', () => {
        if (contextNodeId) {
          openAchievementModal(contextNodeId, true); // true = edit mode
        }
        closeContextMenu();
      });

      deleteAchievementBtn.addEventListener('click', async () => {
        if (contextNodeId && confirm('Delete this achievement from the node?')) {
          const node = nodes.find(n => n.id === contextNodeId);
          if (node && node.achievement) {
            // Delete achievement file
            if (node.achievement.unlocked) {
              try {
                await fetch('/api/achievements/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: node.achievement.id || Date.now() })
                });
              } catch (e) {
                console.error('Failed to delete achievement file:', e);
              }
            }
            // Remove achievement from node
            delete node.achievement;
            await updateNodeDetails(contextNodeId, { achievement: null });
            render();
          }
        }
        closeContextMenu();
      });

      undoAchievementBtn.addEventListener('click', async () => {
        if (contextNodeId && confirm('Undo this achievement? The node will be marked incomplete and the achievement will be removed, but you can earn it again later.')) {
          const node = nodes.find(n => n.id === contextNodeId);
          if (node && node.achievement && node.achievement.unlocked) {
            try {
              // Delete achievement file
              await fetch('/api/achievements/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: node.achievement.id || Date.now() })
              });
              
              // Reset node and achievement
              node.completed = false;
              node.achievement.unlocked = false;
              delete node.achievement.unlockedAt;
              delete node.achievement.id;
              
              await updateNodeDetails(contextNodeId, { 
                completed: false,
                achievement: node.achievement
              });
              
              render();
              showAchievementToast({ 
                icon: '↩️', 
                title: 'Achievement Undone', 
                description: 'You can earn this achievement again!' 
              });
            } catch (e) {
              console.error('Failed to undo achievement:', e);
              alert('Failed to undo achievement');
            }
          }
        }
        closeContextMenu();
      });

      achievementCancelBtn.addEventListener('click', () => {
        achievementModal.style.display = 'none';
      });

      achievementCreateBtn.addEventListener('click', () => {
        createAchievement();
      });

      colorsMenuBtn.addEventListener('mouseenter', () => {
        openColorSubmenu();
      });

      colorSubmenu.addEventListener('mouseenter', () => {
        clearTimeout(colorSubmenuTimeout);
      });

      contextMenu.addEventListener('mouseleave', (event) => {
        if (!colorSubmenu.contains(event.relatedTarget) && !colorPickerModal.classList.contains('open')) {
          closeColorSubmenu();
        }
      });

      colorSubmenu.addEventListener('mouseleave', (event) => {
        if (!contextMenu.contains(event.relatedTarget) && !colorPickerModal.classList.contains('open')) {
          closeColorSubmenu();
        }
      });

      colorSubmenu.addEventListener('click', (event) => {
        const swatch = event.target.closest('.color-swatch');
        if (swatch && contextNodeId) {
          const color = swatch.dataset.color;
          updateNodeColor(contextNodeId, color);
          closeContextMenu();
        }
      });

      colorPickerBtn.addEventListener('click', () => {
        colorPickerModal.classList.add('open');
      });

      colorPickerCancel.addEventListener('click', () => {
        colorPickerModal.classList.remove('open');
      });

      colorPickerApply.addEventListener('click', () => {
        if (contextNodeId) {
          updateNodeColor(contextNodeId, customColor);
        }
        colorPickerModal.classList.remove('open');
        closeContextMenu();
      });

      rSlider.addEventListener('input', () => {
        const r = parseInt(rSlider.value);
        rValue.textContent = r;
        updateColorPreview();
      });

      gSlider.addEventListener('input', () => {
        const g = parseInt(gSlider.value);
        gValue.textContent = g;
        updateColorPreview();
      });

      bSlider.addEventListener('input', () => {
        const b = parseInt(bSlider.value);
        bValue.textContent = b;
        updateColorPreview();
      });

      function updateColorPreview() {
        const r = parseInt(rSlider.value);
        const g = parseInt(gSlider.value);
        const b = parseInt(bSlider.value);
        customColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        colorPreview.style.background = customColor;
      }

      // Text modal handlers
      document.querySelectorAll('.text-color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (event) => {
          document.querySelectorAll('.text-color-swatch').forEach(s => s.classList.remove('active'));
          event.currentTarget.classList.add('active');
          textColor = event.currentTarget.dataset.color;
        });
      });

      textCancel.addEventListener('click', () => {
        textModal.classList.remove('open');
        textInput.value = '';
      });

      textCreate.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) return;
        
        const font = textFont.value;
        const size = textSize.value;
        
        // Создать текстовый объект в центре viewport
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const worldPos = worldFromClient(centerX, centerY);
        
        textObjects.push({
          id: Date.now(),
          text: text,
          font: font,
          size: parseInt(size),
          color: textColor,
          x: worldPos.x,
          y: worldPos.y
        });
        
        // Сохранить в localStorage
        localStorage.setItem('textObjects_' + currentPathId, JSON.stringify(textObjects));
        
        render();
        textModal.classList.remove('open');
        textInput.value = '';
      });

      // Toolbar handlers
      document.getElementById('tool-undo')?.addEventListener('click', () => {
        undo();
      });

      document.getElementById('tool-redo')?.addEventListener('click', () => {
        redo();
      });

      document.getElementById('tool-cursor')?.addEventListener('click', () => {
        currentTool = 'cursor';
        document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('tool-cursor')?.classList.add('active');
      });

      document.getElementById('tool-select')?.addEventListener('click', () => {
        currentTool = 'select';
        document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('tool-select')?.classList.add('active');
      });

      document.getElementById('tool-shapes')?.addEventListener('click', () => {
        const shapesSubmenu = document.getElementById('shapes-submenu');
        const isActive = document.getElementById('tool-shapes')?.classList.contains('active');
        
        if (isActive) {
          // Если уже активен - закрыть submenu
          shapesSubmenu?.classList.remove('open');
          currentTool = 'cursor';
          document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
          document.getElementById('tool-cursor')?.classList.add('active');
        } else {
          // Открыть submenu
          shapesSubmenu?.classList.add('open');
          currentTool = 'shapes';
          document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
          document.getElementById('tool-shapes')?.classList.add('active');
        }
      });

      document.getElementById('tool-text')?.addEventListener('click', () => {
        // Открыть text modal
        const textModal = document.getElementById('text-modal');
        textModal?.classList.add('open');
        document.getElementById('text-input').focus();
      });

      // Shapes submenu handlers
      document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
          const shape = event.currentTarget.dataset.shape;
          if (!shape) return;
          
          // Создать фигуру в центре viewport
          const rect = canvas.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const worldPos = worldFromClient(centerX, centerY);
          
          shapeObjects.push({
            id: Date.now(),
            type: shape,
            x: worldPos.x,
            y: worldPos.y,
            width: 150,
            height: 150,
            color: '#4a9eff'
          });
          
          // Сохранить в localStorage
          localStorage.setItem('shapeObjects_' + currentPathId, JSON.stringify(shapeObjects));
          
          render();
          
          // Закрыть submenu и вернуться на cursor
          document.getElementById('shapes-submenu')?.classList.remove('open');
          currentTool = 'cursor';
          document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
          document.getElementById('tool-cursor')?.classList.add('active');
        });
      });

      world.addEventListener('mousedown', (event) => {
        const textEl = event.target.closest('.text-object');
        const shapeEl = event.target.closest('.shape-object');
        if (!textEl && !shapeEl) {
          return;
        }

        if (currentTool !== 'cursor' && currentTool !== 'select') {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const worldPos = worldFromClient(event.clientX, event.clientY);
        const resizeHandle = event.target.closest('.object-resize-handle');

        if (resizeHandle && textEl) {
          const textId = textEl.dataset.textId;
          const textObj = textObjects.find(t => String(t.id) === textId);
          if (!textObj) return;
          resizeTextId = textId;
          objectResizeStart = {
            x: worldPos.x,
            y: worldPos.y,
            width: 0,
            height: 0,
            size: textObj.size
          };
          return;
        }

        if (resizeHandle && shapeEl) {
          const shapeId = shapeEl.dataset.shapeId;
          const shapeObj = shapeObjects.find(s => String(s.id) === shapeId);
          if (!shapeObj) return;
          resizeShapeId = shapeId;
          objectResizeStart = {
            x: worldPos.x,
            y: worldPos.y,
            width: shapeObj.width,
            height: shapeObj.height,
            size: 0
          };
          return;
        }

        if (textEl) {
          const textId = textEl.dataset.textId;
          const textObj = textObjects.find(t => String(t.id) === textId);
          if (!textObj) return;
          dragTextId = textId;
          dragTextOffset = {
            x: worldPos.x - textObj.x,
            y: worldPos.y - textObj.y
          };
          return;
        }

        if (shapeEl) {
          const shapeId = shapeEl.dataset.shapeId;
          const shapeObj = shapeObjects.find(s => String(s.id) === shapeId);
          if (!shapeObj) return;
          dragShapeId = shapeId;
          dragShapeOffset = {
            x: worldPos.x - shapeObj.x,
            y: worldPos.y - shapeObj.y
          };
        }
      });

      nodesLayer.addEventListener('mousedown', (event) => {
        const nodeEl = event.target.closest('.node');
        if (!nodeEl) return;

        const nodeId = nodeEl.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        if (event.target.dataset.role === 'view') {
          event.stopPropagation();
          openEditModal(nodeId);
          return;
        }

        if (event.target.dataset.role === 'resize' && currentTool === 'cursor') {
          event.stopPropagation();
          resizeNodeId = nodeId;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          const size = node.size || { width: 220, height: 90 };
          resizeStart = {
            x: worldPos.x,
            y: worldPos.y,
            width: size.width,
            height: size.height
          };
          return;
        }

        if (event.target.dataset.role === 'port' && currentTool === 'cursor') {
          linkFromNode = node;
          linkCursor = worldFromClient(event.clientX, event.clientY);
          renderConnections();
          return;
        }

        if (node.pinned) return;

        // Только cursor и select инструменты позволяют перетаскивать ноды
        if (currentTool === 'cursor' || currentTool === 'select') {
          dragNodeId = node.id;
          const worldPos = worldFromClient(event.clientX, event.clientY);
          dragOffset = {
            x: worldPos.x - node.position.x,
            y: worldPos.y - node.position.y
          };
        }
      });

      nodesLayer.addEventListener('dblclick', (event) => {
        const titleEl = event.target.closest('[data-role="title"]');
        if (!titleEl) return;
        const nodeEl = event.target.closest('.node');
        if (!nodeEl) return;
        const nodeId = nodeEl.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const currentTitle = titleEl.textContent || '';
        const input = document.createElement('input');
        input.value = currentTitle;
        input.className = 'node-title-input';
        titleEl.replaceWith(input);
        input.focus();
        input.select();

        const commit = () => {
          const nextTitle = input.value.trim() || 'Untitled';
          pushUndoState('edit-node-title');
          updateNodeTitle(node.id, nextTitle);
          nodes = nodes.map((item) => item.id === node.id ? { ...item, title: nextTitle } : item);
          render();
        };

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            commit();
          }
          if (e.key === 'Escape') {
            render();
          }
        });

        input.addEventListener('blur', commit);
      });

      nodesLayer.addEventListener('click', (event) => {
        // Клик на фон ноды (не на кнопки/порты/resize) переключает completed
        const nodeEl = event.target.closest('.node');
        if (!nodeEl) return;
        
        // Игнорировать клики на интерактивные элементы
        if (event.target.dataset.role === 'view' || 
            event.target.dataset.role === 'port' || 
            event.target.dataset.role === 'resize' ||
            event.target.dataset.role === 'title') {
          return;
        }
        
        const nodeId = nodeEl.dataset.nodeId;
        if (nodeId) {
          toggleCompleted(nodeId);
        }
      });

      nodesLayer.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const nodeEl = event.target.closest('.node');
        if (!nodeEl) return;
        const nodeId = nodeEl.dataset.nodeId;
        selectedNodeId = nodeId;
        closeColorMenu();
        openContextMenu(event.clientX, event.clientY, nodeId);
      });

      canvas.addEventListener('contextmenu', (event) => {
        const nodeEl = event.target.closest('.node');
        if (nodeEl) return;
        
        const toolbar = event.target.closest('.toolbar');
        if (toolbar) {
          event.preventDefault();
          return;
        }
        
        const navBtns = event.target.closest('.nav-buttons');
        if (navBtns) {
          event.preventDefault();
          return;
        }
        
        const menu = event.target.closest('.context-menu');
        if (menu) return;
        
        // Проверка на движение мыши
        const dx = Math.abs(event.clientX - rightClickStart.x);
        const dy = Math.abs(event.clientY - rightClickStart.y);
        const moved = dx > clickThreshold || dy > clickThreshold;
        
        // Проверка на долгое зажатие (более 500ms)
        const timeDiff = Date.now() - rightClickStart.time;
        const longPress = timeDiff > 500;
        
        // Проверяем, кликнули ли на ноду
        const nodeElement = event.target.closest('.node');
        if (nodeElement && !moved && !longPress && !isPanning) {
          console.log('[NodeUI] Right-click on node:', nodeElement.dataset.nodeId);
          event.preventDefault();
          const nodeId = nodeElement.dataset.nodeId;
          contextNodeId = nodeId;
          contextPosition = worldFromClient(event.clientX, event.clientY);
          closeColorMenu();
          openContextMenu(event.clientX, event.clientY, nodeId);
          return;
        }
        
        // Показывать контекстное меню только если не было движения и не было долгого зажатия
        if (!moved && !longPress && !isPanning) {
          event.preventDefault();
          const pos = worldFromClient(event.clientX, event.clientY);
          contextPosition = pos;
          contextNodeId = null;
          closeColorMenu();
          openContextMenu(event.clientX, event.clientY, null);
        } else {
          event.preventDefault();
        }
      });

      colorMenu.addEventListener('click', (event) => {
        const target = event.target.closest('.color-swatch');
        if (!target) return;
        const nodeId = target.dataset.nodeId;
        const color = target.dataset.color;
        if (nodeId && color) {
          updateNodeColor(nodeId, color);
          closeColorMenu();
        }
      });

      closeModalBtn.addEventListener('click', closeEditModal);
      cancelEditBtn.addEventListener('click', closeEditModal);
      saveEditBtn.addEventListener('click', saveEditModal);

      editModalBackdrop.addEventListener('click', (event) => {
        if (event.target === editModalBackdrop) {
          closeEditModal();
        }
      });

      editTitle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          editDescription.focus();
        }
      });

      navToLastBtn.addEventListener('click', () => {
        if (lastCreatedNodeId) {
          navigateToNode(lastCreatedNodeId);
        }
      });

      navToCenterBtn.addEventListener('click', () => {
        navigateToCenter();
      });

      contentSearch.addEventListener('input', () => {
        renderContentBrowser();
      });

      // Toggle content browser visibility
      contentBrowserToggle.addEventListener('click', () => {
        console.log('[NodeUI] ✅ TOGGLE BUTTON CLICKED - VERSION 2.0 LOADED');
        contentBrowser.classList.toggle('collapsed');
        const isCollapsed = contentBrowser.classList.contains('collapsed');
        localStorage.setItem('contentBrowserCollapsed', isCollapsed ? 'true' : 'false');
        console.log('[NodeUI] Content browser collapsed:', isCollapsed);
      });

      // Restore collapsed state from localStorage
      const savedCollapsedState = localStorage.getItem('contentBrowserCollapsed');
      if (savedCollapsedState === 'true') {
        contentBrowser.classList.add('collapsed');
      }

      let lastClickTime = 0;
      let lastClickedId = null;

      contentList.addEventListener('click', (event) => {
        const item = event.target.closest('.content-item');
        if (!item) return;

        const contentId = item.dataset.contentId;
        const contentType = item.dataset.contentType;
        const now = Date.now();
        const isDoubleClick = (contentId === lastClickedId && now - lastClickTime < 350);

        if (isDoubleClick) {
          // Double click - activate element
          if (contentType === 'node') {
            const node = nodes.find(n => n.id === contentId);
            if (node) {
              openEditModal(node);
            }
          }
          if (contentType === 'text') {
            const textObj = textObjects.find(t => t.id === contentId);
            if (textObj) {
              // Двойной клик - режим редактирования текста
              editingTextId = contentId;
              navigateToPoint(textObj.x, textObj.y);
              
              setTimeout(() => {
                const textEl = document.querySelector('[data-text-id="' + contentId + '"]');
                if (textEl) {
                  // Создаем input для редактирования
                  const input = document.createElement('input');
                  input.type = 'text';
                  input.value = textObj.text || '';
                  input.style.position = 'absolute';
                  input.style.left = textEl.style.left;
                  input.style.top = textEl.style.top;
                  input.style.fontSize = textObj.size + 'px';
                  input.style.fontWeight = textObj.bold ? 'bold' : 'normal';
                  input.style.fontStyle = textObj.italic ? 'italic' : 'normal';
                  input.style.color = textObj.color || textColor;
                  input.style.background = 'rgba(26, 26, 26, 0.95)';
                  input.style.border = '2px solid ' + (textObj.color || textColor);
                  input.style.padding = '4px 8px';
                  input.style.borderRadius = '4px';
                  input.style.outline = 'none';
                  input.style.minWidth = '100px';
                  input.style.zIndex = '1000';
                  
                  textEl.style.display = 'none';
                  world.appendChild(input);
                  editingTextInput = input;
                  input.focus();
                  input.select();
                  
                  const finishEditing = () => {
                    const newText = input.value.trim();
                    if (newText) {
                      textObj.text = newText;
                      saveTextObjects();
                      render();
                    }
                    input.remove();
                    editingTextId = null;
                    editingTextInput = null;
                    textEl.style.display = '';
                    renderContentBrowser();
                  };
                  
                  input.addEventListener('blur', finishEditing);
                  input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                      finishEditing();
                    } else if (e.key === 'Escape') {
                      input.remove();
                      editingTextId = null;
                      editingTextInput = null;
                      textEl.style.display = '';
                    }
                  });
                }
              }, 100);
            }
          }
          if (contentType === 'shape') {
            const shapeObj = shapeObjects.find(s => s.id === contentId);
            if (shapeObj) {
              dragShapeId = contentId;
              render();
            }
          }
          lastClickedId = null;
          lastClickTime = 0;
        } else {
          // Single click - navigate and highlight
          if (contentType === 'node') {
            selectedNodeId = contentId;
            const node = nodes.find(n => n.id === contentId);
            if (node) {
              navigateToNode(contentId);
              const nodeEl = document.querySelector('[data-node-id="' + contentId + '"]');
              if (nodeEl) {
                nodeEl.style.boxShadow = '0 0 0 3px rgba(74, 158, 255, 0.6)';
                setTimeout(() => {
                  nodeEl.style.boxShadow = '';
                }, 1000);
              }
            }
          }

          if (contentType === 'text') {
            const textObj = textObjects.find(t => t.id === contentId);
            if (textObj) {
              navigateToPoint(textObj.x, textObj.y);
              const textEl = document.querySelector('[data-text-id="' + contentId + '"]');
              if (textEl) {
                textEl.style.textShadow = '0 0 12px rgba(74, 158, 255, 0.8)';
                setTimeout(() => {
                  textEl.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
                }, 1000);
              }
            }
          }

          if (contentType === 'shape') {
            const shapeObj = shapeObjects.find(s => s.id === contentId);
            if (shapeObj) {
              const centerX = shapeObj.x + (shapeObj.width || 0) / 2;
              const centerY = shapeObj.y + (shapeObj.height || 0) / 2;
              navigateToPoint(centerX, centerY);
              const shapeEl = document.querySelector('[data-shape-id="' + contentId + '"]');
              if (shapeEl) {
                shapeEl.style.filter = 'drop-shadow(0 0 12px rgba(74, 158, 255, 0.8))';
                setTimeout(() => {
                  shapeEl.style.filter = 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
                }, 1000);
              }
            }
          }

          lastClickedId = contentId;
          lastClickTime = now;
          renderContentBrowser();
        }
      });

      // Обработчик для раскрытия/сворачивания групп
      contentList.addEventListener('click', (event) => {
        const groupHeader = event.target.closest('[data-action="toggle-group"]');
        if (!groupHeader) return;

        const groupEl = groupHeader.closest('.content-group');
        const groupId = groupEl.dataset.groupId;
        const group = contentGroups.find(g => g.id === groupId);
        
        if (group) {
          group.expanded = !group.expanded;
          saveContentGroups();
          renderContentBrowser();
        }
      });

      // Обработчик для клика по заголовку группы (выделение всех элементов)
      contentList.addEventListener('click', (event) => {
        const groupHeader = event.target.closest('.content-group-header');
        if (!groupHeader || event.target.closest('[data-action="toggle-group"]')) return;

        const groupEl = groupHeader.closest('.content-group');
        const groupId = groupEl.dataset.groupId;
        const group = contentGroups.find(g => g.id === groupId);
        
        if (group) {
          // Выделяем все элементы группы
          group.items.forEach(itemRef => {
            if (itemRef.type === 'node') {
              const nodeEl = document.querySelector('[data-node-id="' + itemRef.id + '"]');
              if (nodeEl) {
                nodeEl.style.boxShadow = '0 0 0 3px rgba(74, 158, 255, 0.6)';
                setTimeout(() => {
                  nodeEl.style.boxShadow = '';
                }, 2000);
              }
            } else if (itemRef.type === 'text') {
              const textEl = document.querySelector('[data-text-id="' + itemRef.id + '"]');
              if (textEl) {
                textEl.style.textShadow = '0 0 12px rgba(74, 158, 255, 0.8)';
                setTimeout(() => {
                  textEl.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
                }, 2000);
              }
            } else if (itemRef.type === 'shape') {
              const shapeEl = document.querySelector('[data-shape-id="' + itemRef.id + '"]');
              if (shapeEl) {
                shapeEl.style.filter = 'drop-shadow(0 0 12px rgba(74, 158, 255, 0.8))';
                setTimeout(() => {
                  shapeEl.style.filter = 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
                }, 2000);
              }
            }
          });
        }
      });

      // Создание группы
      const createGroupBtn = document.getElementById('create-group-btn');
      createGroupBtn.addEventListener('click', () => {
        const groupName = prompt('Enter group name:');
        if (!groupName || !groupName.trim()) return;

        const newGroup = {
          id: 'group_' + Date.now(),
          name: groupName.trim(),
          items: [],
          expanded: true
        };

        contentGroups.push(newGroup);
        saveContentGroups();
        renderContentBrowser();
      });

      // Drag and drop для элементов в группы
      let draggedItem = null;

      contentList.addEventListener('dragstart', (event) => {
        const item = event.target.closest('.content-item');
        if (!item) return;

        draggedItem = {
          id: item.dataset.contentId,
          type: item.dataset.contentType
        };
        event.dataTransfer.effectAllowed = 'move';
      });

      contentList.addEventListener('dragover', (event) => {
        event.preventDefault();
        const groupHeader = event.target.closest('.content-group-header');
        if (groupHeader && draggedItem) {
          event.dataTransfer.dropEffect = 'move';
          groupHeader.classList.add('drag-over');
        }
      });

      contentList.addEventListener('dragleave', (event) => {
        const groupHeader = event.target.closest('.content-group-header');
        if (groupHeader) {
          groupHeader.classList.remove('drag-over');
        }
      });

      contentList.addEventListener('drop', (event) => {
        event.preventDefault();
        const groupHeader = event.target.closest('.content-group-header');
        
        if (groupHeader && draggedItem) {
          groupHeader.classList.remove('drag-over');
          
          const groupEl = groupHeader.closest('.content-group');
          const groupId = groupEl.dataset.groupId;
          const group = contentGroups.find(g => g.id === groupId);
          
          if (group) {
            // Проверяем, не находится ли элемент уже в группе
            const alreadyInGroup = group.items.some(
              item => item.type === draggedItem.type && item.id === draggedItem.id
            );
            
            if (!alreadyInGroup) {
              group.items.push({
                type: draggedItem.type,
                id: draggedItem.id
              });
              saveContentGroups();
              renderContentBrowser();
            }
          }
        }
        
        draggedItem = null;
      });

      // Content Browser uses existing data only (no filtering logic at this stage)

      // Горячие клавиши
      document.addEventListener('keydown', (event) => {
        // Игнорируем если в поле ввода
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return;
        }
        
        // Undo: Ctrl+Z
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
          return;
        }
        // Redo: Ctrl+Y или Ctrl+Shift+Z
        if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
          event.preventDefault();
          redo();
          return;
        }
        
        // V - cursor tool
        if (event.key === 'v' || event.key === 'V') {
          event.preventDefault();
          document.getElementById('tool-cursor')?.click();
          return;
        }
        // S - select tool
        if (event.key === 's' || event.key === 'S') {
          event.preventDefault();
          document.getElementById('tool-select')?.click();
          return;
        }
        // T - text tool
        if (event.key === 't' || event.key === 'T') {
          event.preventDefault();
          document.getElementById('tool-text')?.click();
          return;
        }
      });

      // Обработчики текстового контекстного меню
      const textContextMenu = document.getElementById('text-context-menu');
      const textColorSubmenu = document.getElementById('text-color-submenu');
      const fontSubmenu = document.getElementById('font-submenu');
      
      function openTextContextMenu(x, y) {
        textContextMenu.style.left = x + 'px';
        textContextMenu.style.top = y + 'px';
        textContextMenu.classList.add('open');
      }
      
      function closeTextContextMenu() {
        textContextMenu?.classList.remove('open');
        textColorSubmenu?.classList.remove('open');
        fontSubmenu?.classList.remove('open');
      }
      
      // Обработка выделения текста в заголовке ноды
      const textFormatToolbar = document.getElementById('text-format-toolbar');
      let currentEditingNode = null;

      document.addEventListener('mouseup', (event) => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        
        // Проверяем, выделен ли текст в заголовке ноды
        if (selectedText && selectedText.length > 0) {
          const titleEl = event.target.closest('.node-title[data-role="title"]');
          if (titleEl) {
            const nodeEl = titleEl.closest('.node');
            const nodeId = nodeEl?.dataset.nodeId;
            if (nodeId) {
              currentEditingNode = nodeId;
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              
              // Позиционируем панель над выделенным текстом
              textFormatToolbar.style.left = `${rect.left + (rect.width / 2) - 100}px`;
              textFormatToolbar.style.top = `${rect.top - 45}px`;
              textFormatToolbar.classList.add('visible');
              
              // Обновляем состояние кнопок
              const node = nodes.find(n => n.id === nodeId);
              if (node && node.textStyle) {
                document.getElementById('format-bold')?.classList.toggle('active', node.textStyle.bold);
                document.getElementById('format-italic')?.classList.toggle('active', node.textStyle.italic);
                document.getElementById('format-strike')?.classList.toggle('active', node.textStyle.strikethrough);
              }
            }
          }
        } else if (!event.target.closest('#text-format-toolbar')) {
          textFormatToolbar.classList.remove('visible');
          currentEditingNode = null;
        }
      });
      
      // Обработчики кнопок форматирования
      document.getElementById('format-bold')?.addEventListener('click', () => {
        if (!currentEditingNode) return;
        pushUndoState('toggle-bold');
        const node = nodes.find(n => n.id === currentEditingNode);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.bold = !node.textStyle.bold;
          updateNodeDetails(currentEditingNode, { textStyle: node.textStyle });
          document.getElementById('format-bold')?.classList.toggle('active', node.textStyle.bold);
        }
      });

      document.getElementById('format-italic')?.addEventListener('click', () => {
        if (!currentEditingNode) return;
        pushUndoState('toggle-italic');
        const node = nodes.find(n => n.id === currentEditingNode);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.italic = !node.textStyle.italic;
          updateNodeDetails(currentEditingNode, { textStyle: node.textStyle });
          document.getElementById('format-italic')?.classList.toggle('active', node.textStyle.italic);
        }
      });

      document.getElementById('format-strike')?.addEventListener('click', () => {
        if (!currentEditingNode) return;
        pushUndoState('toggle-strikethrough');
        const node = nodes.find(n => n.id === currentEditingNode);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.strikethrough = !node.textStyle.strikethrough;
          updateNodeDetails(currentEditingNode, { textStyle: node.textStyle });
          document.getElementById('format-strike')?.classList.toggle('active', node.textStyle.strikethrough);
        }
      });

      // Кнопка выбора шрифта
      document.getElementById('format-font')?.addEventListener('click', (event) => {
        if (!currentEditingNode) return;
        const rect = event.target.getBoundingClientRect();
        fontSubmenu.style.left = rect.left + 'px';
        fontSubmenu.style.top = (rect.bottom + 4) + 'px';
        fontSubmenu.classList.add('open');
        textColorSubmenu?.classList.remove('open');
      });

      // Кнопка выбора цвета
      document.getElementById('format-color')?.addEventListener('click', (event) => {
        if (!currentEditingNode) return;
        const rect = event.target.getBoundingClientRect();
        textColorSubmenu.style.left = rect.left + 'px';
        textColorSubmenu.style.top = (rect.bottom + 4) + 'px';
        textColorSubmenu.classList.add('open');
        fontSubmenu?.classList.remove('open');
      });

      // Выбор шрифта из подменю для панели форматирования
      fontSubmenu?.addEventListener('click', (event) => {
        const fontBtn = event.target.closest('[data-font]');
        if (!fontBtn) return;
        
        if (currentEditingNode) {
          pushUndoState('change-font');
          const fontFamily = fontBtn.dataset.font;
          const node = nodes.find(n => n.id === currentEditingNode);
          if (node) {
            if (!node.textStyle) node.textStyle = {};
            node.textStyle.fontFamily = fontFamily;
            updateNodeDetails(currentEditingNode, { textStyle: node.textStyle });
          }
          fontSubmenu.classList.remove('open');
        }
      });

      // Выбор цвета из подменю для панели форматирования
      textColorSubmenu?.addEventListener('click', (event) => {
        const swatch = event.target.closest('.color-swatch');
        if (!swatch) return;
        
        if (currentEditingNode) {
          pushUndoState('change-text-color');
          const color = swatch.dataset.color;
          const node = nodes.find(n => n.id === currentEditingNode);
          if (node) {
            if (!node.textStyle) node.textStyle = {};
            node.textStyle.color = color;
            updateNodeDetails(currentEditingNode, { textStyle: node.textStyle });
          }
          textColorSubmenu.classList.remove('open');
        }
      });

      document.getElementById('text-font-menu')?.addEventListener('click', (event) => {
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        fontSubmenu.style.left = (rect.right + 4) + 'px';
        fontSubmenu.style.top = rect.top + 'px';
        fontSubmenu.classList.add('open');
        textColorSubmenu?.classList.remove('open');
      });
      
      document.getElementById('text-color-menu')?.addEventListener('click', (event) => {
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        textColorSubmenu.style.left = (rect.right + 4) + 'px';
        textColorSubmenu.style.top = rect.top + 'px';
        textColorSubmenu.classList.add('open');
        fontSubmenu?.classList.remove('open');
      });
      
      document.getElementById('text-bold')?.addEventListener('click', () => {
        if (!editingNodeTextId) return;
        pushUndoState('toggle-bold');
        const node = nodes.find(n => n.id === editingNodeTextId);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.bold = !node.textStyle.bold;
          saveNodes();
          render();
        }
        closeTextContextMenu();
      });
      
      document.getElementById('text-italic')?.addEventListener('click', () => {
        if (!editingNodeTextId) return;
        pushUndoState('toggle-italic');
        const node = nodes.find(n => n.id === editingNodeTextId);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.italic = !node.textStyle.italic;
          saveNodes();
          render();
        }
        closeTextContextMenu();
      });
      
      document.getElementById('text-strikethrough')?.addEventListener('click', () => {
        if (!editingNodeTextId) return;
        pushUndoState('toggle-strikethrough');
        const node = nodes.find(n => n.id === editingNodeTextId);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.strikethrough = !node.textStyle.strikethrough;
          saveNodes();
          render();
        }
        closeTextContextMenu();
      });
      
      // Выбор цвета текста
      textColorSubmenu?.addEventListener('click', (event) => {
        const swatch = event.target.closest('.color-swatch');
        if (!swatch || !editingNodeTextId) return;
        
        pushUndoState('change-text-color');
        const color = swatch.dataset.color;
        const node = nodes.find(n => n.id === editingNodeTextId);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.color = color;
          saveNodes();
          render();
        }
        closeTextContextMenu();
      });
      
      // Выбор шрифта
      fontSubmenu?.addEventListener('click', (event) => {
        const fontBtn = event.target.closest('[data-font]');
        if (!fontBtn || !editingNodeTextId) return;
        
        pushUndoState('change-font');
        const font = fontBtn.dataset.font;
        const node = nodes.find(n => n.id === editingNodeTextId);
        if (node) {
          if (!node.textStyle) node.textStyle = {};
          node.textStyle.fontFamily = font;
          saveNodes();
          render();
        }
        closeTextContextMenu();
      });
      
      // Закрытие меню при клике вне
      document.addEventListener('click', (event) => {
        if (!event.target.closest('#text-context-menu') && 
            !event.target.closest('#text-color-submenu') && 
            !event.target.closest('#font-submenu')) {
          closeTextContextMenu();
        }
      });
    
    // Setup tool cursor as active by default
    document.getElementById('tool-cursor')?.classList.add('active');
  </script>
</body>
</html>
    `;
  }

  // Помощник для отображения error состояния
  private renderErrorState(title: string, message: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Node Editor - PATH Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0d0d;
      --accent: #4a9eff;
      --accent-soft: #3b7ec9;
      --text: #e5e5e5;
      --text-muted: #8c8c8c;
      --border: #252525;
      --panel: #1a1a1a;
      --radius: 10px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-font-smoothing: antialiased;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      text-align: center;
      padding: 40px;
      max-width: 400px;
    }

    .error-icon {
      font-size: 72px;
      opacity: 0.3;
    }

    .error-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.3px;
    }

    .error-text {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .error-button {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 11px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
      margin-top: 8px;
    }

    .error-button:hover {
      background: var(--accent-soft);
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <div class="error-title">${title}</div>
    <div class="error-text">${message}</div>
    <button class="error-button" onclick="window.location.href='/'">Back to Hub</button>
  </div>
</body>
</html>
    `;
  }
}

export default NodeUIPlugin;
