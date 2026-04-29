const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const coreSrc = path.join(root, 'packages', 'core', 'src');
const forbidden = [/\@path\/modules/i, /\@path\/extensions/i, /packages\/modules/i, /packages\/extensions/i];

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
    for (const pattern of forbidden) {
      if (pattern.test(content)) {
        violations.push({ file, pattern: pattern.toString() });
      }
    }
  }

  if (violations.length > 0) {
    console.error('[audit-layering] Violations found:');
    for (const v of violations) {
      console.error(`- ${v.file} matched ${v.pattern}`);
    }
    process.exit(1);
  }

  console.log('[audit-layering] OK');
}

run();
