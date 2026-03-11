export interface WidgetConfig {
  entityId?: string;
  label?: string;
  unit?: string;
  [key: string]: unknown;
}

export interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config: WidgetConfig;
}

export interface Dashboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  widgets: Widget[];
}
