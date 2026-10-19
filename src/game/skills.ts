import type {Role,Unit} from './data';
import type {CcSpec} from './status';
export type Slot='q'|'w'|'e'|'r';
export interface Skill {name:string;kind:'burst'|'heal'|'dash'|'guard'|'control';cost:number;cooldown:number;power:number;radius:number;ultimate:boolean;cc?:CcSpec}
const defs:Record<Role,Record<Slot,Skill>>={
 saci:{q:{name:'Redemoinho',kind:'burst',cost:45,cooldown:150,power:58,radius:145,ultimate:false},w:{name:'Salto Travesso',kind:'dash',cost:35,cooldown:200,power:95,radius:0,ultimate:false},e:{name:'Fumaça Enganadora',kind:'guard',cost:40,cooldown:220,power:35,radius:0,ultimate:false},r:{name:'Tormenta do Saci',kind:'burst',cost:110,cooldown:750,power:175,radius:200,ultimate:true}},
 curupira:{q:{name:'Raízes Vivas',kind:'control',cost:45,cooldown:160,power:46,radius:140,ultimate:false,cc:{kind:'root',ticks:72}},w:{name:'Passos Invertidos',kind:'dash',cost:35,cooldown:220,power:75,radius:0,ultimate:false},e:{name:'Proteção da Mata',kind:'guard',cost:40,cooldown:260,power:65,radius:0,ultimate:false},r:{name:'Fúria da Floresta',kind:'burst',cost:110,cooldown:800,power:155,radius:190,ultimate:true}},
 iara:{q:{name:'Canto das Águas',kind:'burst',cost:45,cooldown:150,power:65,radius:165,ultimate:false},w:{name:'Maré Restauradora',kind:'heal',cost:40,cooldown:210,power:90,radius:170,ultimate:false},e:{name:'Encanto',kind:'control',cost:55,cooldown:240,power:45,radius:140,ultimate:false,cc:{kind:'slow',ticks:120,power:0.45}},r:{name:'Dilúvio',kind:'burst',cost:130,cooldown:850,power:170,radius:210,ultimate:true}},
 boitata:{q:{name:'Chama Errante',kind:'burst',cost:45,cooldown:150,power:70,radius:150,ultimate:false},w:{name:'Escamas Incandescentes',kind:'guard',cost:35,cooldown:220,power:65,radius:0,ultimate:false},e:{name:'Rastro Ardente',kind:'burst',cost:55,cooldown:260,power:65,radius:155,ultimate:false},r:{name:'Incêndio Sagrado',kind:'burst',cost:130,cooldown:850,power:185,radius:200,ultimate:true}},
 cuca:{q:{name:'Pesadelo',kind:'burst',cost:50,cooldown:160,power:65,radius:160,ultimate:false},w:{name:'Caldeirão de Cura',kind:'heal',cost:40,cooldown:210,power:90,radius:160,ultimate:false},e:{name:'Sono Profundo',kind:'control',cost:55,cooldown:260,power:48,radius:140,ultimate:false,cc:{kind:'stun',ticks:78}},r:{name:'Noite Sem Fim',kind:'control',cost:130,cooldown:850,power:130,radius:210,ultimate:true,cc:{kind:'stun',ticks:105}}},
 boto:{q:{name:'Onda Encantada',kind:'burst',cost:45,cooldown:160,power:55,radius:145,ultimate:false},w:{name:'Bênção do Rio',kind:'heal',cost:35,cooldown:190,power:100,radius:170,ultimate:false},e:{name:'Disfarce',kind:'guard',cost:45,cooldown:250,power:60,radius:0,ultimate:false},r:{name:'Festa das Águas',kind:'heal',cost:110,cooldown:780,power:195,radius:230,ultimate:true}},
 mula:{q:{name:'Coice Flamejante',kind:'burst',cost:40,cooldown:155,power:68,radius:115,ultimate:false},w:{name:'Galope',kind:'dash',cost:35,cooldown:210,power:105,radius:0,ultimate:false},e:{name:'Brasa Persistente',kind:'guard',cost:40,cooldown:245,power:65,radius:0,ultimate:false},r:{name:'Investida Infernal',kind:'burst',cost:100,cooldown:790,power:165,radius:165,ultimate:true}},
 caipora:{q:{name:'Dardo da Mata',kind:'burst',cost:45,cooldown:140,power:67,radius:185,ultimate:false},w:{name:'Sopro Vital',kind:'heal',cost:35,cooldown:210,power:75,radius:140,ultimate:false},e:{name:'Companheiro Selvagem',kind:'guard',cost:45,cooldown:250,power:55,radius:0,ultimate:false},r:{name:'Caçada Espiritual',kind:'burst',cost:110,cooldown:810,power:185,radius:215,ultimate:true}},
 matinta:{q:{name:'Assobio Sombrio',kind:'control',cost:45,cooldown:160,power:55,radius:150,ultimate:false,cc:{kind:'silence',ticks:120}},w:{name:'Bênção Noturna',kind:'heal',cost:35,cooldown:195,power:95,radius:170,ultimate:false},e:{name:'Asas da Sombra',kind:'dash',cost:45,cooldown:240,power:90,radius:0,ultimate:false},r:{name:'Agouro',kind:'control',cost:110,cooldown:830,power:150,radius:205,ultimate:true,cc:{kind:'silence',ticks:150}}},
 mapinguari:{q:{name:'Pancada Ancestral',kind:'burst',cost:35,cooldown:150,power:60,radius:105,ultimate:false},w:{name:'Regeneração Selvagem',kind:'heal',cost:35,cooldown:220,power:115,radius:0,ultimate:false},e:{name:'Pele Implacável',kind:'guard',cost:40,cooldown:260,power:95,radius:0,ultimate:false},r:{name:'Rugido Primordial',kind:'control',cost:95,cooldown:800,power:120,radius:170,ultimate:true,cc:{kind:'stun',ticks:90}}}
};
export const SKILLS=defs;
export function canCast(hero:Unit,slot:Slot,cooldowns:Record<Slot,number>,level:number):{ok:boolean;reason:string}{
 if(!hero.role)return {ok:false,reason:'Sem herói'};
 const skill=SKILLS[hero.role][slot];
 if(slot==='r'&&level<6)return {ok:false,reason:'Ultimate disponível no nível 6'};
 if(cooldowns[slot]>0)return {ok:false,reason:'Habilidade recarregando'};
 if(hero.mana<skill.cost)return {ok:false,reason:'Mana insuficiente'};
 return {ok:true,reason:''};
}
