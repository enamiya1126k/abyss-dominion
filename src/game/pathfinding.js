export function findPath(world,start,goal){
if(!world.isWalkable(goal.x,goal.y))return[];
const key=p=>`${p.x},${p.y}`,queue=[{x:start.x,y:start.y}],seen=new Set([key(start)]),prev=new Map(),dirs=[[1,0],[-1,0],[0,1],[0,-1]];
while(queue.length){
const current=queue.shift();if(current.x===goal.x&&current.y===goal.y)break;
for(const[dx,dy]of dirs){const next={x:current.x+dx,y:current.y+dy},k=key(next);if(!world.isWalkable(next.x,next.y)||seen.has(k))continue;seen.add(k);prev.set(k,current);queue.push(next)}
}
if(!seen.has(key(goal)))return[];
const path=[];let current=goal;
while(!(current.x===start.x&&current.y===start.y)){path.push(current);current=prev.get(key(current))}
return path.reverse()
}
