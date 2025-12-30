import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

export interface GameSettings {
  zoomEnabled: boolean;
  fingerOffsetEnabled: boolean;
  rippleEffectEnabled: boolean;
  soundEnabled: boolean;
}

const STORAGE_KEY = "hexaword_settings";

const defaultSettings: GameSettings = {
  zoomEnabled: true,
  fingerOffsetEnabled: false,
  rippleEffectEnabled: true,
  soundEnabled: true,
};

let currentSettings: GameSettings = defaultSettings;
const listeners = new Set<() => void>();

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

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentSettings;
}

function updateSettings(newSettings: Partial<GameSettings>) {
  currentSettings = { ...currentSettings, ...newSettings };
  saveSettings(currentSettings);
  notifyListeners();
}

function resetToDefaults() {
  currentSettings = defaultSettings;
  saveSettings(defaultSettings);
  notifyListeners();
}

// Initialize settings on module load
if (typeof window !== "undefined") {
  currentSettings = loadSettings();
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, () => defaultSettings);

  const setSettings = useCallback((newSettings: Partial<GameSettings>) => {
    updateSettings(newSettings);
  }, []);

  const resetSettings = useCallback(() => {
    resetToDefaults();
  }, []);

  return {
    settings,
    setSettings,
    resetSettings,
  };
}

export function getSettings(): GameSettings {
  return currentSettings;
}
