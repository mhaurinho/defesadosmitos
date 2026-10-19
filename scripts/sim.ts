/**
 * Simulador de balanceamento: partidas 5v5 com drafts aleatórios (semente fixa) e todos os heróis na IA.
 * Uso: npm run sim -- [partidas=40] [semente=1] [minutosMáx=25]
 */
import {Game} from '../src/game/engine';
import {HEROES,type Role,type Team} from '../src/game/data';

const [matches=40,seed=1,maxMinutes=25]=process.argv.slice(2).map(Number);
const ROLES=Object.keys(HEROES) as Role[];

function rng(a:number){return ()=>{a|=0;a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const rand=rng(seed);
const shuffle=<T>(xs:T[])=>{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

const stats=new Map<Role,{games:number;wins:number;kills:number;deaths:number;damage:number;minutes:number}>(ROLES.map(r=>[r,{games:0,wins:0,kills:0,deaths:0,damage:0,minutes:0}]));
const sides:Record<Team|'draw',number>={blue:0,red:0,draw:0};
const towerFalls:number[]=[];let totalTicks=0;const t0=Date.now();const durations:number[]=[];

for(let m=0;m<matches;m++){
 const draft=shuffle(ROLES);
 const blue=draft.slice(0,5),red=draft.slice(5);
 const g=new Game(blue[0],{allies:blue.slice(1),enemies:red,autopilot:true});
 let towersAlive=6;
 while(!g.winner&&g.tick<maxMinutes*3600){
  g.step();
  if(g.tick%60===0){const alive=g.units.filter(u=>u.kind==='tower'&&u.alive).length;for(;towersAlive>alive;towersAlive--)towerFalls.push(g.tick/3600);}
 }
 totalTicks+=g.tick;
 const winner=g.winner??'draw';sides[winner]++;
 if(g.winner)durations.push(g.tick/3600);
 for(const [team,roles] of [['blue',blue],['red',red]] as const)for(const r of roles){const s=stats.get(r)!;s.games++;if(winner===team)s.wins++;}
 for(const u of g.units)if(u.kind==='hero'&&u.role){const s=stats.get(u.role)!,sc=g.scores.get(u.id)!;s.kills+=sc.kills;s.deaths+=sc.deaths;s.damage+=sc.heroDamage;s.minutes+=g.tick/3600;}
}

const pct=(n:number,d:number)=>d?(100*n/d).toFixed(0).padStart(3)+'%':'  -';
console.log(`\n${matches} partidas · semente ${seed} · limite ${maxMinutes} min · ${((Date.now()-t0)/totalTicks).toFixed(2)} ms/tick`);
console.log(`Lado: azul ${pct(sides.blue,matches)} · vermelho ${pct(sides.red,matches)} · sem vencedor ${pct(sides.draw,matches)}`);
if(durations.length)console.log(`Duração das partidas decididas: média ${(durations.reduce((a,b)=>a+b,0)/durations.length).toFixed(1)} min · min ${Math.min(...durations).toFixed(1)} · máx ${Math.max(...durations).toFixed(1)}`);
const avg=(xs:number[])=>xs.length?(xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(1):'-';
console.log(`Torres derrubadas: ${(towerFalls.length/matches).toFixed(1)} por partida · minuto médio da queda ${avg(towerFalls)}`);
console.log('\nHerói              vitórias  partidas   abates/min  mortes/min  dano/min');
for(const [r,s] of [...stats].sort((a,b)=>b[1].wins/b[1].games-a[1].wins/a[1].games))console.log(HEROES[r].name.padEnd(18),pct(s.wins,s.games).padStart(8),String(s.games).padStart(9),(s.kills/s.minutes).toFixed(2).padStart(12),(s.deaths/s.minutes).toFixed(2).padStart(11),String(Math.round(s.damage/s.minutes)).padStart(9));
