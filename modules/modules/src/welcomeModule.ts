import { IModule, EngineAPI, UITab } from '@path/core';

/**
 * Welcome Module - Home/Landing page
 * Shows last 5 paths and quick actions
 * Priority 200 to appear as first tab
 */
export class WelcomeModule implements IModule {
  id = 'welcome-module';
  name = 'Welcome';
  version = '1.0.0';
  metadata = {
    name: 'Welcome',
    version: '1.0.0',
    priority: 200,  // Higher than Hub (10) to show first
    dependencies: [] as string[]
  };

  async register(api: EngineAPI): Promise<void> {
    const tab: UITab = {
      id: 'welcome-tab',
      title: 'Home',
      moduleId: this.id,
      commands: [],
      icon: '🏠'
    };

    api.registerTab(tab);
    console.log(`[WelcomeModule] Registered - Home tab will appear first`);
  }
}
