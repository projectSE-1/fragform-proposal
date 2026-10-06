// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// GET: every formula with the current revision. POST: create a formula with its first version.
import {fail, getStore, readBody, snapshot} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try { return snapshot(await getStore().read()); } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  const body = await readBody(request);
  if (body instanceof Response) return body;
  try { return snapshot(await getStore().createFormula({name: body.name, version: body.version}, body.baseRevision)); }
  catch (error) { return fail(error); }
}
