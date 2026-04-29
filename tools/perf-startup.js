const { spawn } = require('node:child_process');

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = ['run', 'dev', '--workspace=@path/web'];

const start = Date.now();
const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });

let done = false;

function finish(ok) {
  if (done) return;
  done = true;
  const elapsed = Date.now() - start;
  console.log(`[perf-startup] ${ok ? 'Ready' : 'Failed'} in ${elapsed} ms`);
  if (child.pid) {
    try {
      process.kill(child.pid, 'SIGINT');
    } catch (e) {
      // ignore
    }
  }
  setTimeout(() => process.exit(ok ? 0 : 1), 500);
}

child.stdout.on('data', (data) => {
  const text = data.toString();
  if (text.includes('Running at http://localhost:3000')) {
    finish(true);
  }
});

child.stderr.on('data', (data) => {
  const text = data.toString();
  if (text.toLowerCase().includes('error')) {
    console.error(text.trim());
  }
});

child.on('exit', (code) => {
  if (!done) {
    console.error(`[perf-startup] Process exited early with code ${code}`);
    finish(false);
  }
});
