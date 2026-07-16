export const GAME_VERSION = "0.0.4";

export const MAP_CONFIG = Object.freeze({
  columns: 31,
  rows: 31,
  tileSize: 48,
});

export const CAMERA_CONFIG = Object.freeze({
  minZoom: 0.45,
  maxZoom: 1.55,
  defaultZoom: 0.9,
  doubleTapZoom: 0.9,
  dragThreshold: 8,
  doubleTapDelayMs: 280,
  edgePadding: 28,
});

export const SAVE_KEY = "abyss-dominion-save";
