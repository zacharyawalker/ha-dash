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

/** A page within a dashboard (tabs) */
export interface DashboardPage {
  id: string;
  name: string;
  icon?: string;
  widgets: Widget[];
}

export interface Dashboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** Legacy flat widgets — migrated to pages[0] on load */
  widgets: Widget[];
  /** Multi-page support */
  pages?: DashboardPage[];
  /** Active page index */
  activePage?: number;
  /** Theme: 'dark' | 'light' */
  theme?: 'dark' | 'light';
}
