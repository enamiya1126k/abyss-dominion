/* ABYSS DOMINION v0.0.1 Foundation */
export const GAME_VERSION = "0.0.1";

export const FLOOR_CONFIG = {
  minFloor:1,
  maxFloor:1000,
  checkpointInterval:10,
  areaInterval:50,
  shopMinInterval:3,
  shopMaxInterval:7,
};

export const PARTY_CONFIG = {
  maxPartySize:4,
  maxStorageSize:500,
  maxLevel:999,
  maxPlus:99,
  maxStars:10,
};

export const BATTLE_CONFIG = {
  defaultSpeed:1,
  speeds:[0.5,1,1.5,2],
  criticalMultiplier:1.8,
};

export const CAMERA_CONFIG = {
  minZoom:0.5,
  maxZoom:1.5,
  defaultZoom:1,
};

export const SAVE_KEY = "abyss-dominion-save";
