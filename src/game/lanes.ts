import type {Team,Unit} from './data';
export type Lane='top'|'mid'|'bot';
export const LANES:readonly Lane[]=['top','mid','bot'];
export const LANE_Y:Record<Lane,number>={top:80,mid:300,bot:520};
/** Distribuição 2-1-2 dos heróis IA por rota, na ordem em que são criados. */
export const HERO_LANES:readonly Lane[]=['top','mid','bot','top','bot'];
const WAYPOINT_REACHED=12;
const mirror=(p:{x:number;y:number})=>({x:1100-p.x,y:p.y});
/** Caminho de uma rota do ponto de vista do time; o vermelho é o espelho horizontal do azul. */
export function lanePath(team:Team,lane:Lane):{x:number;y:number}[]{
 const y=LANE_Y[lane];
 const blue=lane==='mid'?[{x:1045,y:300}]:[{x:160,y},{x:940,y},{x:1045,y:300}];
 return team==='blue'?blue:blue.map(mirror);
}
/** Torres de uma rota: posição da torre azul; a vermelha é espelhada. */
export function towerSpot(team:Team,lane:Lane){const p={x:lane==='mid'?330:300,y:LANE_Y[lane]};return team==='blue'?p:mirror(p);}
export function advanceWaypoint(u:Unit){
 if(!u.lane)return;
 const path=lanePath(u.team,u.lane);let i=u.waypoint??0;
 while(i<path.length-1&&Math.hypot(path[i].x-u.x,path[i].y-u.y)<WAYPOINT_REACHED)i++;
 u.waypoint=i;
}
export function laneTarget(u:Unit):{x:number;y:number}|null{
 if(!u.lane)return null;
 const path=lanePath(u.team,u.lane);return path[Math.min(u.waypoint??0,path.length-1)];
}
