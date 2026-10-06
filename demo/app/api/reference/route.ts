// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// GET: every reference-data version per category, and which one is active. Readable by every role.
import {fail, getReferenceStore} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try { return Response.json(await getReferenceStore().read(), {headers: {'Cache-Control': 'no-store'}}); }
  catch (error) { return fail(error); }
}
