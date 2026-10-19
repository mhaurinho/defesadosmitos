import {describe,expect,test,vi} from 'vitest';
import {Game} from '../src/game/engine';
import {decideBot,decideBotCast} from '../src/game/bots';
import {buyItem} from '../src/game/economy';
import {HEROES,ITEMS,physicalDamage,type Unit} from '../src/game/data';

const unit=(over:Partial<Unit>):Unit=>({id:1,team:'red',kind:'hero',x:500,y:300,hp:100,maxHp:100,mana:0,maxMana:0,attack:10,armor:0,range:40,speed:1,radius:18,cooldown:0,alive:true,respawn:0,level:1,xp:0,...over});

describe('dano',()=>{
 test('armadura reduz dano físico e nunca zera',()=>{
  expect(physicalDamage(100,0)).toBe(100);
  expect(physicalDamage(100,100)).toBe(50);
  expect(physicalDamage(1,1000)).toBe(1);
  expect(physicalDamage(100,-20)).toBe(100);
 });
});

describe('loja',()=>{
 test('compra aplica atributos e desconta ouro',()=>{
  const hero=unit({team:'blue'});
  const r=buyItem('shield',200,[],hero);
  expect(r.ok).toBe(true);expect(r.gold).toBe(80);expect(hero.maxHp).toBe(210);expect(hero.hp).toBe(210);
 });
 test('recusa ouro insuficiente, item inexistente e inventário cheio',()=>{
  const hero=unit({team:'blue'});
  expect(buyItem('heart',10,[],hero).ok).toBe(false);
  expect(buyItem('nada',999,[],hero).ok).toBe(false);
  expect(buyItem('blade',999,Array(6).fill(ITEMS[0]),hero).message).toBe('Inventário cheio');
  expect(hero.attack).toBe(10);
 });
});

describe('bot',()=>{
 test('recua com pouca vida e só volta à rota após curar na fonte',()=>{
  expect(decideBot(unit({hp:20}),[]).state).toBe('retreat');
  expect(decideBot(unit({x:1000,hp:60}),[]).state).toBe('retreat');
  expect(decideBot(unit({x:1000,hp:95}),[]).state).toBe('push');
  expect(decideBot(unit({hp:60}),[]).state).toBe('push');
 });
 test('luta contra inimigo próximo',()=>{
  const enemy=unit({id:2,team:'blue',x:550});
  expect(decideBot(unit({}),[enemy])).toMatchObject({state:'fight',target:enemy});
 });
 test('não fica preso em retirada: fonte regenera o herói vermelho',()=>{
  const g=new Game();
  g.bot.x=1000;g.bot.hp=10;
  for(let i=0;i<120;i++)g.step();
  expect(g.bot.hp/g.bot.maxHp).toBeGreaterThan(0.9);
 });
});

describe('economia e progressão',()=>{
 test('ouro só por último golpe do herói; tropas aliadas não pagam',()=>{
  const g=new Game();
  g.step();
  const minion=g.units.find(u=>u.kind==='minion'&&u.team==='red')!;
  const ally=g.units.find(u=>u.kind==='minion'&&u.team==='blue')!;
  minion.hp=1;(g as any).hit(minion,50,ally);
  expect(g.gold).toBe(0);expect(g.kills).toBe(0);
  const other=g.units.find(u=>u.kind==='minion'&&u.team==='red'&&u.alive)!;
  other.hp=1;(g as any).hit(other,50,g.hero);
  expect(g.gold).toBe(30);expect(g.kills).toBe(1);
 });
 test('XP só dentro do raio e dividida entre heróis próximos',()=>{
  const g=new Game();
  g.step();
  const far=g.units.find(u=>u.kind==='minion'&&u.team==='red')!;
  far.hp=1;(g as any).hit(far,50,far);
  expect(g.xp).toBe(0);
  const near=g.units.find(u=>u.kind==='minion'&&u.team==='red'&&u.alive)!;
  near.x=g.hero.x+50;near.y=g.hero.y;near.hp=1;(g as any).hit(near,50,g.hero);
  // Os 5 heróis azuis estão na base: os 20 de XP são divididos entre eles.
  expect(g.xp).toBe(4);
  for(const ally of g.units)if(ally.kind==='hero'&&ally.team==='blue'&&ally!==g.hero)ally.x=900;
  const solo=g.units.find(u=>u.kind==='minion'&&u.team==='red'&&u.alive)!;
  solo.x=g.hero.x+50;solo.y=g.hero.y;solo.hp=1;(g as any).hit(solo,50,g.hero);
  expect(g.xp).toBe(24);
 });
 test('XP acumulada sobe vários níveis de uma vez',()=>{
  const g=new Game();
  (g as any).gainXp(320);
  expect(g.level).toBe(3);expect(g.xp).toBe(20);
 });
 test('level-up múltiplo concede pontos de talento',()=>{
  const g=new Game();
  (g as any).gainXp(100+200+300);
  expect(g.level).toBe(4);expect(g.talents.points).toBe(1);
  expect(g.chooseTalent('aggressive')).toBe(true);
 });
 test('ultimate só a partir do nível 6',()=>{
  const g=new Game('saci');
  g.cast('r');expect(g.cooldowns.r).toBe(0);
  (g as any).gainXp(1500);g.hero.mana=g.hero.maxMana;
  g.cast('r');expect(g.cooldowns.r).toBeGreaterThan(0);
 });
 test('renda passiva de ouro',()=>{
  const g=new Game();
  for(let i=0;i<600;i++)g.step();
  expect(g.gold).toBeGreaterThanOrEqual(10);
 });
});

describe('bots com habilidades',()=>{
 const cds=()=>({q:0,w:0,e:0,r:0});
 test('usa dano em área quando um herói inimigo está no raio',()=>{
  const bot=unit({role:'boitata',mana:300,maxMana:300});
  const enemy=unit({id:2,team:'blue',x:560});
  expect(decideBotCast(bot,decideBot(bot,[enemy]),[enemy],[bot],cds())?.slot).toBe('q');
 });
 test('não lança nada sem alvo nem aliado ferido',()=>{
  const bot=unit({role:'boitata',mana:300,maxMana:300});
  expect(decideBotCast(bot,decideBot(bot,[]),[],[bot],cds())).toBeNull();
 });
 test('cura aliado ferido no raio',()=>{
  const bot=unit({role:'boto',mana:300,maxMana:300});
  const ally=unit({id:3,x:540,hp:30});
  expect(decideBotCast(bot,decideBot(bot,[]),[],[bot,ally],cds())?.slot).toBe('w');
 });
 test('respeita mana, recarga e ultimate no nível 6',()=>{
  const enemies=[unit({id:2,team:'blue',x:560}),unit({id:3,team:'blue',x:540})];
  const low=unit({role:'boitata',mana:10,maxMana:300});
  expect(decideBotCast(low,decideBot(low,enemies),enemies,[low],cds())).toBeNull();
  const lvl1=unit({role:'boitata',mana:300,maxMana:300});
  expect(decideBotCast(lvl1,decideBot(lvl1,enemies),enemies,[lvl1],{q:5,w:5,e:5,r:0})).toBeNull();
  const lvl6=unit({role:'boitata',mana:300,maxMana:300,level:6});
  expect(decideBotCast(lvl6,decideBot(lvl6,enemies),enemies,[lvl6],cds())?.slot).toBe('r');
 });
 test('bots lançam habilidades e sobem de nível numa partida simulada',()=>{
  const g=new Game();
  const castFor=vi.spyOn(g as any,'castFor');
  for(let i=0;i<60*60*2;i++)g.step();
  const botCasters=new Set(castFor.mock.calls.map(([caster])=>(caster as Unit).id));
  expect(botCasters.size).toBeGreaterThanOrEqual(5);
  expect(botCasters.has(g.hero.id)).toBe(false);
  expect(g.units.filter(u=>u.kind==='hero'&&u!==g.hero).some(b=>b.level>1)).toBe(true);
 });
});

describe('partida',()=>{
 test('tropas avançam pela rota mesmo sem inimigo à vista',()=>{
  const g=new Game();
  let farthest=0;
  for(let i=0;i<400;i++){g.step();for(const u of g.units)if(u.kind==='minion'&&u.team==='blue')farthest=Math.max(farthest,u.x);}
  expect(farthest).toBeGreaterThan(300);
 });
 test('partida com jogador parado chega a um desfecho de rota (tropas não se acumulam)',()=>{
  const g=new Game();
  for(let i=0;i<60*60*3;i++)g.step();
  expect(g.units.filter(u=>u.kind==='minion').length).toBeLessThan(60);
 });
 test('5v5 sem duplicar o herói escolhido',()=>{
  for(const role of Object.keys(HEROES) as (keyof typeof HEROES)[]){
   const g=new Game(role);const heroes=g.units.filter(u=>u.kind==='hero');
   expect(heroes.filter(u=>u.team==='blue')).toHaveLength(5);expect(heroes.filter(u=>u.team==='red')).toHaveLength(5);
   expect(new Set(heroes.map(u=>u.role)).size).toBe(10);
  }
 });
 test('aliados IA não seguem o clique do jogador',()=>{
  const g=new Game();
  const ally=g.units.find(u=>u.kind==='hero'&&u.team==='blue'&&u!==g.hero)!;
  const solo=new Game();const soloAlly=solo.units.find(u=>u.id===ally.id)!;
  g.move(170,560);
  for(let i=0;i<30;i++){g.step();solo.step();}
  expect(ally.y).toBeCloseTo(soloAlly.y,5);
 });
 test('herói renasce na base e o destino é reiniciado',()=>{
  const g=new Game();
  g.move(900,300);g.hero.hp=1;(g as any).hit(g.hero,50,g.bot);
  expect(g.hero.alive).toBe(false);
  for(let i=0;i<180;i++)g.step();
  expect(g.hero.alive).toBe(true);expect(g.hero.hp).toBe(g.hero.maxHp);
  expect(g.destination).toEqual({x:170,y:300});
 });
 test('destruir o núcleo vermelho dá vitória e congela a simulação',()=>{
  const g=new Game();
  const core=g.units.find(u=>u.kind==='core'&&u.team==='red')!;
  core.hp=1;(g as any).hit(core,50,g.hero);
  expect(g.winner).toBe('blue');
  const tick=g.tick;g.step();expect(g.tick).toBe(tick);
 });
 test('simulação é determinística',()=>{
  const run=()=>{const g=new Game('iara');for(let i=0;i<3000;i++){if(i===500)g.move(700,300);if(i===900)g.cast('q');g.step();}return JSON.stringify([g.units,g.gold,g.xp,g.level]);};
  expect(run()).toBe(run());
 });
 test('todos os heróis iniciam com atributos da tabela',()=>{
  for(const role of Object.keys(HEROES) as (keyof typeof HEROES)[]){const g=new Game(role);expect(g.hero.maxHp).toBe(HEROES[role].hp);expect(g.hero.role).toBe(role);}
 });
});
