import {FOUNTAIN_RADIUS,type Unit} from './data';
export type BotState='push'|'fight'|'retreat';
export function decideBot(unit:Unit,enemies:readonly Unit[]):{state:BotState;target?:Unit;x:number;y:number}{
 const candidates=enemies.filter(e=>e.alive&&e.team!==unit.team);
 const nearest=candidates.sort((a,b)=>Math.hypot(a.x-unit.x,a.y-unit.y)-Math.hypot(b.x-unit.x,b.y-unit.y))[0];
 const base={x:unit.team==='blue'?100:1000,y:300};
 const hpRatio=unit.hp/unit.maxHp;
 // Histerese: recua abaixo de 23% e só volta à rota após recuperar 90% na fonte.
 const atBase=Math.hypot(base.x-unit.x,base.y-unit.y)<FOUNTAIN_RADIUS;
 if(unit.kind==='hero'&&(hpRatio<0.23||(atBase&&hpRatio<0.9)))return {state:'retreat',...base};
 if(nearest&&Math.hypot(nearest.x-unit.x,nearest.y-unit.y)<230)return {state:'fight',target:nearest,x:nearest.x,y:nearest.y};
 return {state:'push',x:unit.team==='blue'?1045:55,y:300};
}
