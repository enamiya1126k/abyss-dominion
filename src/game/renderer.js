import{TILE_SIZE}from"./config.js";
export class Renderer{
constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext("2d")}
resize(){const r=this.canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.floor(r.width*ratio));this.canvas.height=Math.max(1,Math.floor(r.height*ratio))}
draw(world,player,enemies,camera,theme){
const c=this.ctx,t=TILE_SIZE;c.clearRect(0,0,this.canvas.width,this.canvas.height);c.fillStyle="#08050c";c.fillRect(0,0,this.canvas.width,this.canvas.height);
for(let y=0;y<world.height;y++)for(let x=0;x<world.width;x++){const p=camera.worldToScreen(x*t,y*t),size=t*camera.zoom;if(p.x+size<0||p.y+size<0||p.x>this.canvas.width||p.y>this.canvas.height)continue;c.fillStyle=world.tiles[y][x]?theme.wall:theme.floor;c.fillRect(p.x,p.y,size+1,size+1);if(!world.tiles[y][x]){c.strokeStyle="rgba(255,255,255,.045)";c.strokeRect(p.x,p.y,size,size)}}
this.emoji(world.exit,"🪜",camera);if(world.shop)this.emoji(world.shop,"🚪",camera);for(const chest of world.chests)if(!chest.opened)this.emoji(chest,"🎁",camera);
for(const e of enemies){const p=camera.worldToScreen(e.rx*t,e.ry*t);c.fillStyle=e.color;c.beginPath();c.arc(p.x+t*camera.zoom/2,p.y+t*camera.zoom/2,15*camera.zoom,0,Math.PI*2);c.fill();c.fillStyle="#fff";c.textAlign="center";c.font=`${Math.max(10,11*camera.zoom)}px sans-serif`;c.fillText(e.name,p.x+t*camera.zoom/2,p.y+9*camera.zoom);c.fillText(`Lv.${e.level}`,p.x+t*camera.zoom/2,p.y+22*camera.zoom)}
const p=camera.worldToScreen(player.rx*t,player.ry*t);c.fillStyle="#62e37a";c.beginPath();c.arc(p.x+t*camera.zoom/2,p.y+t*camera.zoom/2,17*camera.zoom,0,Math.PI*2);c.fill()
}
emoji(obj,text,camera){const p=camera.worldToScreen(obj.x*TILE_SIZE,obj.y*TILE_SIZE);this.ctx.font=`${Math.max(18,28*camera.zoom)}px sans-serif`;this.ctx.textAlign="center";this.ctx.textBaseline="middle";this.ctx.fillText(text,p.x+TILE_SIZE*camera.zoom/2,p.y+TILE_SIZE*camera.zoom/2)}
}
