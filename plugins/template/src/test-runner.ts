import fs from 'fs';
import path from 'path';
import vm from 'vm';

// Simple VM-based runner to test plugin output safely.
// It loads compiled JS from dist/, creates a sandbox with limited globals
// and invokes the exported plugin class to run init() and render().

const PLUGIN_BUNDLE = path.join(__dirname, 'plugin.js');

function createSandbox() {
  const sandboxConsole = {
    log: (...args: any[]) => console.log('[plugin]', ...args),
    error: (...args: any[]) => console.error('[plugin]', ...args),
    warn: (...args: any[]) => console.warn('[plugin]', ...args)
  };

  const timeouts = new Set<number>();
  const intervals = new Set<number>();
  const rafs = new Set<number>();

  return {
    console: sandboxConsole,
    setTimeout: (fn: () => void, ms = 0) => {
      const id = setTimeout(fn, ms) as unknown as number;
      timeouts.add(id);
      return id;
    },
    clearTimeout: (id: number) => { clearTimeout(id); timeouts.delete(id); },
    setInterval: (fn: () => void, ms = 0) => {
      const id = setInterval(fn, ms) as unknown as number;
      intervals.add(id);
      return id;
    },
    clearInterval: (id: number) => { clearInterval(id); intervals.delete(id); },
    requestAnimationFrame: (cb: FrameRequestCallback) => {
      const id = setTimeout(() => cb(Date.now()), 16) as unknown as number;
      rafs.add(id);
      return id;
    },
    cancelAnimationFrame: (id: number) => { clearTimeout(id); rafs.delete(id); },
    fetch: async () => { throw new Error('Network access disabled in test runner'); },
    __internal: { timeouts, intervals, rafs }
  };
}

async function run() {
  const built = path.join(__dirname, 'plugin.js');
  if (!fs.existsSync(built)) {
    console.error('Build plugin first: npm run build');
    process.exit(1);
  }

  const code = fs.readFileSync(built, 'utf8');
  const sandbox = createSandbox();
  const context = vm.createContext({ ...sandbox });

  // Evaluate plugin bundle in VM
  const script = new vm.Script(code, { filename: 'plugin.js' });
  script.runInContext(context);

  // Expect plugin exports.ExamplePlugin available
  const ExamplePlugin = (context as any).exports?.ExamplePlugin || (context as any).ExamplePlugin;
  if (!ExamplePlugin) {
    console.error('No ExamplePlugin export found');
    process.exit(1);
  }

  const plugin = new ExamplePlugin();

  // Fake API
  const fakeAPI = {
    getState: () => ({ paths: [{ id: 1 }, { id: 2 }] }),
    onEvent: (e: string, cb: any) => { /* no-op */ return () => {}; },
    executeCommand: async (t: string, p?: any) => { return null; },
    log: (m: string, d?: any) => console.log('[api]', m, d || ''),
    registerCleanup: (fn: () => void) => { /* store if needed */ }
  };

  if (plugin.init) {
    await plugin.init(fakeAPI as any);
  }

  const props = { state: fakeAPI.getState(), tabs: [], commands: [], context: sandbox };
  const out = await plugin.render(props as any);
  console.log('=== RENDER OUTPUT ===');
  console.log(out);

  // Clean up: cancel timers
  sandbox.__internal.timeouts.forEach((id: number) => clearTimeout(id));
  sandbox.__internal.intervals.forEach((id: number) => clearInterval(id));
  sandbox.__internal.rafs.forEach((id: number) => clearTimeout(id));

  if (plugin.cleanup) await plugin.cleanup();
}

run().catch(err => {
  console.error('Runner error', err);
  process.exit(1);
});