import {describe,expect,test} from 'vitest';
import {Game} from '../src/game/engine';
import {decideBot} from '../src/game/bots';
import {buyItem} from '../src/game/economy';
import {HEROES,ITEMS,physicalDamage,type Unit} from '../src/game/data';

const unit=(over:Partial<Unit>):Unit=>({id:1,team:'red',kind:'hero',x:500,y:300,hp:100,maxHp:100,mana:0,maxMana:0,attack:10,armor:0,range:40,speed:1,radius:18,cooldown:0,alive:true,respawn:0,...over});

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
 test('XP apenas dentro do raio de compartilhamento',()=>{
  const g=new Game();
  g.step();
  const far=g.units.find(u=>u.kind==='minion'&&u.team==='red')!;
  far.hp=1;(g as any).hit(far,50,far);
  expect(g.xp).toBe(0);
  const near=g.units.find(u=>u.kind==='minion'&&u.team==='red'&&u.alive)!;
  near.x=g.hero.x+50;near.y=g.hero.y;near.hp=1;(g as any).hit(near,50,g.hero);
  expect(g.xp).toBe(20);
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

describe('partida',()=>{
 test('tropas avançam pela rota mesmo sem inimigo à vista',()=>{
  const g=new Game();
  for(let i=0;i<400;i++)g.step();
  const blue=g.units.filter(u=>u.kind==='minion'&&u.team==='blue');
  expect(Math.max(...blue.map(u=>u.x))).toBeGreaterThan(300);
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
