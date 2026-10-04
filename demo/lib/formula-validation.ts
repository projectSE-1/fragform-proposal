// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import type {Ingredient, FormulaVersion} from './model.ts';
import {validateIngredients} from './model.ts';

// Exact declaration checking is only a UI demonstration, never an official chemistry result.
export function validateDemoDeclaration(items:Ingredient[]):string|null {
  const error=validateIngredients(items);
  if(error) return error;
  const places=Math.max(...items.map(x=>(x.amount.split('.')[1]||'').length));
  if(places>12) return 'Use no more than 12 decimal places for this demo input.';
  const scale=10n**BigInt(places);
  const total=items.reduce((sum,item)=>{
    const [integer,fraction='']=item.amount.split('.');
    return sum+BigInt(integer)*scale+BigInt(fraction.padEnd(places,'0')||'0');
  },0n);
  return total===100n*scale?null:'Declared amounts must total exactly 100%. Values are never normalised.';
}
// Exact 0 < dilution <= 100 on the decimal string; Number() would round 100.0000000000000001 to 100.
function validDilution(value:string):boolean {
  if(!/^\d+(\.\d+)?$/.test(value)||!/[1-9]/.test(value)) return false;
  const [integer,fraction='']=value.split('.');
  return BigInt(integer)<100n||(BigInt(integer)===100n&&!/[1-9]/.test(fraction));
}
export function validateDemoContext(draft:FormulaVersion):string|null {
  if(!draft.vehicle.trim()||!draft.category.trim()) return 'Select a demo vehicle and application.';
  if(!validDilution(draft.dilution)) return 'Enter a declared product dilution greater than 0 and no more than 100%.';
  return validateDemoDeclaration(draft.ingredients);
}
