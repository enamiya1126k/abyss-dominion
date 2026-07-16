import{SAVE_KEY}from"./config.js";
const DEFAULT={floor:1,maxFloor:1,checkpoint:1,nextShopFloor:4,gold:0,crystal:0,hp:160,maxHp:160,inRun:false,inventory:{potion:3,capture:5},gear:[]};
export class SaveManager{
constructor(){this.data=this.load();this.timer=setInterval(()=>this.flush(),2000)}
load(){try{return{...structuredClone(DEFAULT),...(JSON.parse(localStorage.getItem(SAVE_KEY))||{})}}catch{return structuredClone(DEFAULT)}}
update(patch){this.data={...this.data,...patch};this.flush()}
flush(){localStorage.setItem(SAVE_KEY,JSON.stringify(this.data))}
reset(){localStorage.removeItem(SAVE_KEY);this.data=structuredClone(DEFAULT);this.flush()}
}
