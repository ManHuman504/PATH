import { IModule, EngineAPI, UITab } from '@path/core';

/**
 * Node Module - управляет узлами в путях
 * Реализует операции обновления и удаления узлов
 */
export class NodeModule implements IModule {
  id = 'node-module';
  name = 'Nodes';
  version = '2.0.0';
  metadata = {
    name: 'Nodes',
    version: '2.0.0',
    priority: 50,
    dependencies: ['path-module'],
    uiPlugin: 'node-ui'
  };

  async register(api: EngineAPI): Promise<void> {
    const getPath = (pathId: string) => {
      const state = api.getState();
      const path = state.paths?.find((p: any) => p.id === pathId);
      return { state, path };
    };

    const ensureNodeDefaults = (node: any) => {
      if (!node.position) node.position = { x: 0, y: 0 };
      if (!node.color) node.color = '#4a9eff';
      if (!Array.isArray(node.connections)) node.connections = [];
      return node;
    };

    // Слушаем события добавления узла
    api.getEventBus().on('node.added', () => {
      console.log(`[NodeModule] Node added`);
    });

    api.onCommand('CREATE_NODE', (payload: any) => {
      const { state, path } = getPath(payload.pathId);
      if (!path) return;

      const newNode = ensureNodeDefaults({
        id: Date.now().toString(),
        title: payload.title || 'Untitled Node',
        description: payload.description || '',
        completed: false,
        createdAt: new Date().toISOString(),
        position: payload.position || { x: 0, y: 0 },
        color: payload.color || '#4a9eff',
        connections: [],
        size: payload.size || { width: 220, height: 90 }
      });

      if (!path.nodes) path.nodes = [];
      path.nodes.push(newNode);
      api.setState({ paths: state.paths });
      api.emitEvent('node.created', { pathId: payload.pathId, nodeId: newNode.id, node: newNode });
      console.log(`[NodeModule] Node created:`, { pathId: payload.pathId, nodeId: newNode.id });
    });

    api.onCommand('UPDATE_NODE_TITLE', (payload: any) => {
      const { state, path } = getPath(payload.pathId);
      if (!path?.nodes) return;
      const node = path.nodes.find((n: any) => n.id === payload.nodeId);
      if (!node) return;
      node.title = payload.title ?? node.title;
      api.setState({ paths: state.paths });
      api.emitEvent('node.updated', { pathId: payload.pathId, nodeId: node.id, node });
      console.log(`[NodeModule] Node title updated:`, { pathId: payload.pathId, nodeId: node.id });
    });

    api.onCommand('UPDATE_NODE_POSITION', (payload: any) => {
      const { state, path } = getPath(payload.pathId);
      if (!path?.nodes) return;
      const node = path.nodes.find((n: any) => n.id === payload.nodeId);
      if (!node) return;
      node.position = payload.position || node.position;
      api.setState({ paths: state.paths });
      api.emitEvent('node.moved', { pathId: payload.pathId, nodeId: node.id, position: node.position });
      console.log(`[NodeModule] Node moved:`, { pathId: payload.pathId, nodeId: node.id });
    });

    api.onCommand('UPDATE_NODE_COLOR', (payload: any) => {
      const { state, path } = getPath(payload.pathId);
      if (!path?.nodes) return;
      const node = path.nodes.find((n: any) => n.id === payload.nodeId);
      if (!node) return;
      node.color = payload.color || node.color;
      api.setState({ paths: state.paths });
      api.emitEvent('node.colorChanged', { pathId: payload.pathId, nodeId: node.id, color: node.color });
      console.log(`[NodeModule] Node color updated:`, { pathId: payload.pathId, nodeId: node.id });
    });

    api.onCommand('ADD_CONNECTION', (payload: any) => {
      const { state, path } = getPath(payload.pathId);
      if (!path?.nodes) return;
      const fromNode = path.nodes.find((n: any) => n.id === payload.fromNodeId);
      const toNode = path.nodes.find((n: any) => n.id === payload.toNodeId);
      if (!fromNode || !toNode) return;
      ensureNodeDefaults(fromNode);
      if (!fromNode.connections.includes(toNode.id)) {
        fromNode.connections.push(toNode.id);
        api.setState({ paths: state.paths });
        api.emitEvent('node.connectionAdded', { pathId: payload.pathId, fromNodeId: fromNode.id, toNodeId: toNode.id });
      }
    });

    api.onCommand('REMOVE_CONNECTION', (payload: any) => {
      const { state, path } = getPath(payload.pathId);
      if (!path?.nodes) return;
      const fromNode = path.nodes.find((n: any) => n.id === payload.fromNodeId);
      if (!fromNode) return;
      ensureNodeDefaults(fromNode);
      fromNode.connections = fromNode.connections.filter((id: string) => id !== payload.toNodeId);
      api.setState({ paths: state.paths });
      api.emitEvent('node.connectionRemoved', { pathId: payload.pathId, fromNodeId: fromNode.id, toNodeId: payload.toNodeId });
    });

    // 🔴 КРИТИЧНОЕ ИСПРАВЛЕНИЕ: Реализуем UPDATE_NODE команду
    api.onCommand('UPDATE_NODE', (payload: any) => {
      const state = api.getState();
      const path = state.paths?.find((p: any) => p.id === payload.pathId);
      
      if (path && path.nodes) {
        const node = path.nodes.find((n: any) => n.id === payload.nodeId);
        if (node) {
          // Обновляем поля узла
          if (payload.updates) {
            Object.keys(payload.updates).forEach(key => {
              node[key] = payload.updates[key];
            });
          }
          if (payload.title !== undefined) node.title = payload.title;
          if (payload.description !== undefined) node.description = payload.description;
          if (payload.completed !== undefined) node.completed = payload.completed;
          if (payload.size !== undefined) node.size = payload.size;
          
          api.setState({ paths: state.paths });
          api.emitEvent('node.updated', { 
            pathId: payload.pathId, 
            nodeId: payload.nodeId, 
            node 
          });
          console.log(`[NodeModule] Node updated:`, { pathId: payload.pathId, nodeId: payload.nodeId });
        }
      }
    });

    // 🔴 КРИТИЧНОЕ ИСПРАВЛЕНИЕ: Реализуем DELETE_NODE команду
    api.onCommand('DELETE_NODE', (payload: any) => {
      const state = api.getState();
      const path = state.paths?.find((p: any) => p.id === payload.pathId);
      
      if (path && path.nodes) {
        const initialLength = path.nodes.length;
        path.nodes = path.nodes.filter((n: any) => n.id !== payload.nodeId);
        
        if (path.nodes.length < initialLength) {
          api.setState({ paths: state.paths });
          api.emitEvent('node.deleted', { 
            pathId: payload.pathId, 
            nodeId: payload.nodeId 
          });
          console.log(`[NodeModule] Node deleted:`, { pathId: payload.pathId, nodeId: payload.nodeId });
        }
      }
    });

    // 🔴 КРИТИЧНОЕ ИСПРАВЛЕНИЕ: Реализуем COMPLETE_NODE команду
    api.onCommand('COMPLETE_NODE', (payload: any) => {
      const state = api.getState();
      const path = state.paths?.find((p: any) => p.id === payload.pathId);
      
      if (path && path.nodes) {
        const node = path.nodes.find((n: any) => n.id === payload.nodeId);
        if (node) {
          node.completed = true;
          api.setState({ paths: state.paths });
          api.emitEvent('node.completed', { 
            pathId: payload.pathId, 
            nodeId: payload.nodeId 
          });
          console.log(`[NodeModule] Node completed:`, { pathId: payload.pathId, nodeId: payload.nodeId });
        }
      }
    });

    // Регистрируем вкладку для UI
    const tab: UITab = {
      id: 'nodes-tab',
      title: 'Nodes',
      moduleId: this.id,
      commands: ['CREATE_NODE', 'UPDATE_NODE_TITLE', 'UPDATE_NODE_POSITION', 'UPDATE_NODE_COLOR', 'ADD_CONNECTION', 'REMOVE_CONNECTION', 'UPDATE_NODE', 'DELETE_NODE', 'COMPLETE_NODE'],
      icon: '🔹',
    };
    api.registerTab(tab);

    console.log(`[NodeModule] Registered`);
  }
}

export default NodeModule;
