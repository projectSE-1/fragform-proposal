// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// GET: every reference-data version per category, and which one is active. System admin persona only.
import {fail, getReferenceStore, requireSystemAdmin} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = requireSystemAdmin(request); if (denied) return denied;
  try { return Response.json(await getReferenceStore().read(), {headers: {'Cache-Control': 'no-store'}}); }
  catch (error) { return fail(error); }
}
