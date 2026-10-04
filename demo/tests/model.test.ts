// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {appendVersion, initialFormulas} from '../lib/model.ts';
import {validateDemoDeclaration} from '../lib/formula-validation.ts';
const declaration = (amounts:string[])=>amounts.map((amount,i)=>({id:`row-${i}`,materialId:`DEMO-M0${i+1}`,amount}));
test('exact decimal declarations never normalise or round an invalid total',()=>{
  assert.equal(validateDemoDeclaration(declaration(['33.333333333333','33.333333333333','33.333333333334'])),null);
  assert.equal(validateDemoDeclaration(declaration(['0.1','0.2','99.7'])),null);
  assert.ok(validateDemoDeclaration(declaration(['33.333333333333','33.333333333333','33.333333333333'])));
  assert.ok(validateDemoDeclaration(declaration(['100.000000000001'])));
  for(const input of ['','-1','1e2','NaN','Infinity','0','100x','0.0000000000001']) assert.ok(validateDemoDeclaration(declaration([input])),input);
});
test('a new version preserves historical values and owns its ingredient objects',()=>{
  const formula=initialFormulas()[0];
  const before=JSON.stringify(formula);
  const draft=structuredClone(formula.versions.at(-1)!);
  draft.ingredients[0].amount='35.5000';draft.ingredients[1].amount='34.5000';
  const next=appendVersion(formula,draft,'Synthetic test');
  assert.equal(JSON.stringify(formula),before);
  assert.equal(next.versions.length,4);
  assert.equal(next.versions.at(-1)!.number,4);
  assert.equal(next.versions.at(-1)!.ingredients[0].amount,'35.5000');
  draft.ingredients[0].amount='20';
  assert.equal(next.versions.at(-1)!.ingredients[0].amount,'35.5000');
  assert.equal(formula.versions.at(-1)!.ingredients[0].amount,'40');
});
