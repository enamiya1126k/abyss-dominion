import { MAP_CONFIG } from "./config.js";

export class DungeonRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  }

  render(world, player, viewport) {
    const ctx = this.context;
    const tile = MAP_CONFIG.tileSize;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#09060d";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < world.height; y += 1) {
      for (let x = 0; x < world.width; x += 1) {
        const position = viewport.worldToScreen(x * tile, y * tile);
        const size = tile * viewport.zoom;

        if (
          position.x + size < 0 ||
          position.y + size < 0 ||
          position.x > this.canvas.width ||
          position.y > this.canvas.height
        ) continue;

        ctx.fillStyle = world.tiles[y][x] === 1 ? "#21172d" : "#49345a";
        ctx.fillRect(position.x, position.y, size + 1, size + 1);

        if (world.tiles[y][x] === 0) {
          ctx.strokeStyle = "rgba(255,255,255,.045)";
          ctx.strokeRect(position.x, position.y, size, size);
        }
      }
    }

    this.#drawEmoji(world.exit, "🪜", viewport, tile);
    for (const chest of world.chests) {
      if (!chest.opened) this.#drawEmoji(chest, "🎁", viewport, tile);
    }

    const p = viewport.worldToScreen(player.renderX * tile, player.renderY * tile);
    ctx.fillStyle = "#6be37f";
    ctx.beginPath();
    ctx.arc(
      p.x + tile * viewport.zoom / 2,
      p.y + tile * viewport.zoom / 2,
      15 * viewport.zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  #drawEmoji(entity, emoji, viewport, tile) {
    const ctx = this.context;
    const p = viewport.worldToScreen(entity.x * tile, entity.y * tile);
    ctx.font = `${Math.max(18, 28 * viewport.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      emoji,
      p.x + tile * viewport.zoom / 2,
      p.y + tile * viewport.zoom / 2
    );
  }
}
