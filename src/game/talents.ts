import type {Role,Unit} from './data';
export type Path='aggressive'|'guardian';
export type Mutation='echo'|'chain'|'execute'|'burn'|'curse'|'mark'|'lifesteal'|'pierce'|'silence'|'quake'|'relay'|'root'|'tide'|'aura'|'ward'|'bond'|'rescue'|'shield'|'veil'|'fortify';
export interface Talent {name:string;description:string;mutation:Mutation}
export interface HeroTalent {passive:{name:string;description:string};aggressive:Talent[];guardian:Talent[]}
const make=(passive:string,description:string,off:[string,string,Mutation],def:[string,string,Mutation]):HeroTalent=>({
 passive:{name:passive,description},
 aggressive:[{name:off[0],description:off[1],mutation:off[2]},{name:'Ressonância de '+off[0],description:'Amplia o efeito de mutação da habilidade.',mutation:off[2]},{name:'Apoteose de '+off[0],description:'Amplia novamente a mutação e reforça a sinergia.',mutation:off[2]}],
 guardian:[{name:def[0],description:def[1],mutation:def[2]},{name:'Ressonância de '+def[0],description:'Amplia o efeito de proteção ou utilidade.',mutation:def[2]},{name:'Apoteose de '+def[0],description:'Amplia novamente a proteção e o jogo em equipe.',mutation:def[2]}]
});
export const TALENTS:Record<Role,HeroTalent>={
 saci:make('Astúcia do Redemoinho','Manipula a posição do combate.',['Eco Travesso','Q repercute em inimigos próximos.','echo'],['Atalho de Vento','W transporta também um aliado próximo.','relay']),
 curupira:make('Guardião da Mata','A floresta responde a seus passos.',['Raiz Contagiosa','Q se propaga entre inimigos.','chain'],['Bosque de Refúgio','E protege aliados próximos.','root']),
 iara:make('Voz Encantadora','O canto governa a correnteza.',['Canto Final','Q causa mais dano em alvos enfraquecidos.','execute'],['Maré Compartilhada','W alcança aliados mais distantes.','tide']),
 boitata:make('Corpo Incandescente','As chamas marcam o campo.',['Fogo Vivo','Q deixa queimadura persistente.','burn'],['Brasa Guardiã','E fortalece aliados próximos.','aura']),
 cuca:make('Mestra dos Sonhos','Seus feitiços confundem a realidade.',['Pesadelo Recorrente','Q enfraquece a resistência dos atingidos.','curse'],['Caldeirão Coletivo','W amplia a recuperação dos aliados.','ward']),
 boto:make('Encanto das Águas','Encantos conectam os companheiros.',['Maré Marcada','Q marca o alvo para receber dano extra.','mark'],['Pacto do Rio','W restaura também mana dos aliados.','bond']),
 mula:make('Galope Ardente','O impulso gera perigo.',['Fogo de Retorno','Q recupera vida por dano causado.','lifesteal'],['Galope Salvador','W protege um aliado próximo.','rescue']),
 caipora:make('Pacto Selvagem','A caça conhece todos os caminhos.',['Flecha Transpassante','Q perfura resistências.','pierce'],['Abrigo Animal','W também concede proteção.','shield']),
 matinta:make('Presságio Noturno','Seu assobio antecipa o perigo.',['Agouro Mudo','Q interrompe temporariamente ataques.','silence'],['Véu Noturno','W protege aliados mais próximos.','veil']),
 mapinguari:make('Pele Ancestral','Sua presença altera o território.',['Abalo Primordial','Q repercute em uma área maior.','quake'],['Muralha Viva','E concede vida temporária aos aliados.','fortify'])
};
export interface TalentState {path:Path|null;rank:number;points:number}
export function availableTalentPoints(level:number){return Math.floor(level/3);}
export function allocateTalent(hero:Unit,state:TalentState,path:Path):{ok:boolean;message:string}{
 if(!hero.role)return {ok:false,message:'Herói inválido'};
 if(state.points<=0)return {ok:false,message:'Sem pontos de talento'};
 if(state.path&&state.path!==path)return {ok:false,message:'Especialização já escolhida'};
 if(state.rank>=3)return {ok:false,message:'Ramo completo'};
 const talent=TALENTS[hero.role][path][state.rank];
 state.path=path;state.rank++;state.points--;
 return {ok:true,message:'Mutação ativada: '+talent.name};
}
