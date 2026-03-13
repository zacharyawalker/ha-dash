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
import IframeEmbed from './IframeEmbed';
import HistoryGraph from './HistoryGraph';
import GroupContainer from './GroupContainer';
import SectionHeader from './SectionHeader';
import ImageWidget from './ImageWidget';
import CameraFeed from './CameraFeed';
import StateCard from './StateCard';
import AlarmPanel from './AlarmPanel';
import TimerWidget from './TimerWidget';
import CounterWidget from './CounterWidget';
import VacuumCard from './VacuumCard';
import BatteryMonitor from './BatteryMonitor';
import EnergyMonitor from './EnergyMonitor';
import NotificationList from './NotificationList';
import TodoList from './TodoList';
import EntityList from './EntityList';

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
  'iframe-embed': IframeEmbed,
  'history-graph': HistoryGraph,
  'group-container': GroupContainer,
  'section-header': SectionHeader,
  'image-widget': ImageWidget,
  'camera-feed': CameraFeed,
  'state-card': StateCard,
  'alarm-panel': AlarmPanel,
  'timer-widget': TimerWidget,
  'counter-widget': CounterWidget,
  'vacuum-card': VacuumCard,
  'battery-monitor': BatteryMonitor,
  'entity-list': EntityList,
  'energy-monitor': EnergyMonitor,
  'notification-list': NotificationList,
  'todo-list': TodoList,
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

  // === Notifications ===
  {
    type: 'notification-list',
    label: 'Notifications',
    icon: 'mdi:bell',
    category: 'display',
    defaultWidth: 280,
    defaultHeight: 300,
    minWidth: 200,
    minHeight: 150,
    defaultConfig: { label: '' },
    configFields: [],
  },

  // === Todo / Shopping List ===
  {
    type: 'todo-list',
    label: 'Todo / Shopping List',
    icon: 'mdi:format-list-bulleted',
    category: 'control',
    defaultWidth: 260,
    defaultHeight: 350,
    minWidth: 200,
    minHeight: 200,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Todo Entity', type: 'entity', domain: 'todo', required: true },
      { key: 'label', label: 'Title', type: 'text', placeholder: 'Auto from entity' },
    ],
  },

  // === Energy ===
  {
    type: 'energy-monitor',
    label: 'Energy Monitor',
    icon: 'mdi:flash',
    category: 'display',
    defaultWidth: 350,
    defaultHeight: 180,
    minWidth: 250,
    minHeight: 120,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'solarEntity', label: 'Solar Production', type: 'entity', domain: 'sensor' },
      { key: 'gridEntity', label: 'Grid Import', type: 'entity', domain: 'sensor' },
      { key: 'batteryEntity', label: 'Battery', type: 'entity', domain: 'sensor' },
      { key: 'consumptionEntity', label: 'Home Consumption', type: 'entity', domain: 'sensor' },
    ],
  },

  // === Monitoring ===
  {
    type: 'battery-monitor',
    label: 'Battery Monitor',
    icon: 'mdi:battery-alert',
    category: 'display',
    defaultWidth: 250,
    defaultHeight: 300,
    minWidth: 180,
    minHeight: 150,
    defaultConfig: { label: '', threshold: 100 },
    configFields: [
      { key: 'threshold', label: 'Show below (%)', type: 'number', min: 1, max: 100, helpText: 'Only show devices below this battery level' },
    ],
  },
  {
    type: 'entity-list',
    label: 'Entity List',
    icon: 'mdi:view-list',
    category: 'display',
    defaultWidth: 280,
    defaultHeight: 350,
    minWidth: 200,
    minHeight: 150,
    defaultConfig: { label: '', filterDomain: '', maxItems: 20 },
    configFields: [
      { key: 'label', label: 'Title', type: 'text' },
      { key: 'filterDomain', label: 'Domain Filter', type: 'text', placeholder: 'light, sensor, switch...' },
      { key: 'maxItems', label: 'Max Items', type: 'number', min: 1, max: 100 },
    ],
  },

  // === History ===
  {
    type: 'history-graph',
    label: 'History Graph',
    icon: 'mdi:chart-line',
    category: 'display',
    defaultWidth: 320,
    defaultHeight: 200,
    minWidth: 200,
    minHeight: 120,
    defaultConfig: { label: '', hours: 24, chartType: 'line' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
      { key: 'hours', label: 'Time Range (hours)', type: 'number', min: 1, max: 168 },
      { key: 'chartType', label: 'Chart Type', type: 'select', options: [
        { label: 'Line', value: 'line' },
        { label: 'Step', value: 'step' },
      ]},
      { key: 'unit', label: 'Unit', type: 'text', placeholder: 'Auto from entity' },
    ],
  },

  // === Embed ===
  {
    type: 'iframe-embed',
    label: 'Iframe Embed',
    icon: 'mdi:web',
    category: 'layout',
    defaultWidth: 400,
    defaultHeight: 300,
    minWidth: 200,
    minHeight: 150,
    defaultConfig: { label: 'Embed', url: '' },
    configFields: [
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://...', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Optional title' },
    ],
  },

  // === Security ===
  {
    type: 'alarm-panel',
    label: 'Alarm Panel',
    icon: 'mdi:shield-home',
    category: 'control',
    defaultWidth: 260,
    defaultHeight: 320,
    minWidth: 200,
    minHeight: 260,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Alarm Entity', type: 'entity', domain: 'alarm_control_panel', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Timer ===
  {
    type: 'timer-widget',
    label: 'Timer',
    icon: 'mdi:timer-outline',
    category: 'control',
    defaultWidth: 180,
    defaultHeight: 220,
    minWidth: 140,
    minHeight: 180,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Timer Entity', type: 'entity', domain: 'timer', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Counter ===
  {
    type: 'counter-widget',
    label: 'Counter',
    icon: 'mdi:counter',
    category: 'control',
    defaultWidth: 160,
    defaultHeight: 220,
    minWidth: 120,
    minHeight: 180,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Counter Entity', type: 'entity', domain: 'counter', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Vacuum ===
  {
    type: 'vacuum-card',
    label: 'Vacuum',
    icon: 'mdi:robot-vacuum',
    category: 'control',
    defaultWidth: 200,
    defaultHeight: 280,
    minWidth: 160,
    minHeight: 240,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Vacuum Entity', type: 'entity', domain: 'vacuum', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    ],
  },

  // === Universal ===
  {
    type: 'state-card',
    label: 'State Card',
    icon: 'mdi:information',
    category: 'display',
    defaultWidth: 160,
    defaultHeight: 160,
    minWidth: 100,
    minHeight: 80,
    defaultConfig: { label: '' },
    configFields: [
      { key: 'entityId', label: 'Entity', type: 'entity', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
      { key: 'unit', label: 'Unit', type: 'text', placeholder: 'Auto from entity' },
    ],
  },

  // === Camera ===
  {
    type: 'camera-feed',
    label: 'Camera Feed',
    icon: 'mdi:cctv',
    category: 'display',
    defaultWidth: 320,
    defaultHeight: 240,
    minWidth: 200,
    minHeight: 150,
    defaultConfig: { label: '', refreshSeconds: 10 },
    configFields: [
      { key: 'entityId', label: 'Camera Entity', type: 'entity', domain: 'camera', required: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
      { key: 'refreshSeconds', label: 'Refresh Interval (seconds)', type: 'number', min: 1, max: 300 },
    ],
  },

  // === Layout ===
  {
    type: 'group-container',
    label: 'Group / Container',
    icon: 'mdi:view-grid',
    category: 'layout',
    defaultWidth: 400,
    defaultHeight: 300,
    minWidth: 200,
    minHeight: 100,
    defaultConfig: { label: 'Group', showBorder: true, bgOpacity: 60 },
    configFields: [
      { key: 'label', label: 'Title', type: 'text' },
      { key: 'showBorder', label: 'Show Border', type: 'toggle' },
      { key: 'bgOpacity', label: 'Background Opacity (%)', type: 'number', min: 0, max: 100 },
    ],
  },
  {
    type: 'section-header',
    label: 'Section Header',
    icon: 'mdi:format-header-1',
    category: 'layout',
    defaultWidth: 300,
    defaultHeight: 60,
    minWidth: 150,
    minHeight: 40,
    defaultConfig: { label: 'Section', subtitle: '', align: 'left', showLine: true, fontSize: 'medium' },
    configFields: [
      { key: 'label', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'align', label: 'Alignment', type: 'select', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ]},
      { key: 'fontSize', label: 'Size', type: 'select', options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ]},
      { key: 'showLine', label: 'Show Line', type: 'toggle' },
    ],
  },
  {
    type: 'image-widget',
    label: 'Image',
    icon: 'mdi:image',
    category: 'layout',
    defaultWidth: 300,
    defaultHeight: 200,
    minWidth: 100,
    minHeight: 80,
    defaultConfig: { label: '', imageUrl: '', objectFit: 'cover', borderRadius: 12, imageOpacity: 100 },
    configFields: [
      { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://...', required: true },
      { key: 'label', label: 'Caption', type: 'text' },
      { key: 'objectFit', label: 'Fit', type: 'select', options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
      ]},
      { key: 'borderRadius', label: 'Corner Radius (px)', type: 'number', min: 0, max: 50 },
      { key: 'imageOpacity', label: 'Opacity (%)', type: 'number', min: 0, max: 100 },
    ],
  },
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
