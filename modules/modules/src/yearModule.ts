import { IModule, EngineAPI } from '@path/core';

/**
 * Year Module — временная система фиксации прогресса
 */

export class YearModule implements IModule {
  id = 'year-module';
  name = 'Timeline';
  version = '1.0.0';
  metadata = {
    name: 'Timeline',
    version: '1.0.0',
    priority: 5,
    dependencies: [] as string[]
  };

  async register(api: EngineAPI): Promise<void> {
    console.log(`[YearModule] Registered`);
  }
}

export default YearModule;
