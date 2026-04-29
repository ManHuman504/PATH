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
  console.log('[e2e-recovery] Sending invalid command...');
  try {
    await requestJson('/api/command', {
      method: 'POST',
      body: JSON.stringify({ payload: {} })
    });
  } catch (error) {
    console.log('[e2e-recovery] Expected error received');
  }

  const health = await requestJson('/api/health');
  if (health.status !== 'healthy') {
    throw new Error('System not healthy after invalid command');
  }

  console.log('[e2e-recovery] OK');
}

run().catch((error) => {
  console.error('[e2e-recovery] Failed:', error.message);
  process.exit(1);
});
