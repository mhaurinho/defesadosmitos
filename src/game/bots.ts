import {FOUNTAIN_RADIUS,type Unit} from './data';
import {SKILLS,canCast,type Slot} from './skills';
import {laneTarget} from './lanes';
export type BotState='push'|'fight'|'retreat'|'hold';
/** Torre inimiga sem nenhuma tropa aliada dentro do alcance dela: herói IA não deve entrar. */
export function uncoveredTowers(unit:Unit,enemies:readonly Unit[],allies:readonly Unit[]):Unit[]{
 return enemies.filter(e=>e.alive&&e.kind==='tower'&&!allies.some(a=>a.alive&&a.kind==='minion'&&Math.hypot(a.x-e.x,a.y-e.y)<e.range));
}
export function decideBot(unit:Unit,enemies:readonly Unit[],allies:readonly Unit[]=[]):{state:BotState;target?:Unit;x:number;y:number}{
 const danger=unit.kind==='hero'?uncoveredTowers(unit,enemies,allies):[];
 const underTower=(p:{x:number;y:number},margin=0)=>danger.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<t.range+margin);
 // Heróis IA ignoram alvos protegidos por torre descoberta, mas tropas lutam com tudo.
 const candidates=enemies.filter(e=>e.alive&&e.team!==unit.team&&(unit.kind!=='hero'||(!danger.includes(e)&&!underTower(e))));
 const nearest=candidates.sort((a,b)=>Math.hypot(a.x-unit.x,a.y-unit.y)-Math.hypot(b.x-unit.x,b.y-unit.y))[0];
 const base={x:unit.team==='blue'?100:1000,y:300};
 const hpRatio=unit.hp/unit.maxHp;
 // Histerese: recua abaixo de 23% e só volta à rota após recuperar 90% na fonte.
 const atBase=Math.hypot(base.x-unit.x,base.y-unit.y)<FOUNTAIN_RADIUS;
 if(unit.kind==='hero'&&(hpRatio<0.23||(atBase&&hpRatio<0.9)))return {state:'retreat',...base};
 // Tropas têm aggro curto para não abandonarem a própria rota.
 const aggro=unit.kind==='minion'?140:230;
 if(nearest&&Math.hypot(nearest.x-unit.x,nearest.y-unit.y)<aggro)return {state:'fight',target:nearest,x:nearest.x,y:nearest.y};
 const lane=laneTarget(unit);
 const blocking=danger.find(t=>Math.hypot(t.x-unit.x,t.y-unit.y)<t.range+unit.radius+70);
 if(blocking)return {state:'hold',x:blocking.x+(unit.team==='blue'?-1:1)*(blocking.range+60),y:blocking.y};
 if(lane)return {state:'push',...lane};
 return {state:'push',x:unit.team==='blue'?1045:55,y:300};
}
export type BotDecision=ReturnType<typeof decideBot>;
const dist=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
/** Escolhe no máximo uma habilidade por avaliação, priorizando ultimate, dano/controle, cura, defesa e deslocamento. */
export function decideBotCast(unit:Unit,decision:BotDecision,enemies:readonly Unit[],allies:readonly Unit[],cooldowns:Record<Slot,number>):{slot:Slot;aim:{x:number;y:number}}|null{
 if(!unit.role)return null;
 const kit=SKILLS[unit.role];
 const ready=(slot:Slot)=>canCast(unit,slot,cooldowns,unit.level).ok;
 const enemyHeroesNear=(radius:number)=>enemies.filter(e=>e.alive&&e.kind==='hero'&&dist(unit,e)<radius+e.radius);
 const unitsNear=(radius:number)=>enemies.filter(e=>e.alive&&e.kind!=='core'&&dist(unit,e)<radius+e.radius);
 const hold={x:unit.x,y:unit.y};
 for(const slot of ['r','q','e','w'] as const){
  if(!ready(slot))continue;
  const skill=kit[slot];
  if(skill.kind==='burst'||skill.kind==='control'){
   const heroes=enemyHeroesNear(skill.radius);
   if(skill.ultimate?heroes.length>=2||heroes.some(h=>h.hp/h.maxHp<0.5):heroes.length>=1||unitsNear(skill.radius).length>=3)return {slot,aim:hold};
  }else if(skill.kind==='heal'){
   const wounded=skill.radius===0?unit.hp/unit.maxHp<0.55:allies.some(a=>a.alive&&a.hp/a.maxHp<0.6&&dist(unit,a)<skill.radius);
   if(wounded)return {slot,aim:hold};
  }else if(skill.kind==='guard'){
   if(unit.hp/unit.maxHp<0.5&&enemyHeroesNear(250).length)return {slot,aim:hold};
  }else if(skill.kind==='dash'){
   if(decision.state==='retreat'&&enemyHeroesNear(250).length)return {slot,aim:{x:decision.x,y:decision.y}};
   const t=decision.target;
   if(decision.state==='fight'&&t?.kind==='hero'&&t.hp/t.maxHp<0.5&&dist(unit,t)>unit.range+t.radius)return {slot,aim:{x:t.x,y:t.y}};
  }
 }
 return null;
}
