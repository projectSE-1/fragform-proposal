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
// Publicly documented aroma chemicals, used here as labels only. Identity and odour family are
// public knowledge. No measured property, threshold or limit from the owner dataset appears in
// this file, and none ever may: this repository is public (rule 0.1, IP-002).
export const materials = [
  {id:'5989-27-5', name:'Limonene', cas:'5989-27-5', family:'Citrus', color:'#be904a'},
  {id:'78-70-6',   name:'Linalool', cas:'78-70-6',   family:'Floral', color:'#9971ad'},
  {id:'106-24-1',  name:'Geraniol', cas:'106-24-1',  family:'Floral', color:'#a9789b'},
  {id:'80-56-8',   name:'alpha-Pinene', cas:'80-56-8', family:'Woody', color:'#698474'},
  {id:'928-96-1',  name:'cis-3-Hexen-1-ol', cas:'928-96-1', family:'Green', color:'#8b9b62'},
  {id:'120-51-4',  name:'Benzyl benzoate', cas:'120-51-4', family:'Balsamic', color:'#7c89b2'},
  {id:'121-33-5',  name:'Vanillin', cas:'121-33-5', family:'Sweet', color:'#b67f65'},
  {id:'97-53-0',   name:'Eugenol', cas:'97-53-0',   family:'Spicy', color:'#a9674f'},
];

// A FICTIONAL regulator, invented for this demo so the four finding states can be seen on screen.
// It is not IFRA, not EU CosIng and not any real instrument. Real restriction rows come from the
// supplied IFRA Standards extract, which is not in this repository and has not been extracted yet,
// so no real limit is reproduced here. Inventing one would be inventing a domain rule.
export const demoRegulation = {code:'DEMO-REG', label:'Demo rule set 01 (fictional)', note:'Fictional demonstration rule. Not IFRA. Not a real limit.'};
export const demoRestrictions: {materialId:string; category:string; maxPctInProduct:string; locator:string}[] = [
  {materialId:'78-70-6',  category:'Demo category 4', maxPctInProduct:'2.0',  locator:'DEMO-REG 01 / row 1'},
  {materialId:'928-96-1', category:'Demo category 4', maxPctInProduct:'0.25', locator:'DEMO-REG 01 / row 2'},
];
const seedIngredients: Ingredient[] = [
  {id:'row-1', materialId:'5989-27-5', amount:'40'},
  {id:'row-2', materialId:'78-70-6', amount:'30'},
  {id:'row-3', materialId:'80-56-8', amount:'20'},
  {id:'row-4', materialId:'928-96-1', amount:'10'},
];
const version = (id:string, number:number, note:string): FormulaVersion => ({
  id, number, note, createdLabel:'04 Oct 2026', ingredients: seedIngredients.map(x=>({...x})),
  vehicle:'Ethanol 96% (hydroalcoholic)', category:'Demo category 4', dilution:'20',
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


// ---------------------------------------------------------------------------
// Declared-quantity arithmetic. Exact decimal strings in, strings out: no float
// rounding on a business value. These are declarations and ratios only. Nothing
// here is a chemical prediction, and nothing here needs an approved model.
// ---------------------------------------------------------------------------
function toNumber(value:string):number {const n=Number(value);return Number.isFinite(n)?n:0;}

export type Row = {
  item: Ingredient;
  material: typeof materials[number] | undefined;
  pctInFormula: string;      // as declared, w/w
  pctInProduct: string|null; // declared share diluted into the finished product
  massInBatch: string|null;  // grams, only when a batch target is declared
};

export function rows(version:FormulaVersion, batchGrams:string):Row[] {
  const dilution = /^\d+(\.\d+)?$/.test(version.dilution) ? toNumber(version.dilution) : null;
  const batch = /^\d+(\.\d+)?$/.test(batchGrams) && toNumber(batchGrams) > 0 ? toNumber(batchGrams) : null;
  return version.ingredients.map(item => {
    const pct = toNumber(item.amount);
    return {
      item,
      material: materials.find(m => m.id === item.materialId),
      pctInFormula: item.amount,
      pctInProduct: dilution === null ? null : (pct * dilution / 100).toFixed(4),
      massInBatch: batch === null ? null : (pct * batch / 100).toFixed(3),
    };
  });
}

// Composition share by odour family. This is arithmetic on declared percentages,
// presented as composition, never as perceived strength. The odour-unit and
// categorical-strength weightings need observations we do not have
// (calculation-engine.md 6.1).
export function familyShares(version:FormulaVersion):{family:string;pct:number;color:string}[] {
  const totals = new Map<string,{pct:number;color:string}>();
  for (const item of version.ingredients) {
    const material = materials.find(m => m.id === item.materialId);
    if (!material) continue;
    const current = totals.get(material.family) ?? {pct:0, color:material.color};
    totals.set(material.family, {pct: current.pct + toNumber(item.amount), color: current.color});
  }
  return [...totals.entries()].map(([family, value]) => ({family, ...value})).sort((a,b)=>b.pct-a.pct);
}

export type Finding = {
  row: Row;
  status: 'within' | 'over' | 'data_missing';
  limit: string|null;
  locator: string|null;
  missing: string|null;
};

export function findings(version:FormulaVersion, batchGrams:string):Finding[] {
  return rows(version, batchGrams).map(row => {
    const rule = demoRestrictions.find(r => r.materialId === row.item.materialId && r.category === version.category);
    if (!rule) return {row, status:'data_missing' as const, limit:null, locator:null, missing:'No sourced restriction row for this material and category.'};
    if (row.pctInProduct === null) return {row, status:'data_missing' as const, limit:rule.maxPctInProduct, locator:rule.locator, missing:'Product dilution is not declared, so the finished-product share cannot be compared.'};
    return {
      row,
      status: Number(row.pctInProduct) > Number(rule.maxPctInProduct) ? 'over' as const : 'within' as const,
      limit: rule.maxPctInProduct,
      locator: rule.locator,
      missing: null,
    };
  });
}
