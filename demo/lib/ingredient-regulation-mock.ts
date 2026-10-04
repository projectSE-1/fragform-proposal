// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Standalone presentation fixture only. Every bound below is invented; none is a legal/IFRA limit.
import type {FormulaVersion, Ingredient} from './model.ts';
import {validateDemoDeclaration} from './formula-validation.ts';

export const INGREDIENT_REGULATION_MOCK_VERSION = 'DEMO-INGREDIENT-CHECKS-UI-v1';
export type IngredientRegulationMockOutcome = 'within_mock_limit' | 'exceeds_mock_limit' | 'insufficient_data';
export type IngredientRegulationMockReason =
  | 'within_limit' | 'exceeds_limit' | 'unknown_material' | 'missing_rule'
  | 'invalid_amount' | 'invalid_dilution' | 'invalid_declaration'
  | 'missing_category' | 'unsupported_category' | 'missing_vehicle' | 'unsupported_vehicle';
type BilingualCopy = readonly [english: string, thai: string];

export type IngredientRegulationMockAssessment = {
  outcome: IngredientRegulationMockOutcome;
  capPercent: number | null;
  sourceId: string | null;
  ruleVersion: string | null;
  sourceKind: 'invented_ui_fixture';
  basis: 'finished_product_w_w_percent';
  reason: IngredientRegulationMockReason;
  label: BilingualCopy;
  explanationEn: string;
  explanationTh: string;
};
export type IngredientRegulationMockFinding = {
  rowId: string;
  materialId: string;
  declaredAmountText: string;
  finishedProductPercent: number | null;
  th: IngredientRegulationMockAssessment;
  ifra: IngredientRegulationMockAssessment;
};
export type IngredientRegulationMockReport = {
  mode: 'synthetic';
  mockRuleVersion: typeof INGREDIENT_REGULATION_MOCK_VERSION;
  actualEngineStatus: 'insufficient_data';
  snapshot: {
    versionId: string;
    versionNumber: number;
    category: string;
    vehicle: string;
    dilutionText: string;
    ingredients: Ingredient[];
    declaredBasis: 'concentrate_w_w_percent';
    comparisonBasis: 'finished_product_w_w_percent';
  };
  ingredients: IngredientRegulationMockFinding[];
};

// Deliberately supports only the public synthetic materials and context in model.ts.
// A missing entry cannot turn into a pass, and these fixtures are never a service fallback.
const MOCK_MATERIAL_IDS = new Set(['DEMO-M01', 'DEMO-M02', 'DEMO-M03', 'DEMO-M04', 'DEMO-M05', 'DEMO-M06']);
const INVENTED_BOUNDS: Record<string, {th: number | null; ifra: number | null}> = {
  'DEMO-M01': {th: 10, ifra: 5},
  'DEMO-M02': {th: 8, ifra: 8},
  'DEMO-M03': {th: null, ifra: 6},
  'DEMO-M04': {th: 3, ifra: null},
};
const REASON_COPY: Record<IngredientRegulationMockReason, BilingualCopy> = {
  within_limit: ['Does not exceed this invented presentation bound. This is not regulatory approval.', 'ไม่เกินตัวเลขสมมติสำหรับพรีเซนต์ ไม่ใช่ผลรับรองตามกฎหมายหรือมาตรฐานจริง'],
  exceeds_limit: ['Exceeds this invented presentation bound. It does not identify a real prohibited substance.', 'สูงกว่าตัวเลขสมมติสำหรับพรีเซนต์ ไม่ได้ระบุว่าเป็นสารต้องห้ามจริง'],
  unknown_material: ['Only the listed invented DEMO materials can be checked in this presentation.', 'เดโมนี้ตรวจได้เฉพาะวัตถุดิบสมมติรหัส DEMO ที่อยู่ในรายการ'],
  missing_rule: ['No invented bound is supplied for this material in this lane. No pass is inferred.', 'ยังไม่มีเกณฑ์สมมติของวัตถุดิบนี้ในฝั่งนี้ จึงไม่สรุปว่าผ่าน'],
  invalid_amount: ['Enter a positive decimal concentrate percentage, up to 100%, with at most 12 decimal places.', 'ระบุสัดส่วนในหัวน้ำหอมเป็นทศนิยมมากกว่า 0 ถึง 100% และไม่เกิน 12 ตำแหน่ง'],
  invalid_dilution: ['Declare a positive decimal product dilution, up to 100%, with at most 12 decimal places. Nothing defaults to 100%.', 'ต้องระบุการเจือจางในผลิตภัณฑ์เป็นทศนิยมมากกว่า 0 ถึง 100% และไม่เกิน 12 ตำแหน่ง ไม่มีการสมมติให้เป็น 100%'],
  invalid_declaration: ['The demo requires a unique listed material in each row and a declared total of exactly 100%. Values are not normalised.', 'ต้องใช้วัตถุดิบในรายการโดยไม่ซ้ำ และสัดส่วนรวมเท่ากับ 100% พอดี เดโมไม่ปรับสัดส่วนให้อัตโนมัติ'],
  missing_category: ['An application must be declared before a mock bound can be selected.', 'ต้องระบุหมวดการใช้งานก่อนเลือกเกณฑ์สมมติ'],
  unsupported_category: ['Mock bounds are provided only for Demo application A. This application has no applicable mock rules.', 'เกณฑ์สมมติมีเฉพาะ Demo application A หมวดที่เลือกยังไม่มีเกณฑ์สมมติที่ใช้ได้'],
  missing_vehicle: ['A vehicle must be declared for the presentation context.', 'ต้องระบุตัวพาสำหรับบริบทตัวอย่างนี้'],
  unsupported_vehicle: ['This mock scenario supports only Demo vehicle A. No verdict is inferred for another vehicle.', 'ตัวอย่างนี้รองรับเฉพาะ Demo vehicle A จึงไม่สรุปผลสำหรับตัวพาอื่น'],
};

// Number arithmetic here is bounded display arithmetic, not the production decimal/uncertainty engine.
function readPositiveDemoPercent(text: string): number | null {
  if (!/^\d+(?:\.\d{1,12})?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : null;
}

function missing(reason: IngredientRegulationMockReason): IngredientRegulationMockAssessment {
  return {
    outcome: 'insufficient_data', capPercent: null, sourceId: null, ruleVersion: null,
    sourceKind: 'invented_ui_fixture', basis: 'finished_product_w_w_percent', reason,
    label: ['Insufficient mock data', 'ข้อมูลจำลองไม่เพียงพอ'],
    explanationEn: REASON_COPY[reason][0], explanationTh: REASON_COPY[reason][1],
  };
}

function compareMockBound(materialId: string, lane: 'th' | 'ifra', finishedProductPercent: number): IngredientRegulationMockAssessment {
  const capPercent = INVENTED_BOUNDS[materialId]?.[lane];
  if (capPercent == null) return missing('missing_rule');
  const exceeds = finishedProductPercent > capPercent;
  const reason = exceeds ? 'exceeds_limit' : 'within_limit';
  return {
    outcome: exceeds ? 'exceeds_mock_limit' : 'within_mock_limit', capPercent,
    sourceId: `DEMO-${lane.toUpperCase()}-${materialId.slice(5)}-UI`,
    ruleVersion: INGREDIENT_REGULATION_MOCK_VERSION,
    sourceKind: 'invented_ui_fixture', basis: 'finished_product_w_w_percent', reason,
    label: exceeds ? ['Above mock limit', 'สูงกว่าเกณฑ์สมมติ'] : ['Within mock limit', 'ไม่เกินเกณฑ์สมมติ'],
    explanationEn: REASON_COPY[reason][0], explanationTh: REASON_COPY[reason][1],
  };
}

/** Invoke explicitly for a presentation; never feed this report into real evaluation, exports or approvals. */
export function evaluateIngredientRegulationMock(draft: Readonly<FormulaVersion>): IngredientRegulationMockReport {
  const dilution = readPositiveDemoPercent(draft.dilution);
  let contextReason: IngredientRegulationMockReason | null = null;
  if (!draft.category.trim()) contextReason = 'missing_category';
  else if (draft.category !== 'Demo application A') contextReason = 'unsupported_category';
  else if (!draft.vehicle.trim()) contextReason = 'missing_vehicle';
  else if (draft.vehicle !== 'Demo vehicle A') contextReason = 'unsupported_vehicle';
  else if (dilution === null) contextReason = 'invalid_dilution';
  else if (validateDemoDeclaration(draft.ingredients)) contextReason = 'invalid_declaration';

  const ingredients = draft.ingredients.map((ingredient): IngredientRegulationMockFinding => {
    const amount = readPositiveDemoPercent(ingredient.amount);
    const reason = !MOCK_MATERIAL_IDS.has(ingredient.materialId) ? 'unknown_material'
      : amount === null ? 'invalid_amount' : contextReason;
    // The declared dilution is applied exactly once to the concentrate declaration.
    const finishedProductPercent = reason === null && dilution !== null && amount !== null
      ? amount * dilution / 100 : null;
    return {
      rowId: ingredient.id, materialId: ingredient.materialId, declaredAmountText: ingredient.amount,
      finishedProductPercent,
      th: reason !== null ? missing(reason) : compareMockBound(ingredient.materialId, 'th', finishedProductPercent!),
      ifra: reason !== null ? missing(reason) : compareMockBound(ingredient.materialId, 'ifra', finishedProductPercent!),
    };
  });
  return {
    mode: 'synthetic', mockRuleVersion: INGREDIENT_REGULATION_MOCK_VERSION, actualEngineStatus: 'insufficient_data',
    snapshot: {
      versionId: draft.id, versionNumber: draft.number, category: draft.category, vehicle: draft.vehicle,
      dilutionText: draft.dilution, ingredients: draft.ingredients.map(ingredient => ({...ingredient})),
      declaredBasis: 'concentrate_w_w_percent', comparisonBasis: 'finished_product_w_w_percent',
    },
    ingredients,
  };
}
