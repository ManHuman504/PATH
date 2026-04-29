const fs = require('fs');
const p = 'C:\\\\Users\\\\feeloowe\\\\Documents\\\\PATH# backups\\\\4214\\\\5\\\\PATH#\\\\modern-reboot\\\\apps\\\\web\\\\app\\\\paths\\\\[id]\\\\page.tsx';
try {
  const c = fs.readFileSync(p, 'utf8');
  const onConnectCount = (c.match(/onConnect/g)||[]).length;
  const defaultEdgeOptionsCount = (c.match(/defaultEdgeOptions/g)||[]).length;
  const s = c.match(/type="source"/g);
  const t = c.match(/type="target"/g);
  console.log('onConnect occurrences:', onConnectCount);
  console.log('defaultEdgeOptions occurrences:', defaultEdgeOptionsCount);
  console.log('type="source" occurrences:', s ? s.length : 0);
  console.log('type="target" occurrences:', t ? t.length : 0);
} catch(e) {
  console.log('Error:', e.message);
}
