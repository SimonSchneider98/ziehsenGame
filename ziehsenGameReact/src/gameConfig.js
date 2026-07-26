export const STORAGE_KEY = "ziehsen.gameConfig";

export const DEFAULT_CONFIG = {
  mode: "cpu", // 'cpu' = vs. computer, 'local' = 2 players
  starter: "player", // 'player' | 'cpu' (only relevant vs. computer)
  layoutMode: "custom", // 'random' | 'custom'
  layout: "10-2", // selected layout name (used when layoutMode === 'custom')
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
