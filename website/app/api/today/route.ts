import { today } from '@/lib/store';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return Response.json(await today(), {headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({error:'The daily passage is unavailable. Please try again shortly.'}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
}
