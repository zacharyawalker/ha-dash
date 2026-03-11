import type { ComponentType } from 'react';
import type { WidgetProps, WidgetDefinition } from '../../types/widget';
import LightToggle from './LightToggle';
import SensorDisplay from './SensorDisplay';

export const widgetComponents: Record<string, ComponentType<WidgetProps>> = {
  'light-toggle': LightToggle,
  'sensor-display': SensorDisplay,
};

export const widgetDefinitions: WidgetDefinition[] = [
  {
    type: 'light-toggle',
    label: 'Light Toggle',
    icon: 'mdi:lightbulb',
    defaultWidth: 140,
    defaultHeight: 140,
    defaultConfig: { label: '' },
  },
  {
    type: 'sensor-display',
    label: 'Sensor Display',
    icon: 'mdi:gauge',
    defaultWidth: 160,
    defaultHeight: 140,
    defaultConfig: { label: '', unit: '' },
  },
];
