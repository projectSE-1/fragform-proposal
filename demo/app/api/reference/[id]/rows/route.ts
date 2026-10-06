// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// GET: every row of one version, for the read-only data viewer.
import {fail, getReferenceStore} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try { return Response.json({rows: await getReferenceStore().rows(id)}, {headers: {'Cache-Control': 'no-store'}}); }
  catch (error) { return fail(error); }
}
