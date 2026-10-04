// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Fixed screen examples; unrelated to the material or formula currently selected by the presenter.
import {evaluateIngredientRegulationMock} from './ingredient-regulation-mock';
import type {FormulaVersion} from './model';

function previewInput(mode:'pass'|'exceed'):FormulaVersion{
  return {id:`DEMO-LAYOUT-${mode.toUpperCase()}`,number:1,createdLabel:'Fixed UI example',note:'Presentation layout only',vehicle:'Demo vehicle A',category:'Demo application A',dilution:'20',ingredients:[
    {id:'preview-primary',materialId:'DEMO-M01',amount:mode==='pass'?'20':'60'},
    {id:'preview-balance',materialId:'DEMO-M02',amount:mode==='pass'?'80':'40'},
  ]};
}

// Only preview-primary is displayed: 4% below both invented bounds, or 12% above both.
export const ingredientRegulationPreviews={
  pass:evaluateIngredientRegulationMock(previewInput('pass')),
  exceed:evaluateIngredientRegulationMock(previewInput('exceed')),
} as const;
