import {Game} from './game/engine';
import {HEROES,ITEMS,type Role} from './game/data';
import {TALENTS} from './game/talents';
import {SKILLS,type Slot} from './game/skills';
import {LANES,lanePath} from './game/lanes';
import {environment,terrainAt} from './game/world';
const game=new Game();
const canvas=document.querySelector<HTMLCanvasElement>('#game')!;
const ctx=canvas.getContext('2d')!;
const hud=document.querySelector<HTMLElement>('#hud')!;
const app=document.querySelector<HTMLElement>('#app')!;
const controls=document.createElement('section');
controls.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0';
const select=document.createElement('select');
select.setAttribute('aria-label','Escolher herói');
for(const [id,hero] of Object.entries(HEROES)){const option=document.createElement('option');option.value=id;option.textContent=hero.name;select.append(option);}
select.addEventListener('change',()=>game.reset(select.value as Role));
controls.append('Herói: ',select);
const passive=document.createElement('span');passive.style.cssText='padding:8px;color:#e9c985';
controls.append(passive);
for(const path of ['aggressive','guardian'] as const){const button=document.createElement('button');button.addEventListener('click',()=>game.chooseTalent(path));button.textContent=path==='aggressive'?'⚔ Talento Ofensivo':'🛡 Talento Defesa/Suporte';controls.append(button);}

for(const item of ITEMS){const button=document.createElement('button');button.textContent=item.name+' ('+item.cost+'g)';button.title='Comprar '+item.name;button.addEventListener('click',()=>game.buy(item.id));controls.append(button);}
hud.after(controls);
document.querySelector('#restart')?.addEventListener('click',()=>game.reset(select.value as Role));
canvas.addEventListener('pointerdown',e=>{const rect=canvas.getBoundingClientRect();game.move((e.clientX-rect.left)*canvas.width/rect.width,(e.clientY-rect.top)*canvas.height/rect.height);});
window.addEventListener('keydown',e=>{if(['q','w','e','r'].includes(e.key.toLowerCase()))game.cast(e.key.toLowerCase() as Slot);});
function draw(){
 const W=canvas.width,H=canvas.height;
 ctx.fillStyle='#14251e';ctx.fillRect(0,0,W,H);
 for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){ctx.fillStyle=(x+y)%100===0?'#193125':'#1d3328';ctx.fillRect(x+1,y+1,48,48);}
 // Zonas de terreno, com indicação visual dos biomas.
 ctx.fillStyle='#194c68';ctx.fillRect(475,65,150,470);
 ctx.fillStyle='#24523b';ctx.fillRect(190,0,230,225);ctx.fillRect(680,375,230,225);
 ctx.fillStyle='#8c9da055';ctx.fillRect(310,380,180,220);ctx.fillRect(610,0,180,210);
 // Três rotas: margem larga de terra e trilha central, do núcleo azul ao vermelho.
 ctx.lineCap='round';ctx.lineJoin='round';
 for(const [width,color] of [[70,'#5b5947'],[30,'#75684c']] as const)for(const lane of LANES){
  ctx.beginPath();ctx.moveTo(55,300);for(const p of lanePath('blue',lane))ctx.lineTo(p.x,p.y);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
 }
 for(const rune of game.runes){ctx.beginPath();ctx.fillStyle='#e9bd51';ctx.arc(rune.x,rune.y,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222';ctx.textAlign='center';ctx.font='bold 14px system-ui';ctx.fillText('✦',rune.x,rune.y+5);}
 const world=environment(game.tick);
 if(world.phase==='night'){ctx.fillStyle='rgba(3,9,32,0.38)';ctx.fillRect(0,0,W,H);}
 else if(world.phase==='dusk'){ctx.fillStyle='rgba(56,23,64,0.18)';ctx.fillRect(0,0,W,H);}
 ctx.strokeStyle='#e3c77b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(game.destination.x,game.destination.y,12,0,Math.PI*2);ctx.stroke();
 for(const u of game.units){if(!u.alive)continue;
 ctx.beginPath();ctx.fillStyle=u.team==='blue'?'#438cda':'#d44d55';ctx.arc(u.x,u.y,u.radius,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=u.kind==='hero'?'#f3dc87':'#c8c2a8';ctx.lineWidth=u.kind==='hero'?4:2;ctx.stroke();
 if(u.kind==='core'){ctx.fillStyle='#fff0b4';ctx.textAlign='center';ctx.font='bold 28px system-ui';ctx.fillText('✦',u.x,u.y+10);}
 if(u.kind==='tower'){ctx.fillStyle='#f3d88d';ctx.fillRect(u.x-8,u.y-8,16,16);}
 ctx.fillStyle='#10151b';ctx.fillRect(u.x-u.radius,u.y-u.radius-14,u.radius*2,5);
 ctx.fillStyle=u.team==='blue'?'#6ce9a3':'#ff8c79';ctx.fillRect(u.x-u.radius,u.y-u.radius-14,u.radius*2*(u.hp/u.maxHp),5);
 }
 ctx.textAlign='left';ctx.font='bold 16px system-ui';ctx.fillStyle='#f2dbac';ctx.fillText('GUARDIÕES DA AURORA',22,36);
 ctx.textAlign='right';ctx.fillText('HORDA CARMESIM',W-22,36);
 if(game.winner){ctx.fillStyle='#060912cc';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f3d98b';ctx.textAlign='center';ctx.font='bold 38px system-ui';ctx.fillText(game.winner==='blue'?'VITÓRIA!':'DERROTA!',W/2,H/2);}
}
const STEP=1000/60;let last=0,accumulator=0;
function frame(now:number){if(!last)last=now;accumulator+=Math.min(250,now-last);last=now;let loops=0;while(accumulator>=STEP&&loops++<8){game.step();accumulator-=STEP;}
 passive.textContent='✨ Q '+SKILLS[game.hero.role!].q.name+' · W '+SKILLS[game.hero.role!].w.name+' · E '+SKILLS[game.hero.role!].e.name+' · R '+SKILLS[game.hero.role!].r.name+' | Passiva: '+TALENTS[game.hero.role!].passive.name+' | Talentos: '+game.talents.points+' pontos | Ramo: '+(game.talents.path??'livre')+' '+game.talents.rank+'/3';
 hud.textContent='🕒 '+environment(game.tick).clock+' '+environment(game.tick).phase+' | 🌿 '+terrainAt(game.hero.x,game.hero.y)+' | ❤️ '+Math.ceil(game.hero.hp)+'/'+game.hero.maxHp+' | 🔮 '+Math.floor(game.hero.mana)+' | ⭐ Nível '+game.level+' | 🪙 '+game.gold+' ouro | ⚔ '+game.kills+' tropas | Q '+(game.qCooldown?Math.ceil(game.qCooldown/60)+'s':'pronta')+' | W '+(game.wCooldown?Math.ceil(game.wCooldown/60)+'s':'pronta')+' | E '+(game.cooldowns.e?Math.ceil(game.cooldowns.e/60)+'s':'pronta')+' | R '+(game.level<6?'nível 6':game.cooldowns.r?Math.ceil(game.cooldowns.r/60)+'s':'pronta')+' | 🎒 '+game.inventory.length+'/6 | '+game.notice;
 draw();requestAnimationFrame(frame);}
app.setAttribute('data-version','0.2.0');requestAnimationFrame(frame);
