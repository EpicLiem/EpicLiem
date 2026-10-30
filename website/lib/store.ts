import { neon } from '@neondatabase/serverless';
import quotes from './quotes.json';
import { candidates, dayAt, nextDay, midnight } from './calendar.mjs';
export { quotes, candidates, dayAt, nextDay, midnight };
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  return neon(process.env.DATABASE_URL);
}
export async function countsFor(day: string) {
  const rows = await db()`SELECT quote_id, COUNT(*)::int AS total FROM leonardo_votes WHERE day = ${day} GROUP BY quote_id`;
  return Object.fromEntries(rows.map(row => [row.quote_id, Number(row.total)]));
}
export async function today() {
  const sql = db();
  const day = dayAt();
  let [edition] = await sql`SELECT quote_id FROM leonardo_editions WHERE day = ${day}`;
  if (!edition) {
    const ids = (day === '2026-10-29' ? [quotes[0]] : candidates(day, quotes)).map(q => q.id);
    // Settlement and voting share a day lock, so an accepted last-second vote commits first.
    await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(hashtext(${day}))`,
      sql`INSERT INTO leonardo_editions (day, quote_id)
        SELECT ${day}, choice.id FROM unnest(${ids}::text[]) WITH ORDINALITY AS choice(id, rank)
        LEFT JOIN leonardo_votes vote ON vote.quote_id = choice.id AND vote.day = ${day}
        GROUP BY choice.id, choice.rank ORDER BY count(vote.voter) DESC, choice.rank ASC LIMIT 1
        ON CONFLICT (day) DO NOTHING`,
    ]);
    [edition] = await sql`SELECT quote_id FROM leonardo_editions WHERE day = ${day}`;
  }
  const quote = quotes.find(q => q.id === edition.quote_id);
  if (!quote) throw new Error('Published passage missing.');
  return {day, timeZone:'America/New_York', quote};
}
export async function ballot(voter: string) {
  const day = nextDay(dayAt());
  const [counts, votes] = await Promise.all([countsFor(day), db()`SELECT quote_id FROM leonardo_votes WHERE day = ${day} AND voter = ${voter}`]);
  return {day, closesAt:midnight(day) * 1000, choices:candidates(day, quotes), counts, selected:votes[0]?.quote_id ?? null};
}
export async function castVote(day: string, voter: string, quoteId: string, network: string) {
  if (day !== nextDay(dayAt()) || !candidates(day, quotes).some(q => q.id === quoteId)) return 'closed';
  const sql = db();
  const deadline = midnight(day);
  // Also serializes against settlement and concurrent browsers sharing a network.
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtext(${day}))`,
    sql`INSERT INTO leonardo_votes (day, voter, quote_id, network, updated_at)
      SELECT ${day}, ${voter}, ${quoteId}, ${network}, now()
      WHERE clock_timestamp() < to_timestamp(${deadline})
      AND ((SELECT count(*) FROM leonardo_votes WHERE day = ${day} AND network = ${network}) < 10
        OR EXISTS (SELECT 1 FROM leonardo_votes WHERE day = ${day} AND voter = ${voter}))
      ON CONFLICT (day, voter) DO UPDATE SET quote_id = EXCLUDED.quote_id, updated_at = now()
      WHERE clock_timestamp() < to_timestamp(${deadline})
      RETURNING quote_id`,
  ]);
  return results[1].length ? 'saved' : (Date.now() >= deadline * 1000 ? 'closed' : 'limited');
}
