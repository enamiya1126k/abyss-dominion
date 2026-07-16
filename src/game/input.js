import{CAMERA}from"./config.js";
export class Input{
constructor(){this.el=null;this.cb={};this.pointers=new Map();this.last=null;this.lastPinch=null;this.lastTap=0;this.dragged=false;this.down=this.down.bind(this);this.move=this.move.bind(this);this.up=this.up.bind(this)}
attach(el,cb){this.detach();this.el=el;this.cb=cb;el.style.touchAction="none";el.addEventListener("pointerdown",this.down);el.addEventListener("pointermove",this.move);el.addEventListener("pointerup",this.up);el.addEventListener("pointercancel",this.up)}
detach(){if(!this.el)return;this.el.removeEventListener("pointerdown",this.down);this.el.removeEventListener("pointermove",this.move);this.el.removeEventListener("pointerup",this.up);this.el.removeEventListener("pointercancel",this.up);this.el=null;this.pointers.clear()}
down(e){this.el.setPointerCapture?.(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});this.last={x:e.clientX,y:e.clientY};this.dragged=false}
move(e){const p=this.pointers.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;const pts=[...this.pointers.values()];
if(pts.length===1&&this.last){const dx=e.clientX-this.last.x,dy=e.clientY-this.last.y;if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>CAMERA.dragThreshold)this.dragged=true;if(this.dragged)this.cb.onPan?.({dx,dy});this.last={x:e.clientX,y:e.clientY}}
if(pts.length===2){this.dragged=true;const d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(this.lastPinch)this.cb.onPinch?.({scale:d/this.lastPinch});this.lastPinch=d}}
up(e){const p=this.pointers.get(e.pointerId);if(!p)return;this.pointers.delete(e.pointerId);if(this.pointers.size<2)this.lastPinch=null;if(!this.dragged){const now=performance.now();if(now-this.lastTap<=CAMERA.doubleTapDelay){this.cb.onDoubleTap?.();this.lastTap=0}else{this.cb.onTap?.({x:e.clientX,y:e.clientY});this.lastTap=now}}}
}
