// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// POST: append a new immutable version to one formula. Earlier versions cannot be changed.
import {fail, getStore, readBody, snapshot} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const body = await readBody(request);
  if (body instanceof Response) return body;
  try { return snapshot(await getStore().appendVersion(id, {version: body.version, note: body.note}, body.baseRevision)); }
  catch (error) { return fail(error); }
}
