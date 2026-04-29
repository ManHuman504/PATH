const fs = require('fs');
const p = 'C:\\\\Users\\\\feeloowe\\\\Documents\\\\PATH# backups\\\\4214\\\\5\\\\PATH#\\\\modern-reboot\\\\apps\\\\web\\\\app\\\\paths\\\\[id]\\\\page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Add missing source/target handles
if (!c.includes('type="source"') && !c.includes('type="target"')) {
  // Find the closing of the div with className="react-flow__controls" or similar insertion point
  // Insert handles before the ControlsWrapper closing or after the Background
  const handleSource = '<Handle\n        type="source"\n        position={Position.Top}\n        style={\n          width: 10,\n          height: 10,\n          background: color,\n          border: "2px solid #07080a",\n          borderRadius: "50%",\n        }\n      />';
  const handleTarget = '<Handle\n        type="target"\n        position={Position.Bottom}\n        style={\n          width: 10,\n          height: 10,\n          background: color,\n          border: "2px solid #07080a",\n          borderRadius: "50%",\n        }\n      />';
  // Insert handles after the div that has position-relative or similar - find ControlsWrapper end
  // Simpler: add after the div className="react-flow__viewport" closing or before Controls closing
  const insertPoint = c.indexOf('</div>') + 7; // after first </div>
  c = c.substring(0, insertPoint) + '\n' + handleSource + '\n' + handleTarget + c.substring(insertPoint);
}

// Ensure onConnect is present
if (!c.includes('onConnect')) {
  c = c.replace('onNodeClick={handleNodeClick}', 'onNodeClick={handleNodeClick}\n          onConnect={onConnect}');
}

// Ensure defaultEdgeOptions exist
if (!c.includes('defaultEdgeOptions')) {
  c = c.replace('style={', 'style={\n          defaultEdgeOptions={\n            type: "smoothstep",\n            animated: true,\n            style: { stroke: "#55b3ff", strokeWidth: 2 },\n          }\n          style={');
}

fs.writeFileSync(p, c);
console.log('Applied all fixes');
console.log('onConnect:', (c.match(/onConnect/g)||[]).length);
console.log('defaultEdgeOptions:', (c.match(/defaultEdgeOptions/g)||[]).length);
console.log('type="source":', (c.match(/type=\"source\"/g)||[]).length);
console.log('type="target":', (c.match(/type=\"target\"/g)||[]).length);