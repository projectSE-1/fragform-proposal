// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// MOCK DATA. EVERY NUMBER IN THIS FILE IS INVENTED.
//
// Nothing here is measured, looked up or taken from the owner dataset. The values exist only so
// the odour-units, perceived-strength and evolution views can be shown working before the real
// inputs arrive (calculation-engine.md 6.1, 9). The interface shows them only when the viewer has
// chosen "Mock data", and labels every chart drawn from them as mock.
//
// Replace, do not tune: when real thresholds, an approved strength mapping and an approved
// evaporation model exist, they come from the backend and this file is deleted.
import type {Weighting} from './model.ts';

export type MockOdour = {
  threshold: number | null;          // MOCK detection threshold, in arbitrary units (null = left missing on purpose)
  strength: 'low' | 'medium' | 'high'; // MOCK categorical odour strength
  halfLifeHours: number;             // MOCK evaporation half-life, used by the MOCK model below
};

// MOCK. Benzyl benzoate has no threshold on purpose, so the "built from 0 of 1" state is visible.
export const mockOdour: Record<string, MockOdour> = {
  '5989-27-5': {threshold: 10,   strength: 'medium', halfLifeHours: 0.5},  // Limonene, MOCK
  '78-70-6':   {threshold: 1,    strength: 'medium', halfLifeHours: 1.5},  // Linalool, MOCK
  '106-24-1':  {threshold: 0.5,  strength: 'medium', halfLifeHours: 4},    // Geraniol, MOCK
  '80-56-8':   {threshold: 5,    strength: 'high',   halfLifeHours: 0.4},  // alpha-Pinene, MOCK
  '928-96-1':  {threshold: 0.2,  strength: 'high',   halfLifeHours: 0.3},  // cis-3-Hexen-1-ol, MOCK
  '120-51-4':  {threshold: null, strength: 'low',    halfLifeHours: 24},   // Benzyl benzoate, MOCK
  '121-33-5':  {threshold: 0.05, strength: 'high',   halfLifeHours: 30},   // Vanillin, MOCK
  '97-53-0':   {threshold: 0.3,  strength: 'high',   halfLifeHours: 8},    // Eugenol, MOCK
  'DEMO-M01':  {threshold: 10,   strength: 'medium', halfLifeHours: 0.5},  // fictional material, MOCK
  'DEMO-M02':  {threshold: 1,    strength: 'medium', halfLifeHours: 2},    // fictional material, MOCK
  'DEMO-M03':  {threshold: 4,    strength: 'high',   halfLifeHours: 0.6},  // fictional material, MOCK
  'DEMO-M04':  {threshold: 20,   strength: 'low',    halfLifeHours: 12},   // fictional material, MOCK
  'DEMO-M05':  {threshold: 0.3,  strength: 'high',   halfLifeHours: 0.3},  // fictional material, MOCK
  'DEMO-M06':  {threshold: 0.5,  strength: 'medium', halfLifeHours: 20},   // fictional material, MOCK
};

// MOCK mapping from category to number. The real one is a decision the owner has not made yet.
export const mockStrengthScale: Record<MockOdour['strength'], number> = {low: 1, medium: 2, high: 3};

// Height of one material under a weighting, at a given remaining amount (% of concentrate).
// Returns null when the MOCK input for that weighting is missing.
export function mockWeighted(materialId: string, pct: number, weighting: Weighting): number | null {
  const data = mockOdour[materialId];
  if (weighting === 'mass') return pct;
  if (!data) return null;
  if (weighting === 'odour_units') return data.threshold === null ? null : pct / data.threshold;
  return pct * mockStrengthScale[data.strength];
}

// MOCK evaporation model: simple first-order decay, remaining = start x 0.5^(t / half-life).
// Real evaporation from skin is not this simple; the approved model replaces it.
export function mockRemaining(materialId: string, pct: number, hours: number): number | null {
  const data = mockOdour[materialId];
  if (!data) return null;
  return pct * Math.pow(0.5, hours / data.halfLifeHours);
}
