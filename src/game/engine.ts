import {HEROES,BLUE_TEAM,RED_TEAM,FOUNTAIN_RADIUS,FOUNTAIN_REGEN,TOWER_HP,CORE_HP,SKILL_STRUCTURE_MULT,TOWER_HERO_MULT,PASSIVE_GOLD_TICKS,XP_SHARE_RADIUS,physicalDamage,type Unit,type Team,type Role,type Item} from './data';
import {decideBot,decideBotCast} from './bots';
import {HERO_LANES,LANES,advanceWaypoint,towerSpot} from './lanes';
import {buyItem} from './economy';
import {allocateTalent,availableTalentPoints,TALENTS,type Path,type TalentState,type Mutation} from './talents';
import {SKILLS,canCast,type Slot} from './skills';
import {ELEMENTS,react,type Effect} from './reactions';
import {collectRune,environment,spawnRune,terrainAt,terrainBonus,visible,type Rune} from './world';
export class Game {
 runes:Rune[]=[];private runeSeq=0;effects=new Map<number,Effect[]>();talents:TalentState={path:null,rank:0,points:0}; units:Unit[]=[]; hero!:Unit; bot!:Unit; inventory:Item[]=[];gold=0;kills=0;tick=0;winner:Team|null=null;notice='';qCooldown=0;wCooldown=0;cooldowns:Record<Slot,number>={q:0,w:0,e:0,r:0};skillCooldowns=new Map<number,Record<Slot,number>>();
 get level(){return this.hero.level;}
 get xp(){return this.hero.xp;}
 destination={x:170,y:300};private nextId=0;private role:Role='curupira';
 constructor(role:Role='curupira'){this.reset(role);}
 private spawn(team:Team,kind:Unit['kind'],x:number,y:number,stats:Partial<Unit>):Unit{
 const u:Unit={id:++this.nextId,team,kind,x,y,hp:80,maxHp:80,mana:0,maxMana:0,attack:10,armor:0,range:38,speed:0.8,radius:11,cooldown:0,alive:true,respawn:0,level:1,xp:0,...stats};
 this.units.push(u);return u;
 }
 reset(role:Role=this.role){
 this.role=role;this.runes=[];this.runeSeq=0;this.effects.clear();this.talents={path:null,rank:0,points:0};this.units=[];this.nextId=0;this.inventory=[];this.gold=0;this.kills=0;this.skillCooldowns.clear();this.tick=0;this.winner=null;this.notice='';this.qCooldown=0;this.wCooldown=0;this.cooldowns={q:0,w:0,e:0,r:0};
 const s=HEROES[role];this.hero=this.spawn('blue','hero',170,300,{role,hp:s.hp,maxHp:s.hp,mana:s.mana,maxMana:s.mana,attack:s.attack,armor:s.armor,range:s.range,speed:s.speed,radius:18});
 const allied=BLUE_TEAM.filter(r=>r!==role).slice(0,4);
 // Seleção livre: o herói escolhido substitui o primeiro slot da composição original.
 const enemyRoles=RED_TEAM.filter(r=>r!==role);
 // Completa o time vermelho com quem sobrou do azul, sem repetir aliados nem o escolhido.
 while(enemyRoles.length<5){const candidate=BLUE_TEAM.find(r=>r!==role&&!enemyRoles.includes(r)&&!allied.includes(r));if(!candidate)break;enemyRoles.push(candidate);}
 for(const [i,r] of allied.entries()){const b=HEROES[r];this.spawn('blue','hero',155+i*22,230+i*36,{lane:HERO_LANES[i],waypoint:0,role:r,hp:b.hp,maxHp:b.hp,mana:b.mana,maxMana:b.mana,attack:b.attack,armor:b.armor,range:b.range,speed:b.speed,radius:18});}
 for(const [i,r] of enemyRoles.entries()){const b=HEROES[r];const enemy=this.spawn('red','hero',945-i*22,230+i*36,{lane:HERO_LANES[i],waypoint:0,role:r,hp:b.hp,maxHp:b.hp,mana:b.mana,maxMana:b.mana,attack:b.attack,armor:b.armor,range:b.range,speed:b.speed,radius:18});if(i===0)this.bot=enemy;}

 this.spawn('blue','core',55,300,{hp:CORE_HP,maxHp:CORE_HP,radius:36,attack:0,speed:0});
 this.spawn('red','core',1045,300,{hp:CORE_HP,maxHp:CORE_HP,radius:36,attack:0,speed:0});
 for(const team of ['blue','red'] as const)for(const lane of LANES){const p=towerSpot(team,lane);this.spawn(team,'tower',p.x,p.y,{lane,hp:TOWER_HP,maxHp:TOWER_HP,attack:24,armor:8,range:165,speed:0,radius:23});}
 for(const u of this.units)if(u.kind==='hero')this.skillCooldowns.set(u.id,{q:0,w:0,e:0,r:0});
 this.cooldowns=this.skillCooldowns.get(this.hero.id)!;
 this.destination={x:170,y:300};
 }
 move(x:number,y:number){this.destination={x:Math.max(20,Math.min(1080,x)),y:Math.max(40,Math.min(560,y))};}
 chooseTalent(path:Path){const result=allocateTalent(this.hero,this.talents,path);this.notice=result.message;return result.ok;}
 buy(id:string){if(!this.hero.alive)return;const result=buyItem(id,this.gold,this.inventory,this.hero);this.gold=result.gold;this.inventory=result.inventory;this.notice=result.message;}
 cast(slot:Slot){
 if(!this.hero.alive||this.winner)return;
 const check=canCast(this.hero,slot,this.cooldowns,this.level);
 if(!check.ok){this.notice=check.reason;return;}
 const skill=SKILLS[this.hero.role!][slot];
 this.notice=skill.name+(skill.ultimate?' — ULTIMATE!':'');
 // castFor pode sobrescrever o aviso com a reação elemental disparada.
 this.castFor(this.hero,slot,this.destination);
 }
 /** Executa a habilidade para qualquer herói; mutações de talento só existem para o jogador. */
 private castFor(caster:Unit,slot:Slot,aim:{x:number;y:number}){
 const cooldowns=this.skillCooldowns.get(caster.id)!;
 const skill=SKILLS[caster.role!][slot];
 caster.mana-=skill.cost;cooldowns[slot]=skill.cooldown;
 const isPlayer=caster===this.hero;
 const enemyTeam:Team=caster.team==='blue'?'red':'blue';
 const mutation:Mutation|null=isPlayer&&this.talents.path?TALENTS[caster.role!][this.talents.path][0].mutation:null;
 const rank=this.talents.rank;
 const attackMutation=this.talents.path==='aggressive'?mutation:null;
 const supportMutation=this.talents.path==='guardian'?mutation:null;
 const rangeBonus=attackMutation==='quake'?40*rank:attackMutation==='chain'?25*rank:0;
 if(skill.kind==='burst'||skill.kind==='control'){
  for(const target of [...this.units])if(target.alive&&target.team===enemyTeam&&this.distance(caster,target)<skill.radius+rangeBonus+target.radius){
   const low=target.hp/target.maxHp<0.4;
   const mult=attackMutation==='execute'&&low?1+0.3*rank:attackMutation==='pierce'?1+0.12*rank:attackMutation==='echo'?1+0.1*rank:1;
   const dealt=Math.round((skill.power+caster.level*4)*mult);
   this.hit(target,dealt,caster,true);
   const element=ELEMENTS[caster.role!];const result=react(this.effects.get(target.id)??[],element,caster.id,this.tick);
   this.effects.set(target.id,result.effects);
   if(result.damage)this.hit(target,result.damage,caster,true);
   if(isPlayer&&result.reactions.length)this.notice='Reação: '+result.reactions.join(' + ');
   if(attackMutation==='lifesteal')caster.hp=Math.min(caster.maxHp,caster.hp+Math.round(dealt*0.15*rank));
   if(attackMutation==='burn')this.hit(target,Math.round(12*rank),caster,true);
   if(attackMutation==='curse')target.armor=Math.max(0,target.armor-rank);
   if(attackMutation==='mark')this.hit(target,10*rank,caster,true);
   if(attackMutation==='silence')target.cooldown=Math.max(target.cooldown,20*rank);
  }
 }else if(skill.kind==='heal'){
  for(const ally of this.units)if(ally.alive&&ally.kind==='hero'&&ally.team===caster.team&&(skill.radius===0?ally.id===caster.id:this.distance(caster,ally)<skill.radius+(supportMutation==='tide'?45*rank:0))) {
   ally.hp=Math.min(ally.maxHp,ally.hp+Math.round(skill.power+caster.level*5));
   if(supportMutation==='bond')ally.mana=Math.min(ally.maxMana,ally.mana+15*rank);
   if(supportMutation==='shield'||supportMutation==='veil')ally.hp=Math.min(ally.maxHp,ally.hp+20*rank);
  }
 }else if(skill.kind==='guard'){
  caster.hp=Math.min(caster.maxHp,caster.hp+Math.round(skill.power));
  if(supportMutation==='root'||supportMutation==='aura'||supportMutation==='ward'||supportMutation==='fortify')for(const ally of this.units)if(ally.alive&&ally.team===caster.team&&this.distance(caster,ally)<160)ally.hp=Math.min(ally.maxHp,ally.hp+25*rank);
 }else if(skill.kind==='dash'){
  const dx=aim.x-caster.x,dy=aim.y-caster.y,d=Math.hypot(dx,dy);
  if(d>1){const step=Math.min(d,skill.power);caster.x=Math.max(20,Math.min(1080,caster.x+dx/d*step));caster.y=Math.max(40,Math.min(560,caster.y+dy/d*step));}
  if(supportMutation==='relay'||supportMutation==='rescue')for(const ally of this.units)if(ally.alive&&ally.team===caster.team&&ally.id!==caster.id&&this.distance(caster,ally)<110){ally.hp=Math.min(ally.maxHp,ally.hp+20*rank);break;}
 }
 this.qCooldown=this.cooldowns.q;this.wCooldown=this.cooldowns.w;
 }
 private distance(a:Unit,b:Unit){return Math.hypot(a.x-b.x,a.y-b.y);}
 private moveUnit(u:Unit,x:number,y:number){const d=Math.hypot(x-u.x,y-u.y);if(d>0.5){const bonus=terrainBonus(u.role,terrainAt(u.x,u.y),environment(this.tick).phase);const n=Math.min(u.speed*bonus.speed,d);u.x+=(x-u.x)/d*n;u.y+=(y-u.y)/d*n;}}
 private hit(target:Unit,raw:number,source:Unit,magic=false){
 if(!target.alive)return;
 const structure=target.kind==='tower'||target.kind==='core';
 target.hp=Math.max(0,target.hp-(magic?Math.round(raw*(structure?SKILL_STRUCTURE_MULT:1)):physicalDamage(raw,target.armor)));
 if(target.hp>0)return;
 target.alive=false;
 if(target.kind==='core'){this.winner=source.team;this.notice=source.team==='blue'?'Vitória!':'Derrota!';}
 if(target.team==='red'){
 // Ouro só no último golpe do herói; torre derrubada paga o time inteiro. XP é compartilhada por proximidade.
 if(source===this.hero){this.gold+=target.kind==='minion'?30:target.kind==='hero'?120:0;if(target.kind==='minion')this.kills++;}
 if(target.kind==='tower')this.gold+=170;
}
 const xp=target.kind==='minion'?20:target.kind==='hero'?90:target.kind==='tower'?70:0;
 // XP dividida entre os heróis próximos: lutar em grupo acelera a partida, mas não multiplica a experiência.
 const receivers=xp?this.units.filter(h=>h.alive&&h.kind==='hero'&&h.team!==target.team&&this.distance(h,target)<=XP_SHARE_RADIUS):[];
 for(const h of receivers)this.gainXp(Math.round(xp/receivers.length),h);
 if(target.kind==='hero')target.respawn=180;
 }
 private gainXp(amount:number,hero:Unit=this.hero){
 hero.xp+=amount;
 while(hero.xp>=hero.level*100){hero.xp-=hero.level*100;hero.level++;hero.maxHp+=35;hero.hp=Math.min(hero.maxHp,hero.hp+70);hero.attack+=5;
 if(hero===this.hero){this.talents.points=availableTalentPoints(hero.level)-this.talents.rank;this.notice='Nível '+hero.level+'!';}}
 }
 private wave(){
 // Uma onda de três tropas por rota; elas saem da base deslocadas na direção da própria rota.
 for(const team of ['blue','red'] as const)for(const lane of LANES)for(let i=0;i<3;i++){
  const dy=lane==='top'?-45:lane==='bot'?45:0;
  this.spawn(team,'minion',team==='blue'?110-i*20:990+i*20,300+dy+(i-1)*12,{lane,waypoint:0,hp:85,maxHp:85,attack:11,armor:1,range:38,speed:0.8,radius:10});
 }
 }
 step(){
 if(this.winner)return;this.tick++;
 const spawned=spawnRune(this.tick,++this.runeSeq);if(spawned)this.runes.push(spawned);
 this.runes=this.runes.filter(r=>r.expiresAt>this.tick);
 for(const rune of [...this.runes]){const collector=this.units.find(u=>u.alive&&u.kind==='hero'&&Math.hypot(u.x-rune.x,u.y-rune.y)<u.radius+15);if(collector){this.notice=collector.role+' coletou: '+collectRune(collector,rune);this.runes=this.runes.filter(r=>r.id!==rune.id);}}
 if(this.tick%260===1)this.wave();
 for(const cds of this.skillCooldowns.values())for(const slot of ['q','w','e','r'] as const)if(cds[slot]>0)cds[slot]--;
 this.qCooldown=this.cooldowns.q;this.wCooldown=this.cooldowns.w;
 if(this.tick%PASSIVE_GOLD_TICKS===0)this.gold++;
 for(const u of this.units){
 if(!u.alive){if(u.kind==='hero'&&u.respawn>0){u.respawn--;if(u.respawn===0){u.alive=true;u.hp=u.maxHp;u.mana=u.maxMana;u.x=u.team==='blue'?170:930;u.y=300;u.waypoint=0;if(u===this.hero)this.destination={x:u.x,y:u.y};if(u===this.hero)this.notice='Você renasceu!';}}continue;}
 if(u.cooldown>0)u.cooldown--;
 if(u.kind==='hero'){u.mana=Math.min(u.maxMana,u.mana+0.08);
 const fountainX=u.team==='blue'?100:1000;
 if(Math.hypot(fountainX-u.x,300-u.y)<FOUNTAIN_RADIUS){u.hp=Math.min(u.maxHp,u.hp+u.maxHp*FOUNTAIN_REGEN);u.mana=Math.min(u.maxMana,u.mana+u.maxMana*FOUNTAIN_REGEN);}if(u===this.hero)this.moveUnit(u,this.destination.x,this.destination.y);}
 const enemies=this.units.filter(v=>v.alive&&v.team!==u.team&&visible(u,v,this.tick));
 if(u.kind==='core')continue;
 // Sem inimigo visível a unidade continua avançando pela rota; a visão só limita alvos.
 if(u.kind==='minion'||u.kind==='hero')advanceWaypoint(u);
 const decision=decideBot(u,enemies,u.kind==='hero'?this.units.filter(v=>v.alive&&v.team===u.team&&v.kind==='minion'):[]);
 if(u.kind==='hero'&&u.id!==this.hero.id){
 this.moveUnit(u,decision.x,decision.y);
 // Bots reavaliam habilidades a cada 12 ticks, escalonados por id para não lançarem todos juntos.
 if((this.tick+u.id)%12===0){const allies=this.units.filter(v=>v.alive&&v.kind==='hero'&&v.team===u.team);const plan=decideBotCast(u,decision,enemies,allies,this.skillCooldowns.get(u.id)!);if(plan)this.castFor(u,plan.slot,plan.aim);}
 }
 if(u.kind==='minion')this.moveUnit(u,decision.x,decision.y);
 if(!enemies.length)continue;
 // Herói IA só bate no alvo escolhido pela decisão; demais unidades atacam o mais próximo.
 const target=u.kind==='hero'&&u!==this.hero?decision.target:enemies.sort((a,b)=>this.distance(u,a)-this.distance(u,b))[0];
 if(u.attack>0&&target&&this.distance(u,target)<=u.range+target.radius&&u.cooldown===0){const terrain=terrainBonus(u.role,terrainAt(u.x,u.y),environment(this.tick).phase);this.hit(target,Math.round(u.attack*terrain.damage*(u.kind==='tower'&&target.kind==='hero'?TOWER_HERO_MULT:1)),u);u.cooldown=u.kind==='tower'?35:u.kind==='hero'?29:50;}
 }
 this.units=this.units.filter(u=>u.alive||u.kind==='hero'||u.kind==='core'||u.kind==='tower');
 }
}
