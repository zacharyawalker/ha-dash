import type { Widget } from '../types/dashboard';
import { generateId } from './id';

export interface WidgetTemplate {
  name: string;
  description: string;
  icon: string;
  category: 'room' | 'overview' | 'security' | 'climate' | 'media';
  widgets: Omit<Widget, 'id'>[];
}

/**
 * Pre-configured widget layout templates.
 * Users can add these as a set to quickly build common dashboard sections.
 */
export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    name: 'Living Room',
    description: '4 lights + climate card + media player',
    icon: 'mdi:sofa',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Living Room', subtitle: '', showLine: true, fontSize: 'large' } },
      { type: 'light-toggle', x: 20, y: 90, width: 140, height: 140, config: { label: 'Ceiling' } },
      { type: 'light-toggle', x: 170, y: 90, width: 140, height: 140, config: { label: 'Lamp' } },
      { type: 'dimmer-slider', x: 320, y: 90, width: 140, height: 200, config: { label: 'Dimmer' } },
      { type: 'media-player', x: 470, y: 90, width: 280, height: 250, config: { label: 'TV' } },
      { type: 'climate-card', x: 20, y: 240, width: 290, height: 320, config: { label: 'Thermostat' } },
    ],
  },
  {
    name: 'Bedroom',
    description: '2 lights + dimmer + clock',
    icon: 'mdi:bed',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 400, height: 50, config: { label: 'Bedroom', showLine: true, fontSize: 'large' } },
      { type: 'light-toggle', x: 20, y: 90, width: 140, height: 140, config: { label: 'Main Light' } },
      { type: 'dimmer-slider', x: 170, y: 90, width: 140, height: 200, config: { label: 'Bedside' } },
      { type: 'clock-widget', x: 320, y: 90, width: 200, height: 120, config: {} },
    ],
  },
  {
    name: 'Security Overview',
    description: 'Alarm panel + door sensors + camera',
    icon: 'mdi:shield-home',
    category: 'security',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Security', showLine: true, fontSize: 'large', accentColor: '#ef4444' } },
      { type: 'alarm-panel', x: 20, y: 90, width: 260, height: 320, config: { label: 'Alarm' } },
      { type: 'binary-sensor', x: 290, y: 90, width: 140, height: 140, config: { label: 'Front Door' } },
      { type: 'binary-sensor', x: 440, y: 90, width: 140, height: 140, config: { label: 'Back Door' } },
      { type: 'camera-feed', x: 290, y: 240, width: 290, height: 200, config: { label: 'Porch Camera' } },
    ],
  },
  {
    name: 'Climate Dashboard',
    description: 'Thermostat + temp sensors + humidity',
    icon: 'mdi:thermometer',
    category: 'climate',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Climate', showLine: true, fontSize: 'large' } },
      { type: 'climate-card', x: 20, y: 90, width: 290, height: 320, config: { label: 'Main Thermostat' } },
      { type: 'sensor-display', x: 320, y: 90, width: 140, height: 140, config: { label: 'Living Room' } },
      { type: 'sensor-display', x: 470, y: 90, width: 140, height: 140, config: { label: 'Bedroom' } },
      { type: 'gauge-widget', x: 320, y: 240, width: 160, height: 160, config: { label: 'Humidity', min: 0, max: 100, unit: '%' } },
      { type: 'history-graph', x: 20, y: 420, width: 590, height: 180, config: { label: 'Temperature History', hours: 24 } },
    ],
  },
  {
    name: 'Quick Overview',
    description: 'Clock + weather + battery + entity list',
    icon: 'mdi:view-dashboard',
    category: 'overview',
    widgets: [
      { type: 'clock-widget', x: 20, y: 20, width: 200, height: 120, config: {} },
      { type: 'weather-forecast', x: 230, y: 20, width: 250, height: 280, config: {} },
      { type: 'battery-monitor', x: 490, y: 20, width: 250, height: 280, config: { threshold: 30 } },
      { type: 'entity-list', x: 20, y: 150, width: 200, height: 300, config: { label: 'Lights', filterDomain: 'light', maxItems: 15 } },
    ],
  },
];

/**
 * Create widget instances from a template.
 * Generates unique IDs and offsets positions by the given amount.
 */
export function instantiateTemplate(
  template: WidgetTemplate,
  offsetX = 0,
  offsetY = 0,
): Widget[] {
  return template.widgets.map((w) => ({
    ...w,
    id: generateId(),
    x: w.x + offsetX,
    y: w.y + offsetY,
    config: { ...w.config },
  }));
}
