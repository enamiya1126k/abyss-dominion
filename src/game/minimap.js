export class MiniMap {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }

  render(world, player) {
    const ctx = this.context;
    const cell = Math.min(
      this.canvas.width / world.width,
      this.canvas.height / world.height
    );

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < world.height; y += 1) {
      for (let x = 0; x < world.width; x += 1) {
        ctx.fillStyle = world.tiles[y][x] === 1 ? "#21172d" : "#8a62ac";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    ctx.fillStyle = "#ff5c66";
    ctx.fillRect(world.exit.x * cell, world.exit.y * cell, cell, cell);

    for (const chest of world.chests) {
      ctx.fillStyle = chest.opened ? "#666" : "#ffe266";
      ctx.fillRect(chest.x * cell, chest.y * cell, cell, cell);
    }

    ctx.fillStyle = "#5dff82";
    ctx.fillRect(player.x * cell, player.y * cell, cell, cell);
  }
}
