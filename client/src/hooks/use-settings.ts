import { useState, useEffect, useCallback } from "react";

export interface GameSettings {
  zoomEnabled: boolean;
  fingerOffsetEnabled: boolean;
  rippleEffectEnabled: boolean;
}

const STORAGE_KEY = "hexaword_settings";

const defaultSettings: GameSettings = {
  zoomEnabled: true,
  fingerOffsetEnabled: false,
  rippleEffectEnabled: true,
};

function loadSettings(): GameSettings {
  if (typeof window === "undefined") return defaultSettings;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return defaultSettings;
}

function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<GameSettings>(loadSettings);

  // Sync with localStorage on mount
  useEffect(() => {
    setSettingsState(loadSettings());
  }, []);

  const setSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(defaultSettings);
    setSettingsState(defaultSettings);
  }, []);

  return {
    settings,
    setSettings,
    resetSettings,
  };
}

// Utility to get settings without React (for components that need initial values)
export function getSettings(): GameSettings {
  return loadSettings();
}

