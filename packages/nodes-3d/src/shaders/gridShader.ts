/**
 * Шейдеры для бесконечного процедурного фона
 * Рисует точки и линии, которые реагируют на позицию камеры и курсора
 */

export const gridVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const gridFragmentShader = `
  uniform vec3 uCameraPosition;
  uniform vec2 uCursorPosition;
  uniform float uTime;
  uniform float uCursorRadius;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  // Функция для генерации точечной сетки
  float gridPattern(vec2 pos, float scale) {
    vec2 grid = fract(pos * scale);
    vec2 distFromCenter = abs(grid - 0.5) * 2.0;
    float dot = 1.0 - smoothstep(0.85, 0.95, max(distFromCenter.x, distFromCenter.y));
    return dot;
  }
  
  // Функция для линий сетки
  float gridLines(vec2 pos, float scale) {
    vec2 grid = fract(pos * scale);
    float lineWidth = 0.02;
    float lines = 0.0;
    
    if (grid.x < lineWidth || grid.x > 1.0 - lineWidth) {
      lines = 0.3;
    }
    if (grid.y < lineWidth || grid.y > 1.0 - lineWidth) {
      lines = max(lines, 0.3);
    }
    
    return lines;
  }
  
  void main() {
    // Позиция относительно камеры для бесконечности
    vec2 worldPos = vWorldPosition.xy + uCameraPosition.xy;
    
    // Основная сетка точек
    float dots = gridPattern(worldPos, 0.2);
    
    // Линии
    float lines = gridLines(worldPos, 0.2);
    
    // Расстояние от курсора (в мировых координатах)
    vec2 cursorWorldPos = uCursorPosition + uCameraPosition.xy;
    float distToCursor = length(vWorldPosition.xy - cursorWorldPos);
    
    // Эффект увеличения и яркости от курсора
    float cursorInfluence = smoothstep(uCursorRadius, 0.0, distToCursor);
    
    // Увеличиваем яркость и размер точек возле курсора
    dots += cursorInfluence * 0.5;
    
    // Базовый цвет сетки
    vec3 baseColor = vec3(0.15, 0.15, 0.2);
    vec3 dotColor = vec3(0.3, 0.35, 0.4);
    vec3 cursorColor = vec3(1.0, 1.0, 1.0);
    
    // Смешиваем цвета
    vec3 finalColor = baseColor;
    finalColor = mix(finalColor, dotColor, dots * 0.5);
    finalColor = mix(finalColor, dotColor, lines);
    
    // Добавляем белое свечение от курсора
    finalColor = mix(finalColor, cursorColor, cursorInfluence * dots);
    
    // Добавляем ambient подсветку для глубины
    float ambient = 0.05 + 0.05 * sin(uTime * 0.5 + worldPos.x * 0.1) * cos(uTime * 0.3 + worldPos.y * 0.1);
    finalColor += ambient;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
