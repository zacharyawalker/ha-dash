import type { ComponentType } from 'react';
import type { WidgetProps, WidgetDefinition } from '../../types/widget';
import LightToggle from './LightToggle';
import SensorDisplay from './SensorDisplay';
import ClimateCard from './ClimateCard';
import SceneButton from './SceneButton';

export const widgetComponents: Record<string, ComponentType<WidgetProps>> = {
  'light-toggle': LightToggle,
  'sensor-display': SensorDisplay,
  'climate-card': ClimateCard,
  'scene-button': SceneButton,
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
  {
    type: 'climate-card',
    label: 'Climate / Thermostat',
    icon: 'mdi:thermostat',
    defaultWidth: 260,
    defaultHeight: 320,
    defaultConfig: { label: '' },
  },
  {
    type: 'scene-button',
    label: 'Scene Button',
    icon: 'mdi:play-circle',
    defaultWidth: 140,
    defaultHeight: 140,
    defaultConfig: { label: '' },
  },
];
