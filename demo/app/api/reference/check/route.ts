// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// POST: check an upload and return the report. Nothing is saved.
import {fail, getReferenceStore, MAX_UPLOAD_BODY, readBody, requireSystemAdmin} from '@/lib/store-server';
import type {Category} from '@/lib/reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = requireSystemAdmin(request); if (denied) return denied;
  const body = await readBody(request, MAX_UPLOAD_BODY);
  if (body instanceof Response) return body;
  try { return Response.json({report: getReferenceStore().check(body.category as Category, String(body.text ?? ''))}); }
  catch (error) { return fail(error); }
}
