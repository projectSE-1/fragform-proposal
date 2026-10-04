// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialFormulas, materials} from '../lib/model.ts';
import type {FormulaVersion} from '../lib/model.ts';
import {checkStandardLimit, checkSupplierCertificate, compareDecimal, productShare, summarizeStandardLimits} from '../lib/limit-check.ts';
import {demoStandardLimits, demoSuppliers} from '../lib/limit-check-fixtures.ts';

const seeded=():FormulaVersion=>structuredClone(initialFormulas()[0].versions.at(-1)!);
const withAmounts=(amounts:string[],patch:Partial<FormulaVersion>={}):FormulaVersion=>{
  const draft=seeded();
  draft.ingredients=amounts.map((amount,i)=>({id:`row-${i}`,materialId:`DEMO-M0${i+1}`,amount}));
  return {...draft,...patch};
};

test('finished-product share applies the dilution once with exact decimals',()=>{
  assert.equal(productShare('10','20'),'2');
  assert.equal(productShare('33.333333333333','20'),'6.6666666666666');
  assert.equal(productShare('0.1','0.5'),'0.0005');
  assert.equal(productShare('100','100'),'100');
  assert.equal(compareDecimal('2.50','2.5'),0);
  assert.equal(compareDecimal('2.5000000000001','2.5'),1);
  assert.equal(compareDecimal('0.0005','0.001'),-1);
});

test('the seeded formula shows a pass, an exceed and a missing limit without editing',()=>{
  const draft=seeded();
  assert.equal(draft.category,'Demo application A');
  const m04=checkStandardLimit(draft,'DEMO-M04');
  assert.equal(m04.status,'pass');
  assert.equal(m04.productPct,'2');
  assert.equal(m04.limitPct,'2.5');
  assert.equal(m04.differencePct,'0.5');
  const m02=checkStandardLimit(draft,'DEMO-M02');
  assert.equal(m02.status,'exceed');
  assert.equal(m02.productPct,'6');
  assert.equal(m02.differencePct,'1');
  assert.equal(m02.maxDeclaredPct,'25');
  assert.equal(m02.maxDeclaredExact,true);
  const m03=checkStandardLimit(draft,'DEMO-M03');
  assert.equal(m03.status,'no_limit_defined');
  assert.equal(m03.productPct,'4');
  assert.equal(m03.limitPct,null);
  assert.deepEqual(summarizeStandardLimits(draft),{pass:2,exceed:1,no_limit_defined:1,data_missing:0});
});

test('the application changes which limit row applies',()=>{
  const draft={...seeded(),category:'Demo application B'};
  assert.equal(checkStandardLimit(draft,'DEMO-M01').status,'exceed');
  assert.equal(checkStandardLimit(draft,'DEMO-M02').status,'pass');
  assert.equal(checkStandardLimit(draft,'DEMO-M04').status,'exceed');
  assert.equal(checkStandardLimit({...draft,category:'Unlisted application'},'DEMO-M01').status,'no_limit_defined');
});

test('a value exactly at the limit is within; one smallest step above exceeds',()=>{
  const at=withAmounts(['35','30','20','15'],{dilution:'10'}); // DEMO-M04: 15 × 10 / 100 = 1.5 ≤ 2.5
  assert.equal(checkStandardLimit(at,'DEMO-M04').status,'pass');
  const equal=withAmounts(['37.5','30','20','12.5']); // DEMO-M04: 12.5 × 20 / 100 = 2.5 = limit
  const finding=checkStandardLimit(equal,'DEMO-M04');
  assert.equal(finding.status,'pass');
  assert.equal(finding.differencePct,'0');
  const above=withAmounts(['37.499999999999','30','20','12.500000000001']);
  assert.equal(checkStandardLimit(above,'DEMO-M04').status,'exceed');
});

test('a non-terminating maximum is rounded down so it never crosses the limit',()=>{
  const draft=withAmounts(['40','30','20','10'],{dilution:'30'}); // DEMO-M02 max = 5 × 100 / 30 = 16.666…
  const finding=checkStandardLimit(draft,'DEMO-M02');
  assert.equal(finding.status,'exceed');
  assert.equal(finding.maxDeclaredPct,'16.6666');
  assert.equal(finding.maxDeclaredExact,false);
  assert.ok(compareDecimal(productShare(finding.maxDeclaredPct!,'30'),'5')<=0);
});

test('invalid input never produces a pass: total, dilution and absent rows are data_missing',()=>{
  const notHundred=withAmounts(['40','30','20','9']);
  const finding=checkStandardLimit(notHundred,'DEMO-M04');
  assert.equal(finding.status,'data_missing');
  assert.equal(finding.missing,'invalid_input');
  assert.equal(finding.productPct,null);
  assert.ok(finding.inputError);
  for(const dilution of ['','0','101','abc','1e2']){
    const bad=checkStandardLimit({...seeded(),dilution},'DEMO-M04');
    assert.equal(bad.status,'data_missing',dilution);
    assert.equal(bad.productPct,null,dilution);
  }
  assert.equal(checkStandardLimit(seeded(),'DEMO-M06').missing,'not_in_formula');
  assert.deepEqual(summarizeStandardLimits(notHundred),{pass:0,exceed:0,no_limit_defined:0,data_missing:4});
});

test('supplier evidence stays separate: no certificate is missing evidence, not a pass',()=>{
  const draft=seeded();
  const a=checkSupplierCertificate(draft,'DEMO-M04','DEMO-SUP-A');
  assert.equal(a.status,'data_missing');
  assert.equal(a.missing,'no_certificate');
  const b=checkSupplierCertificate(draft,'DEMO-M04','DEMO-SUP-B');
  assert.equal(b.status,'pass');
  assert.equal(b.limitPct,'3');
  assert.equal(checkSupplierCertificate(draft,'DEMO-M02','DEMO-SUP-B').status,'exceed');
  // The standard has no row for DEMO-M03; the certificate's own level is reported on its own.
  assert.equal(checkStandardLimit(draft,'DEMO-M03').status,'no_limit_defined');
  assert.equal(checkSupplierCertificate(draft,'DEMO-M03','DEMO-SUP-B').status,'pass');
  assert.equal(checkSupplierCertificate({...draft,category:'Unlisted application'},'DEMO-M04','DEMO-SUP-B').missing,'not_listed');
});

test('fixtures stay fictional: demo IDs only and no CAS-number-shaped strings',()=>{
  const ids=new Set(materials.map(m=>m.id));
  const tables=[demoStandardLimits,...demoSuppliers.flatMap(s=>s.certificate?[s.certificate.limits]:[])];
  for(const table of tables) for(const rows of Object.values(table)) for(const [id,limit] of Object.entries(rows)){
    assert.ok(ids.has(id),id);
    assert.match(id,/^DEMO-M\d\d$/);
    assert.match(limit,/^\d+(\.\d+)?$/);
    assert.ok(Number(limit)>0,`${id} limit must be positive`);
  }
  for(const supplier of demoSuppliers) assert.match(supplier.id,/^DEMO-SUP-/);
  const source=readFileSync(new URL('../lib/limit-check-fixtures.ts',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\b\d{2,7}-\d{2}-\d\b/);
});
