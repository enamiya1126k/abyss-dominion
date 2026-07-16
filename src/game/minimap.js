export class MiniMap{
constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext("2d")}
resize(){const ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=140*ratio;this.canvas.height=140*ratio}
draw(world,player,enemies,theme){const c=this.ctx,cell=Math.min(this.canvas.width/world.width,this.canvas.height/world.height);c.clearRect(0,0,this.canvas.width,this.canvas.height);c.fillStyle="#08050c";c.fillRect(0,0,this.canvas.width,this.canvas.height);
for(let y=0;y<world.height;y++)for(let x=0;x<world.width;x++){c.fillStyle=world.tiles[y][x]?theme.wall:theme.accent;c.fillRect(x*cell,y*cell,cell,cell)}
c.fillStyle="#ff5c66";c.fillRect(world.exit.x*cell,world.exit.y*cell,cell,cell);if(world.shop){c.fillStyle="#ffd65e";c.fillRect(world.shop.x*cell,world.shop.y*cell,cell,cell)}
for(const chest of world.chests){c.fillStyle=chest.opened?"#666":"#fff071";c.fillRect(chest.x*cell,chest.y*cell,cell,cell)}
c.fillStyle="#ef6c72";for(const e of enemies)c.fillRect(e.x*cell,e.y*cell,cell,cell);c.fillStyle="#5dff82";c.fillRect(player.x*cell,player.y*cell,cell,cell)}
}
