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
  const list = await requestJson('/api/plugins/available');
  const plugins = list.plugins || [];

  if (plugins.length === 0) {
    throw new Error('No plugins available');
  }

  const pluginId = plugins[0].id;
  console.log(`[e2e-plugins] Selecting plugin ${pluginId}...`);
  await requestJson(`/api/plugins/select/${pluginId}`, { method: 'POST' });

  const res = await fetch(`${baseUrl}/api/ui/render`);
  const html = await res.text();

  if (!html.includes('<html')) {
    throw new Error('Plugin render returned non-HTML content');
  }

  console.log('[e2e-plugins] OK');
}

run().catch((error) => {
  console.error('[e2e-plugins] Failed:', error.message);
  process.exit(1);
});
