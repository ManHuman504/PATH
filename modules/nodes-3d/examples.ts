/**
 * Примеры использования PathEngine 3D
 * Эти примеры можно использовать после компиляции модуля
 */

// ============================================
// 1. БАЗОВАЯ ИНИЦИАЛИЗАЦИЯ
// ============================================

import { initPathEngine } from '@path/nodes-3d';

const container = document.getElementById('viewport');
const engine = initPathEngine(container, {
  background: 0x0a0a0f,
  antialias: true,
  enableShadows: true
});

// ============================================
// 2. СОЗДАНИЕ ПРОСТЫХ НОД
// ============================================

// Простая нода
const node1 = engine.createNode({
  position: { x: 0, y: 0, z: 0 },
  html: '<div>Hello World</div>'
});

// Нода с кастомным стилем
const node2 = engine.createNode({
  position: { x: 3, y: 0, z: 0 },
  html: `
    <div style="padding: 16px; text-align: center;">
      <h3 style="margin: 0 0 8px 0; color: #4fc3f7;">Welcome</h3>
      <p style="margin: 0; color: #aaa;">This is a custom node</p>
    </div>
  `,
  width: 220,
  height: 100,
  color: 0x2196F3
});

// ============================================
// 3. МНОЖЕСТВЕННОЕ СОЗДАНИЕ НОД
// ============================================

function createGrid(rows, cols, spacing) {
  const nodes = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col - cols / 2) * spacing;
      const y = (row - rows / 2) * spacing;
      
      const node = engine.createNode({
        position: { x, y, z: 0 },
        html: `
          <div style="padding: 12px; text-align: center;">
            <strong>${row},${col}</strong>
          </div>
        `,
        color: 0x2196F3,
        width: 100,
        height: 60
      });
      
      nodes.push(node);
    }
  }
  
  return nodes;
}

// Создаем сетку 3x3
const gridNodes = createGrid(3, 3, 2.5);

// ============================================
// 4. ИНТЕРАКТИВНОСТЬ
// ============================================

const interactiveEngine = initPathEngine(container, {
  callbacks: {
    onNodeHover: (node) => {
      if (node) {
        console.log('Hovering over node:', node);
        // Можно изменить внешний вид
        node.setColor(0xff9800);
      }
    },
    
    onNodeClick: (node) => {
      console.log('Clicked on node:', node);
      
      // Центрируем камеру
      interactiveEngine.focusOnNode(node, true);
      
      // Меняем контент
      node.setHTML(`
        <div style="padding: 16px;">
          <h3 style="color: #4fc3f7;">Clicked!</h3>
          <p>Node was clicked</p>
        </div>
      `);
    },
    
    onNodeDragStart: (node) => {
      console.log('Started dragging:', node);
      node.setColor(0x9c27b0);
    },
    
    onNodeDrag: (node, position) => {
      // Обновляем в реальном времени
      console.log('Dragging to:', position);
    },
    
    onNodeDragEnd: (node) => {
      console.log('Finished dragging:', node);
      node.setColor(0x2196F3);
      
      // Сохраняем позицию
      const pos = node.getPosition();
      localStorage.setItem('lastNodePosition', JSON.stringify(pos));
    }
  }
});

// ============================================
// 5. ДИНАМИЧЕСКОЕ ОБНОВЛЕНИЕ
// ============================================

// Создаем ноду с живым контентом
const liveNode = engine.createNode({
  position: { x: 0, y: 2, z: 0 },
  html: '<div id="live-content">Loading...</div>',
  width: 250
});

// Обновляем каждую секунду
let counter = 0;
setInterval(() => {
  liveNode.setHTML(`
    <div style="padding: 16px;">
      <h3>Live Update</h3>
      <p>Counter: ${++counter}</p>
      <small>Time: ${new Date().toLocaleTimeString()}</small>
    </div>
  `);
}, 1000);

// ============================================
// 6. АНИМАЦИИ И ТРАНСФОРМАЦИИ
// ============================================

const animatedNode = engine.createNode({
  position: { x: -4, y: 0, z: 0 },
  html: '<div>Animated Node</div>'
});

// Простая анимация позиции
function animateNode() {
  const time = Date.now() * 0.001;
  const x = Math.cos(time) * 3;
  const y = Math.sin(time) * 2;
  
  animatedNode.setTransform({ x, y, z: 0 });
  
  requestAnimationFrame(animateNode);
}
animateNode();

// Вращение ноды
function rotateNode() {
  const time = Date.now() * 0.001;
  
  animatedNode.setTransform(
    undefined,
    { x: 0, y: 0, z: time }
  );
  
  requestAnimationFrame(rotateNode);
}
// rotateNode(); // Раскомментируйте для запуска

// ============================================
// 7. УПРАВЛЕНИЕ НОДАМИ
// ============================================

// Получить все ноды
const allNodes = engine.getNodes();
console.log('Total nodes:', allNodes.length);

// Удалить конкретную ноду
engine.removeNode(node1);

// Удалить все ноды
function clearAllNodes() {
  const nodes = engine.getNodes();
  nodes.forEach(node => engine.removeNode(node));
}

// Скрыть/показать ноды
function toggleNodesVisibility() {
  const nodes = engine.getNodes();
  nodes.forEach(node => {
    const isVisible = node.group.visible;
    node.setVisible(!isVisible);
  });
}

// ============================================
// 8. РАБОТА С ЦВЕТАМИ И СТИЛЯМИ
// ============================================

// Создаем разноцветные ноды
const colors = [0xff5722, 0x4caf50, 0x2196f3, 0x9c27b0, 0xffc107];

colors.forEach((color, index) => {
  const node = engine.createNode({
    position: {
      x: (index - colors.length / 2) * 2,
      y: -3,
      z: 0
    },
    html: `
      <div style="padding: 12px; text-align: center;">
        <div style="width: 40px; height: 40px; background: #${color.toString(16)}; 
                    border-radius: 50%; margin: 0 auto 8px;"></div>
        Color ${index + 1}
      </div>
    `,
    color: color,
    width: 120
  });
});

// Изменение цвета при клике
const colorNode = engine.createNode({
  position: { x: 0, y: -5, z: 0 },
  html: '<div>Click to change color</div>'
});

let currentColor = 0x2196f3;
colorNode.htmlElement.addEventListener('click', () => {
  currentColor = Math.random() * 0xffffff;
  colorNode.setColor(currentColor);
});

// ============================================
// 9. СОХРАНЕНИЕ И ЗАГРУЗКА
// ============================================

// Сохранение состояния нод
function saveScene() {
  const nodes = engine.getNodes();
  const sceneData = nodes.map(node => ({
    position: node.getPosition(),
    html: node.htmlElement.innerHTML,
    color: (node.mesh.material as any).color.getHex()
  }));
  
  localStorage.setItem('pathEngineScene', JSON.stringify(sceneData));
  console.log('Scene saved!');
}

// Загрузка состояния
function loadScene() {
  const data = localStorage.getItem('pathEngineScene');
  if (!data) return;
  
  const sceneData = JSON.parse(data);
  
  // Очищаем текущую сцену
  engine.getNodes().forEach(node => engine.removeNode(node));
  
  // Восстанавливаем ноды
  sceneData.forEach(nodeData => {
    engine.createNode({
      position: nodeData.position,
      html: nodeData.html,
      color: nodeData.color
    });
  });
  
  console.log('Scene loaded!');
}

// ============================================
// 10. ПРОДВИНУТЫЕ ПРИМЕРЫ
// ============================================

// Создание ноды с формой
const formNode = engine.createNode({
  position: { x: 5, y: 3, z: 0 },
  html: `
    <div style="padding: 16px;">
      <h3 style="margin: 0 0 12px 0;">Input Form</h3>
      <input type="text" placeholder="Enter text" 
             style="width: 100%; padding: 8px; margin-bottom: 8px; 
                    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                    color: white; border-radius: 4px;">
      <button style="width: 100%; padding: 8px; background: #4fc3f7; 
                     border: none; border-radius: 4px; color: white; cursor: pointer;">
        Submit
      </button>
    </div>
  `,
  width: 240,
  height: 140
});

// Создание графа связанных нод (подготовка к будущей функции связей)
function createConnectedNodes() {
  const centerNode = engine.createNode({
    position: { x: 0, y: 0, z: 0 },
    html: '<div style="padding: 16px; text-align: center;"><strong>Center</strong></div>',
    color: 0xff5722
  });
  
  const satellites = [];
  const count = 6;
  const radius = 4;
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    const node = engine.createNode({
      position: { x, y, z: 0 },
      html: `<div style="padding: 12px; text-align: center;">Node ${i + 1}</div>`,
      color: 0x4caf50,
      width: 120
    });
    
    satellites.push(node);
  }
  
  return { centerNode, satellites };
}

const connected = createConnectedNodes();

// ============================================
// 11. ОЧИСТКА РЕСУРСОВ
// ============================================

// При уничтожении компонента
function cleanup() {
  engine.dispose();
  console.log('Engine disposed, resources freed');
}

// Вызывать при выходе из приложения
// cleanup();

// ============================================
// 12. ЭКСПОРТ ПРИМЕРОВ
// ============================================

export {
  createGrid,
  saveScene,
  loadScene,
  clearAllNodes,
  toggleNodesVisibility,
  createConnectedNodes,
  cleanup
};
