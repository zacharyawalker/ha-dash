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
    category: 'control',
    defaultWidth: 140,
    defaultHeight: 140,
    minWidth: 100,
    minHeight: 100,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'light', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },
  {
    type: 'sensor-display',
    label: 'Sensor Display',
    icon: 'mdi:gauge',
    category: 'display',
    defaultWidth: 160,
    defaultHeight: 140,
    minWidth: 120,
    minHeight: 100,
    defaultConfig: { label: '', unit: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'sensor', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
      { key: 'unit', label: 'Unit Override', type: 'text', placeholder: 'Auto from entity' },
    ],
  },
  {
    type: 'climate-card',
    label: 'Climate / Thermostat',
    icon: 'mdi:thermostat',
    category: 'climate',
    defaultWidth: 260,
    defaultHeight: 320,
    minWidth: 200,
    minHeight: 250,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'climate', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
      {
        key: 'showFan',
        label: 'Show Fan Controls',
        type: 'toggle',
        helpText: 'Display fan mode selector (if entity supports it)',
      },
      {
        key: 'showHumidity',
        label: 'Show Humidity',
        type: 'toggle',
        helpText: 'Display current humidity reading',
      },
    ],
  },
  {
    type: 'scene-button',
    label: 'Scene Button',
    icon: 'mdi:play-circle',
    category: 'automation',
    defaultWidth: 140,
    defaultHeight: 140,
    minWidth: 100,
    minHeight: 100,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'scene', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },
];

/** Look up a widget definition by type */
export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return widgetDefinitions.find((d) => d.type === type);
}
