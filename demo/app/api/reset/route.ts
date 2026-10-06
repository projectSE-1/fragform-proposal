// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// POST: back up the store, then reload the seed formulas.
import {fail, getStore, readBody, snapshot} from '@/lib/store-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readBody(request);
  if (body instanceof Response) return body;
  try { return snapshot(await getStore().reset()); } catch (error) { return fail(error); }
}
