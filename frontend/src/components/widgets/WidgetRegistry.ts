import type { ComponentType } from 'react';
import type { WidgetProps, WidgetDefinition } from '../../types/widget';

// Phase 1 widgets
import LightToggle from './LightToggle';
import SensorDisplay from './SensorDisplay';
import ClimateCard from './ClimateCard';
import SceneButton from './SceneButton';

// Phase 2 widgets
import SwitchToggle from './SwitchToggle';
import ScriptButton from './ScriptButton';
import BinarySensor from './BinarySensor';
import DimmerSlider from './DimmerSlider';
import AutomationToggle from './AutomationToggle';
import InputSelect from './InputSelect';
import InputNumber from './InputNumber';
import WeatherForecast from './WeatherForecast';
import MarkdownBlock from './MarkdownBlock';
import ClockWidget from './ClockWidget';

// Phase 4 widgets
import MediaPlayer from './MediaPlayer';
import CoverControl from './CoverControl';
import LockControl from './LockControl';
import FanControl from './FanControl';
import PersonTracker from './PersonTracker';
import GaugeWidget from './GaugeWidget';

export const widgetComponents: Record<string, ComponentType<WidgetProps>> = {
  'light-toggle': LightToggle,
  'sensor-display': SensorDisplay,
  'climate-card': ClimateCard,
  'scene-button': SceneButton,
  'switch-toggle': SwitchToggle,
  'script-button': ScriptButton,
  'binary-sensor': BinarySensor,
  'dimmer-slider': DimmerSlider,
  'automation-toggle': AutomationToggle,
  'input-select': InputSelect,
  'input-number': InputNumber,
  'weather-forecast': WeatherForecast,
  'markdown-block': MarkdownBlock,
  'clock-widget': ClockWidget,
  'media-player': MediaPlayer,
  'cover-control': CoverControl,
  'lock-control': LockControl,
  'fan-control': FanControl,
  'person-tracker': PersonTracker,
  'gauge-widget': GaugeWidget,
};

export const widgetDefinitions: WidgetDefinition[] = [
  // === Control ===
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
    type: 'dimmer-slider',
    label: 'Dimmer / Brightness',
    icon: 'mdi:brightness-6',
    category: 'control',
    defaultWidth: 160,
    defaultHeight: 200,
    minWidth: 120,
    minHeight: 160,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'light', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },
  {
    type: 'switch-toggle',
    label: 'Switch / Boolean',
    icon: 'mdi:toggle-switch',
    category: 'control',
    defaultWidth: 140,
    defaultHeight: 140,
    minWidth: 100,
    minHeight: 100,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domains: ['switch', 'input_boolean'], required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Climate ===
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
      { key: 'showFan', label: 'Show Fan Controls', type: 'toggle', helpText: 'Display fan mode selector' },
      { key: 'showHumidity', label: 'Show Humidity', type: 'toggle', helpText: 'Display humidity reading' },
    ],
  },
  {
    type: 'weather-forecast',
    label: 'Weather Forecast',
    icon: 'mdi:weather-cloudy',
    category: 'climate',
    defaultWidth: 280,
    defaultHeight: 280,
    minWidth: 200,
    minHeight: 200,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'weather', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Display ===
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
    type: 'binary-sensor',
    label: 'Binary Sensor',
    icon: 'mdi:shield-check',
    category: 'display',
    defaultWidth: 140,
    defaultHeight: 140,
    minWidth: 100,
    minHeight: 100,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'binary_sensor', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },
  {
    type: 'clock-widget',
    label: 'Clock / Date',
    icon: 'mdi:clock-outline',
    category: 'display',
    defaultWidth: 200,
    defaultHeight: 140,
    minWidth: 140,
    minHeight: 100,
    defaultConfig: { showDate: true, showSeconds: false, use24h: false, showIcon: true },
    configFields: [
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Optional subtitle' },
      { key: 'showDate', label: 'Show Date', type: 'toggle' },
      { key: 'showSeconds', label: 'Show Seconds', type: 'toggle' },
      { key: 'use24h', label: '24-Hour Format', type: 'toggle' },
      { key: 'showIcon', label: 'Show Clock Icon', type: 'toggle' },
    ],
  },

  // === Automation ===
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
  {
    type: 'script-button',
    label: 'Script Trigger',
    icon: 'mdi:script',
    category: 'automation',
    defaultWidth: 140,
    defaultHeight: 140,
    minWidth: 100,
    minHeight: 100,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'script', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },
  {
    type: 'automation-toggle',
    label: 'Automation Toggle',
    icon: 'mdi:robot',
    category: 'automation',
    defaultWidth: 140,
    defaultHeight: 160,
    minWidth: 100,
    minHeight: 120,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'automation', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Input Helpers ===
  {
    type: 'input-select',
    label: 'Input Select',
    icon: 'mdi:form-select',
    category: 'control',
    defaultWidth: 200,
    defaultHeight: 120,
    minWidth: 150,
    minHeight: 100,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'input_select', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },
  {
    type: 'input-number',
    label: 'Input Number',
    icon: 'mdi:numeric',
    category: 'control',
    defaultWidth: 180,
    defaultHeight: 160,
    minWidth: 140,
    minHeight: 120,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'input_number', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Media ===
  {
    type: 'media-player',
    label: 'Media Player',
    icon: 'mdi:television',
    category: 'media',
    defaultWidth: 280,
    defaultHeight: 280,
    minWidth: 220,
    minHeight: 200,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'media_player', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Cover / Blinds ===
  {
    type: 'cover-control',
    label: 'Cover / Blinds',
    icon: 'mdi:blinds-horizontal',
    category: 'control',
    defaultWidth: 180,
    defaultHeight: 240,
    minWidth: 140,
    minHeight: 200,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'cover', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Lock ===
  {
    type: 'lock-control',
    label: 'Lock',
    icon: 'mdi:lock',
    category: 'control',
    defaultWidth: 140,
    defaultHeight: 160,
    minWidth: 100,
    minHeight: 120,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'lock', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Fan ===
  {
    type: 'fan-control',
    label: 'Fan Speed',
    icon: 'mdi:fan',
    category: 'control',
    defaultWidth: 180,
    defaultHeight: 260,
    minWidth: 140,
    minHeight: 200,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'fan', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Person ===
  {
    type: 'person-tracker',
    label: 'Person Tracker',
    icon: 'mdi:account-circle',
    category: 'display',
    defaultWidth: 160,
    defaultHeight: 180,
    minWidth: 120,
    minHeight: 140,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'person', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Gauge ===
  {
    type: 'gauge-widget',
    label: 'Gauge',
    icon: 'mdi:gauge',
    category: 'display',
    defaultWidth: 160,
    defaultHeight: 160,
    minWidth: 120,
    minHeight: 120,
    defaultConfig: { label: '', min: 0, max: 100, lowThreshold: 30, highThreshold: 70 },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', domain: 'sensor', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
      { key: 'min', label: 'Min Value', type: 'number', min: -1000, max: 10000 },
      { key: 'max', label: 'Max Value', type: 'number', min: -1000, max: 10000 },
      { key: 'unit', label: 'Unit', type: 'text', placeholder: 'Auto from entity' },
      { key: 'lowThreshold', label: 'Low Threshold (%)', type: 'number', min: 0, max: 100, helpText: 'Green below this' },
      { key: 'highThreshold', label: 'High Threshold (%)', type: 'number', min: 0, max: 100, helpText: 'Red above this' },
    ],
  },

  // === Layout ===
  {
    type: 'markdown-block',
    label: 'Text / Markdown',
    icon: 'mdi:text-box',
    category: 'layout',
    defaultWidth: 200,
    defaultHeight: 100,
    minWidth: 100,
    minHeight: 60,
    defaultConfig: { content: '', fontSize: '14', textAlign: 'center' },
    configFields: [
      { key: 'content', label: 'Content', type: 'text', placeholder: 'Enter text...' },
      { key: 'fontSize', label: 'Font Size (px)', type: 'number', min: 10, max: 72, step: 1 },
      {
        key: 'textAlign',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
    ],
  },
];

/** Domain filter map for the Add Widget toolbar dropdown */
export const WIDGET_DOMAINS: Record<string, string | string[] | undefined> = {};
for (const def of widgetDefinitions) {
  const entityField = def.configFields.find((f) => f.key === 'entityId' && f.type === 'entity');
  if (entityField && entityField.type === 'entity') {
    WIDGET_DOMAINS[def.type] = entityField.domain || (entityField.domains as string[]) || undefined;
  }
}

/** Look up a widget definition by type */
export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return widgetDefinitions.find((d) => d.type === type);
}
