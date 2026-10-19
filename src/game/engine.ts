import {HEROES,BLUE_TEAM,RED_TEAM,physicalDamage,type Unit,type Team,type Role,type Item} from './data';
import {decideBot} from './bots';
import {buyItem} from './economy';
export class Game {
 units:Unit[]=[]; hero!:Unit; bot!:Unit; inventory:Item[]=[];gold=0;xp=0;level=1;kills=0;tick=0;winner:Team|null=null;notice='';qCooldown=0;wCooldown=0;
 destination={x:170,y:300};private nextId=0;private role:Role='curupira';
 constructor(role:Role='curupira'){this.reset(role);}
 private spawn(team:Team,kind:Unit['kind'],x:number,y:number,stats:Partial<Unit>):Unit{
 const u:Unit={id:++this.nextId,team,kind,x,y,hp:80,maxHp:80,mana:0,maxMana:0,attack:10,armor:0,range:38,speed:0.8,radius:11,cooldown:0,alive:true,respawn:0,...stats};
 this.units.push(u);return u;
 }
 reset(role:Role=this.role){
 this.role=role;this.units=[];this.nextId=0;this.inventory=[];this.gold=0;this.xp=0;this.level=1;this.kills=0;this.tick=0;this.winner=null;this.notice='';this.qCooldown=0;this.wCooldown=0;
 const s=HEROES[role];this.hero=this.spawn('blue','hero',170,300,{role,hp:s.hp,maxHp:s.hp,mana:s.mana,maxMana:s.mana,attack:s.attack,armor:s.armor,range:s.range,speed:s.speed,radius:18});
 const allied=BLUE_TEAM.filter(r=>r!==role).slice(0,4);
 // Seleção livre: o herói escolhido substitui o primeiro slot da composição original.
 const enemyRoles=RED_TEAM.filter(r=>r!==role);
 while(enemyRoles.length<5){const candidate=BLUE_TEAM.find(r=>r!==role&&!enemyRoles.includes(r));if(!candidate)break;enemyRoles.push(candidate);}
 for(const [i,r] of allied.entries()){const b=HEROES[r];this.spawn('blue','hero',155+i*22,230+i*36,{role:r,hp:b.hp,maxHp:b.hp,mana:b.mana,maxMana:b.mana,attack:b.attack,armor:b.armor,range:b.range,speed:b.speed,radius:18});}
 for(const [i,r] of enemyRoles.entries()){const b=HEROES[r];const enemy=this.spawn('red','hero',925-i*22,230+i*36,{role:r,hp:b.hp,maxHp:b.hp,mana:b.mana,maxMana:b.mana,attack:b.attack,armor:b.armor,range:b.range,speed:b.speed,radius:18});if(i===0)this.bot=enemy;}

 this.spawn('blue','core',55,300,{hp:850,maxHp:850,radius:36,attack:0,speed:0});
 this.spawn('red','core',1045,300,{hp:850,maxHp:850,radius:36,attack:0,speed:0});
 this.spawn('blue','tower',330,300,{hp:260,maxHp:260,attack:24,armor:8,range:165,speed:0,radius:23});
 this.spawn('red','tower',770,300,{hp:260,maxHp:260,attack:24,armor:8,range:165,speed:0,radius:23});
 this.destination={x:170,y:300};
 }
 move(x:number,y:number){this.destination={x:Math.max(20,Math.min(1080,x)),y:Math.max(40,Math.min(560,y))};}
 buy(id:string){if(!this.hero.alive)return;const result=buyItem(id,this.gold,this.inventory,this.hero);this.gold=result.gold;this.inventory=result.inventory;this.notice=result.message;}
 cast(slot:'q'|'w'){
 if(!this.hero.alive||this.winner)return;
 if(slot==='q'&&this.qCooldown===0&&this.hero.mana>=45){
 this.hero.mana-=45;this.qCooldown=150;
 for(const target of [...this.units])if(target.alive&&target.team==='red'&&this.distance(this.hero,target)<160)this.hit(target,45+this.level*9,this.hero,true);
 this.notice='Explosão mítica!';
 }
 if(slot==='w'&&this.wCooldown===0&&this.hero.mana>=35){this.hero.mana-=35;this.wCooldown=230;this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+85+this.level*14);this.notice='Cura ancestral!';}
 }
 private distance(a:Unit,b:Unit){return Math.hypot(a.x-b.x,a.y-b.y);}
 private moveUnit(u:Unit,x:number,y:number){const d=Math.hypot(x-u.x,y-u.y);if(d>0.5){const n=Math.min(u.speed,d);u.x+=(x-u.x)/d*n;u.y+=(y-u.y)/d*n;}}
 private hit(target:Unit,raw:number,source:Unit,magic=false){
 if(!target.alive)return;target.hp=Math.max(0,target.hp-(magic?raw:physicalDamage(raw,target.armor)));
 if(target.hp>0)return;
 target.alive=false;
 if(target.kind==='core'){this.winner=source.team;this.notice=source.team==='blue'?'Vitória!':'Derrota!';}
 if(target.team==='red'&&source.team==='blue'){this.gold+=target.kind==='minion'?30:target.kind==='hero'?120:target.kind==='tower'?170:0;this.xp+=target.kind==='minion'?20:target.kind==='hero'?90:70;if(target.kind==='minion')this.kills++;
 if(this.xp>=this.level*100){this.xp-=this.level*100;this.level++;this.hero.maxHp+=35;this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+70);this.hero.attack+=5;this.notice='Nível '+this.level+'!';}}
 if(target.kind==='hero')target.respawn=180;
 }
 private wave(){for(const team of ['blue','red'] as const)for(let i=0;i<3;i++)this.spawn(team,'minion',team==='blue'?110-i*20:990+i*20,280+i*20,{hp:85,maxHp:85,attack:11,armor:1,range:38,speed:0.8,radius:10});}
 step(){
 if(this.winner)return;this.tick++;
 if(this.tick%260===1)this.wave();
 if(this.qCooldown>0)this.qCooldown--;if(this.wCooldown>0)this.wCooldown--;
 for(const u of this.units){
 if(!u.alive){if(u.kind==='hero'&&u.respawn>0){u.respawn--;if(u.respawn===0){u.alive=true;u.hp=u.maxHp;u.mana=u.maxMana;u.x=u.team==='blue'?170:930;u.y=300;this.notice=u.team==='blue'?'Você renasceu!':'O rival renasceu!';}}continue;}
 if(u.cooldown>0)u.cooldown--;
 if(u.kind==='hero'){u.mana=Math.min(u.maxMana,u.mana+0.08);if(u.team==='blue')this.moveUnit(u,this.destination.x,this.destination.y);}
 const enemies=this.units.filter(v=>v.alive&&v.team!==u.team);
 if(!enemies.length||u.kind==='core')continue;
 const decision=decideBot(u,enemies);
 if(u.kind==='hero'&&u.id!==this.hero.id)this.moveUnit(u,decision.x,decision.y);
 if(u.kind==='minion')this.moveUnit(u,decision.x,decision.y);
 const target=enemies.sort((a,b)=>this.distance(u,a)-this.distance(u,b))[0];
 if(u.attack>0&&target&&this.distance(u,target)<=u.range+target.radius&&u.cooldown===0){this.hit(target,u.attack,u);u.cooldown=u.kind==='tower'?35:u.kind==='hero'?29:50;}
 }
 this.units=this.units.filter(u=>u.alive||u.kind==='hero'||u.kind==='core'||u.kind==='tower');
 }
}
