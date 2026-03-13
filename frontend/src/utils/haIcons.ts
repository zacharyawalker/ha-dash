/**
 * Curated Home Automation icon library.
 * Maps HA domains, device classes, and common entities to MDI icons.
 * Used by the icon picker and widget auto-icon features.
 */
import {
  mdiLightbulb, mdiLightbulbGroup, mdiLedStrip, mdiFloorLamp, mdiCeilingLight,
  mdiWallSconce, mdiLamp, mdiTrackLight, mdiOutdoorLamp, mdiStringLights,
  mdiThermometer, mdiThermometerHigh, mdiThermometerLow,
  mdiWaterPercent, mdiFan, mdiFanOff, mdiAirConditioner,
  mdiSnowflake, mdiFire, mdiRadiator,
  mdiPowerPlug, mdiPowerPlugOff, mdiPower, mdiPowerStandby,
  mdiLock, mdiLockOpen, mdiLockAlert, mdiDoorOpen, mdiDoorClosed,
  mdiGarage, mdiGarageOpen, mdiGate, mdiGateOpen,
  mdiWindowOpen, mdiWindowClosed, mdiWindowShutter, mdiBlinds, mdiBlindsOpen,
  mdiMotionSensor, mdiRun,
  mdiWater, mdiWaterOff, mdiWaterAlert, mdiShowerHead, mdiFaucet,
  mdiSmokeDetector, mdiFireAlert,
  mdiSpeaker, mdiSpeakerMultiple, mdiTelevision, mdiCast,
  mdiVolumeHigh, mdiVolumeOff,
  mdiPlay, mdiPause, mdiStop,
  mdiCamera, mdiCctv, mdiWebcam,
  mdiWeatherSunny, mdiWeatherCloudy, mdiWeatherRainy, mdiWeatherSnowy,
  mdiWeatherFog, mdiWeatherWindy, mdiWeatherNight, mdiWeatherPartlyCloudy,
  mdiHome, mdiHomeOutline, mdiHomeFloor1, mdiHomeFloor2, mdiHomeFloor3,
  mdiSofa, mdiBed, mdiBathtub, mdiStove, mdiFridgeOutline,
  mdiDesk, mdiTableFurniture,
  mdiRobotVacuum, mdiWashingMachine, mdiTumbleDryer, mdiDishwasher,
  mdiCarConnected, mdiCar, mdiCarBattery, mdiEvStation,
  mdiSolarPower, mdiBattery, mdiBatteryCharging, mdiFlash,
  mdiWifi, mdiWifiOff, mdiBluetooth,
  mdiCellphone, mdiTablet, mdiLaptop,
  mdiAlarm, mdiTimerOutline, mdiBell,
  mdiShield, mdiShieldHome, mdiShieldLock, mdiShieldCheck,
  mdiAccountCircle, mdiAccount, mdiAccountGroup, mdiAccountChild,
  mdiMapMarker, mdiCrosshairsGps,
  mdiChartLine, mdiGauge, mdiSpeedometer, mdiCounter,
  mdiCalendar, mdiClock,
  mdiCog,
  mdiInformation,
  mdiEye, mdiStar,
  mdiArrowUp, mdiArrowDown, mdiArrowLeft, mdiArrowRight,
  mdiChevronUp, mdiChevronDown,
  mdiMenu,
} from '@mdi/js';

/** Icon category for the picker */
export interface IconCategory {
  label: string;
  icons: { name: string; path: string; keywords: string[] }[];
}

/** All available icons organized by category */
export const HA_ICON_LIBRARY: IconCategory[] = [
  {
    label: 'Lighting',
    icons: [
      { name: 'lightbulb', path: mdiLightbulb, keywords: ['light', 'bulb', 'lamp'] },
      { name: 'lightbulb-group', path: mdiLightbulbGroup, keywords: ['light', 'group', 'multi'] },
      { name: 'led-strip', path: mdiLedStrip, keywords: ['led', 'strip', 'rgb'] },
      { name: 'floor-lamp', path: mdiFloorLamp, keywords: ['floor', 'lamp', 'standing'] },
      { name: 'ceiling-light', path: mdiCeilingLight, keywords: ['ceiling', 'overhead'] },
      { name: 'wall-sconce', path: mdiWallSconce, keywords: ['wall', 'sconce'] },
      { name: 'lamp', path: mdiLamp, keywords: ['lamp', 'table', 'desk'] },
      { name: 'track-light', path: mdiTrackLight, keywords: ['track', 'spot'] },
      { name: 'outdoor-lamp', path: mdiOutdoorLamp, keywords: ['outdoor', 'porch', 'garden'] },
      { name: 'string-lights', path: mdiStringLights, keywords: ['string', 'fairy', 'holiday'] },
    ],
  },
  {
    label: 'Climate',
    icons: [
      { name: 'thermometer', path: mdiThermometer, keywords: ['temperature', 'temp'] },
      { name: 'thermometer-high', path: mdiThermometerHigh, keywords: ['hot', 'warm'] },
      { name: 'thermometer-low', path: mdiThermometerLow, keywords: ['cold', 'cool'] },
      { name: 'water-percent', path: mdiWaterPercent, keywords: ['humidity', 'moisture'] },
      { name: 'fan', path: mdiFan, keywords: ['fan', 'ventilation'] },
      { name: 'fan-off', path: mdiFanOff, keywords: ['fan', 'off'] },
      { name: 'air-conditioner', path: mdiAirConditioner, keywords: ['ac', 'hvac', 'cool'] },
      { name: 'snowflake', path: mdiSnowflake, keywords: ['cool', 'freeze', 'cold'] },
      { name: 'fire', path: mdiFire, keywords: ['heat', 'flame', 'warm'] },
      { name: 'radiator', path: mdiRadiator, keywords: ['heat', 'radiator'] },
    ],
  },
  {
    label: 'Power & Plugs',
    icons: [
      { name: 'power-plug', path: mdiPowerPlug, keywords: ['plug', 'outlet', 'socket'] },
      { name: 'power-plug-off', path: mdiPowerPlugOff, keywords: ['plug', 'off'] },
      { name: 'power', path: mdiPower, keywords: ['power', 'on', 'off'] },
      { name: 'power-standby', path: mdiPowerStandby, keywords: ['standby', 'sleep'] },
    ],
  },
  {
    label: 'Security & Access',
    icons: [
      { name: 'lock', path: mdiLock, keywords: ['lock', 'locked', 'secure'] },
      { name: 'lock-open', path: mdiLockOpen, keywords: ['unlock', 'unlocked'] },
      { name: 'lock-alert', path: mdiLockAlert, keywords: ['lock', 'alert', 'warning'] },
      { name: 'door-open', path: mdiDoorOpen, keywords: ['door', 'open', 'entry'] },
      { name: 'door-closed', path: mdiDoorClosed, keywords: ['door', 'closed', 'shut'] },
      { name: 'garage', path: mdiGarage, keywords: ['garage', 'closed'] },
      { name: 'garage-open', path: mdiGarageOpen, keywords: ['garage', 'open'] },
      { name: 'gate', path: mdiGate, keywords: ['gate', 'closed', 'fence'] },
      { name: 'gate-open', path: mdiGateOpen, keywords: ['gate', 'open'] },
      { name: 'shield', path: mdiShield, keywords: ['alarm', 'security'] },
      { name: 'shield-home', path: mdiShieldHome, keywords: ['home', 'alarm', 'armed'] },
      { name: 'shield-lock', path: mdiShieldLock, keywords: ['alarm', 'locked'] },
      { name: 'shield-check', path: mdiShieldCheck, keywords: ['alarm', 'ok', 'safe'] },
    ],
  },
  {
    label: 'Windows & Covers',
    icons: [
      { name: 'window-open', path: mdiWindowOpen, keywords: ['window', 'open'] },
      { name: 'window-closed', path: mdiWindowClosed, keywords: ['window', 'closed'] },
      { name: 'window-shutter', path: mdiWindowShutter, keywords: ['shutter', 'roller'] },
      { name: 'blinds', path: mdiBlinds, keywords: ['blinds', 'closed'] },
      { name: 'blinds-open', path: mdiBlindsOpen, keywords: ['blinds', 'open'] },
    ],
  },
  {
    label: 'Sensors',
    icons: [
      { name: 'motion-sensor', path: mdiMotionSensor, keywords: ['motion', 'pir', 'movement'] },
      { name: 'run', path: mdiRun, keywords: ['motion', 'running', 'active'] },
      { name: 'water', path: mdiWater, keywords: ['water', 'leak', 'flood'] },
      { name: 'water-off', path: mdiWaterOff, keywords: ['water', 'dry'] },
      { name: 'water-alert', path: mdiWaterAlert, keywords: ['water', 'leak', 'alert'] },
      { name: 'smoke-detector', path: mdiSmokeDetector, keywords: ['smoke', 'fire', 'co'] },
      { name: 'fire-alert', path: mdiFireAlert, keywords: ['fire', 'alarm'] },
    ],
  },
  {
    label: 'Media',
    icons: [
      { name: 'speaker', path: mdiSpeaker, keywords: ['speaker', 'audio', 'sound'] },
      { name: 'speaker-multiple', path: mdiSpeakerMultiple, keywords: ['speakers', 'multi-room'] },
      { name: 'television', path: mdiTelevision, keywords: ['tv', 'screen', 'display'] },
      { name: 'cast', path: mdiCast, keywords: ['chromecast', 'cast', 'stream'] },
      { name: 'play', path: mdiPlay, keywords: ['play', 'start'] },
      { name: 'pause', path: mdiPause, keywords: ['pause'] },
      { name: 'stop', path: mdiStop, keywords: ['stop'] },
      { name: 'volume-high', path: mdiVolumeHigh, keywords: ['volume', 'loud'] },
      { name: 'volume-off', path: mdiVolumeOff, keywords: ['mute', 'silent'] },
    ],
  },
  {
    label: 'Camera',
    icons: [
      { name: 'camera', path: mdiCamera, keywords: ['camera', 'photo'] },
      { name: 'cctv', path: mdiCctv, keywords: ['cctv', 'surveillance', 'security'] },
      { name: 'webcam', path: mdiWebcam, keywords: ['webcam', 'stream'] },
    ],
  },
  {
    label: 'Weather',
    icons: [
      { name: 'weather-sunny', path: mdiWeatherSunny, keywords: ['sun', 'clear', 'sunny'] },
      { name: 'weather-cloudy', path: mdiWeatherCloudy, keywords: ['cloud', 'overcast'] },
      { name: 'weather-rainy', path: mdiWeatherRainy, keywords: ['rain', 'shower'] },
      { name: 'weather-snowy', path: mdiWeatherSnowy, keywords: ['snow', 'winter'] },
      { name: 'weather-fog', path: mdiWeatherFog, keywords: ['fog', 'mist'] },
      { name: 'weather-windy', path: mdiWeatherWindy, keywords: ['wind', 'breeze'] },
      { name: 'weather-night', path: mdiWeatherNight, keywords: ['night', 'moon'] },
      { name: 'weather-partly-cloudy', path: mdiWeatherPartlyCloudy, keywords: ['partly', 'mixed'] },
    ],
  },
  {
    label: 'Rooms',
    icons: [
      { name: 'home', path: mdiHome, keywords: ['home', 'house'] },
      { name: 'home-outline', path: mdiHomeOutline, keywords: ['home', 'outline'] },
      { name: 'home-floor-1', path: mdiHomeFloor1, keywords: ['floor', 'first', 'ground'] },
      { name: 'home-floor-2', path: mdiHomeFloor2, keywords: ['floor', 'second', 'upper'] },
      { name: 'home-floor-3', path: mdiHomeFloor3, keywords: ['floor', 'third'] },
      { name: 'sofa', path: mdiSofa, keywords: ['living', 'room', 'lounge', 'couch'] },
      { name: 'bed', path: mdiBed, keywords: ['bedroom', 'sleep'] },
      { name: 'bathtub', path: mdiBathtub, keywords: ['bathroom', 'bath'] },
      { name: 'stove', path: mdiStove, keywords: ['kitchen', 'cooking'] },
      { name: 'fridge', path: mdiFridgeOutline, keywords: ['fridge', 'kitchen', 'refrigerator'] },
      { name: 'desk', path: mdiDesk, keywords: ['office', 'desk', 'work'] },
      { name: 'table', path: mdiTableFurniture, keywords: ['table', 'dining'] },
    ],
  },
  {
    label: 'Appliances',
    icons: [
      { name: 'robot-vacuum', path: mdiRobotVacuum, keywords: ['vacuum', 'roomba', 'clean'] },
      { name: 'washing-machine', path: mdiWashingMachine, keywords: ['washer', 'laundry'] },
      { name: 'tumble-dryer', path: mdiTumbleDryer, keywords: ['dryer', 'laundry'] },
      { name: 'dishwasher', path: mdiDishwasher, keywords: ['dishwasher', 'kitchen'] },
      { name: 'shower-head', path: mdiShowerHead, keywords: ['shower', 'water'] },
      { name: 'faucet', path: mdiFaucet, keywords: ['faucet', 'tap', 'water'] },
    ],
  },
  {
    label: 'Energy & EV',
    icons: [
      { name: 'solar-power', path: mdiSolarPower, keywords: ['solar', 'panel', 'sun'] },
      { name: 'battery', path: mdiBattery, keywords: ['battery', 'charge'] },
      { name: 'battery-charging', path: mdiBatteryCharging, keywords: ['battery', 'charging'] },
      { name: 'flash', path: mdiFlash, keywords: ['electricity', 'power', 'energy'] },
      { name: 'meter', path: mdiSpeedometer, keywords: ['meter', 'utility', 'usage'] },
      { name: 'car', path: mdiCar, keywords: ['car', 'vehicle'] },
      { name: 'car-connected', path: mdiCarConnected, keywords: ['car', 'connected', 'ev'] },
      { name: 'car-battery', path: mdiCarBattery, keywords: ['car', 'battery', 'ev'] },
      { name: 'ev-station', path: mdiEvStation, keywords: ['ev', 'charger', 'station'] },
    ],
  },
  {
    label: 'People & Presence',
    icons: [
      { name: 'account', path: mdiAccount, keywords: ['person', 'user'] },
      { name: 'account-circle', path: mdiAccountCircle, keywords: ['person', 'avatar'] },
      { name: 'account-group', path: mdiAccountGroup, keywords: ['family', 'group'] },
      { name: 'account-child', path: mdiAccountChild, keywords: ['child', 'kid'] },
      { name: 'map-marker', path: mdiMapMarker, keywords: ['location', 'gps', 'pin'] },
      { name: 'crosshairs-gps', path: mdiCrosshairsGps, keywords: ['gps', 'tracking'] },
    ],
  },
  {
    label: 'Network',
    icons: [
      { name: 'wifi', path: mdiWifi, keywords: ['wifi', 'wireless', 'network'] },
      { name: 'wifi-off', path: mdiWifiOff, keywords: ['wifi', 'off', 'disconnected'] },
      { name: 'bluetooth', path: mdiBluetooth, keywords: ['bluetooth', 'bt'] },
      { name: 'cellphone', path: mdiCellphone, keywords: ['phone', 'mobile'] },
      { name: 'tablet', path: mdiTablet, keywords: ['tablet', 'ipad'] },
      { name: 'laptop', path: mdiLaptop, keywords: ['laptop', 'computer'] },
    ],
  },
  {
    label: 'Dashboard',
    icons: [
      { name: 'chart-line', path: mdiChartLine, keywords: ['chart', 'graph', 'history'] },
      { name: 'gauge', path: mdiGauge, keywords: ['gauge', 'meter', 'dial'] },
      { name: 'speedometer', path: mdiSpeedometer, keywords: ['speed', 'performance'] },
      { name: 'counter', path: mdiCounter, keywords: ['counter', 'number'] },
      { name: 'clock', path: mdiClock, keywords: ['time', 'clock'] },
      { name: 'calendar', path: mdiCalendar, keywords: ['calendar', 'date', 'schedule'] },
      { name: 'bell', path: mdiBell, keywords: ['notification', 'alert'] },
      { name: 'alarm', path: mdiAlarm, keywords: ['alarm', 'timer'] },
      { name: 'timer', path: mdiTimerOutline, keywords: ['timer', 'countdown'] },
      { name: 'eye', path: mdiEye, keywords: ['view', 'watch', 'visible'] },
      { name: 'star', path: mdiStar, keywords: ['favorite', 'star', 'bookmark'] },
      { name: 'information', path: mdiInformation, keywords: ['info', 'about'] },
      { name: 'cog', path: mdiCog, keywords: ['settings', 'config'] },
    ],
  },
  {
    label: 'Navigation',
    icons: [
      { name: 'arrow-up', path: mdiArrowUp, keywords: ['up', 'arrow'] },
      { name: 'arrow-down', path: mdiArrowDown, keywords: ['down', 'arrow'] },
      { name: 'arrow-left', path: mdiArrowLeft, keywords: ['left', 'arrow', 'back'] },
      { name: 'arrow-right', path: mdiArrowRight, keywords: ['right', 'arrow', 'forward'] },
      { name: 'chevron-up', path: mdiChevronUp, keywords: ['up', 'expand'] },
      { name: 'chevron-down', path: mdiChevronDown, keywords: ['down', 'collapse'] },
      { name: 'menu', path: mdiMenu, keywords: ['menu', 'hamburger'] },
    ],
  },
];

/** Flat list of all icons for search */
export const ALL_HA_ICONS = HA_ICON_LIBRARY.flatMap((cat) =>
  cat.icons.map((icon) => ({ ...icon, category: cat.label }))
);

/** Get icon path by name */
export function getIconByName(name: string): string | undefined {
  return ALL_HA_ICONS.find((i) => i.name === name)?.path;
}

/** Search icons */
export function searchIcons(query: string, limit = 50) {
  const q = query.toLowerCase();
  return ALL_HA_ICONS
    .filter((icon) =>
      icon.name.includes(q) ||
      icon.category.toLowerCase().includes(q) ||
      icon.keywords.some((k) => k.includes(q))
    )
    .slice(0, limit);
}

/** Preset accent colors for widgets */
export const WIDGET_COLORS = [
  { name: 'Blue', value: '#4a9eff' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Slate', value: '#64748b' },
  { name: 'White', value: '#ffffff' },
];
