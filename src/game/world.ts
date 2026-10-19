import type {Role,Unit} from './data';
export type Phase='dawn'|'day'|'dusk'|'night';
export type Terrain='river'|'forest'|'mist'|'plain';
export type RuneKind='fury'|'ward'|'clarity'|'haste';
export interface Rune {id:number;x:number;y:number;kind:RuneKind;expiresAt:number}
export interface Environment {phase:Phase;clock:string;vision:number}
export const CYCLE_TICKS=60*180;
export const RUNE_SITES=[{x:540,y:150},{x:550,y:450},{x:550,y:300},{x:350,y:120},{x:750,y:480}] as const;
const RUNE_KINDS:RuneKind[]=['fury','ward','clarity','haste'];
export function environment(tick:number):Environment{
 const part=Math.floor((tick%CYCLE_TICKS)/(CYCLE_TICKS/4));
 const phase=(['dawn','day','dusk','night'] as const)[part];
 const hour=(6+Math.floor((tick%CYCLE_TICKS)/CYCLE_TICKS*24))%24;
 return {phase,clock:String(hour).padStart(2,'0')+':00',vision:phase==='night'?0.66:phase==='dusk'?0.8:phase==='dawn'?0.9:1};
}
export function terrainAt(x:number,y:number):Terrain{
 if(x>=475&&x<=625&&y>=65&&y<=535)return 'river';
 if((x>=190&&x<=420&&y<225)||(x>=680&&x<=910&&y>375))return 'forest';
 if((x>=310&&x<=490&&y>=380)||(x>=610&&x<=790&&y<210))return 'mist';
 return 'plain';
}
export interface TerrainBonus {speed:number;vision:number;damage:number;regen:number}
export function terrainBonus(role:Role|undefined,terrain:Terrain,phase:Phase):TerrainBonus{
 const b:TerrainBonus={speed:1,vision:1,damage:1,regen:0};
 if(!role)return b;
 if(terrain==='river'&&(role==='iara'||role==='boto')){b.speed=1.17;b.regen=0.2;b.damage=1.08;}
 if(terrain==='forest'&&(role==='curupira'||role==='caipora'||role==='mapinguari')){b.vision=1.25;b.damage=1.08;}
 if(terrain==='mist'&&(role==='saci'||role==='matinta')){b.vision=1.45;b.speed=1.13;}
 if(phase==='night'&&(role==='saci'||role==='matinta'||role==='cuca')){b.vision*=1.4;b.damage*=1.06;}
 if(phase==='day'&&role==='boitata')b.damage=1.1;
 return b;
}
export function visible(observer:Unit,target:Unit,tick:number):boolean{
 const env=environment(tick);
 const b=terrainBonus(observer.role,terrainAt(observer.x,observer.y),env.phase);
 const base=observer.kind==='tower'?240:observer.kind==='hero'?220:170;
 const distance=Math.hypot(observer.x-target.x,observer.y-target.y);
 return distance<=base*env.vision*b.vision;
}
export function spawnRune(tick:number,seq:number):Rune|null{
 if(tick===0||tick%(60*45)!==0)return null;
 const site=RUNE_SITES[(Math.floor(tick/(60*45))-1)%RUNE_SITES.length];
 return {id:seq,x:site.x,y:site.y,kind:RUNE_KINDS[(Math.floor(tick/(60*45))-1)%RUNE_KINDS.length],expiresAt:tick+60*25};
}
export function collectRune(hero:Unit,rune:Rune):string{
 switch(rune.kind){
 case 'fury':hero.attack+=7;return 'Runa da Fúria: +7 ataque nesta partida';
 case 'ward':hero.maxHp+=80;hero.hp+=80;return 'Runa do Guardião: +80 vida nesta partida';
 case 'clarity':hero.mana=Math.min(hero.maxMana,hero.mana+130);return 'Runa da Clareza: +130 mana';
 case 'haste':hero.speed+=0.25;return 'Runa do Vento: +0,25 velocidade nesta partida';
 }
}
