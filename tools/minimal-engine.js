const { Engine } = require('../engine/core/dist/index.js');

async function run() {
  const engine = new Engine();
  console.log('[minimal-engine] Engine created');

  const state = engine.getState();
  if (!state) {
    throw new Error('State not available');
  }

  engine.setState({ hello: 'world' });
  const updated = engine.getState();
  if (updated.hello !== 'world') {
    throw new Error('State update failed');
  }

  engine.onCommand('PING', () => {
    console.log('[minimal-engine] PING received');
  });

  await engine.dispatch({ type: 'PING', payload: {} });
  console.log('[minimal-engine] OK');
}

run().catch((error) => {
  console.error('[minimal-engine] Failed:', error.message);
  process.exit(1);
});
