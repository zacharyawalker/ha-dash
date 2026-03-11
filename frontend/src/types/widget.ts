import type { WidgetConfig } from './dashboard';

export interface WidgetProps {
  config: WidgetConfig;
  mode: 'edit' | 'view';
}

export interface WidgetDefinition {
  type: string;
  label: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultConfig: WidgetConfig;
}
