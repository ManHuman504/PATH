import { IModule, EngineAPI, UITab } from '@path/core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Path Module - управляет путями
 * Сохраняет пути на диск в DEMOCOMPONENTS/paths
 * Не имеет доступа прямо в Engine, только через EngineAPI
 */
export class PathModule implements IModule {
  id = 'path-module';
  name = 'Paths';
  version = '2.0.0';
  metadata = {
    name: 'Paths',
    version: '2.0.0',
    priority: 100,
    dependencies: [] as string[],
    uiPlugin: null
  };

  private pathsDir = this.resolvePathsDir();
  private legacyPathsDir = path.join(process.cwd(), 'DEMOCOMPONENTS', 'paths');

  private resolvePathsDir(): string {
    const cwd = process.cwd();
    const isWebWorkspace = path.basename(cwd) === 'web' && path.basename(path.dirname(cwd)) === 'apps';
    const projectRoot = isWebWorkspace ? path.resolve(cwd, '..', '..') : cwd;
    return path.join(projectRoot, 'paths');
  }

  private ensurePathsDirectory() {
    if (!fs.existsSync(this.pathsDir)) {
      fs.mkdirSync(this.pathsDir, { recursive: true });
    }

    this.migrateLegacyPaths();
  }

  private migrateLegacyPaths() {
    if (!fs.existsSync(this.legacyPathsDir)) {
      return;
    }

    const legacyFiles = fs.readdirSync(this.legacyPathsDir).filter(f => f.endsWith('.json'));
    if (legacyFiles.length === 0) {
      return;
    }

    const currentFiles = fs.existsSync(this.pathsDir)
      ? fs.readdirSync(this.pathsDir).filter(f => f.endsWith('.json'))
      : [];

    if (currentFiles.length > 0) {
      return;
    }

    legacyFiles.forEach(file => {
      const from = path.join(this.legacyPathsDir, file);
      const to = path.join(this.pathsDir, file);
      try {
        fs.copyFileSync(from, to);
        console.log(`[PathModule] Migrated legacy path file: ${file}`);
      } catch (e) {
        console.error(`[PathModule] Failed to migrate legacy file: ${file}`, e);
      }
    });
  }

  private getPathFile(pathId: string): string {
    return path.join(this.pathsDir, `${pathId}.json`);
  }

  private getLegacyPathFile(pathId: string): string {
    return path.join(this.legacyPathsDir, `${pathId}.json`);
  }

  private removeAchievementsForPath(pathId: string): void {
    const achievementsDir = path.join(path.dirname(this.pathsDir), 'achievements');
    if (!fs.existsSync(achievementsDir)) return;
    const files = fs.readdirSync(achievementsDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(achievementsDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const achievement = JSON.parse(content);
        if (achievement?.pathId === pathId) {
          fs.unlinkSync(filePath);
          console.log(`[PathModule] Deleted achievement file: ${filePath}`);
        }
      } catch (e) {
        console.error(`[PathModule] Failed to remove achievement file: ${filePath}`, e);
      }
    });
  }

  private savePath(pathData: any): void {
    this.ensurePathsDirectory();
    const filePath = this.getPathFile(pathData.id);
    fs.writeFileSync(filePath, JSON.stringify(pathData, null, 2));
    console.log(`[PathModule] Saved path to file: ${filePath}`);
  }

  private loadPaths(): any[] {
    this.ensurePathsDirectory();
    const files = fs.readdirSync(this.pathsDir);
    const paths = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const content = fs.readFileSync(path.join(this.pathsDir, f), 'utf-8');
          return JSON.parse(content);
        } catch (e) {
          console.error(`[PathModule] Failed to parse path file: ${f}`, e);
          return null;
        }
      })
      .filter(p => p !== null);
    
    // Сортируем по дате последнего открытия (или создания)
    return paths.sort((a, b) => {
      const dateA = new Date(a.lastOpened || a.createdAt).getTime();
      const dateB = new Date(b.lastOpened || b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  async register(api: EngineAPI): Promise<void> {
    const savePathById = (pathId: string) => {
      const state = api.getState();
      const pathObj = state.paths?.find((p: any) => p.id === pathId);
      if (pathObj) {
        this.savePath(pathObj);
      }
    };

    const eventBus = api.getEventBus();
    eventBus.on('node.created', (data: any) => savePathById(data.pathId));
    eventBus.on('node.updated', (data: any) => savePathById(data.pathId));
    eventBus.on('node.moved', (data: any) => savePathById(data.pathId));
    eventBus.on('node.colorChanged', (data: any) => savePathById(data.pathId));
    eventBus.on('node.connectionAdded', (data: any) => savePathById(data.pathId));
    eventBus.on('node.connectionRemoved', (data: any) => savePathById(data.pathId));
    // Загружаем пути из файловой системы
    const loadedPaths = this.loadPaths();
    
    // Инициализируем состояние модуля
    const state = api.getState();
    if (!state.paths) {
      api.setState({ paths: loadedPaths });
    }

    // Регистрируем команду CREATE_PATH
    api.onCommand('CREATE_PATH', (payload: any) => {
      const state = api.getState();
      const newPath = {
        id: Date.now().toString(),
        title: payload.title || 'Untitled Path',
        description: payload.description || '',
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        status: payload.status || 'active',
        previewUrl: payload.previewUrl || '',
        previewMeta: payload.previewMeta || null,
        nodes: [],
        createdAt: new Date().toISOString(),
        lastOpened: new Date().toISOString(),
        fileSize: 0
      };
      if (!state.paths) state.paths = [];
      state.paths.push(newPath);
      
      // Сохраняем на диск
      this.savePath(newPath);
      
      api.setState({ paths: state.paths });
      api.emitEvent('path.created', { pathId: newPath.id, title: newPath.title });
      console.log(`[PathModule] Created path:`, { pathId: newPath.id, title: newPath.title });
    });

    // Регистрируем команду DELETE_PATH
    api.onCommand('DELETE_PATH', (payload: any) => {
      const state = api.getState();
      const initialLength = state.paths?.length || 0;
      state.paths = state.paths.filter((p: any) => p.id !== payload.pathId);
      
      if (state.paths.length < initialLength) {
        // Удаляем файл
        try {
          const filePath = this.getPathFile(payload.pathId);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[PathModule] Deleted path file: ${filePath}`);
          }
          const legacyFilePath = this.getLegacyPathFile(payload.pathId);
          if (fs.existsSync(legacyFilePath)) {
            fs.unlinkSync(legacyFilePath);
            console.log(`[PathModule] Deleted legacy path file: ${legacyFilePath}`);
          }
          this.removeAchievementsForPath(payload.pathId);
        } catch (e) {
          console.error(`[PathModule] Failed to delete path file`, e);
        }
        
        api.setState({ paths: state.paths });
        api.emitEvent('path.deleted', { pathId: payload.pathId });
        console.log(`[PathModule] Deleted path:`, { pathId: payload.pathId });
      }
    });

    // Регистрируем команду UPDATE_PATH
    api.onCommand('UPDATE_PATH', (payload: any) => {
      const { pathId, updates } = payload || {};
      if (!pathId || !updates) return;
      const state = api.getState();
      const path = state.paths?.find((p: any) => p.id === pathId);
      if (!path) return;

      if (typeof updates.title === 'string') {
        path.title = updates.title.trim() || 'Untitled Path';
      }
      if (typeof updates.description === 'string') {
        path.description = updates.description;
      }
      if (Array.isArray(updates.tags)) {
        path.tags = updates.tags;
      }
      if (typeof updates.previewUrl === 'string') {
        path.previewUrl = updates.previewUrl;
      }
      if (updates.previewUrl === null) {
        path.previewUrl = '';
      }
      if (updates.previewMeta && typeof updates.previewMeta === 'object') {
        path.previewMeta = updates.previewMeta;
      }
      if (updates.previewMeta === null) {
        path.previewMeta = null;
      }
      if (typeof updates.status === 'string') {
        path.status = updates.status;
      }
      if (typeof updates.category === 'string') {
        path.category = updates.category;
      }

      path.updatedAt = new Date().toISOString();
      this.savePath(path);
      api.setState({ paths: state.paths });
      api.emitEvent('path.updated', { pathId, updates });
      console.log(`[PathModule] Updated path:`, { pathId, updates });
    });

    // Регистрируем команду OPEN_PATH (обновляет lastOpened)
    api.onCommand('OPEN_PATH', (payload: any) => {
      const state = api.getState();
      const path = state.paths?.find((p: any) => p.id === payload.pathId);
      if (path) {
        path.lastOpened = new Date().toISOString();
        this.savePath(path);
        api.setState({ paths: state.paths });
        api.emitEvent('path.opened', { pathId: payload.pathId });
        console.log(`[PathModule] Opened path:`, { pathId: payload.pathId });
      }
    });

    // 🔴 КРИТИЧНОЕ: Регистрируем команду SET_ACTIVE_PATH
    // Устанавливает активный path в состояние, с валидацией
    api.onCommand('SET_ACTIVE_PATH', (payload: any) => {
      const state = api.getState();
      const pathExists = state.paths?.find((p: any) => p.id === payload.pathId);
      
      if (!pathExists) {
        console.warn(`[PathModule] Path not found: ${payload.pathId}`);
        return;
      }

      // Обновляем lastOpened и устанавливаем как активный
      const path = state.paths.find((p: any) => p.id === payload.pathId);
      path.lastOpened = new Date().toISOString();
      this.savePath(path);
      
      api.setState({
        ...state,
        paths: state.paths,
        activePathId: payload.pathId
      });
      
      api.emitEvent('path.activated', { pathId: payload.pathId });
      console.log(`[PathModule] Set active path:`, { pathId: payload.pathId, title: path.title });
    });

    // 🔴 КРИТИЧНОЕ: Регистрируем команду CLEAR_ACTIVE_PATH
    // Очищает активный path (возврат в Hub)
    api.onCommand('CLEAR_ACTIVE_PATH', (payload: any) => {
      const state = api.getState();
      
      api.setState({
        ...state,
        activePathId: null
      });
      
      api.emitEvent('path.deactivated', { previousPathId: state.activePathId });
      console.log(`[PathModule] Cleared active path`);
    });

    // Регистрируем команду ADD_NODE (legacy)
    api.onCommand('ADD_NODE', (payload: any) => {
      const state = api.getState();
      const pathObj = state.paths?.find((p: any) => p.id === payload.pathId);
      if (pathObj) {
        const newNode = {
          id: Date.now().toString(),
          title: payload.title || 'Untitled Node',
          description: payload.description || '',
          completed: false,
          createdAt: new Date().toISOString(),
          position: payload.position || { x: 0, y: 0 },
          color: payload.color || '#4a9eff',
          connections: [],
        };
        if (!pathObj.nodes) pathObj.nodes = [];
        pathObj.nodes.push(newNode);
        
        // Сохраняем обновленный путь
        this.savePath(pathObj);
        
        api.setState({ paths: state.paths });
        api.emitEvent('node.added', { pathId: payload.pathId, nodeId: newNode.id, title: newNode.title });
        console.log(`[PathModule] Added node:`, { pathId: payload.pathId, nodeId: newNode.id });
      }
    });

    // Регистрируем вкладку для UI
    const tab: UITab = {
      id: 'paths-tab',
      title: 'Paths',
      moduleId: this.id,
      commands: ['CREATE_PATH', 'UPDATE_PATH', 'DELETE_PATH', 'ADD_NODE', 'OPEN_PATH', 'SET_ACTIVE_PATH', 'CLEAR_ACTIVE_PATH'],
      icon: '📁',
    };
    api.registerTab(tab);

    console.log(`[PathModule] Registered - Paths dir: ${this.pathsDir}`);
  }
}

export default PathModule;
