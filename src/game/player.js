export class Player {
  constructor(x = 1, y = 1) {
    this.x = x;
    this.y = y;
    this.renderX = x;
    this.renderY = y;
    this.path = [];
    this.progress = 0;
    this.speed = 5;
  }

  setPath(path) {
    this.path = path;
    this.progress = 0;
  }

  update(deltaSeconds) {
    if (!this.path.length) return false;

    const target = this.path[0];
    this.progress += deltaSeconds * this.speed;
    const t = Math.min(1, this.progress);

    this.renderX = this.x + (target.x - this.x) * t;
    this.renderY = this.y + (target.y - this.y) * t;

    if (this.progress >= 1) {
      this.x = target.x;
      this.y = target.y;
      this.renderX = this.x;
      this.renderY = this.y;
      this.path.shift();
      this.progress = 0;
      return true;
    }

    return false;
  }
}
