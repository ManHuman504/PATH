import { IPlugin, PluginAPI, PluginRenderProps } from './types';

export class ExamplePlugin implements IPlugin {
  id = 'example-plugin';
  name = 'Example Plugin';
  version = '0.0.1';
  class = 'UI' as const;
  metadata = { requiredAPIs: ['state-v1'] };

  private api?: PluginAPI;

  async init(api: PluginAPI) {
    this.api = api;
    api.log('ExamplePlugin initialized');
    // register cleanup for demonstration
    api.registerCleanup(() => api.log('ExamplePlugin cleanup hook called'));
  }

  async render(props: PluginRenderProps) {
    const count = (props.state?.paths || []).length;
    // Use sandboxed context timers
    try {
      const ctx = props.context;
      if (ctx && ctx.setTimeout) {
        const id = ctx.setTimeout(() => ctx.console.log('sandbox timer fired'), 200);
        // intentionally not clearing to show resource tracker will clean on unload
      }
    } catch (e) {
      // ignore
    }
    return `<div style="padding:20px;color:#fff">Example Plugin — paths: ${count}</div>`;
  }

  async cleanup() {
    this.api?.log('ExamplePlugin cleanup called');
  }
}
