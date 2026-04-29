/**
 * Core типы для Path#
 */

export interface INode {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}

export interface IEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface IPath {
  id: string;
  title: string;
  nodes: INode[];
  edges: IEdge[];
  createdAt: Date;
}

export interface IAchievement {
  id: string;
  nodeId: string;
  pathId: string;
  completedAt: Date;
}

export interface ICoreState {
  paths: Map<string, IPath>;
  achievements: Map<string, IAchievement>;
}
