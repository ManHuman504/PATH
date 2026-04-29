/**
 * Core data types for Path# system
 */

export interface Node {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  position: { x: number; y: number };
  color: string;
  connections: string[];
  size?: { width: number; height: number };
  tags?: string[];  // NEW: Tags like ["it", "design"]
  hasButton?: boolean;
  pinned?: boolean;
  achievement?: Achievement;
}

export interface Path {
  id: string;
  title: string;
  description?: string;
  nodes: Node[];
  createdAt: string;
  updatedAt?: string;
  tags?: string[];  // NEW: Tags like ["it", "design"]
  previewUrl?: string;
  previewMeta?: { x: number; y: number; scale: number } | null;
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
  difficulty: number;
  unlocked: boolean;
  tags?: string[];  // NEW: Tags like ["it", "design"]
  tagColor?: string; // Color for the tag display
}

/**
 * Parse tags from text, supports formats:
 * - #tag
 * - tag (without #)
 * Returns array of lowercase tags without # symbol
 */
export function parseTags(text: string): string[] {
  if (!text) return [];
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(tagRegex);
  if (!matches) return [];
  return matches.map(tag => tag.slice(1).toLowerCase());
}

/**
 * Format tags for display
 * Returns tags with # prefix
 */
export function formatTags(tags: string[]): string {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => `#${tag}`).join(' ');
}
