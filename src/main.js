const VERSION="0.1.1",KEY="abyss-dominion-v006",TILE=48,COLS=31,ROWS=31;
const SPECIES={
slime:{name:"スライム",color:"#67d273",hp:46,atk:6,def:1,spd:10,skill:"ぷるぷる体当たり"},
goblin:{name:"ゴブリン",color:"#a18c58",hp:52,atk:9,def:2,spd:15,skill:"二段斬り"},
fairy:{name:"妖精",color:"#82d9ee",hp:34,atk:3,def:0,spd:18,skill:"癒やしの風"},
dragon:{name:"ドラゴン",color:"#df6262",hp:130,atk:18,def:5,spd:6,skill:"火炎ブレス"},
mushroom:{name:"毒キノコ",color:"#b360c9",hp:58,atk:8,def:3,spd:8,skill:"毒胞子"}
};
const DEFAULT=()=>({floor:1,maxFloor:1,checkpoint:1,nextShopFloor:4,gold:150,crystal:10,inRun:false,items:{potion:3,capture:8},souls:{slime:0,goblin:0,fairy:0,dragon:0,mushroom:0},monsters:[
mk("slime",1,1),mk("goblin",1,1),mk("fairy",1,2),mk("dragon",1,1)
],party:[],gear:[
gear("weapon","鉄の剣","R",{atk:5,crit:2}),gear("armor","魔布のローブ","SR",{hp:18,def:2}),gear("accessory","旅人の指輪","R",{spd:2,capture:3})
]});
function id(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`}
function mk(species,level=1,stars=1){const s=SPECIES[species];return{id:id(),species,name:s.name,level,exp:0,stars,plus:0,hp:maxHp({species,level,stars,plus:0,equipment:{}}),equipment:{weapon:null,armor:null,accessory:null},favorite:false}}
function gear(slot,name,rarity,stats){return{id:id(),slot,name,rarity,stats,equippedBy:null}}
function maxHp(m){const s=SPECIES[m.species];return Math.floor((s.hp+(m.level-1)*4)*(1+(m.stars-1)*.12)+(m.plus||0)*2)}
function stat(m,k){const s=SPECIES[m.species];let base=k==="atk"?s.atk+(m.level-1)*1.3:k==="def"?s.def+(m.level-1)*.55:s.spd+(m.level-1)*.2;for(const gid of Object.values(m.equipment||{})){const g=state.gear?.find(x=>x.id===gid);if(g)base+=g.stats[k]||0}return Math.floor(base*(1+(m.stars-1)*.08)+(m.plus||0))}
function totalMaxHp(m){let v=maxHp(m);for(const gid of Object.values(m.equipment||{})){const g=state.gear?.find(x=>x.id===gid);if(g)v+=g.stats.hp||0}return v}
let state=load();
state.settings??={};
if(typeof state.settings.minimapVisible!=="boolean")state.settings.minimapVisible=true;
if(typeof state.settings.autoBattle!=="boolean")state.settings.autoBattle=true;
if(!state.party?.length)state.party=state.monsters.slice(0,4).map(m=>m.id);
normalize();
let explorationPaused=false;

function load(){try{return{...DEFAULT(),...(JSON.parse(localStorage.getItem(KEY))||{})}}catch{return DEFAULT()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function normalize(){state.monsters.forEach(m=>{m.equipment??={weapon:null,armor:null,accessory:null};m.hp=Math.min(m.hp??totalMaxHp(m),totalMaxHp(m))});save()}
const $=x=>document.getElementById(x),screens=["home","explore","shop"];
function show(s){screens.forEach(x=>$(x).classList.toggle("active",x===s))}
function party(){return state.party.map(i=>state.monsters.find(m=>m.id===i)).filter(Boolean)}
function partyHp(){const p=party();return[p.reduce((a,m)=>a+m.hp,0),p.reduce((a,m)=>a+totalMaxHp(m),0)]}
function renderHome(){$("homeArea").textContent=areaName();$("homeFloor").textContent=`最高到達 ${state.maxFloor}階`;$("homeMoney").textContent=`G ${state.gold}　魔晶石 ${state.crystal}`;$("homeParty").innerHTML=party().map(m=>`<div class="compact-row"><span><b>${m.name}</b> Lv.${m.level} +${m.plus}<br><small class="stars">${"★".repeat(m.stars)}</small></span><span>${m.hp}/${totalMaxHp(m)}</span></div>`).join("")}
function areaName(){return state.floor<50?"地下洞窟":state.floor<100?"灼熱火山":state.floor<150?"毒沼":"深淵ジャングル"}
function hud(){const[h,m]=partyHp();$("floorHud").textContent=state.floor;$("goldHud").textContent=state.gold;$("crystalHud").textContent=state.crystal;$("partyHpText").textContent=`${h}/${m}`;$("partyHpFill").style.width=`${m?h/m*100:0}%`}
function toast(t){$("toast").textContent=t;$("toast").classList.remove("hidden");clearTimeout(toast.t);toast.t=setTimeout(()=>$("toast").classList.add("hidden"),1200)}
function openModal(title,html){$("modalTitle").textContent=title;$("modalBody").innerHTML=html;$("modal").classList.remove("hidden")}
$("modalClose").onclick=()=>$("modal").classList.add("hidden");

function monsterCard(m,mode="list"){return`<div class="monster-card ${state.party.includes(m.id)?"selected":""}">
<div class="monster-head"><span class="orb" style="background:${SPECIES[m.species].color}"></span><div><b>${m.name}</b> Lv.${m.level} +${m.plus}<div class="stars">${"★".repeat(m.stars)}${"☆".repeat(Math.max(0,5-m.stars))}</div></div></div>
<div class="stats">HP ${m.hp}/${totalMaxHp(m)}　ATK ${stat(m,"atk")}　DEF ${stat(m,"def")}　SPD ${stat(m,"spd")}<br>EXP ${m.exp}/${needExp(m.level)}</div>
<div class="card-actions"><button onclick="monsterDetail('${m.id}')">詳細</button>${mode==="party"?`<button onclick="toggleParty('${m.id}')">${state.party.includes(m.id)?"外す":"編成"}</button>`:"<button onclick=\"toggleParty('"+m.id+"')\">編成</button>"}</div></div>`}
function needExp(lv){return 40+lv*25}
window.monsterDetail=idv=>{const m=state.monsters.find(x=>x.id===idv),same=state.monsters.filter(x=>x.species===m.species&&x.id!==m.id);openModal(m.name,`<div class="monster-card"><div class="monster-head"><span class="orb" style="background:${SPECIES[m.species].color}"></span><div><h2>${m.name} Lv.${m.level} +${m.plus}</h2><div class="stars">${"★".repeat(m.stars)}</div></div></div><div class="stats">HP ${m.hp}/${totalMaxHp(m)}<br>ATK ${stat(m,"atk")}　DEF ${stat(m,"def")}　SPD ${stat(m,"spd")}<br>固有スキル：${SPECIES[m.species].skill}<br>魔魂：${state.souls[m.species]||0}</div></div>
<div class="item-row"><span>★覚醒<br><small>魔魂 ${m.stars*20}・${m.stars*100}G</small></span><button onclick="awaken('${m.id}')">覚醒</button></div>
<div class="item-row"><span>同種合成 ＋1<br><small>素材候補 ${same.length}体</small></span><button onclick="fuse('${m.id}')">合成</button></div>
<div class="item-row"><span>HP全回復</span><button onclick="healMonster('${m.id}')">回復薬</button></div>`)};
window.toggleParty=idv=>{const i=state.party.indexOf(idv);if(i>=0){if(state.party.length<=1)return alert("最低1体必要");state.party.splice(i,1)}else{if(state.party.length>=4)return alert("パーティーは4体まで");state.party.push(idv)}save();openParty()};
window.awaken=idv=>{const m=state.monsters.find(x=>x.id===idv),cost=m.stars*20,gold=m.stars*100;if(m.stars>=10)return alert("最大★");if((state.souls[m.species]||0)<cost||state.gold<gold)return alert("素材不足");state.souls[m.species]-=cost;state.gold-=gold;m.stars++;m.hp=totalMaxHp(m);save();monsterDetail(idv)};
window.fuse=idv=>{const m=state.monsters.find(x=>x.id===idv),food=state.monsters.find(x=>x.species===m.species&&x.id!==m.id&&!state.party.includes(x.id));if(!food)return alert("控えに同種モンスターが必要");state.monsters=state.monsters.filter(x=>x.id!==food.id);m.plus=Math.min(99,m.plus+1);m.hp=totalMaxHp(m);save();monsterDetail(idv)};
window.healMonster=idv=>{if(state.items.potion<=0)return alert("回復薬がない");const m=state.monsters.find(x=>x.id===idv);state.items.potion--;m.hp=totalMaxHp(m);save();monsterDetail(idv)};
function openParty(){openModal("パーティー編成",`<p class="muted">最大4体。編成中は金枠。</p><div class="monster-grid">${state.monsters.map(m=>monsterCard(m,"party")).join("")}</div>`)}
function openMonsters(){openModal("手持ちモンスター",`<input id="monsterSearch" class="search" placeholder="名前で検索"><div id="monsterList" class="monster-grid">${state.monsters.map(m=>monsterCard(m)).join("")}</div>`);$("monsterSearch").oninput=e=>{$("monsterList").innerHTML=state.monsters.filter(m=>m.name.includes(e.target.value)).map(m=>monsterCard(m)).join("")}}
let equipTarget=null;
function openEquipment(){equipTarget??=state.party[0];const target=state.monsters.find(m=>m.id===equipTarget)??party()[0];openModal("装備",`<div class="tabs">${party().map(m=>`<button onclick="selectEquipTarget('${m.id}')">${m.name}</button>`).join("")}</div><div class="panel"><b>${target.name}</b><br><span class="muted">武器：${gearName(target.equipment.weapon)}<br>防具：${gearName(target.equipment.armor)}<br>アクセ：${gearName(target.equipment.accessory)}</span></div><div class="gear-grid">${state.gear.map(g=>gearCard(g,target)).join("")||"装備なし"}</div>`)}
function gearName(idv){return state.gear.find(g=>g.id===idv)?.name??"なし"}
function gearCard(g,target){const stats=Object.entries(g.stats).map(([k,v])=>`${labelStat(k)}+${v}`).join(" ");return`<div class="gear-card"><b>[${g.rarity}] ${g.name}</b><div class="stats">${g.slot}　${stats}<br>${g.equippedBy?`装備中：${state.monsters.find(m=>m.id===g.equippedBy)?.name}`:"未装備"}</div><button onclick="equipGear('${g.id}','${target.id}')">装備</button></div>`}
function labelStat(k){return{atk:"ATK",def:"DEF",hp:"HP",spd:"SPD",crit:"会心",capture:"捕獲"}[k]||k}
window.selectEquipTarget=idv=>{equipTarget=idv;openEquipment()};
window.equipGear=(gid,mid)=>{const g=state.gear.find(x=>x.id===gid),m=state.monsters.find(x=>x.id===mid);if(g.equippedBy){const old=state.monsters.find(x=>x.id===g.equippedBy);if(old)old.equipment[g.slot]=null}const current=m.equipment[g.slot];if(current){const cg=state.gear.find(x=>x.id===current);if(cg)cg.equippedBy=null}m.equipment[g.slot]=g.id;g.equippedBy=m.id;m.hp=Math.min(m.hp,totalMaxHp(m));save();openEquipment()};
function openInventory(){openModal("持ち物",`<div class="item-row"><span>回復薬</span><b>${state.items.potion}</b></div><div class="item-row"><span>捕獲結晶</span><b>${state.items.capture}</b></div><div class="item-row"><span>装備所持数</span><b>${state.gear.length}</b></div>`)}
function openSouls(){openModal("魔魂",Object.keys(SPECIES).map(k=>`<div class="item-row"><span>${SPECIES[k].name}の魔魂</span><b>${state.souls[k]||0}</b></div>`).join(""))}
document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>({party:openParty,monsters:openMonsters,equipment:openEquipment,inventory:openInventory,souls:openSouls}[b.dataset.open]?.()));

class World{
constructor(){this.w=COLS;this.h=ROWS;this.t=[];this.exit=null;this.shop=null;this.chests=[]}
generate(shop){this.t=Array.from({length:this.h},()=>Array(this.w).fill(1));this.carve(1,1);for(let i=0;i<45;i++)this.loop();const cells=this.cells();this.exit=this.farthest(cells);this.shop=shop?this.pick(cells,10,[this.exit]):null;this.chests=[this.pick(cells,6,[this.exit,this.shop]),this.pick(cells,7,[this.exit,this.shop])].filter(Boolean).map(x=>({...x,open:false}));return this}
carve(x,y){this.t[y][x]=0;for(const[dx,dy]of[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>Math.random()-.5)){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<this.w-1&&ny<this.h-1&&this.t[ny][nx]){this.t[y+dy/2][x+dx/2]=0;this.carve(nx,ny)}}}
loop(){const x=1+Math.floor(Math.random()*(this.w-2)),y=1+Math.floor(Math.random()*(this.h-2));if(!this.t[y][x])return;if((!this.t[y][x-1]&&!this.t[y][x+1])||(!this.t[y-1][x]&&!this.t[y+1][x]))this.t[y][x]=0}
cells(){const a=[];for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(!this.t[y][x])a.push({x,y});return a}
farthest(c){return c.reduce((b,x)=>x.x+x.y>b.x+b.y?x:b,c[0])}
pick(c,min,ex=[]){const a=c.filter(x=>x.x+x.y>=min&&!ex.some(e=>e&&e.x===x.x&&e.y===x.y));return structuredClone(a[Math.floor(Math.random()*a.length)]||null)}
walk(x,y){return x>=0&&y>=0&&x<this.w&&y<this.h&&!this.t[y][x]}
}
function path(world,start,goal){if(!world.walk(goal.x,goal.y))return[];const k=p=>p.x+","+p.y,q=[{x:start.x,y:start.y}],seen=new Set([k(start)]),prev=new Map();while(q.length){const c=q.shift();if(c.x===goal.x&&c.y===goal.y)break;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n={x:c.x+dx,y:c.y+dy};if(!world.walk(n.x,n.y)||seen.has(k(n)))continue;seen.add(k(n));prev.set(k(n),c);q.push(n)}}if(!seen.has(k(goal)))return[];const out=[];let c=goal;while(c.x!==start.x||c.y!==start.y){out.push(c);c=prev.get(k(c))}return out.reverse()}
class E{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{
constructor(c){
  this.c=c;
  this.x=TILE;
  this.y=TILE;
  this.z=.85;
  this.ox=0;
  this.oy=0;
  this.manual=false;
}
world(wx,wy){
  return{
    x:(wx-this.x)*this.z+this.c.width/2+this.ox,
    y:(wy-this.y)*this.z+this.c.height/2+this.oy
  };
}
screen(sx,sy){
  return{
    x:(sx-this.c.width/2-this.ox)/this.z+this.x,
    y:(sy-this.c.height/2-this.oy)/this.z+this.y
  };
}
pan(dx,dy){
  this.ox+=dx;
  this.oy+=dy;
  this.manual=true;
}
reset(px,py){
  this.x=px;
  this.y=py;
  this.ox=0;
  this.oy=0;
  this.z=.85;
  this.manual=false;
}
follow(px,py){
  if(this.manual)return;
  const pos=this.world(px,py);
  const left=this.c.width*.34;
  const right=this.c.width*.66;
  const top=this.c.height*.34;
  const bottom=this.c.height*.66;

  if(pos.x<left)this.x+=(pos.x-left)/this.z*.12;
  if(pos.x>right)this.x+=(pos.x-right)/this.z*.12;
  if(pos.y<top)this.y+=(pos.y-top)/this.z*.12;
  if(pos.y>bottom)this.y+=(pos.y-bottom)/this.z*.12;
}
clamp(world){
  const edge=30;
  const mapWidth=world.w*TILE*this.z;
  const mapHeight=world.h*TILE*this.z;

  const mapLeft=this.c.width/2-this.x*this.z;
  const mapTop=this.c.height/2-this.y*this.z;

  const minOffsetX=edge-(mapLeft+mapWidth);
  const maxOffsetX=this.c.width-edge-mapLeft;
  const minOffsetY=edge-(mapTop+mapHeight);
  const maxOffsetY=this.c.height-edge-mapTop;

  if(mapWidth<=this.c.width-edge*2){
    this.ox=(this.c.width-mapWidth)/2-mapLeft;
  }else{
    this.ox=Math.max(minOffsetX,Math.min(maxOffsetX,this.ox));
  }

  if(mapHeight<=this.c.height-edge*2){
    this.oy=(this.c.height-mapHeight)/2-mapTop;
  }else{
    this.oy=Math.max(minOffsetY,Math.min(maxOffsetY,this.oy));
  }
}
}
let world,player,enemies=[],camera,ctx,run=false,last=0,input={pts:new Map(),last:null,pinch:null,drag:false,tap:0};
let exploreSnapshot=null;
let activeEncounterEnemy=null;

function applyMinimapSetting(){
  const map=$("minimap"),button=$("minimapToggle");
  if(!map||!button)return;
  map.classList.toggle("minimap-off",!state.settings.minimapVisible);
  button.textContent=state.settings.minimapVisible?"MAP ON":"MAP OFF";
}
function setExplorationPaused(paused){
  explorationPaused=paused;
  document.querySelector(".canvas-wrap")?.classList.toggle("map-paused",paused);
}
function startExplore(options={}){
  const restore=options.restore??false;
  show("explore");
  hud();

  if(!restore||!exploreSnapshot){
    world=new World().generate(state.floor>=state.nextShopFloor);
    player=new E(1,1);
    enemies=[];
    for(let i=0;i<5;i++)spawn();
  }else{
    world=exploreSnapshot.world;
    player=exploreSnapshot.player;
    enemies=exploreSnapshot.enemies;
  }

  const c=$("canvas"),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
  c.width=r.width*d;
  c.height=r.height*d;
  ctx=c.getContext("2d");

  const mm=$("minimap");
  mm.width=132*d;
  mm.height=132*d;

  camera=new Camera(c);

  if(restore&&exploreSnapshot?.camera){
    camera.x=exploreSnapshot.camera.x;
    camera.y=exploreSnapshot.camera.y;
    camera.z=exploreSnapshot.camera.z;
    camera.ox=exploreSnapshot.camera.ox;
    camera.oy=exploreSnapshot.camera.oy;
    camera.manual=exploreSnapshot.camera.manual;
    camera.clamp(world);
  }else{
    camera.reset(TILE,TILE);
    camera.clamp(world);
  }

  bindInput(c);
  applyMinimapSetting();
  run=true;
  last=performance.now();
  requestAnimationFrame(loop);
}
function stopExplore(){
  run=false;
  unbindInput($("canvas"));
  resetInputState();
}
function spawn(){const cells=world.cells().filter(c=>c.x+c.y>8&&!enemies.some(e=>e.x===c.x&&e.y===c.y));const p=cells[Math.floor(Math.random()*cells.length)],types=Object.keys(SPECIES),sp=types[Math.floor(Math.random()*types.length)];const e=new E(p.x,p.y);e.species=sp;e.level=Math.max(1,state.floor+Math.floor(Math.random()*5)-1);e.patrol=1;e.repath=0;enemies.push(e)}
function resetInputState(){
  input.pts.clear();
  input.last=null;
  input.pinch=null;
  input.drag=false;
  input.tap=0;
}

function bindInput(c){
  resetInputState();

  const finishPointer=e=>{
    input.pts.delete(e.pointerId);

    if(input.pts.size===0){
      input.last=null;
      input.pinch=null;
      input.drag=false;
      return;
    }

    if(input.pts.size===1){
      const remaining=[...input.pts.values()][0];
      input.last={x:remaining.x,y:remaining.y};
      input.pinch=null;
      input.drag=true;
    }
  };

  c.onpointerdown=e=>{
    if(explorationPaused)return;

    c.setPointerCapture?.(e.pointerId);
    input.pts.set(e.pointerId,{
      x:e.clientX,
      y:e.clientY,
      sx:e.clientX,
      sy:e.clientY
    });

    const points=[...input.pts.values()];

    if(points.length===1){
      input.last={x:e.clientX,y:e.clientY};
      input.pinch=null;
      input.drag=false;
    }

    if(points.length===2){
      input.drag=true;
      input.last=null;
      input.pinch=Math.hypot(
        points[0].x-points[1].x,
        points[0].y-points[1].y
      );
    }
  };

  c.onpointermove=e=>{
    if(explorationPaused)return;

    const p=input.pts.get(e.pointerId);
    if(!p)return;

    p.x=e.clientX;
    p.y=e.clientY;

    const points=[...input.pts.values()];

    if(points.length===1){
      const only=points[0];

      if(!input.last){
        input.last={x:only.x,y:only.y};
        return;
      }

      const dx=only.x-input.last.x;
      const dy=only.y-input.last.y;
      const moved=Math.hypot(only.x-only.sx,only.y-only.sy);

      if(moved>7)input.drag=true;

      if(input.drag){
        camera.pan(
          dx*(c.width/c.clientWidth),
          dy*(c.height/c.clientHeight)
        );
        camera.clamp(world);
      }

      input.last={x:only.x,y:only.y};
      input.pinch=null;
      return;
    }

    if(points.length===2){
      input.drag=true;
      input.last=null;

      const distance=Math.hypot(
        points[0].x-points[1].x,
        points[0].y-points[1].y
      );

      if(input.pinch&&Number.isFinite(distance)&&distance>0){
        const scale=Math.max(.92,Math.min(1.08,distance/input.pinch));
        camera.z=Math.max(.45,Math.min(1.55,camera.z*scale));
        camera.clamp(world);
      }

      input.pinch=distance;
      return;
    }

    // 3本以上では誤操作防止のため、カメラ変更を行わない。
    input.last=null;
    input.pinch=null;
    input.drag=true;
  };

  c.onpointerup=e=>{
    const p=input.pts.get(e.pointerId);
    if(!p)return;

    const wasSingle=input.pts.size===1;
    const wasDragged=input.drag;
    finishPointer(e);

    if(!wasSingle||wasDragged||explorationPaused)return;

    const now=performance.now();

    if(now-input.tap<280){
      camera.reset(player.rx*TILE,player.ry*TILE);
      camera.clamp(world);
      input.tap=0;
    }else{
      tapMove(e);
      input.tap=now;
    }
  };

  c.onpointercancel=finishPointer;
  c.onlostpointercapture=finishPointer;
}

function unbindInput(c){
  c.onpointerdown=null;
  c.onpointermove=null;
  c.onpointerup=null;
  c.onpointercancel=null;
  c.onlostpointercapture=null;
  resetInputState();
}
function tapMove(e){if(explorationPaused)return;const c=$("canvas"),r=c.getBoundingClientRect(),sx=(e.clientX-r.left)*(c.width/r.width),sy=(e.clientY-r.top)*(c.height/r.height),w=camera.screen(sx,sy),g={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};if(!world.walk(g.x,g.y))return;player.setPath(path(world,player,g))}
function loop(now){if(!run)return;const dt=Math.min(.05,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop)}
function update(dt){if(explorationPaused)return;if(player.move(dt,5)){for(const c of world.chests)if(!c.open&&c.x===player.x&&c.y===player.y){c.open=true;randomChest()}if(world.shop&&player.x===world.shop.x&&player.y===world.shop.y){stopExplore();state.nextShopFloor=state.floor+3+Math.floor(Math.random()*5);save();show("shop");return}if(player.x===world.exit.x&&player.y===world.exit.y){exploreSnapshot=null;activeEncounterEnemy=null;state.floor++;state.maxFloor=Math.max(state.maxFloor,state.floor);if(state.floor%10===0)state.checkpoint=state.floor;save();startExplore();return}}
for(const e of enemies){e.patrol-=dt;e.repath-=dt;const d=Math.abs(e.x-player.x)+Math.abs(e.y-player.y);if(d<=5&&e.repath<=0){e.setPath(path(world,e,player).slice(0,8));e.repath=.5}else if(d>5&&e.patrol<=0&&!e.path.length){const n=[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:e.x+x,y:e.y+y})).filter(p=>world.walk(p.x,p.y));if(n.length)e.setPath([n[Math.floor(Math.random()*n.length)]]);e.patrol=1+Math.random()*2}if(e.move(dt,d<=5?2.7:1.5)&&e.x===player.x&&e.y===player.y){
  activeEncounterEnemy=e;
  exploreSnapshot={
    world,
    player,
    enemies,
    camera:{
      x:camera.x,y:camera.y,z:camera.z,
      ox:camera.ox,oy:camera.oy,
      manual:camera.manual
    }
  };
  stopExplore();
  beginBattle(e);
  return
}}
camera.follow(player.rx*TILE,player.ry*TILE);camera.clamp(world);hud()}
function draw(){ctx.fillStyle="#120c18";ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++){const p=camera.world(x*TILE,y*TILE),s=TILE*camera.z;ctx.fillStyle=world.t[y][x]?"#2c2036":"#6a4a7f";ctx.fillRect(p.x,p.y,s+1,s+1);if(!world.t[y][x]){ctx.strokeStyle="rgba(255,255,255,.08)";ctx.strokeRect(p.x,p.y,s,s)}}emoji(world.exit,"🪜");if(world.shop)emoji(world.shop,"🚪");world.chests.forEach(c=>!c.open&&emoji(c,"🎁"));enemies.forEach(e=>circle(e.rx,e.ry,SPECIES[e.species].color,`${SPECIES[e.species].name}\nLv.${e.level}`));circle(player.rx,player.ry,"#69e17c","");drawMini()}
function emoji(o,t){const p=camera.world(o.x*TILE,o.y*TILE);ctx.font=`${28*camera.z}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(t,p.x+TILE*camera.z/2,p.y+TILE*camera.z/2)}
function circle(x,y,color,text){const p=camera.world(x*TILE,y*TILE);ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x+TILE*camera.z/2,p.y+TILE*camera.z/2,15*camera.z,0,Math.PI*2);ctx.fill();if(text){ctx.fillStyle="#fff";ctx.font=`${10*camera.z}px sans-serif`;ctx.textAlign="center";const a=text.split("\n");ctx.fillText(a[0],p.x+TILE*camera.z/2,p.y+8*camera.z);ctx.fillText(a[1],p.x+TILE*camera.z/2,p.y+20*camera.z)}}
function drawMini(){const c=$("minimap").getContext("2d"),cell=Math.min(c.canvas.width/world.w,c.canvas.height/world.h);c.fillStyle="#130c18";c.fillRect(0,0,c.canvas.width,c.canvas.height);for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++){c.fillStyle=world.t[y][x]?"#33243d":"#b178d0";c.fillRect(x*cell,y*cell,cell,cell)}c.fillStyle="#ff5d66";c.fillRect(world.exit.x*cell,world.exit.y*cell,cell,cell);if(world.shop){c.fillStyle="#ffe15d";c.fillRect(world.shop.x*cell,world.shop.y*cell,cell,cell)}c.fillStyle="#ef6c72";enemies.forEach(e=>c.fillRect(e.x*cell,e.y*cell,cell,cell));c.fillStyle="#5dff82";c.fillRect(player.x*cell,player.y*cell,cell,cell)}
function randomChest(){const r=Math.random();if(r<.3){state.gold+=80+state.floor*5;loot("💰","宝箱",`${80+state.floor*5}Gを獲得`)}else if(r<.5){state.items.capture++;loot("💎","捕獲結晶","捕獲結晶 ×1")}else{const g=randomGear();state.gear.push(g);loot("⚔️",`[${g.rarity}] ${g.name}`,Object.entries(g.stats).map(([k,v])=>`${labelStat(k)}+${v}`).join(" "))}save()}
let battleState=null;
function beginBattle(enemy){
  const base=SPECIES[enemy.species];
  battleState={
    enemy:{
      species:enemy.species,
      name:base.name,
      level:enemy.level,
      maxHp:Math.floor(base.hp+enemy.level*8),
      hp:Math.floor(base.hp+enemy.level*8),
      atk:Math.floor(base.atk+enemy.level*1.5),
      def:Math.floor(base.def+enemy.level*.6),
      spd:base.spd,
      guard:false
    },
    turn:1,
    index:0,
    auto:state.settings.autoBattle,
    speed:1,
    guard:false
  };
  $("battle").classList.remove("hidden");
  $("autoBtn").textContent=`AUTO ${battleState.auto?"ON":"OFF"}`;
  renderBattle();

  if(battleState.auto){
    setTimeout(()=>command("attack"),420);
  }
}
function actor(){const alive=party().filter(m=>m.hp>0);if(!alive.length)return null;battleState.index%=alive.length;return alive[battleState.index]}
function renderBattle(){const e=battleState.enemy,a=actor();$("turnNo").textContent=battleState.turn;$("enemyName").textContent=`${e.name} Lv.${e.level}`;$("enemyIcon").style.background=SPECIES[e.species].color;$("enemyHpFill").style.width=`${e.hp/e.maxHp*100}%`;$("enemyHpText").textContent=`${e.hp}/${e.maxHp}`;$("actorName").textContent=a?`${a.name}のターン`:"全滅";$("battleParty").innerHTML=party().map(m=>`<div class="battle-unit ${a?.id===m.id?"active":""} ${m.hp<=0?"dead":""}"><b>${m.name} Lv.${m.level}+${m.plus}</b><div class="stats">HP ${m.hp}/${totalMaxHp(m)}　SPD ${stat(m,"spd")}</div><div class="bar unit-bar"><i style="width:${m.hp/totalMaxHp(m)*100}%"></i></div></div>`).join("");$("battleHint").textContent=`捕獲結晶 ${state.items.capture}`;hud()}
function effect(t,color="#fff"){$("battleEffect").textContent=t;$("battleEffect").style.color=color;setTimeout(()=>$("battleEffect").textContent="",500/battleState.speed)}
document.querySelector(".commands").onclick=e=>{const b=e.target.closest("[data-command]");if(b)command(b.dataset.command)};
function command(cmd){if(!battleState||!actor())return;const a=actor(),en=battleState.enemy;if(cmd==="attack"){const dmg=Math.max(1,Math.floor(stat(a,"atk")*(.9+Math.random()*.25)-en.def*.45));en.hp=Math.max(0,en.hp-dmg);effect(`-${dmg}`,"#ffe276")}if(cmd==="guard"){battleState.guard=true;effect("GUARD","#9ed4ff")}if(cmd==="skill"){if(a.species==="fairy"){const heal=Math.floor(totalMaxHp(a)*.3);party().forEach(m=>m.hp=Math.min(totalMaxHp(m),m.hp+heal));effect(`全体回復 +${heal}`,"#79ee94")}else{const dmg=Math.max(2,Math.floor(stat(a,"atk")*1.55-en.def*.35));en.hp=Math.max(0,en.hp-dmg);effect(`${SPECIES[a.species].skill} -${dmg}`,"#ff9a61")}}if(cmd==="item"){if(state.items.potion<=0)return alert("回復薬がない");state.items.potion--;a.hp=Math.min(totalMaxHp(a),a.hp+Math.floor(totalMaxHp(a)*.5));effect("回復！","#79ee94")}if(cmd==="capture"){return tryCapture()}save();if(en.hp<=0)return victory(false);setTimeout(enemyTurn,550/battleState.speed)}
function enemyTurn(){const a=actor();if(!a)return defeat();const en=battleState.enemy,dmg=Math.max(1,Math.floor((en.atk-stat(a,"def")*.5)*(battleState.guard?.45:1)));a.hp=Math.max(0,a.hp-dmg);battleState.guard=false;effect(`味方 -${dmg}`,"#ff6877");if(!party().some(m=>m.hp>0))return setTimeout(defeat,500);battleState.index++;battleState.turn++;save();setTimeout(()=>{renderBattle();if(battleState.auto)command("attack")},500/battleState.speed)}
function tryCapture(){if(state.items.capture<=0)return alert("捕獲結晶がない");state.items.capture--;const e=battleState.enemy,power=Math.max(...party().map(m=>m.level+m.stars*3+m.plus)),chance=Math.max(.05,Math.min(.85,.18+(1-e.hp/e.maxHp)*.55+(power-e.level)*.015));effect(`捕獲 ${Math.round(chance*100)}%`,"#9bdcff");save();if(Math.random()<chance){const m=mk(e.species,e.level,1);state.monsters.push(m);save();setTimeout(()=>victory(true),600)}else setTimeout(enemyTurn,600)}
function removeEncounterEnemy(){
  if(!activeEncounterEnemy||!exploreSnapshot)return;
  exploreSnapshot.enemies=exploreSnapshot.enemies.filter(e=>e!==activeEncounterEnemy);
  activeEncounterEnemy=null;
}
function clearEncounterWithoutRemoval(){
  activeEncounterEnemy=null;
}
function victory(captured){removeEncounterEnemy();const e=battleState.enemy,gold=20+e.level*6,soul=2+Math.floor(Math.random()*4);state.gold+=gold;state.souls[e.species]=(state.souls[e.species]||0)+soul;const ups=[];party().forEach(m=>{m.exp+=15+e.level*8;while(m.exp>=needExp(m.level)&&m.level<999){m.exp-=needExp(m.level);m.level++;m.hp=totalMaxHp(m);ups.push(`${m.name} Lv.${m.level}`)}});let drop=null;if(Math.random()<.28){drop=randomGear();state.gear.push(drop)}save();$("battle").classList.add("hidden");battleState=null;loot(captured?"✨":"🏆",captured?`${e.name}を捕獲！`:`${e.name}を撃破`,`${gold}G　魔魂×${soul}${drop?`<br>[${drop.rarity}] ${drop.name}`:""}${ups.length?`<br><span class="level-up">LEVEL UP：${ups.join("、")}</span>`:""}`)}
function defeat(){exploreSnapshot=null;activeEncounterEnemy=null;$("battle").classList.add("hidden");const lost=Math.floor(state.gold*.5);state.gold-=lost;state.floor=state.checkpoint;party().forEach(m=>m.hp=totalMaxHp(m));save();battleState=null;alert(`全滅！ ${lost}G失った。${state.checkpoint}階へ戻る`);renderHome();show("home")}
function loot(icon,title,body){setExplorationPaused(true);$("lootIcon").textContent=icon;$("lootTitle").textContent=title;$("lootBody").innerHTML=body;$("loot").classList.remove("hidden")}
$("lootClose").onclick=()=>{
  $("loot").classList.add("hidden");
  setExplorationPaused(false);
  if(state.inRun){
    startExplore({restore:!!exploreSnapshot});
  }else{
    exploreSnapshot=null;
    renderHome();
    show("home");
  }
};
function randomGear(){const slots=["weapon","armor","accessory"],slot=slots[Math.floor(Math.random()*3)],rarities=["R","R","SR","SR","SSR"],rarity=rarities[Math.floor(Math.random()*rarities.length)],mult={R:1,SR:1.6,SSR:2.4}[rarity],names={weapon:["鉄の剣","魔爪","炎刃"],armor:["革鎧","魔布のローブ","竜鱗鎧"],accessory:["旅人の指輪","幸運の護符","捕獲師の耳飾り"]}[slot],name=names[Math.floor(Math.random()*names.length)],stats=slot==="weapon"?{atk:Math.ceil((3+Math.random()*5)*mult),crit:Math.ceil(Math.random()*4*mult)}:slot==="armor"?{hp:Math.ceil((10+Math.random()*18)*mult),def:Math.ceil((1+Math.random()*4)*mult)}:{spd:Math.ceil((1+Math.random()*3)*mult),capture:Math.ceil((2+Math.random()*5)*mult)};return gear(slot,name,rarity,stats)}
$("autoBtn").onclick=()=>{
  battleState.auto=!battleState.auto;
  state.settings.autoBattle=battleState.auto;
  save();
  $("autoBtn").textContent=`AUTO ${battleState.auto?"ON":"OFF"}`;
  if(battleState.auto)command("attack");
};$("speedBtn").onclick=()=>{battleState.speed=battleState.speed===1?1.5:battleState.speed===1.5?2:1;$("speedBtn").textContent=`×${battleState.speed.toFixed(1)}`};$("escapeBtn").onclick=()=>{
  const e=battleState.enemy,p=Math.max(.15,.75-e.level*.015);
  if(Math.random()<p){
    $("battle").classList.add("hidden");
    battleState=null;
    clearEncounterWithoutRemoval();
    startExplore({restore:true});
  }else{
    effect("逃走失敗","#ff6877");
    enemyTurn();
  }
};
$("startBtn").onclick=()=>{state.inRun=true;save();startExplore()};$("returnBtn").onclick=()=>{if(confirm("帰還する？")){stopExplore();exploreSnapshot=null;activeEncounterEnemy=null;state.inRun=false;save();renderHome();show("home")}};$("leaveShop").onclick=()=>startExplore();
document.querySelector(".shop-grid").onclick=e=>{const b=e.target.closest("[data-shop]");if(!b)return;const t=b.dataset.shop;if(t==="bed"){if(state.gold<100)return alert("G不足");state.gold-=100;party().forEach(m=>m.hp=totalMaxHp(m));$("shopMessage").textContent="全回復した！"}if(t==="potion"){if(state.gold<50)return alert("G不足");state.gold-=50;state.items.potion++}if(t==="capture"){if(state.gold<80)return alert("G不足");state.gold-=80;state.items.capture++}if(t==="gear"){if(state.gold<180)return alert("G不足");state.gold-=180;state.gear.push(randomGear())}save()};

$("minimapToggle").onclick=()=>{
  state.settings.minimapVisible=!state.settings.minimapVisible;
  save();
  applyMinimapSetting();
};
$("resetBtn").onclick=()=>{if(confirm("本当に初期化する？")){localStorage.removeItem(KEY);location.reload()}};
let frames=0,ft=performance.now();function fps(now){frames++;if(now-ft>=500){$("fps").textContent=`${Math.round(frames*1000/(now-ft))} FPS`;frames=0;ft=now}requestAnimationFrame(fps)}
renderHome();if(state.inRun)startExplore();else show("home");requestAnimationFrame(fps);