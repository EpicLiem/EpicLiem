# Leonardo, tomorrow

Next.js source for https://profile.epicliem.com. See [operations](../docs/OPERATIONS.md) for local setup, voting rules, deployment and the GitHub image workflow.

Vercel project: `leonardo-profile`; root directory: `website`. Required environment variables: `DATABASE_URL`, `VOTER_SECRET`. The database is dedicated to this site. `npm run db:migrate` applies the idempotent setup to the database in `.env.local`.
