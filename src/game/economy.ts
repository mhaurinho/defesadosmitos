import {ITEMS,type Item,type Unit} from './data';
export function buyItem(id:string,gold:number,inventory:readonly Item[],hero:Unit):{ok:boolean;gold:number;inventory:Item[];message:string}{
 const item=ITEMS.find(i=>i.id===id);
 if(!item)return {ok:false,gold,inventory:[...inventory],message:'Item inexistente'};
 if(inventory.length>=6)return {ok:false,gold,inventory:[...inventory],message:'Inventário cheio'};
 if(gold<item.cost)return {ok:false,gold,inventory:[...inventory],message:'Ouro insuficiente'};
 hero.attack+=item.attack??0;hero.armor+=item.armor??0;hero.speed+=item.speed??0;
 if(item.hp){hero.maxHp+=item.hp;hero.hp+=item.hp;}
 return {ok:true,gold:gold-item.cost,inventory:[...inventory,item],message:item.name+' comprado'};
}
