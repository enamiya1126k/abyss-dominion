import{CAMERA,TILE_SIZE}from"./config.js";
export class Camera{
constructor(canvas){this.canvas=canvas;this.x=TILE_SIZE;this.y=TILE_SIZE;this.zoom=CAMERA.defaultZoom;this.offsetX=0;this.offsetY=0}
follow(wx,wy,strength=.1){this.x+=(wx-this.x)*strength;this.y+=(wy-this.y)*strength}
pan(dx,dy){this.offsetX+=dx;this.offsetY+=dy}
zoomBy(scale){this.zoom=Math.max(CAMERA.minZoom,Math.min(CAMERA.maxZoom,this.zoom*scale))}
reset(wx,wy){this.x=wx;this.y=wy;this.zoom=CAMERA.defaultZoom;this.offsetX=0;this.offsetY=0}
worldToScreen(wx,wy){return{x:(wx-this.x)*this.zoom+this.canvas.width/2+this.offsetX,y:(wy-this.y)*this.zoom+this.canvas.height/2+this.offsetY}}
screenToWorld(sx,sy){return{x:(sx-this.canvas.width/2-this.offsetX)/this.zoom+this.x,y:(sy-this.canvas.height/2-this.offsetY)/this.zoom+this.y}}
clamp(world){
const mapW=world.width*TILE_SIZE*this.zoom,mapH=world.height*TILE_SIZE*this.zoom;
const limitX=Math.max(0,(mapW-this.canvas.width)/2+TILE_SIZE*this.zoom*2),limitY=Math.max(0,(mapH-this.canvas.height)/2+TILE_SIZE*this.zoom*2);
this.offsetX=Math.max(-limitX,Math.min(limitX,this.offsetX));this.offsetY=Math.max(-limitY,Math.min(limitY,this.offsetY))
}
}
