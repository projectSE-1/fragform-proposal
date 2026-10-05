// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// Evaporation models for the evolution chart (calculation-engine.md 6.3). Pure functions: no clock,
// no network, no data lookup. The caller passes every input.
//
// What is real and what is not:
// - The EQUATION is the textbook vapour-pressure-driven mass transfer flux, J = k * P / (R * T).
// - The MIXTURE options are "each material alone" and Raoult's law for an ideal mixture.
// - The CONDITION below is ONE fixed, ASSUMED reference, not a measurement. It sets the time scale.
//   Skin, spray area and airflow modelling were dropped as too complex for this project (team, 2026-10-05).
// - In this demo the INPUTS (vapour pressure, molecular weight) are MOCK, from mock-odour.ts.
// Not validated against any measurement, and not approved by the owner. The model choice is hers.

export type EvaporationModel = 'independent' | 'raoult';

// ASSUMED reference: paper blotter, still air, 25 °C, 1 mg of concentrate per cm². k is the mass
// transfer coefficient (m/s), set by air movement. Changing these stretches or squeezes the time
// axis; the order in which materials leave stays the same.
export const referenceCondition = {tempK: 298.15, k: 1e-4, loadingGPerM2: 10};

// psatPa is the vapour pressure at the reference temperature, 25 °C.
export type Component = {id: string; pct: number; mw: number; psatPa: number};
const R = 8.314; // J/(mol K)

// Remaining mass of each component, as % of the starting concentrate, at samples+1 evenly spaced
// times from 0 to `hours`. Explicit time stepping; each step uses the amounts from the step before.
export function simulate(components: Component[], model: EvaporationModel, hours: number, samples: number): {id: string; points: number[]}[] {
  const c = referenceCondition;
  const moles = components.map(x => c.loadingGPerM2 * (x.pct / 100) / x.mw); // mol per m²
  const steps = samples * Math.ceil(3000 / samples); // a whole number of steps per sample
  const dt = hours * 3600 / steps;
  const out = components.map(() => [] as number[]);
  const record = () => components.forEach((x, i) => out[i].push(moles[i] * x.mw / c.loadingGPerM2 * 100));
  record();
  for (let s = 1; s <= steps; s++) {
    const total = moles.reduce((a, b) => a + b, 0);
    // Raoult: a material's effective vapour pressure is its mole fraction times its pure vapour pressure.
    // Each alone: every material evaporates as if it were a pure film, until it runs out.
    const pressure = components.map((x, i) => moles[i] <= 0 ? 0
      : model === 'raoult' ? (moles[i] / total) * x.psatPa : x.psatPa);
    pressure.forEach((p, i) => { moles[i] = Math.max(0, moles[i] - c.k * p / (R * c.tempK) * dt); });
    if (s % (steps / samples) === 0) record();
  }
  return components.map((x, i) => ({id: x.id, points: out[i]}));
}
