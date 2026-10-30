import { ballot } from '@/lib/store';
import { voter } from '@/lib/session';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return Response.json(await ballot(await voter()), {headers:{'Cache-Control':'private, no-store'}});
  } catch {
    return Response.json({error:'Voting is unavailable. Please try again shortly.'}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
}
