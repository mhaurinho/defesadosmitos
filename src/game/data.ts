export type Team='blue'|'red';
export type Role='saci'|'curupira'|'iara'|'boitata'|'cuca'|'boto'|'mula'|'caipora'|'matinta'|'mapinguari';
export type Kind='hero'|'minion'|'tower'|'core';
export type Class='assassino'|'lutador'|'mago'|'tanque'|'suporte'|'atirador';
export interface Unit {id:number;team:Team;kind:Kind;role?:Role;x:number;y:number;hp:number;maxHp:number;mana:number;maxMana:number;attack:number;armor:number;range:number;speed:number;radius:number;cooldown:number;alive:boolean;respawn:number}
export interface Item {id:string;name:string;cost:number;attack?:number;hp?:number;armor?:number;speed?:number}
export interface HeroDef {name:string;title:string;class:Class;hp:number;mana:number;attack:number;armor:number;range:number;speed:number;q:string;w:string;e:string;r:string}
export const HEROES:Record<Role,HeroDef>={
 saci:{name:'Saci',title:'O Trapaceiro do Redemoinho',class:'assassino',hp:285,mana:220,attack:35,armor:2,range:55,speed:3.35,q:'Redemoinho',w:'Salto Travesso',e:'Fumaça Enganadora',r:'Tormenta do Saci'},
 curupira:{name:'Curupira',title:'Guardião das Matas',class:'lutador',hp:410,mana:170,attack:30,armor:6,range:65,speed:2.65,q:'Raízes Vivas',w:'Passos Invertidos',e:'Proteção da Mata',r:'Fúria da Floresta'},
 iara:{name:'Iara',title:'Voz das Águas',class:'mago',hp:275,mana:370,attack:23,armor:1,range:160,speed:2.5,q:'Canto das Águas',w:'Maré Restauradora',e:'Encanto',r:'Dilúvio'},
 boitata:{name:'Boitatá',title:'Serpente de Fogo',class:'mago',hp:340,mana:310,attack:28,armor:3,range:145,speed:2.5,q:'Chama Errante',w:'Escamas Incandescentes',e:'Rastro Ardente',r:'Incêndio Sagrado'},
 cuca:{name:'Cuca',title:'Feiticeira dos Sonhos',class:'mago',hp:290,mana:390,attack:25,armor:2,range:155,speed:2.45,q:'Pesadelo',w:'Caldeirão de Cura',e:'Sono Profundo',r:'Noite Sem Fim'},
 boto:{name:'Boto',title:'Encantador dos Rios',class:'suporte',hp:335,mana:350,attack:19,armor:4,range:145,speed:2.7,q:'Onda Encantada',w:'Bênção do Rio',e:'Disfarce',r:'Festa das Águas'},
 mula:{name:'Mula-sem-Cabeça',title:'Galope das Chamas',class:'lutador',hp:435,mana:180,attack:33,armor:5,range:60,speed:3.05,q:'Coice Flamejante',w:'Galope',e:'Brasa Persistente',r:'Investida Infernal'},
 caipora:{name:'Caipora',title:'Protetora dos Animais',class:'atirador',hp:310,mana:220,attack:34,armor:2,range:165,speed:2.85,q:'Dardo da Mata',w:'Sopro Vital',e:'Companheiro Selvagem',r:'Caçada Espiritual'},
 matinta:{name:'Matinta Pereira',title:'Assobio da Noite',class:'suporte',hp:305,mana:360,attack:21,armor:3,range:150,speed:2.75,q:'Assobio Sombrio',w:'Benção Noturna',e:'Asas da Sombra',r:'Agouro'},
 mapinguari:{name:'Mapinguari',title:'Gigante da Floresta',class:'tanque',hp:590,mana:145,attack:27,armor:10,range:55,speed:2.1,q:'Pancada Ancestral',w:'Regeneração Selvagem',e:'Pele Implacável',r:'Rugido Primordial'}
};
export const BLUE_TEAM:Role[]=['curupira','iara','saci','caipora','mapinguari'];
export const RED_TEAM:Role[]=['mula','boitata','cuca','boto','matinta'];
export const ITEMS:Item[]=[
{id:'blade',name:'Lâmina Solar',cost:120,attack:12},{id:'shield',name:'Escudo Rúnico',cost:120,hp:110},
{id:'mail',name:'Armadura Antiga',cost:140,armor:7},{id:'boots',name:'Botas do Vento',cost:110,speed:0.4},
{id:'scepter',name:'Cetro Astral',cost:260,attack:26},{id:'heart',name:'Coração Titânico',cost:290,hp:260}
];
export const physicalDamage=(raw:number,armor:number)=>Math.max(1,Math.round(raw*100/(100+Math.max(0,armor))));
export const FOUNTAIN_RADIUS=140;
export const FOUNTAIN_REGEN=0.012;
export const XP_SHARE_RADIUS=420;
export const PASSIVE_GOLD_TICKS=60;
