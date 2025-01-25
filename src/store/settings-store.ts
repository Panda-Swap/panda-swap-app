// store/settings-store.ts
import { persistentAtom } from '@nanostores/persistent';
import type { Settings } from '../types/settings';
export type { Settings } from '../types/settings';

export const DEFAULT_SETTINGS: Settings = {
  preview: {
    renderTubes: true,
    buildArea: true,
    showPreview: true,
  },
  display: {
    emptyFilaments: false,
    showTotalCost: true,
    showPrinterInfo: true,
    compactMode: true,
  },
  gcode: {
    buildPlateSwap: `G1 Z180 F3000
G1 Y186 F6000
G1 Z185 F3000
G1 Y-4  F6000
G1 Y186 F6000
G1 Y-4  F6000
G1 Y2.5 F6000
G1 Y-4  F6000`,
  }
};

export const settingsStore = persistentAtom<Settings>(
  'print-settings',
  DEFAULT_SETTINGS,
  {
    encode: JSON.stringify,
    decode: (str) => {
      try {
        const parsed = JSON.parse(str);
        return {
          preview: { ...DEFAULT_SETTINGS.preview, ...parsed.preview },
          display: { ...DEFAULT_SETTINGS.display, ...parsed.display },
          gcode: { ...DEFAULT_SETTINGS.gcode, ...parsed.gcode }
        };
      } catch (error) {
        console.error('Error loading settings:', error);
        return DEFAULT_SETTINGS;
      }
    }
  }
);

export function initSettings(): Settings {
  return settingsStore.get();
}

export function updateSettings(newSettings: Partial<Settings>): void {
  const currentSettings = settingsStore.get();
  const updatedSettings = {
    preview: { ...currentSettings.preview, ...(newSettings.preview || {}) },
    display: { ...currentSettings.display, ...(newSettings.display || {}) },
    gcode: { ...currentSettings.gcode, ...(newSettings.gcode || {}) }
  };
  
  settingsStore.set(updatedSettings);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<Settings>('settings-changed', {
      detail: updatedSettings
    }));
  }
}

export function getSettings(): Settings {
  return settingsStore.get();
}