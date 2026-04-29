import { IModule, EngineAPI } from '@path/core';

/**
 * Hub Module - главный модуль управления хабом
 * Агрегирует данные, предоставляет статистику, управляет общим состоянием
 * UI Plugin: HubUIPlugin (hub-ui)
 * 
 * Примечание: Этот модуль показывается как вкладка Hub (priority: 10)
 * Для домашней страницы используется WelcomeModule (priority: 200)
 */
export class HubModule implements IModule {
  id = 'hub-module';
  name = 'Hub';
  version = '2.0.0';
  metadata = {
    name: 'Hub',
    version: '2.0.0',
    priority: 10,
    dependencies: ['path-module', 'node-module'],
    uiPlugin: 'hub-ui'
  };

  async register(api: EngineAPI): Promise<void> {
    const defaultLinks = [
      { id: 'select-interface', label: 'Select Interface', href: '/' },
      { id: 'open-ui', label: 'Open UI', href: '/' },
      { id: 'reset-interface', label: 'Reset Interface', href: '/?reset=1' }
    ];

    const getTabsSnapshot = () => api.getTabs().map(tab => ({
      id: tab.id,
      title: tab.title,
      icon: tab.icon,
      commands: tab.commands,
      moduleId: tab.moduleId
    }));

    // Инициализируем состояние Hub
    const state = api.getState();
    if (!state.hub) {
      api.setState({ 
        hub: {
          totalPaths: 0,
          totalNodes: 0,
          completedNodes: 0,
          recentPaths: [],
          systemStatus: {
            engine: 'running',
            modulesLoaded: 0,
            uiExtensions: 0,
            errors: 0
          },
          links: defaultLinks,
          tabs: getTabsSnapshot()
        }
      });
    }

    // Регистрируем вкладку Hub
    api.registerTab({
      id: 'hub-tab',
      title: 'Hub',
      moduleId: this.id,
      commands: ['GET_HUB_STATUS', 'GET_SYSTEM_INFO'],
      icon: '🏠'
    });

    // Обновляем ссылки и вкладки в hub state
    const afterTabState = api.getState();
    api.setState({
      hub: {
        ...(afterTabState.hub || {}),
        links: (afterTabState.hub?.links?.length ? afterTabState.hub.links : defaultLinks),
        tabs: getTabsSnapshot()
      }
    });

    // Подписываемся на события создания пути
    api.getEventBus().on('path.created', (data: any) => {
      console.log(`[HubModule] Path created:`, data);
      const state = api.getState();
      if (!state.hub) state.hub = {};
      state.hub.totalPaths = (state.paths || []).length;
      state.hub.recentPaths = (state.paths || []).slice(-5).reverse();
      api.setState(state);
    });

    // Слушаем удаление пути
    api.getEventBus().on('path.deleted', (data: any) => {
      console.log(`[HubModule] Path deleted:`, data);
      const state = api.getState();
      if (!state.hub) state.hub = {};
      state.hub.totalPaths = (state.paths || []).length;
      state.hub.recentPaths = (state.paths || []).slice(-5).reverse();
      api.setState(state);
    });

    // Слушаем добавление узла
    api.getEventBus().on('node.added', (data: any) => {
      console.log(`[HubModule] Node added:`, data);
      const state = api.getState();
      const totalNodes = (state.paths || []).reduce((sum: number, path: any) => sum + (path.nodes || []).length, 0);
      if (!state.hub) state.hub = {};
      state.hub.totalNodes = totalNodes;
      api.setState(state);
    });

    // Слушаем удаление узла
    api.getEventBus().on('node.deleted', (data: any) => {
      console.log(`[HubModule] Node deleted:`, data);
      const state = api.getState();
      const totalNodes = (state.paths || []).reduce((sum: number, path: any) => sum + (path.nodes || []).length, 0);
      if (!state.hub) state.hub = {};
      state.hub.totalNodes = totalNodes;
      api.setState(state);
    });

    // Слушаем завершение узла
    api.getEventBus().on('node.completed', (data: any) => {
      console.log(`[HubModule] Node completed:`, data);
      const state = api.getState();
      const completedNodes = (state.paths || []).reduce((sum: number, path: any) => 
        sum + (path.nodes || []).filter((n: any) => n.completed).length, 0
      );
      if (!state.hub) state.hub = {};
      state.hub.completedNodes = completedNodes;
      api.setState(state);
    });

    console.log(`[HubModule] Registered`);
  }
}

// Экспортируем также как HomeModule для обратной совместимости
export const HomeModule = HubModule;
export default HubModule;
