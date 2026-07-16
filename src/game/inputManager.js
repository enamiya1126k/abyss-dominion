import { CAMERA_CONFIG } from "./config.js";

export class InputManager {
  constructor() {
    this.element = null;
    this.callbacks = {};
    this.pointers = new Map();
    this.lastPoint = null;
    this.lastPinch = null;
    this.lastTap = 0;
    this.down = this.down.bind(this);
    this.move = this.move.bind(this);
    this.up = this.up.bind(this);
  }

  attach(element, callbacks = {}) {
    this.detach();
    this.element = element;
    this.callbacks = callbacks;
    element.style.touchAction = "none";
    element.addEventListener("pointerdown", this.down);
    element.addEventListener("pointermove", this.move);
    element.addEventListener("pointerup", this.up);
    element.addEventListener("pointercancel", this.up);
  }

  detach() {
    if (!this.element) return;
    this.element.removeEventListener("pointerdown", this.down);
    this.element.removeEventListener("pointermove", this.move);
    this.element.removeEventListener("pointerup", this.up);
    this.element.removeEventListener("pointercancel", this.up);
    this.element = null;
    this.pointers.clear();
  }

  down(event) {
    this.element.setPointerCapture?.(event.pointerId);
    this.pointers.set(event.pointerId, {
      x: event.clientX, y: event.clientY,
      startX: event.clientX, startY: event.clientY
    });
    if (this.pointers.size === 1) this.lastPoint = { x: event.clientX, y: event.clientY };
  }

  move(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const points = [...this.pointers.values()];

    if (points.length === 1 && this.lastPoint) {
      this.callbacks.onPan?.({
        deltaX: event.clientX - this.lastPoint.x,
        deltaY: event.clientY - this.lastPoint.y
      });
      this.lastPoint = { x: event.clientX, y: event.clientY };
    }

    if (points.length === 2) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (this.lastPinch) this.callbacks.onPinch?.({ scale: distance / this.lastPinch });
      this.lastPinch = distance;
    }
  }

  up(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    const movement = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.lastPinch = null;

    if (movement <= CAMERA_CONFIG.dragThreshold) {
      const now = performance.now();
      if (now - this.lastTap <= CAMERA_CONFIG.doubleTapDelayMs) {
        this.callbacks.onDoubleTap?.();
        this.lastTap = 0;
      } else {
        this.callbacks.onTap?.({ x: event.clientX, y: event.clientY });
        this.lastTap = now;
      }
    }
  }
}
