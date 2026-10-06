// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// POST: make one version the active one for its category.
import {fail, getReferenceStore, readBody, requireSystemAdmin} from '@/lib/store-server';
import type {Category} from '@/lib/reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = requireSystemAdmin(request); if (denied) return denied;
  const body = await readBody(request);
  if (body instanceof Response) return body;
  try { return Response.json(await getReferenceStore().activate(body.category as Category, String(body.id ?? ''), body.baseRevision)); }
  catch (error) { return fail(error); }
}
