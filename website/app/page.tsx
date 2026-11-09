import { Suspense } from 'react';
import { Today, Voting } from './reader';
import ReaderShell from './reader-shell';
import { ballot, today } from '@/lib/store';
import { initialRead } from '@/lib/initial-read.mjs';

export const dynamic = 'force-dynamic';

async function TodaySection() { return <Today initialEdition={await initialRead(today())} />; }
async function VotingSection() { return <Voting initialBallot={await initialRead(ballot())} />; }

export default function Page() {
  return <ReaderShell>
    <Suspense fallback={<section className="today" aria-label="Today’s passage"><p className="loading" role="status">Opening the notebooks…</p><a className="jump-link" href="#voting">Vote for tomorrow ↓</a></section>}><TodaySection /></Suspense>
    <Suspense fallback={<section className="voting" id="voting" aria-label="Tomorrow’s choices"><p className="loading" role="status">Loading tomorrow’s choices…</p></section>}><VotingSection /></Suspense>
  </ReaderShell>;
}
