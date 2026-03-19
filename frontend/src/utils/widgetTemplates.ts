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
  {
    name: 'Kitchen',
    description: 'Lights + timer + sensor grid + button row',
    icon: 'mdi:stove',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Kitchen', showLine: true, fontSize: 'large' } },
      { type: 'button-row', x: 20, y: 90, width: 400, height: 80, config: { label: 'Kitchen Lights' } },
      { type: 'timer-widget', x: 430, y: 90, width: 160, height: 200, config: { label: 'Cooking Timer' } },
      { type: 'sensor-grid', x: 20, y: 180, width: 400, height: 160, config: { label: 'Kitchen Sensors' } },
      { type: 'todo-list', x: 20, y: 350, width: 260, height: 250, config: { label: 'Grocery List', todos: '[]' } },
    ],
  },
  {
    name: 'Media Room',
    description: 'Media player + color lights + scene buttons',
    icon: 'mdi:television',
    category: 'media',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Media Room', showLine: true, fontSize: 'large' } },
      { type: 'media-player', x: 20, y: 90, width: 350, height: 250, config: { label: 'Home Theater' } },
      { type: 'color-light', x: 380, y: 90, width: 180, height: 280, config: { label: 'Ambient Lights' } },
      { type: 'scene-button', x: 20, y: 350, width: 140, height: 80, config: { label: 'Movie Mode' } },
      { type: 'scene-button', x: 170, y: 350, width: 140, height: 80, config: { label: 'Game Mode' } },
      { type: 'scene-button', x: 320, y: 350, width: 140, height: 80, config: { label: 'Bright' } },
    ],
  },
  {
    name: 'Bathroom',
    description: 'Light + fan + humidity gauge + timer',
    icon: 'mdi:shower',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 400, height: 50, config: { label: 'Bathroom', showLine: true, fontSize: 'large' } },
      { type: 'light-toggle', x: 20, y: 90, width: 140, height: 140, config: { label: 'Light' } },
      { type: 'fan-control', x: 170, y: 90, width: 200, height: 200, config: { label: 'Exhaust Fan' } },
      { type: 'gauge-widget', x: 20, y: 240, width: 160, height: 160, config: { label: 'Humidity', min: 0, max: 100, unit: '%' } },
      { type: 'timer-widget', x: 190, y: 300, width: 160, height: 200, config: { label: 'Shower Timer' } },
    ],
  },
  {
    name: 'Office / Workspace',
    description: 'Desk lights + computer + clock + todo + energy',
    icon: 'mdi:desk',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Office', showLine: true, fontSize: 'large' } },
      { type: 'color-light', x: 20, y: 90, width: 180, height: 280, config: { label: 'Desk Light' } },
      { type: 'switch-toggle', x: 210, y: 90, width: 140, height: 140, config: { label: 'Monitor' } },
      { type: 'date-time', x: 360, y: 90, width: 260, height: 100, config: { showDate: true, use24h: false } },
      { type: 'todo-list', x: 360, y: 200, width: 260, height: 250, config: { label: 'Tasks', todos: '[]' } },
      { type: 'energy-monitor', x: 210, y: 240, width: 140, height: 200, config: { label: 'Desk Power' } },
    ],
  },
  {
    name: 'Garage / Outdoor',
    description: 'Cover + lights + person tracker + camera',
    icon: 'mdi:garage',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 580, height: 50, config: { label: 'Garage & Outdoor', showLine: true, fontSize: 'large' } },
      { type: 'cover-control', x: 20, y: 90, width: 200, height: 200, config: { label: 'Garage Door' } },
      { type: 'light-toggle', x: 230, y: 90, width: 140, height: 140, config: { label: 'Porch Light' } },
      { type: 'light-toggle', x: 380, y: 90, width: 140, height: 140, config: { label: 'Garage Light' } },
      { type: 'camera-feed', x: 20, y: 300, width: 290, height: 200, config: { label: 'Driveway Camera' } },
      { type: 'person-tracker', x: 320, y: 240, width: 200, height: 200, config: { label: 'Family' } },
    ],
  },
  {
    name: 'Irrigation Control',
    description: 'Complete sprinkler management — zones, schedule, rain sensor',
    icon: 'mdi:sprinkler',
    category: 'room',
    widgets: [
      { type: 'section-header', x: 20, y: 20, width: 820, height: 50, config: { label: 'Irrigation Control', showLine: true, fontSize: 'large', accentColor: '#3b82f6' } },
      { type: 'irrigation-panel', x: 20, y: 90, width: 520, height: 420, config: {
        label: 'Sprinkler Zones',
        zone1: 'switch.rain_bird_sprinkler_1',
        zone2: 'switch.rain_bird_sprinkler_2',
        zone3: 'switch.rain_bird_sprinkler_3',
        zone4: 'switch.rain_bird_sprinkler_4',
        zone5: 'switch.rain_bird_sprinkler_5',
        zone6: 'switch.rain_bird_sprinkler_6',
        zone7: 'switch.rain_bird_sprinkler_7',
        zone8: 'switch.rain_bird_sprinkler_8',
        rainSensorId: 'binary_sensor.rain_bird_controller_rainsensor',
      }},
      { type: 'irrigation-schedule', x: 550, y: 90, width: 300, height: 420, config: {
        label: 'Schedule',
        entityId: 'automation.outside_sprinkler_schedule',
        runningEntityId: 'input_boolean.sprinkler_running',
        scheduleSelectId: 'input_select.sprinkler_schedule',
        runAutomationId: 'automation.sprinkler_run_selected_schedule',
        rainDelayEntityId: 'number.rain_bird_controller_rain_delay',
        lastRunEntityId: 'input_text.sprinkler_last_run',
      }},
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
