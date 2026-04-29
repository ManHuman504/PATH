/**
 * History Manager - Undo/Redo system for Path#
 * Tracks all reversible actions (node create/delete/move/edit)
 */

export interface HistoryAction {
  type: 'CREATE_NODE' | 'DELETE_NODE' | 'UPDATE_NODE' | 'MOVE_NODE' | 'CONNECT_NODES' | 'DISCONNECT_NODES';
  timestamp: number;
  pathId: string;
  undo: () => void;
  redo: () => void;
  data: any;  // Original state for undo
}

export class HistoryManager {
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private maxHistorySize = 25;

  /**
   * Record a new action
   */
  push(action: HistoryAction): void {
    this.undoStack.push(action);
    this.redoStack = [];  // Clear redo stack on new action
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    console.log('[History] Action recorded:', action.type);
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (this.undoStack.length === 0) {
      console.log('[History] Nothing to undo');
      return false;
    }
    
    const action = this.undoStack.pop()!;
    action.undo();
    this.redoStack.push(action);
    
    console.log('[History] Undid action:', action.type);
    return true;
  }

  /**
   * Redo last undone action
   */
  redo(): boolean {
    if (this.redoStack.length === 0) {
      console.log('[History] Nothing to redo');
      return false;
    }
    
    const action = this.redoStack.pop()!;
    action.redo();
    this.undoStack.push(action);
    
    console.log('[History] Redid action:', action.type);
    return true;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    console.log('[History] History cleared');
  }

  /**
   * Get history state
   */
  getState() {
    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length
    };
  }
}

// Global singleton instance
export const historyManager = new HistoryManager();
