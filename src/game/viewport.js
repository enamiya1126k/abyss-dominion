import { CAMERA_CONFIG, MAP_CONFIG } from "./config.js";

export class Viewport {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = MAP_CONFIG.tileSize;
    this.y = MAP_CONFIG.tileSize;
    this.zoom = CAMERA_CONFIG.defaultZoom;
    this.manualOffsetX = 0;
    this.manualOffsetY = 0;
  }

  follow(worldX, worldY, strength = 0.12) {
    this.x += (worldX - this.x) * strength;
    this.y += (worldY - this.y) * strength;
  }

  pan(deltaX, deltaY) {
    this.manualOffsetX += deltaX;
    this.manualOffsetY += deltaY;
  }

  zoomBy(scale) {
    this.zoom = Math.max(
      CAMERA_CONFIG.minZoom,
      Math.min(CAMERA_CONFIG.maxZoom, this.zoom * scale)
    );
  }

  resetTo(worldX, worldY) {
    this.x = worldX;
    this.y = worldY;
    this.zoom = CAMERA_CONFIG.doubleTapZoom;
    this.manualOffsetX = 0;
    this.manualOffsetY = 0;
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.zoom + this.canvas.width / 2 + this.manualOffsetX,
      y: (worldY - this.y) * this.zoom + this.canvas.height / 2 + this.manualOffsetY,
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.canvas.width / 2 - this.manualOffsetX) / this.zoom + this.x,
      y: (screenY - this.canvas.height / 2 - this.manualOffsetY) / this.zoom + this.y,
    };
  }

  clamp(world) {
    const tile = MAP_CONFIG.tileSize;
    const mapWidth = world.width * tile * this.zoom;
    const mapHeight = world.height * tile * this.zoom;
    const maxX = Math.max(0, (mapWidth - this.canvas.width) / 2 + tile);
    const maxY = Math.max(0, (mapHeight - this.canvas.height) / 2 + tile);

    this.manualOffsetX = Math.max(-maxX, Math.min(maxX, this.manualOffsetX));
    this.manualOffsetY = Math.max(-maxY, Math.min(maxY, this.manualOffsetY));
  }
}
