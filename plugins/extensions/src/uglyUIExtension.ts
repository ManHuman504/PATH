/**
 * Ugly UI Extension - простой интерфейс
 * Использует декларативный UIBuilder для генерации интерфейса из JSON
 * 
 * Больше НЕТ хардкода HTML - все через JSON конфигурацию!
 */

import { UIBuilder, UIConfig } from './uiBuilder';

export class UglyUIExtension {
  id = 'ugly-ui';
  name = 'Simple UI';

  async renderUI(props: { state: any; tabs: any[]; commands: string[] }): Promise<string> {
    const { state, tabs, commands } = props;
    
    // Генерируем JSON конфигурацию UI на основе текущего состояния
    const uiConfig = this.buildUIConfig(state, tabs, commands);
    
    // Используем UIBuilder для генерации HTML из JSON
    const builder = new UIBuilder(uiConfig);
    return builder.render();
  }

  /**
   * Генерирует JSON конфигурацию UI на основе состояния
   * Это ЧИСТАЯ JSON конфигурация - никаких HTML строк!
   */
  private buildUIConfig(state: any, tabs: any[], commands: string[]): UIConfig {
    const paths = state.paths || [];
    const home = state.home || {};
    const tabsFromHome = Array.isArray(home.tabs) ? home.tabs : tabs;
    const homeLinks = Array.isArray(home.links) ? home.links : [];
    const interfaces = Array.isArray(home.interfaces) ? home.interfaces : [];

    // Подготавливаем данные для карточек (пути)
    const pathCards = paths.map((path: any) => ({
      title: path.title,
      icon: '📁',
      description: `${path.nodes?.length || 0} nodes`,
      count: path.nodes?.length || 0,
    }));

    // Подготавливаем статистику
    const totalNodes = paths.reduce((sum: number, p: any) => sum + (p.nodes?.length || 0), 0);
    const completedNodes = paths.reduce(
      (sum: number, p: any) => sum + (p.nodes?.filter((n: any) => n.completed).length || 0),
      0
    );

    const commandOptions = commands.map((cmd: string) => ({
      label: cmd,
      value: cmd
    }));

    const interfaceActions = interfaces.map((iface: any) => ({
      label: iface.name || iface.id,
      command: `SELECT_INTERFACE:${iface.id}`,
      style: iface.id === home.selectedInterfaceId ? 'secondary' : 'primary'
    }));

    const linkActions = homeLinks.map((link: any) => ({
      label: link.label || link.id,
      command: `NAVIGATE:${link.href}`,
      style: link.style || 'secondary'
    }));

    // Конфигурация JSON - полностью декларативна
    return {
      title: 'PATH# Debug Console',
      subtitle: 'Full control over modules, commands and system state',
      theme: 'dark',
      sections: [
        // ВЫБОР ИНТЕРФЕЙСА
        ...(interfaceActions.length > 0
          ? [
              {
                type: 'buttons',
                title: 'Select Interface',
                actions: interfaceActions,
              } as any,
            ]
          : [
              {
                type: 'list',
                title: 'Interface Selection',
                items: [{ text: 'No UI interfaces available', icon: '⚠️' }],
              } as any,
            ]),

        // НАВИГАЦИЯ И ССЫЛКИ
        ...(linkActions.length > 0
          ? [
              {
                type: 'buttons',
                title: 'Home Links',
                actions: linkActions,
              } as any,
            ]
          : []),

        // СТАТИСТИКА
        {
          type: 'stats',
          items: [
            { 
              label: 'Total Paths', 
              value: paths.length, 
              icon: '📁' 
            },
            { 
              label: 'Total Nodes', 
              value: totalNodes, 
              icon: '🔹' 
            },
            { 
              label: 'Completed', 
              value: completedNodes, 
              icon: '✅' 
            },
            { 
              label: 'Progress', 
              value: totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) + '%' : '0%', 
              icon: '📊' 
            },
          ],
        },

        // КОНСОЛЬ КОМАНД
        {
          type: 'form',
          title: 'Command Runner',
          fields: [
            {
              name: 'commandType',
              label: 'Command',
              type: 'select',
              options: commandOptions,
              required: true
            },
            {
              name: 'payloadJson',
              label: 'Payload (JSON)',
              type: 'textarea',
              placeholder: '{ "pathId": "...", "nodeId": "..." }'
            }
          ],
          actions: [
            { label: '▶ Execute Command', command: 'RUN_COMMAND', style: 'primary' }
          ]
        },

        // ФОРМА ДЛЯ СОЗДАНИЯ ПУТИ
        {
          type: 'form',
          title: 'Create New Path',
          fields: [
            {
              name: 'title',
              label: 'Path Title',
              type: 'text',
              placeholder: 'e.g., Learn TypeScript',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'What are you going to do?',
              required: false,
            },
          ],
          actions: [
            { label: '➕ Create Path', command: 'CREATE_PATH', style: 'primary' },
          ],
        },

        // СПИСОК ПУТЕЙ
        ...(pathCards.length > 0
          ? [
              {
                type: 'cards',
                title: `Your Paths (${pathCards.length})`,
                items: pathCards,
              } as any,
            ]
          : [
              {
                type: 'list',
                title: 'No Paths Yet',
                items: [{ text: 'Create your first path to start tracking!', icon: '👆' }],
              } as any,
            ]),

        // МОДУЛИ И КОМАНДЫ
        {
          type: 'list',
          title: 'Available Modules',
          items: tabsFromHome.map((tab: any) => ({
            text: `${tab.title} Module`,
            icon: tab.icon,
          })),
        },

        // КОМАНДЫ
        {
          type: 'list',
          title: `Available Commands (${commands.length})`,
          items: commands.map((cmd: string) => ({
            text: cmd.replace(/_/g, ' '),
            icon: '⚙️',
          })),
        },

        // DEBUG PANEL
        {
          type: 'debug',
          title: 'Diagnostics'
        }
      ],
    };
  }
}

export default UglyUIExtension;
