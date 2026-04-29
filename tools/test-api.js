const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function requestJson(path, options) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}

async function run() {
  const health = await requestJson('/api/health');
  if (health.status !== 'healthy') throw new Error('Health not healthy');

  const docs = await requestJson('/api/documentation');
  if (!docs.api?.version || !docs.api?.capabilities?.length) throw new Error('API info missing');

  const mods = await requestJson('/api/modules');
  if (!Array.isArray(mods.modules)) throw new Error('Modules list missing');

  const plugins = await requestJson('/api/plugins/available');
  if (!Array.isArray(plugins.plugins)) throw new Error('Plugins list missing');

  console.log('[test-api] OK');
}

run().catch((error) => {
  console.error('[test-api] Failed:', error.message);
  process.exit(1);
});
