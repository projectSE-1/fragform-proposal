// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialFormulas} from '../lib/model.ts';
import type {FormulaVersion} from '../lib/model.ts';
import {evaluateIngredientRegulationMock, INGREDIENT_REGULATION_MOCK_VERSION} from '../lib/ingredient-regulation-mock.ts';

const draft = (): FormulaVersion => structuredClone(initialFormulas()[0].versions.at(-1)!);

test('synthetic checks apply declared dilution once and keep TH and IFRA mock outcomes separate', () => {
  const report = evaluateIngredientRegulationMock(draft());
  assert.equal(report.mode, 'synthetic');
  assert.equal(report.actualEngineStatus, 'insufficient_data');
  assert.equal(report.mockRuleVersion, INGREDIENT_REGULATION_MOCK_VERSION);
  assert.deepEqual(report.ingredients.map(row => row.finishedProductPercent), [8, 6, 4, 2]);
  assert.equal(report.ingredients[0].th.outcome, 'within_mock_limit');
  assert.equal(report.ingredients[0].ifra.outcome, 'exceeds_mock_limit');
  assert.equal(report.ingredients[0].ifra.capPercent, 5);
  assert.equal(report.ingredients[0].ifra.sourceId, 'DEMO-IFRA-M01-UI');
  assert.equal(report.ingredients[0].ifra.sourceKind, 'invented_ui_fixture');
  assert.equal(report.ingredients[0].ifra.basis, 'finished_product_w_w_percent');
  assert.equal(report.ingredients[1].th.outcome, 'within_mock_limit');
  assert.equal(report.ingredients[2].th.outcome, 'insufficient_data');
  assert.equal(report.ingredients[2].th.reason, 'missing_rule');
  assert.equal(report.ingredients[2].ifra.outcome, 'within_mock_limit');
  assert.equal(report.ingredients[3].th.outcome, 'within_mock_limit');
  assert.equal(report.ingredients[3].ifra.outcome, 'insufficient_data');
});

test('equality is within the invented bound; an explicitly greater declaration exceeds it', () => {
  const input = draft();
  input.ingredients[0].amount = '25';
  input.ingredients[1].amount = '45';
  let result = evaluateIngredientRegulationMock(input).ingredients[0];
  assert.equal(result.finishedProductPercent, 5);
  assert.equal(result.ifra.outcome, 'within_mock_limit');
  input.ingredients[0].amount = '25.000000000001';
  input.ingredients[1].amount = '44.999999999999';
  result = evaluateIngredientRegulationMock(input).ingredients[0];
  assert.ok(result.finishedProductPercent! > 5);
  assert.equal(result.ifra.outcome, 'exceeds_mock_limit');
});

test('missing, unsupported or malformed context never supplies an applicable mock limit', () => {
  const variations: Array<[keyof Pick<FormulaVersion, 'category' | 'vehicle' | 'dilution'>, string]> = [
    ['category', ''], ['category', 'Demo application B'], ['vehicle', ''], ['vehicle', 'Demo vehicle B'],
    ['dilution', ''], ['dilution', '-20'], ['dilution', '0'], ['dilution', '101'],
    ['dilution', '1e2'], ['dilution', 'Infinity'], ['dilution', 'NaN'], ['dilution', '0.0000000000001'],
  ];
  for (const [field, value] of variations) {
    const input = draft();
    input[field] = value;
    const report = evaluateIngredientRegulationMock(input);
    for (const row of report.ingredients) {
      assert.equal(row.finishedProductPercent, null, `${field}: ${value}`);
      for (const assessment of [row.th, row.ifra]) {
        assert.equal(assessment.outcome, 'insufficient_data');
        assert.equal(assessment.capPercent, null);
        assert.equal(assessment.sourceId, null);
      }
    }
  }
});

test('unlisted material, missing mock rules and invalid declarations do not become passes', () => {
  const noRule = draft();
  noRule.ingredients[0].materialId = 'DEMO-M05';
  const noRuleRow = evaluateIngredientRegulationMock(noRule).ingredients[0];
  assert.equal(noRuleRow.finishedProductPercent, 8);
  assert.equal(noRuleRow.th.reason, 'missing_rule');
  assert.equal(noRuleRow.ifra.reason, 'missing_rule');

  const unknown = draft();
  unknown.ingredients[0].materialId = 'REAL-UNKNOWN';
  const unknownReport = evaluateIngredientRegulationMock(unknown);
  assert.equal(unknownReport.ingredients[0].th.reason, 'unknown_material');
  assert.ok(unknownReport.ingredients.every(row => row.th.outcome === 'insufficient_data' && row.ifra.outcome === 'insufficient_data'));

  for (const amount of ['', '-1', '0', '101', 'NaN', '1e2', 'Infinity', '0.0000000000001']) {
    const input = draft();
    input.ingredients[0].amount = amount;
    const report = evaluateIngredientRegulationMock(input);
    assert.equal(report.ingredients[0].th.reason, 'invalid_amount', amount);
    assert.ok(report.ingredients.every(row => row.th.outcome === 'insufficient_data' && row.ifra.outcome === 'insufficient_data'));
  }
  const invalidTotal = draft();
  invalidTotal.ingredients[0].amount = '39';
  assert.ok(evaluateIngredientRegulationMock(invalidTotal).ingredients.every(row => row.th.reason === 'invalid_declaration'));
  const duplicate = draft();
  duplicate.ingredients[1].materialId = duplicate.ingredients[0].materialId;
  assert.ok(evaluateIngredientRegulationMock(duplicate).ingredients.every(row => row.th.reason === 'invalid_declaration'));
});

test('a supported tiny decimal is not rounded to zero before comparison', () => {
  const input = draft();
  input.ingredients = [
    {id: 'tiny', materialId: 'DEMO-M01', amount: '0.000000000001'},
    {id: 'rest', materialId: 'DEMO-M02', amount: '99.999999999999'},
  ];
  const row = evaluateIngredientRegulationMock(input).ingredients[0];
  assert.ok(row.finishedProductPercent! > 0);
  const expected = 0.0000000000002;
  assert.ok(Math.abs(row.finishedProductPercent! - expected) <= expected * Number.EPSILON * 2);
  assert.equal(row.ifra.outcome, 'within_mock_limit');
});

test('evaluation never mutates the input, and its context snapshot owns ingredient objects', () => {
  const input = draft();
  const before = JSON.stringify(input);
  Object.freeze(input.ingredients[0]);
  Object.freeze(input.ingredients);
  Object.freeze(input);
  const report = evaluateIngredientRegulationMock(input);
  assert.equal(JSON.stringify(input), before);
  assert.notEqual(report.snapshot.ingredients[0], input.ingredients[0]);
  report.snapshot.ingredients[0].amount = '1';
  assert.equal(input.ingredients[0].amount, '40');
  assert.equal(report.ingredients[0].declaredAmountText, '40');
});
