import {describe,expect,test,vi} from 'vitest';
import {Game} from '../src/game/engine';
import {decideBot,decideBotCast} from '../src/game/bots';
import {LANE_Y,lanePath} from '../src/game/lanes';
import {HARD_CC_IMMUNITY,StatusBook} from '../src/game/status';
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

describe('três rotas',()=>{
 test('rotas vermelhas espelham as azuis e cada time tem uma torre por rota',()=>{
  for(const lane of ['top','mid','bot'] as const)expect(lanePath('red',lane)).toEqual(lanePath('blue',lane).map(p=>({x:1100-p.x,y:p.y})));
  const g=new Game();
  for(const team of ['blue','red'] as const)expect(g.units.filter(u=>u.kind==='tower'&&u.team===team).map(u=>u.lane).sort()).toEqual(['bot','mid','top']);
 });
 test('cada onda manda três tropas por rota e elas chegam à própria rota',()=>{
  const g=new Game();g.step();
  const wave=g.units.filter(u=>u.kind==='minion');
  expect(wave).toHaveLength(18);
  for(let i=0;i<500;i++)g.step();
  for(const lane of ['top','bot'] as const){
   const m=wave.filter(u=>u.alive&&u.lane===lane);
   if(m.length)expect(Math.min(...m.map(u=>Math.abs(u.y-LANE_Y[lane])))).toBeLessThan(20);
  }
 });
 test('herói IA não ataca torre sem tropas aliadas sob ela',()=>{
  const bot=unit({x:900,y:300});
  const tower=unit({id:9,team:'blue',kind:'tower',x:800,y:300,range:165});
  expect(decideBot(bot,[tower],[]).state).toBe('hold');
  const minion=unit({id:10,kind:'minion',x:820,y:300});
  expect(decideBot(bot,[tower],[minion])).toMatchObject({state:'fight',target:tower});
 });
 test('torre causa dano extra a heróis e cura não restaura estruturas',()=>{
  const g=new Game('boto');
  const tower=g.units.find(u=>u.kind==='tower'&&u.team==='blue'&&u.lane==='mid')!;
  tower.hp=500;g.hero.x=tower.x+30;g.hero.y=tower.y;g.hero.mana=g.hero.maxMana;
  g.cast('w');
  expect(tower.hp).toBe(500);
  const enemy=g.units.find(u=>u.kind==='hero'&&u.team==='red')!;
  const hpBefore=enemy.maxHp;enemy.hp=hpBefore;
  (g as any).hit(enemy,Math.round(tower.attack*2.5),tower);
  expect(hpBefore-enemy.hp).toBeGreaterThan(tower.attack*2);
 });
});

describe('controle',()=>{
 test('atordoado não anda, não ataca e não lança; enraizado ataca mas não anda',()=>{
  const book=new StatusBook();const u=unit({});
  book.apply(u,{kind:'stun',ticks:30},0);
  expect([book.canMove(u,10),book.canAttack(u,10),book.canCast(u,10)]).toEqual([false,false,false]);
  expect([book.canMove(u,30),book.canAttack(u,30),book.canCast(u,30)]).toEqual([true,true,true]);
  const r=unit({id:2});book.apply(r,{kind:'root',ticks:30},0);
  expect([book.canMove(r,10),book.canAttack(r,10),book.canCast(r,10)]).toEqual([false,true,true]);
 });
 test('silêncio bloqueia só habilidades e lentidão usa a mais forte',()=>{
  const book=new StatusBook();const u=unit({});
  book.apply(u,{kind:'silence',ticks:30},0);
  expect([book.canMove(u,5),book.canAttack(u,5),book.canCast(u,5)]).toEqual([true,true,false]);
  book.apply(u,{kind:'slow',ticks:30,power:0.2},0);book.apply(u,{kind:'slow',ticks:30,power:0.45},0);
  expect(book.speedMult(u,5)).toBeCloseTo(0.55);
  expect(book.speedMult(u,40)).toBe(1);
 });
 test('imunidade curta impede controle duro em cadeia; estruturas são imunes',()=>{
  const book=new StatusBook();const u=unit({});
  expect(book.apply(u,{kind:'stun',ticks:30},0)).toBe(true);
  expect(book.apply(u,{kind:'root',ticks:30},20)).toBe(false);
  expect(book.apply(u,{kind:'slow',ticks:30,power:0.3},20)).toBe(true);
  expect(book.apply(u,{kind:'stun',ticks:30},30+HARD_CC_IMMUNITY)).toBe(true);
  expect(book.apply(unit({id:5,kind:'tower'}),{kind:'stun',ticks:30},0)).toBe(false);
 });
 test('Raízes Vivas prendem o inimigo no lugar dentro da partida',()=>{
  const g=new Game('curupira');
  const enemy=g.units.find(u=>u.kind==='hero'&&u.team==='red')!;
  enemy.x=g.hero.x+60;enemy.y=g.hero.y;enemy.hp=enemy.maxHp=5000;
  g.cast('q');
  expect(g.status.has(enemy,'root',g.tick)).toBe(true);
  const x=enemy.x;for(let i=0;i<30;i++)g.step();
  expect(enemy.x).toBe(x);
 });
 test('jogador atordoado não lança habilidade',()=>{
  const g=new Game('saci');
  g.status.apply(g.hero,{kind:'stun',ticks:60},g.tick);
  g.cast('q');
  expect(g.cooldowns.q).toBe(0);expect(g.notice).toBe('Atordoado!');
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
  expect(g.units.filter(u=>u.kind==='minion').length).toBeLessThan(120);
 },30000);
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
 },30000);
 test('todos os heróis iniciam com atributos da tabela',()=>{
  for(const role of Object.keys(HEROES) as (keyof typeof HEROES)[]){const g=new Game(role);expect(g.hero.maxHp).toBe(HEROES[role].hp);expect(g.hero.role).toBe(role);}
 });
});
