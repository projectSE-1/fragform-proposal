// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Browser side of the local store. Every call returns the full formula list and its revision.
import type {Formula, FormulaVersion} from './model';

export type StoreSnapshot = {revision: number; updatedAt: string; formulas: Formula[]; notice: string | null};
export class StoreRequestError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

async function call(url: string, body?: unknown): Promise<StoreSnapshot> {
  let response: Response;
  try {
    response = await fetch(url, body === undefined ? {cache: 'no-store'}
      : {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  } catch { throw new StoreRequestError('offline', 'The local store is not reachable.'); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new StoreRequestError(data?.error ?? 'io', data?.message ?? `The local store answered ${response.status}.`);
  return data as StoreSnapshot;
}

// Only the fields the server keeps are sent; ids, numbers and dates are assigned by the server.
const versionBody = (v: FormulaVersion) => ({vehicle: v.vehicle, category: v.category, dilution: v.dilution,
  ingredients: v.ingredients.map(x => ({materialId: x.materialId, amount: x.amount}))});

export const storeApi = {
  load: () => call('/api/formulas'),
  create: (baseRevision: number, name: string, version: FormulaVersion) =>
    call('/api/formulas', {baseRevision, name, version: versionBody(version)}),
  appendVersion: (baseRevision: number, formulaId: string, version: FormulaVersion, note: string) =>
    call(`/api/formulas/${encodeURIComponent(formulaId)}/versions`, {baseRevision, note, version: versionBody(version)}),
  reset: () => call('/api/reset', {}),
};
