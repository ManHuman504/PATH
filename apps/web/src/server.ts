import express, { Request, Response } from 'express';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { Engine } from '@path/core';
import { PathModule, HubModule, NodeModule, YearModule } from '@path/modules';
import { UglyUIExtension } from '@path/extensions';
import { 
  PluginManager,
  HubUIPlugin,
  NodeUIPlugin,
  Nodes3DUIPlugin,
  UIBuilder
} from '@path/extensions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const startedAt = Date.now();

console.log('[Server] Starting PATH# v2.0.0');

// Root directory
const ROOT_DIR = join(__dirname, '../../..');

// Settings management
let appSettings: any = null;

async function loadSettings() {
  try {
    const settingsPath = join(ROOT_DIR, 'settings.json');
    const content = await fs.readFile(settingsPath, 'utf-8');
    appSettings = JSON.parse(content);
    console.log('[Settings] Loaded successfully');
    return appSettings;
  } catch (error) {
    console.warn('[Settings] File not found, using defaults');
    appSettings = {
      general: { theme: 'dark', language: 'ru', reset_settings: false },
      nodes_hub: { grid_display: true, highlight_active_nodes: true, autosave_nodes: true, quick_chain_mode: true },
      achievements: { show_notifications: true, display_difficulty: true },
      modules_plugins: { active_modules: ['path-module', 'node-module', 'hub-module', 'year-module'], active_extensions: ['hub-ui', 'nodes-3d-ui'], dependency_check: true },
      developer: { engine_logs: false, clear_cache: false, ui_debug_mode: false }
    };
    return appSettings;
  }
}

async function saveSettings(settings: any) {
  try {
    const settingsPath = join(ROOT_DIR, 'settings.json');
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    appSettings = settings;
    console.log('[Settings] Saved successfully');
    return true;
  } catch (error) {
    console.error('[Settings] Save failed:', error);
    return false;
  }
}

// Инициализируем Engine
const engine = new Engine();
let pluginManager: PluginManager | null = null;
let activeExtension: any = null;
let selectedPluginId: string | null = null;
let failedModules: Array<{ id: string; name: string; error: string }> = [];
let failedPlugins: Array<{ id: string; name: string; error: string }> = [];
let errorLog: Array<{ timestamp: string; source: string; message: string; stack?: string }> = [];

function recordError(source: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  errorLog.push({
    timestamp: new Date().toISOString(),
    source,
    message,
    stack
  });
  if (errorLog.length > 100) {
    errorLog = errorLog.slice(-100);
  }
}

function updateHomeInterfaces() {
  const state = engine.getState();
  const allPlugins = pluginManager ? pluginManager.getPlugins() : [];
  const interfaces = allPlugins
    .filter(p => p.class === 'UI')
    .map(p => ({
      id: p.id,
      name: p.name,
      class: p.class,
      version: p.version,
      description: p.description,
      author: p.author
    }));

  engine.setState({
    home: {
      ...(state.home || {}),
      interfaces,
      selectedInterfaceId: selectedPluginId
    }
  });
}

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS для всех запросов
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, '../public'), { index: false }));
app.use('/previews', express.static(join(ROOT_DIR, 'previews')));
// Provide access to packaged built files for client-side ES modules
app.use('/packages', express.static(join(ROOT_DIR, 'packages')));
app.use('/modules', express.static(join(ROOT_DIR, 'modules')));
app.use('/plugins', express.static(join(ROOT_DIR, 'plugins')));
app.use('/engine', express.static(join(ROOT_DIR, 'engine')));


/**
 * Инициализация: регистрируем модули при запуске
 */
async function initializeModules() {
  console.log('\n[Server] Initializing modules...\n');
  failedModules = [];
  failedPlugins = [];
  selectedPluginId = null;

  const modules = [
    new PathModule(),
    new HubModule(),
    new NodeModule(),
    new YearModule()
  ];

  await engine.registerModules(modules);
  failedModules = engine.getFailedModules().map(m => ({
    id: m.id,
    name: m.name,
    error: m.error instanceof Error ? m.error.message : String(m.error)
  }));
  failedModules.forEach(m => recordError('module', new Error(`${m.name}: ${m.error}`)));

  console.log('\n[Server] Modules initialized\n');

  // Создаём PluginManager с параметрами
  const eventBus = engine.getEventBus();
  const moduleManager = (engine as any).moduleManager ?? null;
  try {
    pluginManager = new PluginManager(engine, eventBus, moduleManager);
  } catch (error) {
    pluginManager = null;
    console.error('[Server] Failed to create PluginManager:', error);
    recordError('plugin-system', error);
  }

  // Регистрируем плагины интерфейса
  console.log('[Server] Registering UI plugins...\n');
  
  const plugins = [
    new HubUIPlugin(),
    new Nodes3DUIPlugin()  // Новый 3D редактор нод
  ];
  
  if (pluginManager) {
    for (const plugin of plugins) {
      try {
        pluginManager.registerPlugin(plugin);
        console.log(`  ✓ Registered: ${plugin.name} (${plugin.class})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        failedPlugins.push({ id: plugin.id, name: plugin.name, error: errorMessage });
        console.error(`[Server] Plugin failed: ${plugin.name}`, error);
        recordError('plugin', error);
      }
    }
  } else {
    console.warn('[Server] PluginManager unavailable. Skipping plugin registration.');
  }

  updateHomeInterfaces();
  
  console.log('\n[Server] Plugins ready for selection\n');

  // Hub must be the default UI on startup
  if (pluginManager) {
    const hubPlugin = pluginManager.getPlugins().find(p => p.id === 'hub-ui');
    if (hubPlugin) {
      if (!pluginManager.isPluginLoaded('hub-ui')) {
        await pluginManager.loadPlugin('hub-ui');
      }
      selectedPluginId = 'hub-ui';
      pluginManager.setActivePlugin('hub-ui');
      updateHomeInterfaces();
    }
  }

  // Активируем старое расширение как fallback
  const uglyUI = new UglyUIExtension();
  activeExtension = uglyUI;
  console.log(`[Server] Fallback extension: ${uglyUI.id}\n`);
}

/**
 * API: Получить список доступных плагинов интерфейса
 */
app.get('/api/plugins/available', (req: Request, res: Response) => {
  const allPlugins = pluginManager ? pluginManager.getPlugins() : [];
  
  // Фильтруем по классу, если указан параметр class
  const classFilter = req.query.class as string | undefined;
  const plugins = classFilter 
    ? allPlugins.filter(p => p.class === classFilter)
    : allPlugins;
  
  console.log(`[Server] GET /api/plugins/available${classFilter ? ` (class=${classFilter})` : ''} - found ${plugins.length} plugins`);
  
  res.json({
    plugins: plugins.map(p => ({
      id: p.id,
      name: p.name,
      class: p.class,
      version: p.version,
      description: p.description,
      author: p.author,
      isSelected: p.id === selectedPluginId
    })),
    failedPlugins
  });
});

/**
 * API: Выбрать плагин для интерфейса
 */
app.post('/api/plugins/select/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!pluginManager) {
      return res.status(503).json({ error: 'Plugin system unavailable' });
    }

    const plugins = pluginManager.getPlugins();
    const plugin = plugins.find(p => p.id === id);

    if (!plugin) {
      return res.status(404).json({ error: `Plugin ${id} not found` });
    }

    try {
      if (!pluginManager.isPluginLoaded(id)) {
        await pluginManager.loadPlugin(id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      failedPlugins.push({ id: plugin.id, name: plugin.name, error: errorMessage });
      recordError('plugin', error);
      return res.status(400).json({ error: `Failed to load plugin: ${errorMessage}` });
    }

    selectedPluginId = id;
    pluginManager.setActivePlugin(id);
    updateHomeInterfaces();
    
    console.log(`[Server] Selected plugin: ${plugin.name}`);
    
    res.json({
      success: true,
      pluginId: id,
      pluginName: plugin.name,
      pluginClass: plugin.class
    });
  } catch (error) {
    console.error('[API] Plugin selection error:', error);
    recordError('api', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * API: Переключиться на NodeUI с сохранением pathId
 */
app.post('/api/switch-to-node', async (req: Request, res: Response) => {
  try {
    const { pathId } = req.body;
    
    if (!pluginManager) {
      return res.status(503).json({ error: 'Plugin system unavailable' });
    }

    if (!pathId) {
      return res.status(400).json({ error: 'pathId is required' });
    }

    // Проверяем что путь существует
    const state = engine.getState();
    const pathExists = (state.paths || []).some((p: any) => p.id === pathId);
    
    if (!pathExists) {
      return res.status(404).json({ error: 'Path not found' });
    }

    // Загружаем NodeUI плагин если не загружен
    if (!pluginManager.isPluginLoaded('nodes-3d-ui')) {
      try {
        await pluginManager.loadPlugin('nodes-3d-ui');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[API] Failed to load nodes-3d-ui plugin:', errorMessage);
        return res.status(400).json({ error: `Failed to load nodes-3d-ui: ${errorMessage}` });
      }
    }

    // Устанавливаем активный плагин
    selectedPluginId = 'nodes-3d-ui';
    pluginManager.setActivePlugin('nodes-3d-ui');

    // Сохраняем pathId в state
    const newState = engine.getState();
    newState.currentPathId = pathId;
    newState.activePathId = pathId;
    engine.setState(newState);

    console.log(`[Server] Switched to nodes-3d-ui plugin with pathId: ${pathId}`);
    
    // Рендерим NodeUI плагин с currentPathId
    const plugin = pluginManager.getActivePlugin();
    if (plugin) {
      const state = engine.getState();
      const tabs = engine.getTabs();
      const commands = engine.getAvailableCommands();
      
      try {
        const html = await plugin.render({
          state,
          tabs,
          commands
        });
        
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } catch (error) {
        console.error('[API] Plugin render error:', error);
        return res.status(500).json({ error: 'Failed to render plugin' });
      }
    } else {
      return res.status(500).json({ error: 'No active plugin' });
    }
  } catch (error) {
    console.error('[API] Switch to node error:', error);
    recordError('api', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * UI: Открыть путь без JS (через обычную ссылку)
 */
app.get('/ui/open-path/:pathId', async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;

    if (!pluginManager) {
      return res.status(503).send('Plugin system unavailable');
    }

    if (!pathId) {
      return res.status(400).send('pathId is required');
    }

    const state = engine.getState();
    const pathExists = (state.paths || []).some((p: any) => p.id === pathId);

    if (!pathExists) {
      return res.status(404).send('Path not found');
    }

    if (!pluginManager.isPluginLoaded('nodes-3d-ui')) {
      await pluginManager.loadPlugin('nodes-3d-ui');
    }

    selectedPluginId = 'nodes-3d-ui';
    pluginManager.setActivePlugin('nodes-3d-ui');

    const newState = engine.getState();
    newState.currentPathId = pathId;
    newState.activePathId = pathId;
    engine.setState(newState);

    console.log(`[Server] Open path via link, switched to nodes-3d-ui: ${pathId}`);
    
    // Рендерим HTML напрямую
    try {
      const plugins = pluginManager.getPlugins();
      const plugin = plugins.find(p => p.id === 'nodes-3d-ui');
      
      if (plugin && pluginManager.isPluginLoaded('nodes-3d-ui')) {
        const state = engine.getState();
        const tabs = engine.getTabs();
        const commands = engine.getAvailableCommands();
        const html = await plugin.render({ state, tabs, commands });
        
        res.set('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }
    } catch (renderError) {
      console.error('[Server] Failed to render nodes-3d-ui:', renderError);
    }
    
    return res.status(500).send('Failed to render path');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Server] Failed to open path via link:', message);
    return res.status(500).send('Failed to open path');
  }
});

/**
 * API: Сбросить выбранный плагин
 */
app.post('/api/plugins/reset', (req: Request, res: Response) => {
  selectedPluginId = null;
  updateHomeInterfaces();
  res.json({ success: true });
});

/**
 * API: Получить информацию о расширениях
 */
app.get('/api/extensions', (req: Request, res: Response) => {
  res.json({
    extensions: [
      {
        id: 'ugly-ui',
        name: 'Simple UI',
        version: '1.0.0',
        active: true,
      },
    ],
  });
});

/**
 * API: Включить расширение
 */
app.post('/api/extension/enable/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`[Server] Enabling extension: ${id}`);
  res.json({ success: true, extensionId: id, enabled: true });
});

/**
 * API: Отключить расширение
 */
app.post('/api/extension/disable/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`[Server] Disabling extension: ${id}`);
  res.json({ success: true, extensionId: id, enabled: false });
});

/**
 * API: Получить все вкладки и доступные команды
 */
app.get('/api/ui/tabs', (req: Request, res: Response) => {
  const tabs = engine.getTabs();
  const commands = engine.getAvailableCommands();
  res.json({
    tabs: tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      icon: tab.icon,
      commands: tab.commands,
    })),
    allCommands: commands,
  });
});

/**
 * API: Получить текущее состояние
 */
app.get('/api/state', (req: Request, res: Response) => {
  const state = engine.getState();
  console.log('[API] State requested. Paths:', state.paths?.length || 0);
  res.json(state);
});

/**
 * API: Выполнить команду
 * Универсальный endpoint для любых команд
 */
app.post('/api/command', async (req: Request, res: Response) => {
  try {
    const { type, payload } = req.body;
    console.log(`[API] Command received: ${type}`, 'payload:', payload);

    if (!type) {
      console.warn('[API] Command type is missing');
      return res.status(400).json({ error: 'Command type is required' });
    }

    await engine.dispatch({ type, payload: payload || {} });
    const state = engine.getState();
    
    console.log(`[API] Command ${type} completed. New paths count:`, state.paths?.length || 0);
    res.json({ success: true, state });
  } catch (error) {
    console.error('[API] Command error:', error);
    recordError('api', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * API: Получить список модулей
 */
app.get('/api/modules', (req: Request, res: Response) => {
  const modules = engine.getModules();
  res.json({
    modules: modules.map(m => ({
      id: m.id,
      name: m.name,
      version: m.version,
      metadata: m.metadata,
    })),
    failedModules
  });
});

/**
 * API: Получить UI HTML от активного расширения
 */
app.get('/api/ui/render', async (req: Request, res: Response) => {
  try {
    console.log('[UI] Starting render...');
    
    // Если плагин выбран - используем его
    if (selectedPluginId && pluginManager) {
      console.log(`[UI] Rendering selected plugin: ${selectedPluginId}`);
      const plugins = pluginManager.getPlugins();
      const plugin = plugins.find(p => p.id === selectedPluginId);
      
      if (plugin && pluginManager.isPluginLoaded(selectedPluginId)) {
        let state = engine.getState();
        
        // Для NodeUIPlugin - добавляем currentPathId из query param
        if (selectedPluginId === 'nodes-3d-ui') {
          const currentPathId = req.query.pathId as string | undefined;
          if (currentPathId && state.activePathId !== currentPathId) {
            await engine.dispatch({ type: 'SET_ACTIVE_PATH', payload: { pathId: currentPathId } });
            state = engine.getState();
          }

          if (currentPathId && state.currentPathId !== currentPathId) {
            state.currentPathId = currentPathId;
            engine.setState({ ...state });
          }
        }
        
        const tabs = engine.getTabs();
        const commands = engine.getAvailableCommands();
        
        try {
          const html = await plugin.render({
            state,
            tabs,
            commands
          });
          
          console.log(`[UI] Rendered plugin: ${plugin.id}, metadata:`, JSON.stringify(plugin.metadata));
          
          // Inject extensions for this module
          let finalHtml = html;
          if (plugin.metadata && plugin.metadata.moduleId) {
            console.log(`[UI] Plugin has moduleId: "${plugin.metadata.moduleId}", looking for extensions...`);
            const extensionsHtml = await pluginManager.renderExtensionsForModule(plugin.metadata.moduleId, {
              state,
              tabs,
              commands
            });
            
            console.log(`[UI] Extensions HTML length: ${extensionsHtml.length} chars`);
            if (extensionsHtml && extensionsHtml.trim().length > 0) {
              // Insert before </body>
              if (html.includes('</body>')) {
                finalHtml = html.replace('</body>', extensionsHtml + '\n</body>');
                console.log(`[UI] ✅ Extensions injected successfully, new HTML length: ${finalHtml.length} chars`);
              } else {
                console.log(`[UI] ⚠️ HTML does not contain </body>, cannot inject extensions`);
              }
            } else {
              console.log(`[UI] ℹ️ No extensions found for module: "${plugin.metadata.moduleId}"`);
            }
          } else {
            console.log(`[UI] ℹ️ Plugin has no moduleId (plugin.metadata=${JSON.stringify(plugin.metadata)}), skipping extensions`);
          }
          
          console.log(`[UI] ✅ Plugin rendered HTML, length: ${finalHtml.length} chars`);
          console.log(`[UI] HTML starts with: ${finalHtml.substring(0, 150)}...`);
          console.log(`[UI] HTML contains <script>: ${finalHtml.includes('<script>')}`);
          console.log(`[UI] HTML contains window.handlePathClick: ${finalHtml.includes('window.handlePathClick')}`);
          console.log(`[UI] HTML contains <div class="app">: ${finalHtml.includes('<div class="app">')}`);
          console.log(`[UI] HTML contains sidebar: ${finalHtml.includes('class="sidebar"')}`);
          console.log(`[UI] Checking for template literals remaining: ${finalHtml.includes('${')}`);          
          res.set('Content-Type', 'text/html; charset=utf-8');
          res.send(finalHtml);
          return;
        } catch (error) {
          console.error(`[UI] Plugin render failed: ${plugin.id}`, error);
          recordError('ui', error);
        }
      } else if (plugin && !pluginManager.isPluginLoaded(selectedPluginId)) {
        try {
          await pluginManager.loadPlugin(selectedPluginId);
          // После загрузки рендерим сразу
          const state = engine.getState();
          const tabs = engine.getTabs();
          const commands = engine.getAvailableCommands();
          const html = await plugin.render({ state, tabs, commands });
          
          res.set('Content-Type', 'text/html; charset=utf-8');
          return res.send(html);
        } catch (error) {
          console.error(`[UI] Plugin load failed: ${plugin.id}`, error);
          recordError('ui', error);
        }
      }
    }
    
    // Иначе используем fallback расширение
    if (!activeExtension) {
      console.error('[UI] No active extension');
      res.set('Content-Type', 'text/html; charset=utf-8');
      return res.send(`<h1>Debug UI</h1><p>No active extension available.</p>`);
    }

    console.log('[UI] Getting state...');
    const state = engine.getState();
    console.log('[UI] Getting tabs...');
    const tabs = engine.getTabs();
    console.log('[UI] Getting commands...');
    const commands = engine.getAvailableCommands();
    
    console.log('[UI] Calling renderUI...');
    const html = await activeExtension.renderUI({
      state,
      tabs,
      commands,
    });

    console.log('[UI] Got HTML, length:', html.length);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    console.log('[UI] Sent response');
  } catch (error) {
    console.error('[UI] Render error:', error);
    recordError('ui', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * API: Render UIBuilder JSON to HTML (preview for visual builder)
 */
app.post('/api/ui/preview', (req: Request, res: Response) => {
  try {
    const config = req.body;
    if (!config || !config.title || !Array.isArray(config.sections)) {
      return res.status(400).json({ error: 'Invalid UI config' });
    }

    const builder = new UIBuilder(config);
    const html = builder.render();
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('[API] UI preview error:', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * API: Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'healthy',
    engine: {
      version: engine.getApiInfo().version,
      uptime: Math.floor((Date.now() - startedAt) / 1000)
    },
    modules: {
      loaded: engine.getModules().length,
      failed: failedModules.length
    },
    plugins: {
      loaded: pluginManager ? pluginManager.getPlugins().length : 0,
      failed: failedPlugins.length
    },
    memory: {
      usage: Math.round((memory.rss / 1024 / 1024) * 10) / 10,
      limit: 512
    }
  });
});

/**
 * API: Get all achievements from achievements folder
 */
app.get('/api/achievements/list', async (req: Request, res: Response) => {
  try {
    const achievementsDir = join(ROOT_DIR, 'achievements');
    
    // Check if achievements directory exists
    try {
      await fs.access(achievementsDir);
    } catch {
      return res.json({ achievements: [] });
    }

    const files = await fs.readdir(achievementsDir);
    const achievements: any[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(join(achievementsDir, file), 'utf-8');
          const achievement = JSON.parse(content);
          achievements.push(achievement);
        } catch (error) {
          console.error(`[API] Error reading achievement file ${file}:`, error);
        }
      }
    }

    console.log(`[API] Loaded ${achievements.length} achievements`);
    res.json({ achievements });
  } catch (error) {
    console.error('[API] Error loading achievements:', error);
    recordError('api', error);
    res.status(500).json({ error: 'Failed to load achievements' });
  }
});

/**
 * API: Save achievement
 */
app.post('/api/achievements/save', async (req: Request, res: Response) => {
  try {
    const achievement = req.body;
    
    if (!achievement.id || !achievement.pathId || !achievement.nodeId) {
      return res.status(400).json({ error: 'Missing required fields: id, pathId, nodeId' });
    }

    const achievementsDir = join(ROOT_DIR, 'achievements');
    
    // Create directory if it doesn't exist
    try {
      await fs.access(achievementsDir);
    } catch {
      await fs.mkdir(achievementsDir, { recursive: true });
    }

    const filePath = join(achievementsDir, `${achievement.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(achievement, null, 2), 'utf-8');

    console.log(`[API] Achievement saved: ${achievement.id}`);
    res.json({ success: true, achievement });
  } catch (error) {
    console.error('[API] Error saving achievement:', error);
    recordError('api', error);
    res.status(500).json({ error: 'Failed to save achievement' });
  }
});

/**
 * API: Archive achievement
 */
app.post('/api/achievements/archive', async (req: Request, res: Response) => {
  try {
    const { id, archived } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing achievement id' });
    }

    const achievementsDir = join(ROOT_DIR, 'achievements');
    const filePath = join(achievementsDir, `${id}.json`);

    // Read current achievement
    const content = await fs.readFile(filePath, 'utf-8');
    const achievement = JSON.parse(content);
    
    // Update archived status
    achievement.archived = archived ?? !achievement.archived;
    
    // Save updated achievement
    await fs.writeFile(filePath, JSON.stringify(achievement, null, 2), 'utf-8');

    console.log(`[API] Achievement ${archived ? 'archived' : 'unarchived'}: ${id}`);
    res.json({ success: true, achievement });
  } catch (error) {
    console.error('[API] Error archiving achievement:', error);
    recordError('api', error);
    res.status(500).json({ error: 'Failed to archive achievement' });
  }
});

/**
 * API: Delete achievement
 */
app.post('/api/achievements/delete', async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing achievement id' });
    }

    const achievementsDir = join(ROOT_DIR, 'achievements');
    const filePath = join(achievementsDir, `${id}.json`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Delete file
    await fs.unlink(filePath);

    // Remove achievement references from paths
    try {
      const pathsDir = join(ROOT_DIR, 'paths');
      const pathFiles = await fs.readdir(pathsDir);
      for (const file of pathFiles) {
        if (!file.endsWith('.json')) continue;
        const pathFile = join(pathsDir, file);
        try {
          const content = await fs.readFile(pathFile, 'utf-8');
          const pathData = JSON.parse(content);
          let changed = false;
          if (Array.isArray(pathData?.nodes)) {
            pathData.nodes = pathData.nodes.map((node: any) => {
              if (node?.achievement?.id === id) {
                const updatedNode = { ...node };
                delete updatedNode.achievement;
                changed = true;
                return updatedNode;
              }
              return node;
            });
          }
          if (changed) {
            await fs.writeFile(pathFile, JSON.stringify(pathData, null, 2), 'utf-8');
            console.log(`[API] Removed achievement ${id} from path file: ${pathFile}`);
          }
        } catch (error) {
          console.error(`[API] Failed to update path file ${pathFile}:`, error);
        }
      }
    } catch (error) {
      console.error('[API] Failed to scan paths for achievement cleanup:', error);
    }

    console.log(`[API] Achievement deleted: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting achievement:', error);
    recordError('api', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

/**
 * API: Upload path preview image (data URL)
 */
app.post('/api/paths/upload-preview', async (req: Request, res: Response) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing dataUrl' });
    }

    const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/i);
    if (!match) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const mime = match[1].toLowerCase();
    const base64 = match[3];
    const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.split('/')[1];

    const previewsDir = join(ROOT_DIR, 'previews');
    try {
      await fs.access(previewsDir);
    } catch {
      await fs.mkdir(previewsDir, { recursive: true });
    }

    const filename = `preview_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = join(previewsDir, filename);
    const buffer = Buffer.from(base64, 'base64');
    await fs.writeFile(filePath, buffer);

    res.json({ success: true, url: `/previews/${filename}` });
  } catch (error) {
    console.error('[API] Error uploading preview:', error);
    recordError('api', error);
    res.status(500).json({ error: 'Failed to upload preview' });
  }
});

/**
 * API: Errors log
 */
app.get('/api/errors', (req: Request, res: Response) => {
  res.json(errorLog.slice(-100));
});

/**
 * API: Get all settings
 */
app.get('/api/settings', async (req: Request, res: Response) => {
  if (!appSettings) {
    await loadSettings();
  }
  res.json(appSettings);
});

/**
 * API: Update settings
 */
app.post('/api/settings', async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    
    // Validate structure
    if (!newSettings.general || !newSettings.modules_plugins) {
      return res.status(400).json({ error: 'Invalid settings structure' });
    }
    
    const saved = await saveSettings(newSettings);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.json({ success: true, settings: appSettings });
  } catch (error) {
    console.error('[API] Settings update error:', error);
    recordError('api', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * API: Auto-generated documentation
 */
app.get('/api/documentation', (req: Request, res: Response) => {
  const eventBus = engine.getEventBus();
  res.json({
    api: engine.getApiInfo(),
    commands: engine.getAvailableCommands(),
    tabs: engine.getTabs(),
    events: (eventBus as any).getEventTypes?.() || [],
    recentEvents: (eventBus as any).getEvents?.() || [],
    modules: engine.getModules().map(m => ({
      id: m.id,
      name: m.name,
      version: m.version,
      metadata: m.metadata
    })),
    pluginApiMethods: [
      'getState',
      'onStateChange',
      'executeCommand',
      'getCommands',
      'onEvent',
      'getTabs',
      'getModules',
      'log',
      'error'
    ],
    pluginMetadata: pluginManager ? pluginManager.getPlugins().map(p => ({
      id: p.id,
      name: p.name,
      version: p.version,
      class: p.class,
      metadata: p.metadata
    })) : []
  });
});

/**
 * Debug dashboard
 */
app.get('/debug', (req: Request, res: Response) => {
  const modules = engine.getModules();
  const plugins = pluginManager ? pluginManager.getPlugins() : [];
  const errors = errorLog.slice(-20).reverse();

  const html = `
    <html>
      <head>
        <title>PATH# Debug</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #111; color: #eee; }
          h1 { color: #7dd3fc; }
          .section { margin-bottom: 24px; padding: 16px; background: #1f2937; border-radius: 8px; }
          .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; background: #334155; color: #fff; }
          ul { margin: 8px 0 0 18px; }
          .error { color: #fca5a5; }
        </style>
      </head>
      <body>
        <h1>PATH# Debug Dashboard</h1>
        <div class="section">
          <p><span class="badge">Engine</span> version: ${engine.getApiInfo().version}</p>
          <p><span class="badge">Uptime</span> ${Math.floor((Date.now() - startedAt) / 1000)}s</p>
        </div>

        <div class="section">
          <h3>Modules (${modules.length})</h3>
          <ul>
            ${modules.map(m => `<li>${m.name} (${m.id})</li>`).join('') || '<li>None</li>'}
          </ul>
          <h4>Failed Modules</h4>
          <ul>
            ${failedModules.map(m => `<li class="error">${m.name}: ${m.error}</li>`).join('') || '<li>None</li>'}
          </ul>
        </div>

        <div class="section">
          <h3>Plugins (${plugins.length})</h3>
          <ul>
            ${plugins.map(p => `<li>${p.name} (${p.id})</li>`).join('') || '<li>None</li>'}
          </ul>
          <h4>Failed Plugins</h4>
          <ul>
            ${failedPlugins.map(p => `<li class="error">${p.name}: ${p.error}</li>`).join('') || '<li>None</li>'}
          </ul>
        </div>

        <div class="section">
          <h3>Recent Errors</h3>
          <ul>
            ${errors.map(e => `<li class="error">[${e.timestamp}] ${e.source}: ${e.message}</li>`).join('') || '<li>None</li>'}
          </ul>
        </div>
      </body>
    </html>
  `;

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

/**
 * API: Получить события из EventBus
 */
app.get('/api/events', (req: Request, res: Response) => {
  const eventBus = engine.getEventBus();
  const events = (eventBus as any).getEvents?.() || [];
  res.json(events.slice(-50)); // Last 50 events
});

/**
 * Fallback: главная страница - выбор плагина интерфейса
 */
app.get('/', async (req: Request, res: Response) => {
  console.log(`[Server] GET / - selectedPluginId: ${selectedPluginId}`);

  if (req.query.reset === '1') {
    selectedPluginId = null;
  }

  // Hub must always be the first view on initial load
  selectedPluginId = 'hub-ui';

  // Автоматически выбираем hub-ui по-умолчанию
  if (pluginManager) {
    try {
      const plugins = pluginManager.getPlugins();
      const hubPlugin = plugins.find(p => p.id === 'hub-ui');
      
      if (hubPlugin) {
        // Load plugin if needed
        if (!pluginManager.isPluginLoaded('hub-ui')) {
          await pluginManager.loadPlugin('hub-ui');
        }
        
        selectedPluginId = 'hub-ui';
        pluginManager.setActivePlugin('hub-ui');
        updateHomeInterfaces();
        
        console.log(`[Server] Auto-selected and loaded default plugin: hub-ui`);
      }
    } catch (error) {
      console.error(`[Server] Failed to auto-select hub-ui:`, error);
    }
  }

  // Рендерим HTML напрямую, без редиректа
  try {
    console.log('[UI] Rendering on main page...');
    
    if (selectedPluginId && pluginManager) {
      const plugins = pluginManager.getPlugins();
      const plugin = plugins.find(p => p.id === selectedPluginId);
      
      if (plugin && pluginManager.isPluginLoaded(selectedPluginId)) {
        const state = engine.getState();
        const tabs = engine.getTabs();
        const commands = engine.getAvailableCommands();
        
        const html = await plugin.render({ state, tabs, commands });
        
        console.log(`[UI] Rendered plugin: ${plugin.id}, metadata:`, JSON.stringify(plugin.metadata));
        
        // Inject extensions for this module
        let finalHtml = html;
        if (plugin.metadata && plugin.metadata.moduleId) {
          const extensionsHtml = await pluginManager.renderExtensionsForModule(plugin.metadata.moduleId, {
            state,
            tabs,
            commands
          });
          
          if (extensionsHtml) {
            finalHtml = html.replace('</body>', extensionsHtml + '</body>');
          }
        }
        
        console.log(`[UI] ✅ Plugin rendered HTML, length: ${finalHtml.length} chars`);
        res.set('Content-Type', 'text/html; charset=utf-8');
        return res.send(finalHtml);
      }
    }
    
    // Fallback
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send('<html><body><h1>No plugin selected</h1><p>Please configure a UI plugin.</p></body></html>');
  } catch (error) {
    console.error('[UI] Render error on main page:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Helper: Get emoji icon for plugin class
 */
function getPluginIcon(pluginClass: string): string {
  const icons: Record<string, string> = {
    'UI': '🎨',
    'THEME': '🎭',
    'HANDLER': '⚙️',
    'VISUALIZATION': '📊',
    'DATA': '📊',
    'UNKNOWN': '❓'
  };
  return icons[pluginClass] || icons['UNKNOWN'];
}

/**
 * Start server
 */
async function start() {
  // Load settings first
  try {
    await loadSettings();
  } catch (error) {
    console.error('[Server] Settings load failed:', error);
  }
  
  // Initialize modules and plugins
  try {
    await initializeModules();
  } catch (error) {
    console.error('[Server] Initialization failed:', error);
  }

  const PORT = parseInt(process.env.PORT || '3000', 10);

  const server = app.listen(PORT, 'localhost', () => {
    console.log(`\n[Server] ✅ Running at http://localhost:${PORT}`);
    console.log(`[Server] Open http://localhost:${PORT} in your browser\n`);
    console.log('[Server] Keeping server alive... Press Ctrl+C to stop\n');
  });

  server.on('error', (err: any) => {
    console.error('[Server] ❌ Error:', err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use`);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[Server] Shutting down...');
    server.close(() => process.exit(0));
  });
}


start().catch(console.error);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Server] ❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] ❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`[Server] Process exiting with code ${code}`);
});

process.on('SIGHUP', () => {
  console.log('[Server] Received SIGHUP');
});

process.on('SIGTERM', () => {
  console.log('[Server] Received SIGTERM');
  process.exit(0);
});

export { engine };
