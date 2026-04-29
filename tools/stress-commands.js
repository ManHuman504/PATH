const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const total = Number(process.env.COUNT || 1000);
const batchSize = Number(process.env.BATCH || 50);

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
  console.log(`[stress-commands] Sending ${total} commands in batches of ${batchSize}...`);
  const start = Date.now();

  for (let i = 0; i < total; i += batchSize) {
    const batch = Array.from({ length: Math.min(batchSize, total - i) }, (_, idx) => {
      const title = `Stress Path ${i + idx + 1}`;
      return requestJson('/api/command', {
        method: 'POST',
        body: JSON.stringify({ type: 'CREATE_PATH', payload: { title } })
      });
    });
    await Promise.all(batch);
  }

  const elapsed = Date.now() - start;
  console.log(`[stress-commands] Completed in ${elapsed} ms`);
}

run().catch((error) => {
  console.error('[stress-commands] Failed:', error.message);
  process.exit(1);
});
