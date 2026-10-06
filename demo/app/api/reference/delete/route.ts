// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// POST: delete an inactive uploaded version. Its file is moved to backups, not erased.
import {fail, getReferenceStore, readBody, requireSystemAdmin} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = requireSystemAdmin(request); if (denied) return denied;
  const body = await readBody(request);
  if (body instanceof Response) return body;
  try { return Response.json(await getReferenceStore().remove(String(body.id ?? ''), body.baseRevision)); }
  catch (error) { return fail(error); }
}
