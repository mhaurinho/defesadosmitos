import type {Unit} from './data';
export type CcKind='stun'|'root'|'slow'|'silence';
/** Controle aplicado por uma habilidade: duração em ticks e, para lentidão, fração de velocidade removida. */
export interface CcSpec {kind:CcKind;ticks:number;power?:number}
interface Cc {kind:CcKind;until:number;power:number}
const HARD:readonly CcKind[]=['stun','root'];
/** Após um controle duro, o alvo fica imune a novos controles duros por este tempo, evitando travamento em cadeia. */
export const HARD_CC_IMMUNITY=60;
export class StatusBook {
 private active=new Map<number,Cc[]>();
 private hardImmuneUntil=new Map<number,number>();
 clear(){this.active.clear();this.hardImmuneUntil.clear();}
 apply(u:Unit,spec:CcSpec,now:number):boolean{
  if(!u.alive||(u.kind!=='hero'&&u.kind!=='minion'))return false;
  const hard=HARD.includes(spec.kind);
  if(hard&&(this.hardImmuneUntil.get(u.id)??0)>now)return false;
  const list=(this.active.get(u.id)??[]).filter(c=>c.until>now);
  list.push({kind:spec.kind,until:now+spec.ticks,power:spec.power??0});
  this.active.set(u.id,list);
  if(hard)this.hardImmuneUntil.set(u.id,now+spec.ticks+HARD_CC_IMMUNITY);
  return true;
 }
 has(u:Unit,kind:CcKind,now:number){return (this.active.get(u.id)??[]).some(c=>c.kind===kind&&c.until>now);}
 canMove(u:Unit,now:number){return !this.has(u,'stun',now)&&!this.has(u,'root',now);}
 canAttack(u:Unit,now:number){return !this.has(u,'stun',now);}
 canCast(u:Unit,now:number){return !this.has(u,'stun',now)&&!this.has(u,'silence',now);}
 /** Multiplicador de velocidade: vale a lentidão mais forte ativa. */
 speedMult(u:Unit,now:number){return 1-Math.max(0,...(this.active.get(u.id)??[]).filter(c=>c.kind==='slow'&&c.until>now).map(c=>c.power));}
 kinds(u:Unit,now:number):CcKind[]{return [...new Set((this.active.get(u.id)??[]).filter(c=>c.until>now).map(c=>c.kind))];}
 forget(u:Unit){this.active.delete(u.id);}
}
