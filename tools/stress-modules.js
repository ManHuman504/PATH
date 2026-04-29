const { Engine } = require('../engine/core/dist/index.js');
const { PathModule, HomeModule, NodeModule, YearModule } = require('../modules/modules/dist/index.js');

const cycles = Number(process.env.CYCLES || 10);

async function run() {
  console.log(`[stress-modules] Running ${cycles} load/unload cycles...`);
  const engine = new Engine();

  for (let i = 0; i < cycles; i += 1) {
    const modules = [new PathModule(), new HomeModule(), new NodeModule(), new YearModule()];
    await engine.registerModules(modules);

    for (const module of modules) {
      if (typeof engine.unregisterModule === 'function') {
        await engine.unregisterModule(module.id);
      }
    }
  }

  console.log('[stress-modules] OK');
}

run().catch((error) => {
  console.error('[stress-modules] Failed:', error.message);
  process.exit(1);
});
