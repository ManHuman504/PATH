/**
 * UI Extension Interface
 * 
 * Extensions are responsible for:
 * - Building UI configuration from application state
 * - NOT generating HTML or CSS (UIBuilder does that)
 * - Returning declarative JSON configuration only
 * 
 * Architecture:
 * Extension → buildUIConfig() → JSON → UIBuilder → HTML → Browser
 */
export interface IUIExtension {
  /**
   * Unique identifier for this extension
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Build UI configuration from application state
   * 
   * @param props - State and metadata from application
   * @returns Declarative UI configuration (JSON-serializable)
   * 
   * IMPORTANT: Return JSON only, never HTML or CSS strings!
   */
  buildUIConfig(props: {
    state: any;
    tabs: Array<{ id: string; title: string; icon?: string }>;
    commands: string[];
  }): Promise<UIConfig>;
}

/**
 * Complete UI Configuration
 * This is what buildUIConfig() should return
 */
export interface UIConfig {
  title: string;
  subtitle?: string;
  description?: string;
  sections: UISection[];
}

/**
 * UI Section - A logical group of components
 */
export interface UISection {
  type: 'stats' | 'form' | 'cards' | 'table' | 'list' | 'buttons';
  title?: string;
  subtitle?: string;
  
  // For stats
  items?: UIStatItem[];
  
  // For form
  fields?: UIField[];
  
  // For cards/table/list
  columns?: string[];
  
  // For any section - action buttons
  actions?: UIAction[];
}

/**
 * Statistics Item
 */
export interface UIStatItem {
  label: string;
  value: number | string;
  icon?: string;
  color?: string;
  unit?: string;
}

/**
 * Form Field
 */
export interface UIField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email';
  placeholder?: string;
  required?: boolean;
  value?: any;
  options?: Array<{ label: string; value: any }>;
  help?: string;
  disabled?: boolean;
}

/**
 * Action Button
 */
export interface UIAction {
  label: string;
  command: string;  // Must match registered command handler
  style?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: string;
  disabled?: boolean;
  confirm?: string; // Optional confirmation message
}

/**
 * Card Item (for cards component)
 */
export interface UICardItem {
  title: string;
  icon?: string;
  count?: number;
  description?: string;
  link?: string;
  image?: string;
}

/**
 * Table Row
 */
export interface UITableRow {
  [key: string]: string | number | boolean;
}

/**
 * List Item
 */
export interface UIListItem {
  text: string;
  icon?: string;
  link?: string;
  color?: string;
}
