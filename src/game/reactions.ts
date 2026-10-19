/**
 * Sistema de reações emergentes: não referencia IDs de heróis nem duplas fixas.
 * Toda habilidade pode emitir tags e qualquer outra habilidade pode reagir.
 */
export type Element='fire'|'water'|'nature'|'wind'|'shadow'|'dream'|'beast'|'spirit';
export type Condition='wet'|'rooted'|'burning'|'exposed'|'drowsy'|'displaced'|'shielded';
export interface Effect {condition:Condition;expiresAt:number;sourceId:number}
export interface Reaction {id:string;requires:readonly Condition[];trigger:Element;consumes:readonly Condition[];applies:Condition|null;bonusDamage:number;description:string}
export const REACTIONS:readonly Reaction[]=[
 {id:'steam',requires:['wet'],trigger:'fire',consumes:['wet'],applies:'exposed',bonusDamage:22,description:'Vapor escaldante: alvo molhado recebe fogo e fica exposto'},
 {id:'wildfire',requires:['rooted'],trigger:'fire',consumes:[],applies:'burning',bonusDamage:18,description:'Raízes inflamáveis'},
 {id:'conduct',requires:['wet'],trigger:'spirit',consumes:[],applies:'exposed',bonusDamage:16,description:'Energia espiritual percorre a água'},
 {id:'spread',requires:['burning'],trigger:'wind',consumes:[],applies:'displaced',bonusDamage:14,description:'Vento alimenta as chamas'},
 {id:'nightmare',requires:['drowsy'],trigger:'shadow',consumes:['drowsy'],applies:'exposed',bonusDamage:26,description:'Sombra desperta o pesadelo'},
 {id:'overgrowth',requires:['wet'],trigger:'nature',consumes:[],applies:'rooted',bonusDamage:10,description:'Água faz a vegetação crescer'},
 {id:'hunt',requires:['exposed'],trigger:'beast',consumes:['exposed'],applies:null,bonusDamage:32,description:'Predador encontra alvo vulnerável'},
 {id:'gust',requires:['rooted'],trigger:'wind',consumes:[],applies:'displaced',bonusDamage:12,description:'Vendaval rompe o equilíbrio'}
];
export const ELEMENTS:Record<string,Element>={
 saci:'wind',curupira:'nature',iara:'water',boitata:'fire',cuca:'dream',
 boto:'water',mula:'fire',caipora:'beast',matinta:'shadow',mapinguari:'spirit'
};
export const BASE_CONDITIONS:Partial<Record<Element,Condition>>={
 water:'wet',nature:'rooted',fire:'burning',dream:'drowsy',wind:'displaced',shadow:'drowsy',beast:'exposed'
};
export interface ReactionResult {damage:number;reactions:string[];effects:Effect[]}
export function react(effects:readonly Effect[],element:Element,sourceId:number,now:number):ReactionResult{
 const active=effects.filter(e=>e.expiresAt>now);
 const present=new Set(active.map(e=>e.condition));
 const triggered=REACTIONS.filter(r=>r.trigger===element&&r.requires.every(c=>present.has(c)));
 const consumed=new Set(triggered.flatMap(r=>[...r.consumes]));
 const next=active.filter(e=>!consumed.has(e.condition));
 const add=(condition:Condition)=>{const i=next.findIndex(e=>e.condition===condition);if(i>=0)next.splice(i,1);next.push({condition,sourceId,expiresAt:now+180});};
 for(const reaction of triggered)if(reaction.applies)add(reaction.applies);
 const base=BASE_CONDITIONS[element];if(base)add(base);
 return {damage:triggered.reduce((n,r)=>n+r.bonusDamage,0),reactions:triggered.map(r=>r.id),effects:next};
}
