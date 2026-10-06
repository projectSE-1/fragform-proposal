// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// POST: switch every version of one category off. Formulas then show no data for it.
import {fail, getReferenceStore, readBody, requireSystemAdmin} from '@/lib/store-server';
import type {Category} from '@/lib/reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = requireSystemAdmin(request); if (denied) return denied;
  const body = await readBody(request);
  if (body instanceof Response) return body;
  try { return Response.json(await getReferenceStore().deactivate(body.category as Category, body.baseRevision)); }
  catch (error) { return fail(error); }
}
