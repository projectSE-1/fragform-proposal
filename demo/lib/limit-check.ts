// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Mock limit check for the presentation demo: a real, exact comparison of the declared input
// against FICTIONAL limits (limit-check-fixtures.ts). It is never an official regulatory result.
import type {FormulaVersion} from './model.ts';
import {validateDemoContext} from './formula-validation.ts';
import {demoLimitStandard, demoStandardLimits, demoSuppliers} from './limit-check-fixtures.ts';

// Shapes follow calculation-engine.md §7: pass / exceed / no_limit_defined / data_missing.
export type LimitStatus='pass'|'exceed'|'no_limit_defined'|'data_missing';
export type LimitMissing='invalid_input'|'not_in_formula'|'no_certificate'|'not_listed';
export type LimitFinding={
  status:LimitStatus;
  materialId:string;
  application:string;
  sourceId:string;
  sourceVersion:string;
  locator:string|null;
  missing:LimitMissing|null;
  inputError:string|null;
  declaredPct:string|null;
  dilutionPct:string|null;
  productPct:string|null;
  limitPct:string|null;
  // pass: headroom below the limit; exceed: amount above it. Percentage points, exact.
  differencePct:string|null;
  // Largest declared % in the formula that stays within the limit at this dilution, rounded down.
  maxDeclaredPct:string|null;
  maxDeclaredExact:boolean;
};

type Decimal={units:bigint;scale:number};
const DECIMAL=/^\d+(\.\d+)?$/;
function parse(value:string):Decimal {
  const [integer,fraction='']=value.split('.');
  return {units:BigInt(integer+fraction),scale:fraction.length};
}
function align(a:Decimal,b:Decimal):[bigint,bigint,number] {
  const scale=Math.max(a.scale,b.scale);
  return [a.units*10n**BigInt(scale-a.scale),b.units*10n**BigInt(scale-b.scale),scale];
}
export function formatDecimal({units,scale}:Decimal):string {
  const negative=units<0n;
  const digits=(negative?-units:units).toString().padStart(scale+1,'0');
  const integer=digits.slice(0,digits.length-scale);
  const fraction=digits.slice(digits.length-scale).replace(/0+$/,'');
  return `${negative?'-':''}${integer}${fraction?`.${fraction}`:''}`;
}
// pct_in_product = pct_in_formula × concentrate_in_product_pct / 100, applied exactly once.
export function productShare(declaredPct:string,dilutionPct:string):string {
  const a=parse(declaredPct),d=parse(dilutionPct);
  return formatDecimal({units:a.units*d.units,scale:a.scale+d.scale+2});
}
export function compareDecimal(a:string,b:string):number {
  const [x,y]=align(parse(a),parse(b));
  return x===y?0:x<y?-1:1;
}
function difference(a:string,b:string):string {
  const [x,y,scale]=align(parse(a),parse(b));
  return formatDecimal({units:x>y?x-y:y-x,scale});
}
const MAX_DECLARED_PLACES=4;
// limit × 100 / dilution, rounded down so the suggested amount never crosses the limit.
function maxDeclared(limitPct:string,dilutionPct:string):{value:string;exact:boolean} {
  const l=parse(limitPct),d=parse(dilutionPct);
  const numerator=l.units*100n*10n**BigInt(d.scale+MAX_DECLARED_PLACES);
  const denominator=d.units*10n**BigInt(l.scale);
  return {value:formatDecimal({units:numerator/denominator,scale:MAX_DECLARED_PLACES}),exact:numerator%denominator===0n};
}

function compare(draft:FormulaVersion,materialId:string,limit:string|undefined,sourceId:string,sourceVersion:string,locator:string,noLimit:'no_limit_defined'|LimitMissing):LimitFinding {
  const item=draft.ingredients.find(x=>x.materialId===materialId);
  const base:LimitFinding={status:'data_missing',materialId,application:draft.category,sourceId,sourceVersion,locator:null,missing:null,inputError:null,declaredPct:item?.amount??null,dilutionPct:draft.dilution,productPct:null,limitPct:null,differencePct:null,maxDeclaredPct:null,maxDeclaredExact:false};
  if(!item) return {...base,missing:'not_in_formula'};
  // A formula that fails the exact 100% / dilution contract has no product basis to compare.
  const inputError=validateDemoContext(draft);
  if(inputError||!DECIMAL.test(item.amount)||!DECIMAL.test(draft.dilution)) return {...base,missing:'invalid_input',inputError:inputError||'Invalid declared amount or dilution.'};
  const productPct=productShare(item.amount,draft.dilution);
  if(limit===undefined) return noLimit==='no_limit_defined'?{...base,status:'no_limit_defined',productPct}:{...base,productPct,missing:noLimit};
  const max=maxDeclared(limit,draft.dilution);
  return {...base,status:compareDecimal(productPct,limit)<=0?'pass':'exceed',locator,productPct,limitPct:limit,differencePct:difference(productPct,limit),maxDeclaredPct:max.value,maxDeclaredExact:max.exact};
}

export function checkStandardLimit(draft:FormulaVersion,materialId:string):LimitFinding {
  const limit=demoStandardLimits[draft.category]?.[materialId];
  return compare(draft,materialId,limit,demoLimitStandard.id,demoLimitStandard.version,`${demoLimitStandard.id} ${demoLimitStandard.version} / ${draft.category} / ${materialId}`,'no_limit_defined');
}

export function checkSupplierCertificate(draft:FormulaVersion,materialId:string,supplierId:string):LimitFinding {
  const supplier=demoSuppliers.find(x=>x.id===supplierId);
  const certificate=supplier?.certificate??null;
  if(!certificate) return compare(draft,materialId,undefined,supplierId,'—','','no_certificate');
  // A certificate that does not list this material/application is missing evidence, not a pass.
  return compare(draft,materialId,certificate.limits[draft.category]?.[materialId],certificate.id,certificate.version,`${certificate.id} ${certificate.version} / ${draft.category} / ${materialId}`,'not_listed');
}

export function summarizeStandardLimits(draft:FormulaVersion):Record<LimitStatus,number> {
  const counts:Record<LimitStatus,number>={pass:0,exceed:0,no_limit_defined:0,data_missing:0};
  for(const item of draft.ingredients) counts[checkStandardLimit(draft,item.materialId).status]++;
  return counts;
}
