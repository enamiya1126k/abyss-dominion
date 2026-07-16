import { MAP_CONFIG } from "./config.js";
import { World } from "./world.js";
import { Player } from "./player.js";
import { Viewport } from "./viewport.js";
import { DungeonRenderer } from "./dungeonRenderer.js";
import { MiniMap } from "./minimap.js";
import { findPath } from "./pathfinding.js";

export class ExploreScene {
  constructor({ canvas, minimapCanvas, inputManager, onFloorClear }) {
    this.canvas = canvas;
    this.minimapCanvas = minimapCanvas;
    this.inputManager = inputManager;
    this.onFloorClear = onFloorClear;
    this.world = new World().generate();
    this.player = new Player();
    this.viewport = new Viewport(canvas);
    this.renderer = new DungeonRenderer(canvas);
    this.minimap = new MiniMap(minimapCanvas);
    this.running = false;
    this.lastTime = 0;
    this.frame = this.frame.bind(this);
  }

  start() {
    this.running = true;
    this.resize();
    this.viewport.resetTo(
      this.player.x * MAP_CONFIG.tileSize,
      this.player.y * MAP_CONFIG.tileSize
    );

    this.inputManager.attach(this.canvas, {
      onTap: ({ x, y }) => this.moveToScreenPoint(x, y),
      onPan: ({ deltaX, deltaY }) => {
        this.viewport.pan(deltaX * (this.canvas.width / this.canvas.clientWidth), deltaY * (this.canvas.height / this.canvas.clientHeight));
        this.viewport.clamp(this.world);
      },
      onPinch: ({ scale }) => {
        this.viewport.zoomBy(scale);
        this.viewport.clamp(this.world);
      },
      onDoubleTap: () => {
        this.viewport.resetTo(
          this.player.renderX * MAP_CONFIG.tileSize,
          this.player.renderY * MAP_CONFIG.tileSize
        );
      },
    });

    window.addEventListener("resize", this.resizeBound = () => this.resize());
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    this.inputManager.detach();
    window.removeEventListener("resize", this.resizeBound);
  }

  resize() {
    this.renderer.resize();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.minimapCanvas.width = 150 * ratio;
    this.minimapCanvas.height = 150 * ratio;
  }

  moveToScreenPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) * (this.canvas.width / rect.width);
    const sy = (clientY - rect.top) * (this.canvas.height / rect.height);
    const worldPoint = this.viewport.screenToWorld(sx, sy);
    const tile = {
      x: Math.floor(worldPoint.x / MAP_CONFIG.tileSize),
      y: Math.floor(worldPoint.y / MAP_CONFIG.tileSize),
    };

    if (
      tile.x < 0 || tile.y < 0 ||
      tile.x >= this.world.width || tile.y >= this.world.height ||
      !this.world.isWalkable(tile.x, tile.y)
    ) return;

    this.player.setPath(findPath(this.world, this.player, tile));
  }

  update(delta) {
    const stepped = this.player.update(delta);

    if (stepped) {
      for (const chest of this.world.chests) {
        if (!chest.opened && chest.x === this.player.x && chest.y === this.player.y) {
          chest.opened = true;
          window.dispatchEvent(new CustomEvent("abyss:toast", { detail: "宝箱を発見！" }));
        }
      }

      if (this.player.x === this.world.exit.x && this.player.y === this.world.exit.y) {
        this.onFloorClear?.();
        return;
      }
    }

    this.viewport.follow(
      this.player.renderX * MAP_CONFIG.tileSize,
      this.player.renderY * MAP_CONFIG.tileSize
    );
    this.viewport.clamp(this.world);
  }

  render() {
    this.renderer.render(this.world, this.player, this.viewport);
    this.minimap.render(this.world, this.player);
  }

  frame(time) {
    if (!this.running) return;
    const delta = Math.min(0.05, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;
    this.update(delta);
    this.render();
    requestAnimationFrame(this.frame);
  }
}
