// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// MOCK DATA. EVERY NUMBER IN THIS FILE IS INVENTED OR ROUGHLY APPROXIMATED.
//
// Nothing here is measured or taken from the owner dataset, which must never enter this public
// repository. The values exist only so the odour-units, perceived-strength and evolution views can
// be shown working before the real inputs arrive (calculation-engine.md 6.1, 6.3, 9). The interface
// shows them only when the viewer has chosen "Mock", and labels every chart drawn from them as mock.
//
// Replace, do not tune: the real values come from the owner dataset through the backend, and this
// file is deleted.
import type {Weighting} from './model.ts';

export type MockOdour = {
  threshold: number | null;            // MOCK detection threshold, arbitrary units (null = left missing on purpose)
  strength: 'low' | 'medium' | 'high'; // MOCK categorical odour strength
  mw: number;                          // MOCK molecular weight, g/mol
  psat25: number;                      // MOCK vapour pressure at 25 °C, Pa
  tenacityHours: number;               // MOCK "smellable for" hours, the measured-longevity column's stand-in
};

// MOCK. Order-of-magnitude values so top notes leave first and base notes last; none is checked
// against a source. Benzyl benzoate has no threshold on purpose, so the "0 of 1" state is visible.
export const mockOdour: Record<string, MockOdour> = {
  '5989-27-5': {threshold: 10,   strength: 'medium', mw: 136, psat25: 190,  tenacityHours: 2},   // Limonene, MOCK
  '78-70-6':   {threshold: 1,    strength: 'medium', mw: 154, psat25: 20,   tenacityHours: 6},   // Linalool, MOCK
  '106-24-1':  {threshold: 0.5,  strength: 'medium', mw: 154, psat25: 4,    tenacityHours: 24},  // Geraniol, MOCK
  '80-56-8':   {threshold: 5,    strength: 'high',   mw: 136, psat25: 600,  tenacityHours: 1},   // alpha-Pinene, MOCK
  '928-96-1':  {threshold: 0.2,  strength: 'high',   mw: 100, psat25: 130,  tenacityHours: 1},   // cis-3-Hexen-1-ol, MOCK
  '120-51-4':  {threshold: null, strength: 'low',    mw: 212, psat25: 0.03, tenacityHours: 400}, // Benzyl benzoate, MOCK
  '121-33-5':  {threshold: 0.05, strength: 'high',   mw: 152, psat25: 0.03, tenacityHours: 400}, // Vanillin, MOCK
  '97-53-0':   {threshold: 0.3,  strength: 'high',   mw: 164, psat25: 3,    tenacityHours: 48},  // Eugenol, MOCK
  'DEMO-M01':  {threshold: 10,   strength: 'medium', mw: 140, psat25: 200,  tenacityHours: 2},   // fictional material, MOCK
  'DEMO-M02':  {threshold: 1,    strength: 'medium', mw: 150, psat25: 20,   tenacityHours: 8},   // fictional material, MOCK
  'DEMO-M03':  {threshold: 4,    strength: 'high',   mw: 136, psat25: 500,  tenacityHours: 1},   // fictional material, MOCK
  'DEMO-M04':  {threshold: 20,   strength: 'low',    mw: 220, psat25: 0.05, tenacityHours: 300}, // fictional material, MOCK
  'DEMO-M05':  {threshold: 0.3,  strength: 'high',   mw: 100, psat25: 150,  tenacityHours: 1},   // fictional material, MOCK
  'DEMO-M06':  {threshold: 0.5,  strength: 'medium', mw: 230, psat25: 0.02, tenacityHours: 400}, // fictional material, MOCK
};

// MOCK mapping from category to number. The real one is a decision the owner has not made yet.
export const mockStrengthScale: Record<MockOdour['strength'], number> = {low: 1, medium: 2, high: 3};

// Height of one material under a weighting, for a given amount (% of concentrate).
// Returns null when the MOCK input for that weighting is missing.
export function mockWeighted(materialId: string, pct: number, weighting: Weighting): number | null {
  const data = mockOdour[materialId];
  if (weighting === 'mass') return pct;
  if (!data) return null;
  if (weighting === 'odour_units') return data.threshold === null ? null : pct / data.threshold;
  return pct * mockStrengthScale[data.strength];
}
