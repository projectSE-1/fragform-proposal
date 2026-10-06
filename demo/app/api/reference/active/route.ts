// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// GET: the rows of the active version in each category, as the formula workspace reads them.
import {fail, getReferenceStore} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try { return Response.json(await getReferenceStore().active(), {headers: {'Cache-Control': 'no-store'}}); }
  catch (error) { return fail(error); }
}
