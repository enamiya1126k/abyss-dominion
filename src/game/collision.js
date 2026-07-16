export function canMove(x, y, world) {
  return world.isWalkable(x, y);
}
