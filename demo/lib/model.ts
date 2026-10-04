// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// All records in this module are invented, public-safe fixtures. No scientific rules are encoded.
// Roles, accounts and the laboratory workflow are out of this build (scope-lock.md).
export type Page = 'formulas' | 'editor';
export type Ingredient = { id: string; materialId: string; amount: string };
export type FormulaVersion = {
  id: string; number: number; createdLabel: string; note: string;
  ingredients: Ingredient[]; vehicle: string; category: string; dilution: string;
};
export type Formula = { id: string; name: string; code: string; updatedLabel: string; versions: FormulaVersion[] };
export const materials = [
  {id:'DEMO-M01', name:'Citrus study 01', family:'Citrus', color:'#be904a'},
  {id:'DEMO-M02', name:'Petal study 02', family:'Floral', color:'#9971ad'},
  {id:'DEMO-M03', name:'Wood study 03', family:'Woody', color:'#698474'},
  {id:'DEMO-M04', name:'Soft study 04', family:'Soft', color:'#7c89b2'},
  {id:'DEMO-M05', name:'Green study 05', family:'Green', color:'#8b9b62'},
  {id:'DEMO-M06', name:'Amber study 06', family:'Amber', color:'#b67f65'},
];
const seedIngredients: Ingredient[] = [
  {id:'row-1', materialId:'DEMO-M01', amount:'40'},
  {id:'row-2', materialId:'DEMO-M02', amount:'30'},
  {id:'row-3', materialId:'DEMO-M03', amount:'20'},
  {id:'row-4', materialId:'DEMO-M04', amount:'10'},
];
const version = (id:string, number:number, note:string): FormulaVersion => ({
  id, number, note, createdLabel:'04 Oct 2026', ingredients: seedIngredients.map(x=>({...x})),
  vehicle:'Demo vehicle A', category:'Demo application A', dilution:'20',
});
export function initialFormulas(): Formula[] {
  return [
    {id:'formula-1', name:'Morning Reverie', code:'F-001', updatedLabel:'Today', versions:[version('v1',1,'Initial study'),version('v2',2,'Updated study'),version('v3',3,'Review-ready demo snapshot')]},
    {id:'formula-2', name:'Quiet Woods', code:'F-002', updatedLabel:'Yesterday', versions:[version('w1',1,'First synthetic study')]},
    {id:'formula-3', name:'Petal No. 04', code:'F-003', updatedLabel:'02 Oct', versions:[version('p1',1,'First synthetic study'),version('p2',2,'Second synthetic study')]},
  ];
}
export function validateIngredients(items:Ingredient[]): string | null {
  if (!items.length) return 'Add at least one demo material.';
  if (new Set(items.map(x=>x.materialId)).size !== items.length) return 'A material can appear only once in this demo input.';
  if (items.some(x=>!materials.some(m=>m.id===x.materialId))) return 'Choose a listed demo material.';
  if (items.some(x=>!/^\d+(\.\d+)?$/.test(x.amount) || !Number.isFinite(Number(x.amount)) || Number(x.amount)<=0)) return 'Enter a positive decimal amount for every material.';
  return null;
}
export function appendVersion(formula:Formula, draft:FormulaVersion, note:string): Formula {
  const error = validateIngredients(draft.ingredients);
  if(error) throw new Error(error);
  const number = Math.max(...formula.versions.map(x=>x.number)) + 1;
  const next:FormulaVersion = {...draft, id:`${formula.id}-v${number}`, number, note, createdLabel:'This session', ingredients:draft.ingredients.map(x=>({...x}))};
  return {...formula, updatedLabel:'Just now', versions:[...formula.versions,next]};
}
export function downloadDemo(filename:string, value:unknown) {
  const blob = new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)], {type:typeof value==='string'?'text/plain;charset=utf-8':'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
