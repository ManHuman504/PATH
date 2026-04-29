/**
 * Команды Core
 */

export type Command =
  | CreatePathCommand
  | DeletePathCommand
  | AddNodeCommand
  | UpdateNodeCommand
  | DeleteNodeCommand
  | ConnectNodesCommand
  | DisconnectNodesCommand
  | CompleteNodeCommand;

export interface CreatePathCommand {
  type: 'CREATE_PATH';
  payload: {
    title: string;
    description?: string;
  };
}

export interface DeletePathCommand {
  type: 'DELETE_PATH';
  payload: {
    pathId: string;
  };
}

export interface AddNodeCommand {
  type: 'ADD_NODE';
  payload: {
    pathId: string;
    title: string;
    description?: string;
  };
}

export interface UpdateNodeCommand {
  type: 'UPDATE_NODE';
  payload: {
    pathId: string;
    nodeId: string;
    title?: string;
    description?: string;
  };
}

export interface DeleteNodeCommand {
  type: 'DELETE_NODE';
  payload: {
    pathId: string;
    nodeId: string;
  };
}

export interface ConnectNodesCommand {
  type: 'CONNECT_NODES';
  payload: {
    pathId: string;
    fromNodeId: string;
    toNodeId: string;
  };
}

export interface UndoCommand {
  type: 'UNDO';
  payload: {};
}

export interface RedoCommand {
  type: 'REDO';
  payload: {};
}

export interface DisconnectNodesCommand {
  type: 'DISCONNECT_NODES';
  payload: {
    pathId: string;
    edgeId: string;
  };
}

export interface CompleteNodeCommand {
  type: 'COMPLETE_NODE';
  payload: {
    pathId: string;
    nodeId: string;
  };
}
