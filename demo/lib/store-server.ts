// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Shared plumbing for the /api route handlers: one store per server process, request checks and
// error mapping. Server only.
import path from 'node:path';
import {createStore, StoreError} from './store.ts';
import {createReferenceStore} from './reference-store.ts';
import type {StoreRead} from './store.ts';

// Next.js dev reloads modules on every edit; keeping the store on globalThis keeps one write queue.
const holder = globalThis as unknown as {perfumeryStore?: ReturnType<typeof createStore>; referenceStore?: ReturnType<typeof createReferenceStore>};
const dataDir = () => process.env.DEMO_DATA_DIR || path.join(process.cwd(), 'data');
export function getStore() {
  holder.perfumeryStore ??= createStore({dir: dataDir()});
  return holder.perfumeryStore;
}
export function getReferenceStore() {
  holder.referenceStore ??= createReferenceStore({dir: dataDir()});
  return holder.referenceStore;
}

// Demo persona check for reference-data changes. The persona is chosen in the browser, so this is
// NOT security: anyone at this keyboard can choose it. The 127.0.0.1 binding is the protection.
// Real authorization comes with login (rule 26); this only keeps the demo's roles consistent.
export function requireSystemAdmin(request: Request): Response | null {
  return request.headers.get('x-demo-persona') === 'system_admin' ? null
    : refuse(403, 'forbidden', 'Reference data management needs the system_admin persona.');
}

const MAX_BODY = 64 * 1024;
export const MAX_UPLOAD_BODY = 6 * 1024 * 1024; // a 5 MB CSV plus JSON escaping

export function snapshot(data: StoreRead) {
  return Response.json({revision: data.revision, updatedAt: data.updatedAt, formulas: data.formulas, notice: data.recovered ?? null},
    {headers: {'Cache-Control': 'no-store'}});
}
function refuse(status: number, error: string, message: string) {
  return Response.json({error, message}, {status, headers: {'Cache-Control': 'no-store'}});
}

// Writes must be JSON from this same origin. A page on another site cannot send a JSON body to
// 127.0.0.1 without a CORS preflight, which this server never answers, and a mismatched Origin
// header is refused outright.
export async function readBody(request: Request, max = MAX_BODY): Promise<Record<string, unknown> | Response> {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json'))
    return refuse(415, 'invalid', 'Send the request as JSON.');
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host'))
    return refuse(403, 'forbidden', 'Requests from another site are refused.');
  const text = await request.text();
  if (text.length > max) return refuse(413, 'limit', 'The request is too large.');
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : refuse(400, 'invalid', 'Expected a JSON object.');
  } catch { return refuse(400, 'invalid', 'The request is not valid JSON.'); }
}

const STATUS = {stale: 409, invalid: 422, not_found: 404, limit: 413} as const;
export function fail(error: unknown) {
  if (error instanceof StoreError) return refuse(STATUS[error.code], error.code, error.message);
  // File-system details stay in the server log; the browser gets a plain message.
  console.error('[store]', error);
  return refuse(500, 'io', 'The local store could not be read or written. Check the server window for details.');
}
