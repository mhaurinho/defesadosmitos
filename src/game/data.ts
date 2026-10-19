export type Team = 'blue' | 'red';
export type Role = 'guardian' | 'hunter' | 'mage' | 'oracle';
export type Kind = 'hero' | 'minion' | 'tower' | 'core';
export interface Unit { id:number; team:Team; kind:Kind; role?:Role; x:number; y:number; hp:number; maxHp:number; mana:number; maxMana:number; attack:number; armor:number; range:number; speed:number; radius:number; cooldown:number; alive:boolean; respawn:number }
export interface Item { id:string; name:string; cost:number; attack?:number; hp?:number; armor?:number; speed?:number }
export const ITEMS:Item[]=[
{id:'blade',name:'Lâmina Solar',cost:120,attack:12},
{id:'shield',name:'Escudo Rúnico',cost:120,hp:110},
{id:'mail',name:'Armadura Antiga',cost:140,armor:7},
{id:'boots',name:'Botas do Vento',cost:110,speed:0.4},
{id:'scepter',name:'Cetro Astral',cost:260,attack:26},
{id:'heart',name:'Coração Titânico',cost:290,hp:260}
];
export const HEROES:Record<Role,{name:string;hp:number;mana:number;attack:number;armor:number;range:number;speed:number}> = {
 guardian:{name:'Guardião',hp:470,mana:140,attack:23,armor:8,range:60,speed:2.25},
 hunter:{name:'Caçadora',hp:290,mana:200,attack:32,armor:2,range:150,speed:2.85},
 mage:{name:'Arcanista',hp:270,mana:340,attack:27,armor:1,range:165,speed:2.55},
 oracle:{name:'Oráculo',hp:330,mana:310,attack:19,armor:3,range:145,speed:2.65}
};
export const physicalDamage=(raw:number,armor:number)=>Math.max(1,Math.round(raw*100/(100+Math.max(0,armor))));
