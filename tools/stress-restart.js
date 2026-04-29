const { spawn } = require('node:child_process');

const cycles = Number(process.env.CYCLES || 20);
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = ['run', 'dev', '--workspace=@path/web'];

async function runCycle(index) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let ready = false;

    const timeout = setTimeout(() => {
      if (!ready) {
        child.kill('SIGINT');
        reject(new Error(`Cycle ${index}: timeout waiting for server`));
      }
    }, 15000);

    child.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Running at http://localhost:3000')) {
        ready = true;
        clearTimeout(timeout);
        const elapsed = Date.now() - start;
        child.kill('SIGINT');
        resolve(elapsed);
      }
    });

    child.on('exit', (code) => {
      if (!ready && code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Cycle ${index}: process exited early (${code})`));
      }
    });
  });
}

async function run() {
  console.log(`[stress-restart] Running ${cycles} restart cycles...`);
  const times = [];

  for (let i = 1; i <= cycles; i += 1) {
    const ms = await runCycle(i);
    times.push(ms);
    console.log(`[stress-restart] Cycle ${i}/${cycles}: ${ms} ms`);
  }

  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  console.log(`[stress-restart] OK. Avg startup: ${avg} ms`);
}

run().catch((error) => {
  console.error('[stress-restart] Failed:', error.message);
  process.exit(1);
});
