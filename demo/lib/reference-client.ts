// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Browser side of the reference-data store.
import type {Role} from './model';
import type {Category, CheckReport, DatasetRow} from './reference';
import type {ReferenceView, VersionMeta} from './reference-store';
import {StoreRequestError} from './store-client';

export type ActiveReference = {revision: number} & Record<Category, {meta: VersionMeta; rows: DatasetRow[]; problem: string | null}>;

async function call<T>(url: string, role?: Role, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, body === undefined ? {cache: 'no-store', headers: {'X-Demo-Persona': role ?? ''}} : {method: 'POST', body: JSON.stringify(body),
      // The persona header is a demo role check, not security (lib/store-server.ts).
      headers: {'Content-Type': 'application/json', 'X-Demo-Persona': role ?? ''}});
  } catch { throw new StoreRequestError('offline', 'The local store is not reachable.'); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new StoreRequestError(data?.error ?? 'io', data?.message ?? `The local store answered ${response.status}.`);
  return data as T;
}

export const referenceApi = {
  index: (role: Role) => call<ReferenceView>('/api/reference', role),
  active: () => call<ActiveReference>('/api/reference/active'),
  rows: (role: Role, id: string) => call<{rows: DatasetRow[]}>(`/api/reference/${encodeURIComponent(id)}/rows`, role).then(d => d.rows),
  check: (role: Role, category: Category, text: string) => call<{report: CheckReport}>('/api/reference/check', role, {category, text}).then(d => d.report),
  upload: (role: Role, baseRevision: number, category: Category, fileName: string, text: string) =>
    call<ReferenceView>('/api/reference/upload', role, {baseRevision, category, fileName, text}),
  activate: (role: Role, baseRevision: number, category: Category, id: string) =>
    call<ReferenceView>('/api/reference/activate', role, {baseRevision, category, id}),
  remove: (role: Role, baseRevision: number, id: string) => call<ReferenceView>('/api/reference/delete', role, {baseRevision, id}),
};
