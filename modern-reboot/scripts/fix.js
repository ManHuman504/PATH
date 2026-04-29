const fs = require('fs');
const path = require('path');

const filePath = 'C:\\\\Users\\\\feeloowe\\\\Documents\\\\PATH# backups\\\\4214\\\\5\\\\PATH#\\\\modern-reboot\\\\apps\\\\web\\\\app\\\\paths\\\\[id]\\\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

let modified = false;

// Fix 1: Ensure onConnect handler is present
if (!content.includes('onConnect')) {
  content = content.replace(
    'onNodeClick={handleNodeClick}',
    'onNodeClick={handleNodeClick}\n          onConnect={onConnect}'
  );
  modified = true;
  console.log('Applied onConnect fix');
}

// Fix 2: Ensure defaultEdgeOptions exist
if (!content.includes('defaultEdgeOptions')) {
  content = content.replace(
    'style={',
    'style={\n          defaultEdgeOptions={\n            type: "smoothstep",\n            animated: true,\n            style: { stroke: "#55b3ff", strokeWidth: 2 },\n          }\n          style={'
  );
  modified = true;
  console.log('Applied defaultEdgeOptions fix');
}

// Fix 3: Ensure handles are correct (source on top, target on bottom)
if (!content.includes('type="source"') || !content.includes('type="target"')) {
  const targetHandle = '<Handle\n        type="target"\n        position={Position.Top}\n        style={\n          width: "8px",\n          height: "8px",\n          background: color,\n          border: "2px solid #07080a",\n        }\n      />';
  const sourceHandle = '<Handle\n        type="source"\n        position={Position.Bottom}\n        style={\n          width: "8px",\n          height: "8px",\n          background: color,\n          border: "2px solid #07080a",\n        }\n      />';
  
  // Simple string replacement for the handle section
  if (content.includes('type="target"') && !content.includes('type="source"')) {
    content = content.replace(
      targetHandle,
      targetHandle + '\n' + sourceHandle
    );
    modified = true;
    console.log('Added missing source handle');
  } else if (content.includes('type="source"') && !content.includes('type="target"')) {
    content = content.replace(
      sourceHandle,
      sourceHandle + '\n' + targetHandle
    );
    modified = true;
    console.log('Added missing target handle');
  }
}

if (modified) {
  fs.writeFileSync(filePath, content);
  console.log('SUCCESS: File updated');
} else {
  console.log('NO CHANGES: File already correct');
}