import type { WidgetConfig } from './dashboard';

export interface WidgetProps {
  config: WidgetConfig;
  mode: 'edit' | 'view';
}

/**
 * Declarative config field definition.
 * Each widget type declares what fields appear in the config panel.
 * The panel renders them dynamically — no widget-specific code needed.
 */
export type ConfigFieldType = 'text' | 'number' | 'entity' | 'select' | 'toggle' | 'color' | 'icon' | 'accent-color';

export interface ConfigFieldBase {
  /** Key in WidgetConfig to read/write */
  key: string;
  /** Display label */
  label: string;
  /** Field type determines the input component */
  type: ConfigFieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Help text shown below the field */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Show this field only when a condition is met */
  showWhen?: {
    field: string;
    value: unknown;
    notEmpty?: boolean;
  };
}

export interface TextConfigField extends ConfigFieldBase {
  type: 'text';
}

export interface NumberConfigField extends ConfigFieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface EntityConfigField extends ConfigFieldBase {
  type: 'entity';
  /** Filter entities by domain (e.g., 'light', 'sensor', 'climate') */
  domain?: string;
  /** Filter entities by multiple domains */
  domains?: string[];
}

export interface SelectConfigField extends ConfigFieldBase {
  type: 'select';
  options: { label: string; value: string }[];
}

export interface ToggleConfigField extends ConfigFieldBase {
  type: 'toggle';
}

export interface ColorConfigField extends ConfigFieldBase {
  type: 'color';
}

export interface IconConfigField extends ConfigFieldBase {
  type: 'icon';
}

export interface AccentColorConfigField extends ConfigFieldBase {
  type: 'accent-color';
}

export type ConfigField =
  | TextConfigField
  | NumberConfigField
  | EntityConfigField
  | SelectConfigField
  | ToggleConfigField
  | ColorConfigField
  | IconConfigField
  | AccentColorConfigField;

/**
 * Widget definition — declares everything about a widget type.
 * Adding a new widget = adding a definition + a component. That's it.
 */
export interface WidgetDefinition {
  /** Unique type identifier (e.g., 'light-toggle') */
  type: string;
  /** Display name in the Add Widget menu */
  label: string;
  /** MDI icon name for menus */
  icon: string;
  /** Category for grouping in Add Widget menu */
  category?: 'control' | 'display' | 'climate' | 'media' | 'automation' | 'info' | 'layout';
  /** Default canvas size */
  defaultWidth: number;
  defaultHeight: number;
  /** Minimum canvas size */
  minWidth?: number;
  minHeight?: number;
  /** Default config values */
  defaultConfig: WidgetConfig;
  /** Declarative config panel fields — rendered automatically */
  configFields: ConfigField[];
}
