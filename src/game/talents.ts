import type {Role,Unit} from './data';
export type Path='aggressive'|'guardian';
export interface Talent {name:string;description:string;attack?:number;hp?:number;armor?:number;speed?:number;mana?:number}
export interface HeroTalent {passive:{name:string;description:string};aggressive:Talent[];guardian:Talent[]}
const paths=(passive:string,desc:string,attack:string,defense:string):HeroTalent=>({
 passive:{name:passive,description:desc},
 aggressive:[{name:attack+' I',description:'+8 ataque',attack:8},{name:attack+' II',description:'+12 ataque',attack:12},{name:attack+' III',description:'+18 ataque',attack:18}],
 guardian:[{name:defense+' I',description:'+75 vida',hp:75},{name:defense+' II',description:'+5 armadura',armor:5},{name:defense+' III',description:'+125 vida e +3 armadura',hp:125,armor:3}]
});
export const TALENTS:Record<Role,HeroTalent>={
 saci:paths('Astúcia do Redemoinho','Mobilidade elevada e estilo evasivo.','Travessura Mortal','Fuga Ilusória'),
 curupira:paths('Guardião da Mata','Resistência natural ao proteger a floresta.','Vingança Verde','Raízes Protetoras'),
 iara:paths('Voz Encantadora','Magia das águas fortalece sua presença.','Canto Devastador','Maré Restauradora'),
 boitata:paths('Corpo Incandescente','Fogo ancestral emana da serpente.','Chama Voraz','Escamas Eternas'),
 cuca:paths('Mestra dos Sonhos','A feitiçaria se alimenta de ilusões.','Pesadelo Cruel','Caldeirão Protetor'),
 boto:paths('Encanto das Águas','A presença do boto inspira aliados.','Correnteza Ofensiva','Benção do Rio'),
 mula:paths('Galope Ardente','Investidas aceleram o ritmo do combate.','Coice Incendiário','Couraça de Brasa'),
 caipora:paths('Pacto Selvagem','A fauna responde à protetora.','Caçada Implacável','Abrigo da Mata'),
 matinta:paths('Presságio Noturno','Seu assobio anuncia a noite.','Agouro Fatal','Asas Protetoras'),
 mapinguari:paths('Pele Ancestral','O gigante resiste ao avanço inimigo.','Fúria Primordial','Fortaleza da Selva')
};
export interface TalentState {path:Path|null;rank:number;points:number}
export function availableTalentPoints(level:number){return Math.floor(level/3);}
export function allocateTalent(hero:Unit,state:TalentState,path:Path):{ok:boolean;message:string}{
 if(!hero.role)return {ok:false,message:'Herói inválido'};
 if(state.points<=0)return {ok:false,message:'Sem pontos de talento'};
 if(state.path&&state.path!==path)return {ok:false,message:'Especialização já escolhida'};
 if(state.rank>=3)return {ok:false,message:'Ramo completo'};
 const talent=TALENTS[hero.role][path][state.rank];
 hero.attack+=talent.attack??0;hero.armor+=talent.armor??0;hero.speed+=talent.speed??0;
 if(talent.hp){hero.maxHp+=talent.hp;hero.hp+=talent.hp;}
 if(talent.mana){hero.maxMana+=talent.mana;hero.mana+=talent.mana;}
 state.path=path;state.rank++;state.points--;
 return {ok:true,message:'Talento aprendido: '+talent.name};
}
