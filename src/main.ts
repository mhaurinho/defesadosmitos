type Team = 'blue'|'red';
type Kind = 'hero'|'minion'|'tower'|'core';
interface Unit {id:number;team:Team;kind:Kind;x:number;y:number;hp:number;maxHp:number;damage:number;range:number;speed:number;radius:number;cooldown:number;alive:boolean}
const canvas=document.querySelector<HTMLCanvasElement>('#game')!;
const ctx=canvas.getContext('2d')!;
const hud=document.querySelector<HTMLElement>('#hud')!;
const units:Unit[]=[];
let seq=0,tick=0,gameOver=false,winner='',gold=0,kills=0,level=1,xp=0;
let destination={x:170,y:300};
let qCooldown=0,wCooldown=0;
const W=1100,H=600;
const create=(team:Team,kind:Kind,x:number,y:number,hp:number,damage:number,range:number,speed:number,radius:number):Unit=>{
 const u={id:++seq,team,kind,x,y,hp,maxHp:hp,damage,range,speed,radius,cooldown:0,alive:true};units.push(u);return u;
};
const hero=create('blue','hero',170,300,320,24,75,2.7,17);
create('blue','core',55,300,700,0,0,0,36);
create('red','core',1045,300,700,0,0,0,36);
create('blue','tower',330,300,240,20,150,0,23);
create('red','tower',770,300,240,20,150,0,23);
function reset(){
 units.length=0;seq=0;tick=0;gameOver=false;winner='';gold=0;kills=0;level=1;xp=0;qCooldown=0;wCooldown=0;
 Object.assign(hero,create('blue','hero',170,300,320,24,75,2.7,17));
 // Remove a cópia temporária criada por create, preservando a referência do herói.
 units.pop();units.push(hero);
 create('blue','core',55,300,700,0,0,0,36);create('red','core',1045,300,700,0,0,0,36);
 create('blue','tower',330,300,240,20,150,0,23);create('red','tower',770,300,240,20,150,0,23);
 destination={x:170,y:300};
}
const dist=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
function damage(target:Unit,amount:number,source:Unit){
 if(!target.alive)return;
 target.hp=Math.max(0,target.hp-amount);
 if(target.hp===0){target.alive=false;
 if(target.team==='red'&&source.team==='blue'){gold+=target.kind==='minion'?25:target.kind==='tower'?100:0;xp+=target.kind==='minion'?20:80;if(target.kind==='minion')kills++;if(xp>=level*100){xp-=level*100;level++;hero.maxHp+=35;hero.hp=Math.min(hero.maxHp,hero.hp+65);hero.damage+=5;}}
 if(target.kind==='core'){gameOver=true;winner=source.team==='blue'?'Vitória! O núcleo inimigo caiu.':'Derrota! Seu núcleo foi destruído.';}
 if(target.kind==='hero'){target.hp=target.maxHp;target.alive=true;target.x=170;target.y=300;destination={x:170,y:300};}
 }
}
function closest(u:Unit):Unit|undefined{return units.filter(v=>v.alive&&v.team!==u.team).sort((a,b)=>dist(u,a)-dist(u,b))[0];}
function moveTowards(u:Unit,x:number,y:number,speed=u.speed){const d=Math.hypot(x-u.x,y-u.y);if(d>1){const m=Math.min(speed,d);u.x+=(x-u.x)/d*m;u.y+=(y-u.y)/d*m;}}
function spawnWave(){for(const team of ['blue','red'] as const)for(let i=0;i<3;i++)create(team,'minion',team==='blue'?100-i*24:1000+i*24,275+i*25,80,10,38,0.65,10);}
function update(){
 if(gameOver)return;
 tick++;
 if(tick%280===1)spawnWave();
 if(qCooldown>0)qCooldown--;if(wCooldown>0)wCooldown--;
 if(hero.alive)moveTowards(hero,destination.x,destination.y);
 for(const u of units){
 if(!u.alive||u.damage<=0)continue;
 if(u.cooldown>0)u.cooldown--;
 const enemy=closest(u);if(!enemy)continue;
 const d=dist(u,enemy);
 if(u.kind==='minion'&&d>u.range+enemy.radius)moveTowards(u,enemy.x,enemy.y);
 if(d<=u.range+enemy.radius&&u.cooldown===0){damage(enemy,u.damage,u);u.cooldown=u.kind==='tower'?42:u.kind==='hero'?32:55;}
 }
 hud.textContent=`❤️ ${Math.ceil(hero.hp)}/${hero.maxHp}  |  ⭐ Nível ${level} (${xp} XP)  |  🪙 ${gold} ouro  |  ⚔ ${kills} tropas  |  Q: ${qCooldown?Math.ceil(qCooldown/60)+'s':'pronta'}  |  W: ${wCooldown?Math.ceil(wCooldown/60)+'s':'pronta'}`;
}
function draw(){
 ctx.fillStyle='#172a22';ctx.fillRect(0,0,W,H);
 for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){ctx.fillStyle=(x+y)%100===0?'#1b3025':'#1d3328';ctx.fillRect(x+1,y+1,48,48);}
 ctx.fillStyle='#5e5743';ctx.fillRect(0,245,W,110);ctx.fillStyle='#73664b';ctx.fillRect(0,280,W,40);
 ctx.strokeStyle='#dfc87988';ctx.lineWidth=2;ctx.beginPath();ctx.arc(destination.x,destination.y,12,0,Math.PI*2);ctx.stroke();
 for(const u of units){if(!u.alive)continue;
 ctx.beginPath();ctx.fillStyle=u.team==='blue'?'#4c9ee6':'#d64d54';ctx.arc(u.x,u.y,u.radius,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=u.kind==='hero'?'#f2d77d':'#d4cbb1';ctx.lineWidth=u.kind==='hero'?4:2;ctx.stroke();
 if(u.kind==='core'){ctx.fillStyle='#f8e7a5';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('✦',u.x,u.y+10);}
 if(u.kind==='tower'){ctx.fillStyle='#e8d49b';ctx.fillRect(u.x-8,u.y-8,16,16);}
 ctx.fillStyle='#0c101a';ctx.fillRect(u.x-u.radius,u.y-u.radius-14,u.radius*2,5);
 ctx.fillStyle=u.team==='blue'?'#65e09b':'#ff8b78';ctx.fillRect(u.x-u.radius,u.y-u.radius-14,u.radius*2*(u.hp/u.maxHp),5);
 }
 ctx.fillStyle='#f0d6a0';ctx.font='bold 16px system-ui';ctx.textAlign='left';ctx.fillText('GUARDIÕES DA AURORA',24,38);ctx.textAlign='right';ctx.fillText('HORDA CARMESIM',W-24,38);
 if(gameOver){ctx.fillStyle='#060a12cc';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f2d58d';ctx.textAlign='center';ctx.font='bold 34px system-ui';ctx.fillText(winner,W/2,H/2);}
}
function frame(){update();draw();requestAnimationFrame(frame);}
canvas.addEventListener('pointerdown',e=>{if(gameOver)return;const r=canvas.getBoundingClientRect();destination={x:Math.max(20,Math.min(W-20,(e.clientX-r.left)*W/r.width)),y:Math.max(20,Math.min(H-20,(e.clientY-r.top)*H/r.height))};});
window.addEventListener('keydown',e=>{if(gameOver||!hero.alive)return;
 if(e.key.toLowerCase()==='q'&&qCooldown===0){qCooldown=300;for(const u of units)if(u.alive&&u.team==='red'&&dist(hero,u)<145)damage(u,55+level*8,hero);}
 if(e.key.toLowerCase()==='w'&&wCooldown===0){wCooldown=480;hero.hp=Math.min(hero.maxHp,hero.hp+90+level*12);}
});
document.querySelector('#restart')?.addEventListener('click',reset);
frame();
