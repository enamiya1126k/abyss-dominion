import { MAP_CONFIG } from "./config.js";

const WALL = 1;
const FLOOR = 0;

export class World {
  constructor(width = MAP_CONFIG.columns, height = MAP_CONFIG.rows) {
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
    this.tiles = [];
    this.exit = { x: this.width - 2, y: this.height - 2 };
    this.chests = [];
  }

  generate() {
    this.tiles = Array.from(
      { length: this.height },
      () => Array(this.width).fill(WALL)
    );

    this.#carve(1, 1);
    this.#addLoops(42);

    const floors = this.getFloorCells();
    this.exit = this.#farthestCell({ x: 1, y: 1 }, floors);
    this.chests = this.#pickChests(floors, 4);

    return this;
  }

  #carve(x, y) {
    this.tiles[y][x] = FLOOR;
    const directions = [[2,0],[-2,0],[0,2],[0,-2]].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx > 0 && ny > 0 &&
        nx < this.width - 1 &&
        ny < this.height - 1 &&
        this.tiles[ny][nx] === WALL
      ) {
        this.tiles[y + dy / 2][x + dx / 2] = FLOOR;
        this.#carve(nx, ny);
      }
    }
  }

  #addLoops(count) {
    for (let i = 0; i < count; i += 1) {
      const x = 1 + Math.floor(Math.random() * (this.width - 2));
      const y = 1 + Math.floor(Math.random() * (this.height - 2));

      if (this.tiles[y][x] !== WALL) continue;

      const horizontal =
        this.tiles[y][x - 1] === FLOOR &&
        this.tiles[y][x + 1] === FLOOR;

      const vertical =
        this.tiles[y - 1][x] === FLOOR &&
        this.tiles[y + 1][x] === FLOOR;

      if (horizontal || vertical) {
        this.tiles[y][x] = FLOOR;
      }
    }
  }

  #farthestCell(start, cells) {
    return cells.reduce((best, cell) => {
      const bestDistance = Math.abs(best.x - start.x) + Math.abs(best.y - start.y);
      const cellDistance = Math.abs(cell.x - start.x) + Math.abs(cell.y - start.y);
      return cellDistance > bestDistance ? cell : best;
    }, cells[0] ?? start);
  }

  #pickChests(cells, count) {
    const available = cells.filter(
      (cell) =>
        !(cell.x === 1 && cell.y === 1) &&
        !(cell.x === this.exit.x && cell.y === this.exit.y)
    );

    return available
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((cell) => ({ ...cell, opened: false }));
  }

  getFloorCells() {
    const result = [];

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.tiles[y][x] === FLOOR) result.push({ x, y });
      }
    }

    return result;
  }

  isWalkable(x, y) {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.width &&
      y < this.height &&
      this.tiles[y][x] === FLOOR
    );
  }
}
