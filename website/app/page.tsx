import Reader from './reader';
import { ballot, today } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const [edition, choices] = await Promise.all([today(), ballot()]);
    return <Reader initialEdition={edition} initialBallot={choices} />;
  } catch {
    // Keep retry controls available during a temporary database outage.
    return <Reader />;
  }
}
