const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function run() {
  const res = await fetch(`${baseUrl}/api/health`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  console.log(`[perf-memory] RSS: ${data.memory.usage} MB (limit ${data.memory.limit} MB)`);
}

run().catch((error) => {
  console.error('[perf-memory] Failed:', error.message);
  process.exit(1);
});
