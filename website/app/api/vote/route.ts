import { castVote } from '@/lib/store';
import { voter, networkKey } from '@/lib/session';
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error:'Please vote from this website.'}, {status:403});
  if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({error:'Expected JSON.'}, {status:415});
  if (Number(request.headers.get('content-length')) > 1024) return Response.json({error:'Request too large.'}, {status:413});
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 1024) return Response.json({error:'Request too large.'}, {status:413});
    body = JSON.parse(raw);
  } catch { return Response.json({error:'Invalid vote.'}, {status:400}); }
  if (!body || typeof body.day !== 'string' || typeof body.quoteId !== 'string' || body.day.length !== 10 || body.quoteId.length > 150) return Response.json({error:'Invalid vote.'}, {status:400});
  try {
    const result = await castVote(body.day, await voter(), body.quoteId, networkKey(request, body.day));
    if (result === 'closed') return Response.json({error:'This ballot has closed or the passage is not eligible. Refresh to see the new choices.'}, {status:409});
    if (result === 'limited') return Response.json({error:'Too many browsers have voted from this network today. Please try again tomorrow.'}, {status:429});
    return Response.json({saved:true});
  } catch {
    return Response.json({error:'Your vote could not be saved. Please try again.'}, {status:503});
  }
}
