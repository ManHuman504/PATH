/**
 * Sequence Model - Единая логическая модель последовательностей
 * Синхронизируется между визуальным и текстовым редакторами
 * Формат: "название - название - название"
 */

/**
 * Шаг в последовательности
 */
export interface Step {
  id: string;
  index: number;           // Порядок в цепочке (1, 2, 3...)
  title: string;           // Название шага
  nodeId: string;          // ID соответствующей ноды в визуальном редакторе
}

/**
 * Последовательность (цепочка шагов)
 */
export interface Sequence {
  id: string;
  pathId: string;
  name?: string;
  steps: Step[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Преобразовать Sequence в текстовый формат
 * Возвращает: "название - название - название"
 */
export function sequenceToText(sequence: Sequence): string {
  return sequence.steps
    .sort((a, b) => a.index - b.index)
    .map(step => step.title)
    .join(' - ');
}

/**
 * Парсить текстовый формат в Sequence
 * Формат: "название - название - название"
 * nodeIds: массив ID нод в порядке соответствия
 */
export function parseTextToSequence(
  text: string,
  pathId: string,
  nodeIds: string[] = [],
  sequenceId?: string
): Sequence {
  const titles = text.split('-').map(t => t.trim()).filter(t => t.length > 0);
  
  const steps: Step[] = titles.map((title, idx) => ({
    id: 'step_' + Date.now() + '_' + idx,
    index: idx + 1,
    title,
    nodeId: nodeIds[idx] || ''
  }));

  return {
    id: sequenceId || 'seq_' + Date.now(),
    pathId,
    name: titles[0] || 'Untitled',
    steps,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Добавить шаг в последовательность
 */
export function addStepToSequence(sequence: Sequence, title: string, nodeId: string): Sequence {
  const newIndex = sequence.steps.length + 1;
  const newStep: Step = {
    id: 'step_' + Date.now() + '_' + newIndex,
    index: newIndex,
    title,
    nodeId
  };

  return {
    ...sequence,
    steps: [...sequence.steps, newStep],
    updatedAt: Date.now()
  };
}

/**
 * Удалить шаг и пересчитать индексы
 */
export function removeStepFromSequence(sequence: Sequence, stepId: string): Sequence {
  const filtered = sequence.steps.filter(s => s.id !== stepId);
  const reindexed = filtered.map((step, idx) => ({
    ...step,
    index: idx + 1
  }));

  return {
    ...sequence,
    steps: reindexed,
    updatedAt: Date.now()
  };
}

/**
 * Обновить название шага
 */
export function updateStepTitle(sequence: Sequence, stepId: string, newTitle: string): Sequence {
  return {
    ...sequence,
    steps: sequence.steps.map(s => 
      s.id === stepId ? { ...s, title: newTitle } : s
    ),
    updatedAt: Date.now()
  };
}

/**
 * Получить последовательность из подключенных нод
 * Ищет цепочку соединений начиная с первой ноды
 */
export function buildSequenceFromConnections(
  nodes: any[],
  startNodeId: string,
  pathId: string
): Sequence {
  const steps: Step[] = [];
  const nodeIds: string[] = [];
  let currentNodeId = startNodeId;
  const visited = new Set<string>();

  while (currentNodeId && !visited.has(currentNodeId)) {
    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) break;

    visited.add(currentNodeId);
    steps.push({
      id: 'step_' + Date.now() + '_' + steps.length,
      index: steps.length + 1,
      title: node.title || `Step ${steps.length + 1}`,
      nodeId: node.id
    });
    nodeIds.push(node.id);

    // Найти следующую ноду через соединение
    const nextNodeId = node.connections?.[0];
    currentNodeId = nextNodeId;
  }

  return {
    id: 'seq_' + Date.now(),
    pathId,
    name: steps[0]?.title || 'Untitled',
    steps,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Получить Step номер ноды (для отображения над нодой)
 */
export function getStepIndex(sequence: Sequence, nodeId: string): number | null {
  const step = sequence.steps.find(s => s.nodeId === nodeId);
  return step ? step.index : null;
}
