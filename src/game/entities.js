export class Entity{
constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.progress=0}
setPath(path){this.path=path;this.progress=0}
update(dt,speed){if(!this.path.length)return false;const t=this.path[0];this.progress+=dt*speed;const p=Math.min(1,this.progress);this.rx=this.x+(t.x-this.x)*p;this.ry=this.y+(t.y-this.y)*p;if(this.progress>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.progress=0;return true}return false}
}
export class Player extends Entity{constructor(){super(1,1)}}
export class Enemy extends Entity{
constructor(x,y,name,level,color){super(x,y);this.name=name;this.level=level;this.color=color;this.patrolTimer=1+Math.random()*2;this.alert=false;this.repathTimer=0}
}
