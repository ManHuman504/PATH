const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const coreSrc = path.join(root, 'packages', 'core', 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function run() {
  const files = walk(coreSrc);
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes(': any') || line.includes('<any>') || line.includes(' as any')) {
        violations.push({ file, line: index + 1, text: line.trim() });
      }
    });
  }

  if (violations.length > 0) {
    console.error('[audit-types] Potential any usage found:');
    for (const v of violations) {
      console.error(`- ${v.file}#${v.line}: ${v.text}`);
    }
    process.exit(1);
  }

  console.log('[audit-types] OK');
}

run();
