export function findPath(world, start, goal) {
  if (!world.isWalkable(goal.x, goal.y)) return [];

  const key = ({ x, y }) => `${x},${y}`;
  const queue = [start];
  const visited = new Set([key(start)]);
  const previous = new Map();
  const directions = [[1,0],[-1,0],[0,1],[0,-1]];

  while (queue.length) {
    const current = queue.shift();

    if (current.x === goal.x && current.y === goal.y) break;

    for (const [dx, dy] of directions) {
      const next = { x: current.x + dx, y: current.y + dy };
      const nextKey = key(next);

      if (!world.isWalkable(next.x, next.y) || visited.has(nextKey)) continue;

      visited.add(nextKey);
      previous.set(nextKey, current);
      queue.push(next);
    }
  }

  if (!visited.has(key(goal))) return [];

  const path = [];
  let current = goal;

  while (!(current.x === start.x && current.y === start.y)) {
    path.push(current);
    current = previous.get(key(current));
  }

  return path.reverse();
}
