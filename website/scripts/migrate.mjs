import { neon } from '@neondatabase/serverless';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = neon(process.env.DATABASE_URL);
await sql.transaction([
  sql`CREATE TABLE IF NOT EXISTS leonardo_votes (day text NOT NULL, voter text NOT NULL, quote_id text NOT NULL, network text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (day, voter))`,
  sql`CREATE TABLE IF NOT EXISTS leonardo_editions (day text PRIMARY KEY, quote_id text NOT NULL)`,
  sql`CREATE INDEX IF NOT EXISTS leonardo_votes_network ON leonardo_votes(day, network)`,
]);
console.log('Leonardo tables ready.');
