import{MAP_COLUMNS,MAP_ROWS}from"./config.js";
export class World{
constructor(){this.width=MAP_COLUMNS;this.height=MAP_ROWS;this.tiles=[];this.exit={x:1,y:1};this.shop=null;this.chests=[]}
generate(shopEnabled=false){
this.tiles=Array.from({length:this.height},()=>Array(this.width).fill(1));this.carve(1,1);this.addLoops(44);
const floors=this.floorCells();this.exit=this.farthest({x:1,y:1},floors);
this.shop=shopEnabled?this.pick(floors,{x:1,y:1},10,[this.exit]):null;
const a=this.pick(floors,{x:1,y:1},6,[this.exit,this.shop]);const b=this.pick(floors,{x:1,y:1},5,[this.exit,this.shop,a]);
this.chests=[a,b].filter(Boolean).map(c=>({...c,opened:false}));if(Math.random()<.45){const c=this.pick(floors,{x:1,y:1},7,[this.exit,this.shop,a,b]);if(c)this.chests.push({...c,opened:false})}
return this}
carve(x,y){this.tiles[y][x]=0;for(const[dx,dy]of[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>Math.random()-.5)){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<this.width-1&&ny<this.height-1&&this.tiles[ny][nx]===1){this.tiles[y+dy/2][x+dx/2]=0;this.carve(nx,ny)}}}
addLoops(count){for(let i=0;i<count;i++){const x=1+Math.floor(Math.random()*(this.width-2)),y=1+Math.floor(Math.random()*(this.height-2));if(this.tiles[y][x]!==1)continue;const h=this.tiles[y][x-1]===0&&this.tiles[y][x+1]===0,v=this.tiles[y-1][x]===0&&this.tiles[y+1][x]===0;if(h||v)this.tiles[y][x]=0}}
floorCells(){const out=[];for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++)if(this.tiles[y][x]===0)out.push({x,y});return out}
farthest(start,cells){return cells.reduce((best,c)=>Math.abs(c.x-start.x)+Math.abs(c.y-start.y)>Math.abs(best.x-start.x)+Math.abs(best.y-start.y)?c:best,cells[0]??start)}
pick(cells,from,min,exclude=[]){const options=cells.filter(c=>Math.abs(c.x-from.x)+Math.abs(c.y-from.y)>=min&&!exclude.some(e=>e&&e.x===c.x&&e.y===c.y));return structuredClone(options[Math.floor(Math.random()*options.length)]??null)}
isWalkable(x,y){return x>=0&&y>=0&&x<this.width&&y<this.height&&this.tiles[y][x]===0}
}
