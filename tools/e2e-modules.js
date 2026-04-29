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
  console.log('[e2e-modules] Creating path...');
  const createRes = await requestJson('/api/command', {
    method: 'POST',
    body: JSON.stringify({ type: 'CREATE_PATH', payload: { title: 'E2E Path' } })
  });

  const pathId = createRes.state.paths?.[createRes.state.paths.length - 1]?.id;
  if (!pathId) {
    throw new Error('Path ID not found');
  }

  console.log('[e2e-modules] Adding node...');
  await requestJson('/api/command', {
    method: 'POST',
    body: JSON.stringify({ type: 'ADD_NODE', payload: { pathId, title: 'E2E Node' } })
  });

  const stateAfterAdd = await requestJson('/api/state');
  const nodeId = stateAfterAdd.paths?.find((p) => p.id === pathId)?.nodes?.[0]?.id;
  if (!nodeId) {
    throw new Error('Node ID not found');
  }

  console.log('[e2e-modules] Completing node...');
  await requestJson('/api/command', {
    method: 'POST',
    body: JSON.stringify({ type: 'COMPLETE_NODE', payload: { pathId, nodeId } })
  });

  const finalState = await requestJson('/api/state');
  const node = finalState.paths?.find((p) => p.id === pathId)?.nodes?.find((n) => n.id === nodeId);
  if (!node || node.completed !== true) {
    throw new Error('Node not completed');
  }

  console.log('[e2e-modules] OK');
}

run().catch((error) => {
  console.error('[e2e-modules] Failed:', error.message);
  process.exit(1);
});
