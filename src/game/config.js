export const VERSION="0.0.5";
export const TILE_SIZE=48;
export const MAP_COLUMNS=31;
export const MAP_ROWS=31;
export const SAVE_KEY="abyss-dominion-v005";
export const CAMERA={minZoom:.45,maxZoom:1.55,defaultZoom:.85,doubleTapDelay:280,dragThreshold:8};
export const AREAS=[
{name:"地下洞窟",start:1,end:49,floor:"#49345a",wall:"#21172d",accent:"#8a62ac"},
{name:"灼熱火山",start:50,end:99,floor:"#5a2c25",wall:"#281314",accent:"#ef704c"},
{name:"毒沼",start:100,end:149,floor:"#3c2947",wall:"#1b1322",accent:"#9bd653"},
{name:"深淵ジャングル",start:150,end:199,floor:"#234233",wall:"#11231a",accent:"#68d59a"}
];
export function areaFor(floor){return AREAS.find(a=>floor>=a.start&&floor<=a.end)??AREAS[0]}
