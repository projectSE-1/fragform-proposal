// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// All records in this module are invented, public-safe fixtures. No scientific rules are encoded.
// Roles and the pages below beyond 'formulas' and 'editor' belong to the roadmap preview, not to
// the alpha build (scope-lock.md). They are kept so the preview pages can still be shown.
export const roles = ['formulator', 'data_curator', 'safety_assessor', 'legal_reviewer', 'approver', 'org_admin', 'system_admin'] as const;
export type Role = typeof roles[number] | 'pending';
export type Page = 'dashboard' | 'formulas' | 'editor' | 'lab' | 'compliance' | 'references' | 'account' | 'admin' | 'tutorial' | 'public' | 'auth';
export type Ingredient = { id: string; materialId: string; amount: string };
export type FormulaVersion = {
  id: string; number: number; createdLabel: string; note: string;
  ingredients: Ingredient[]; vehicle: string; category: string; dilution: string;
};
export type Formula = { id: string; name: string; code: string; updatedLabel: string; versions: FormulaVersion[] };
// Publicly documented aroma chemicals. Identity and odour family are public knowledge, so these
// carry facts only: no measured property, threshold or limit from the owner dataset appears here,
// and none may, because this repository is public (rule 0.1, IP-002).
const realMaterials = [
  {id:'5989-27-5', name:'Limonene', cas:'5989-27-5', family:'Citrus', color:'#be904a', fictional:false},
  {id:'78-70-6',   name:'Linalool', cas:'78-70-6', family:'Floral', color:'#9971ad', fictional:false},
  {id:'106-24-1',  name:'Geraniol', cas:'106-24-1', family:'Floral', color:'#a9789b', fictional:false},
  {id:'80-56-8',   name:'alpha-Pinene', cas:'80-56-8', family:'Woody', color:'#698474', fictional:false},
  {id:'928-96-1',  name:'cis-3-Hexen-1-ol', cas:'928-96-1', family:'Green', color:'#8b9b62', fictional:false},
  {id:'120-51-4',  name:'Benzyl benzoate', cas:'120-51-4', family:'Balsamic', color:'#7c89b2', fictional:false},
  {id:'121-33-5',  name:'Vanillin', cas:'121-33-5', family:'Sweet', color:'#b67f65', fictional:false},
  {id:'97-53-0',   name:'Eugenol', cas:'97-53-0', family:'Spicy', color:'#a9674f', fictional:false},
];
// Fictional study materials. They exist only so the mock limit check has something to attach its
// invented limits to. A fictional limit must never sit on a real substance, and
// limit-check.test.ts fails the build if one does.
const fictionalMaterials = [
  {id:'DEMO-M01', name:'Citrus study 01', cas:null, family:'Citrus', color:'#be904a', fictional:true},
  {id:'DEMO-M02', name:'Petal study 02', cas:null, family:'Floral', color:'#9971ad', fictional:true},
  {id:'DEMO-M03', name:'Wood study 03', cas:null, family:'Woody', color:'#698474', fictional:true},
  {id:'DEMO-M04', name:'Soft study 04', cas:null, family:'Soft', color:'#7c89b2', fictional:true},
  {id:'DEMO-M05', name:'Green study 05', cas:null, family:'Green', color:'#8b9b62', fictional:true},
  {id:'DEMO-M06', name:'Amber study 06', cas:null, family:'Amber', color:'#b67f65', fictional:true},
];
export const materials: {id:string;name:string;cas:string|null;family:string;color:string;fictional:boolean}[] = [...realMaterials, ...fictionalMaterials];

const rows = (pairs:[string,string][]): Ingredient[] => pairs.map(([materialId, amount], i) => ({id:`row-${i+1}`, materialId, amount}));
const realSeed = rows([['5989-27-5','40'],['78-70-6','30'],['80-56-8','20'],['928-96-1','10']]);
const mockSeed = rows([['DEMO-M01','40'],['DEMO-M02','30'],['DEMO-M03','20'],['DEMO-M04','10']]);
const version = (id:string, number:number, note:string, ingredients:Ingredient[]): FormulaVersion => ({
  id, number, note, createdLabel:'04 Oct 2026', ingredients: ingredients.map(x=>({...x})),
  vehicle:'Ethanol 96% (hydroalcoholic)', category:'Fine fragrance (demo category)', dilution:'20',
});
export function initialFormulas(): Formula[] {
  return [
    {id:'formula-1', name:'Morning Reverie', code:'F-001', updatedLabel:'Today', versions:[version('v1',1,'Initial study',realSeed),version('v2',2,'Updated study',realSeed),version('v3',3,'Review-ready demo snapshot',realSeed)]},
    {id:'formula-mock', name:'Mock limit walkthrough', code:'F-MOCK', updatedLabel:'Today', versions:[version('m1',1,'Fictional materials for the mock limit check',mockSeed)]},
    {id:'formula-2', name:'Quiet Woods', code:'F-002', updatedLabel:'Yesterday', versions:[version('w1',1,'First study',rows([['80-56-8','50'],['120-51-4','30'],['97-53-0','20']]))]},
    {id:'formula-3', name:'Petal No. 04', code:'F-003', updatedLabel:'02 Oct', versions:[version('p1',1,'First study',rows([['78-70-6','40'],['106-24-1','35'],['121-33-5','25']])),version('p2',2,'Second study',rows([['78-70-6','45'],['106-24-1','30'],['121-33-5','25']]))]},
  ];
}
export function can(role:Role, action:'read'|'formula.write'|'lab.write'|'document.write'|'admin'): boolean {
  if (role === 'pending') return false;
  if (action === 'read') return true;
  if (action === 'formula.write') return ['formulator','org_admin','system_admin'].includes(role);
  if (action === 'lab.write') return role === 'formulator';
  if (action === 'document.write') return ['formulator','data_curator','org_admin','system_admin'].includes(role);
  return ['org_admin','system_admin'].includes(role);
}
// `known` says which material ids are allowed: the built-in list by default, the active reference
// data in the workspace, any valid CAS or mock id on the server (lib/store.ts).
export function validateIngredients(items:Ingredient[], known:(id:string)=>boolean = id=>materials.some(m=>m.id===id)): string | null {
  if (!items.length) return 'Add at least one demo material.';
  if (new Set(items.map(x=>x.materialId)).size !== items.length) return 'A material can appear only once in this demo input.';
  if (items.some(x=>!known(x.materialId))) return 'Choose a listed demo material.';
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


function toNumber(value:string):number {const n=Number(value);return Number.isFinite(n)?n:0;}

// The three odour weightings of calculation-engine.md 6.1. The caller names one and gets exactly
// that one back; a weighting whose inputs are absent reports what is missing and draws nothing.
// Nothing here ever substitutes mass for another weighting.
export const weightings = ['odour_units','mass'] as const;
export type Weighting = typeof weightings[number];
export type FamilyBar = {family:string;color:string;value:number|null;used:number;total:number;materials:{id:string;name:string;included:boolean}[]};
export type WeightedProfile = {weighting:Weighting;available:boolean;missing:string|null;bars:FamilyBar[]};
// What the profile needs from a material: its family, and for odour units its detection threshold.
export type ProfileMaterial = {id:string;name:string;family:string;color:string;threshold:number|null};
const weightingInput:Record<Weighting,string|null> = {
  mass: null,
  odour_units: 'detection threshold (none of these materials has one in the active material data)',
};
export function weightedProfile(version:FormulaVersion, weighting:Weighting, list:ProfileMaterial[] = materials.map(m=>({...m, threshold:null}))):WeightedProfile {
  const groups = new Map<string,FamilyBar>();
  for (const item of version.ingredients) {
    const material = list.find(m => m.id === item.materialId);
    if (!material) continue;
    const bar = groups.get(material.family) ?? {family:material.family, color:material.color, value:null, used:0, total:0, materials:[]};
    const pct = toNumber(item.amount);
    // A material lacking this weighting's input is listed under its family but adds nothing to the height.
    const height = weighting === 'mass' ? pct : material.threshold !== null && material.threshold > 0 ? pct / material.threshold : null;
    bar.total += 1;
    bar.materials.push({id:material.id, name:material.name, included:height !== null});
    if (height !== null) { bar.value = (bar.value ?? 0) + height; bar.used += 1; }
    groups.set(material.family, bar);
  }
  const bars = [...groups.values()].map(b => ({...b, value: b.value === null ? null : Number(b.value.toFixed(6))}))
    .sort((a,b) => (b.value ?? -1) - (a.value ?? -1) || a.family.localeCompare(b.family));
  const available = weighting === 'mass' || bars.some(b => b.value !== null);
  return {weighting, available, missing: available ? null : weightingInput[weighting], bars};
}
