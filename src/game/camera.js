import { CAMERA_CONFIG } from "./config.js";

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = CAMERA_CONFIG.defaultZoom;
  }

  panBy(dx, dy) {
    this.x += Number(dx) || 0;
    this.y += Number(dy) || 0;
  }

  zoomBy(scale) {
    if (!Number.isFinite(scale) || scale <= 0) return;
    this.zoom = Math.min(CAMERA_CONFIG.maxZoom, Math.max(CAMERA_CONFIG.minZoom, this.zoom * scale));
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.zoom = CAMERA_CONFIG.doubleTapZoom;
  }
}
