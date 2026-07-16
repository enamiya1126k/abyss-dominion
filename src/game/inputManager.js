import { CAMERA_CONFIG } from "./config.js";

export class InputManager {
  constructor() {
    this.element = null;
    this.callbacks = {};
    this.pointers = new Map();
    this.lastPoint = null;
    this.lastPinchDistance = null;
    this.lastTapAt = 0;
    this.moved = false;

    this.pointerDown = this.pointerDown.bind(this);
    this.pointerMove = this.pointerMove.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
  }

  attach(element, callbacks = {}) {
    this.detach();
    this.element = element;
    this.callbacks = callbacks;
    element.style.touchAction = "none";
    element.addEventListener("pointerdown", this.pointerDown);
    element.addEventListener("pointermove", this.pointerMove);
    element.addEventListener("pointerup", this.pointerUp);
    element.addEventListener("pointercancel", this.pointerUp);
  }

  detach() {
    if (!this.element) return;
    this.element.removeEventListener("pointerdown", this.pointerDown);
    this.element.removeEventListener("pointermove", this.pointerMove);
    this.element.removeEventListener("pointerup", this.pointerUp);
    this.element.removeEventListener("pointercancel", this.pointerUp);
    this.element = null;
    this.pointers.clear();
  }

  pointerDown(event) {
    this.element.setPointerCapture?.(event.pointerId);
    this.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
    });
    this.lastPoint = { x: event.clientX, y: event.clientY };
    this.moved = false;
  }

  pointerMove(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    const points = [...this.pointers.values()];

    if (points.length === 1 && this.lastPoint) {
      const dx = event.clientX - this.lastPoint.x;
      const dy = event.clientY - this.lastPoint.y;
      if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > CAMERA_CONFIG.dragThreshold) {
        this.moved = true;
      }
      if (this.moved) this.callbacks.onPan?.({ deltaX: dx, deltaY: dy });
      this.lastPoint = { x: event.clientX, y: event.clientY };
    }

    if (points.length === 2) {
      this.moved = true;
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
      if (this.lastPinchDistance) {
        this.callbacks.onPinch?.({ scale: distance / this.lastPinchDistance });
      }
      this.lastPinchDistance = distance;
    }
  }

  pointerUp(event) {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;

    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.lastPinchDistance = null;

    if (!this.moved) {
      const now = performance.now();
      if (now - this.lastTapAt <= CAMERA_CONFIG.doubleTapDelayMs) {
        this.callbacks.onDoubleTap?.({ x: event.clientX, y: event.clientY });
        this.lastTapAt = 0;
      } else {
        this.callbacks.onTap?.({ x: event.clientX, y: event.clientY });
        this.lastTapAt = now;
      }
    }
  }
}
