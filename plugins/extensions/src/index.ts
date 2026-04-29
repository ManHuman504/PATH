/**
 * Экспорт расширений и инструментов
 */

// Old Extension system (JSON-based)
export type { 
  IUIExtension,
  UIConfig,
  UISection,
  UIField,
  UIAction,
  UIStatItem,
  UICardItem,
  UITableRow,
  UIListItem
} from './interfaces';
export { UglyUIExtension } from './uglyUIExtension';
export { UIBuilder } from './uiBuilder';

// New Plugin System (Full control)
export type { IPlugin, PluginRenderProps } from './pluginSystem';
export { PluginAPI, PluginManager, PluginFactory, PluginClass } from './pluginSystem';
export { HubUIPlugin } from './hubUIPlugin';
export { NodeUIPlugin } from './nodeUIPlugin';
export { Nodes3DUIPlugin } from './nodes3DUIPlugin';
export { NodeSequencePlugin } from './nodeSequencePlugin';
export { WelcomeUIPlugin } from './welcomeUIPlugin';
