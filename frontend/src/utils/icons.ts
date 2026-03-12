import {
  mdiLightbulb,
  mdiTelevision,
  mdiThermometer,
  mdiWaterPercent,
  mdiWeatherCloudy,
  mdiGauge,
  mdiFlash,
  mdiBattery,
  mdiSignal,
  mdiDoorOpen,
  mdiDoorClosed,
  mdiWindowOpen,
  mdiWindowClosed,
  mdiMotionSensor,
  mdiWaterAlert,
  mdiSmoke,
  mdiShieldCheck,
  mdiShieldAlert,
  mdiHome,
  mdiHomeOutline,
  mdiRun,
  mdiLock,
  mdiLockOpen,
  mdiGarage,
  mdiGarageOpen,
  mdiFan,
  mdiPower,
  mdiToggleSwitch,
  mdiToggleSwitchOff,
  mdiPlay,
  mdiRobot,
  mdiCalendar,
  mdiWeatherSunny,
  mdiWeatherNight,
  mdiWeatherRainy,
  mdiWeatherSnowy,
  mdiWeatherFog,
  mdiWeatherWindy,
  mdiWeatherPartlyCloudy,
  mdiWeatherLightning,
  mdiWeatherHail,
  mdiAlert,
  mdiBrightness6,
  mdiScript,
  mdiCog,
  mdiNumeric,
  mdiFormSelect,
  mdiClockOutline,
  mdiTextBox,
} from '@mdi/js';

/** Device class → MDI icon path mapping for binary sensors */
export const BINARY_SENSOR_ICONS: Record<string, { on: string; off: string }> = {
  door: { on: mdiDoorOpen, off: mdiDoorClosed },
  window: { on: mdiWindowOpen, off: mdiWindowClosed },
  motion: { on: mdiRun, off: mdiMotionSensor },
  moisture: { on: mdiWaterAlert, off: mdiWaterPercent },
  smoke: { on: mdiSmoke, off: mdiSmoke },
  safety: { on: mdiShieldAlert, off: mdiShieldCheck },
  occupancy: { on: mdiHome, off: mdiHomeOutline },
  lock: { on: mdiLockOpen, off: mdiLock },
  garage_door: { on: mdiGarageOpen, off: mdiGarage },
  problem: { on: mdiAlert, off: mdiShieldCheck },
  connectivity: { on: mdiSignal, off: mdiSignal },
};

/** Device class → MDI icon for sensors */
export const SENSOR_ICONS: Record<string, string> = {
  temperature: mdiThermometer,
  humidity: mdiWaterPercent,
  pressure: mdiGauge,
  power: mdiFlash,
  energy: mdiFlash,
  battery: mdiBattery,
  voltage: mdiFlash,
  current: mdiFlash,
  signal_strength: mdiSignal,
  illuminance: mdiBrightness6,
};

/** Domain → default icon */
export const DOMAIN_ICONS: Record<string, string> = {
  light: mdiLightbulb,
  switch: mdiToggleSwitch,
  input_boolean: mdiToggleSwitchOff,
  fan: mdiFan,
  climate: mdiThermometer,
  media_player: mdiTelevision,
  automation: mdiRobot,
  script: mdiScript,
  scene: mdiPlay,
  sensor: mdiGauge,
  binary_sensor: mdiShieldCheck,
  lock: mdiLock,
  cover: mdiGarage,
  input_select: mdiFormSelect,
  input_number: mdiNumeric,
  input_datetime: mdiCalendar,
  input_text: mdiTextBox,
  weather: mdiWeatherCloudy,
  person: mdiHome,
  vacuum: mdiRobot,
};

/** Weather condition → icon */
export const WEATHER_ICONS: Record<string, string> = {
  'clear-night': mdiWeatherNight,
  'cloudy': mdiWeatherCloudy,
  'fog': mdiWeatherFog,
  'hail': mdiWeatherHail,
  'lightning': mdiWeatherLightning,
  'lightning-rainy': mdiWeatherLightning,
  'partlycloudy': mdiWeatherPartlyCloudy,
  'pouring': mdiWeatherRainy,
  'rainy': mdiWeatherRainy,
  'snowy': mdiWeatherSnowy,
  'snowy-rainy': mdiWeatherSnowy,
  'sunny': mdiWeatherSunny,
  'windy': mdiWeatherWindy,
  'windy-variant': mdiWeatherWindy,
  'exceptional': mdiAlert,
};

/**
 * Get the appropriate icon for an entity based on domain + device_class + state.
 */
export function getEntityIcon(
  domain: string,
  deviceClass?: string,
  state?: string,
): string {
  // Binary sensors use state-dependent icons
  if (domain === 'binary_sensor' && deviceClass) {
    const icons = BINARY_SENSOR_ICONS[deviceClass];
    if (icons) return state === 'on' ? icons.on : icons.off;
  }

  // Sensors use device class
  if (domain === 'sensor' && deviceClass) {
    return SENSOR_ICONS[deviceClass] || mdiGauge;
  }

  // Switch state
  if (domain === 'switch' || domain === 'input_boolean') {
    return state === 'on' ? mdiToggleSwitch : mdiToggleSwitchOff;
  }

  return DOMAIN_ICONS[domain] || mdiCog;
}

export {
  mdiPower,
  mdiLightbulb,
  mdiToggleSwitch,
  mdiToggleSwitchOff,
  mdiScript,
  mdiPlay,
  mdiRobot,
  mdiFan,
  mdiClockOutline,
  mdiTextBox,
  mdiFormSelect,
  mdiNumeric,
  mdiCalendar,
};
