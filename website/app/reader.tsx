'use client';
import { useCallback, useEffect, useState } from 'react';
type Quote = {id:string;text:string;section:string;topic:string;source:string};
type Edition = {day:string;quote:Quote};
type Ballot = {day:string;closesAt:number;choices:Quote[];counts:Record<string,number>;selected:string|null};
function dateLabel(day: string) { return new Intl.DateTimeFormat('en-US', {month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z')); }
async function read<T>(url: string): Promise<T> {
  const response = await fetch(url, {cache:'no-store'});
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Could not load this page.');
  return body;
}
export default function Reader() {
  const [edition,setEdition] = useState<Edition|null>(null);
  const [ballot,setBallot] = useState<Ballot|null>(null);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [message,setMessage] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [current, next] = await Promise.all([read<Edition>('/api/today'),read<Ballot>('/api/ballot')]);
      setEdition(current); setBallot(next);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load the passages.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!ballot) return;
    const timer = setTimeout(() => { setMessage('A new day has begun. Loading the next ballot.'); void refresh(); }, Math.max(0,ballot.closesAt-Date.now()) + 1000);
    return () => clearTimeout(timer);
  }, [ballot,refresh]);
  async function vote(id:string) {
    if (!ballot || busy) return;
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/vote', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({day:ballot.day,quoteId:id})});
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Your vote could not be saved.');
      setBallot({...ballot,selected:id});
      setMessage('Your vote is saved. You can change it until midnight.');
      try { setBallot(await read<Ballot>('/api/ballot')); }
      catch { setMessage('Your vote is saved. Vote totals could not refresh; reload to see them.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Your vote could not be saved.'); }
    finally { setBusy(false); }
  }
  return <div className="page">
    <header><a className="title" href="/">Leonardo, tomorrow</a><a href="https://github.com/EpicLiem">GitHub profile</a></header>
    <main>
      {loading && !edition && <p className="loading" role="status">Opening the notebooks…</p>}
      {error && <div className="error" role="alert"><p>{error}</p><button onClick={() => void refresh()} disabled={loading}>{loading ? 'Loading…' : 'Reload passages'}</button></div>}
      {edition && <section className="today" aria-label="Today’s passage">
        <div className="meta"><time dateTime={edition.day}>{dateLabel(edition.day)}</time><span>Notebook {edition.quote.section}</span></div>
        <blockquote>{edition.quote.text}</blockquote>
        <p className="author">Leonardo da Vinci</p>
        <div className="source"><a href={edition.quote.source}>Read the source</a><span>{edition.quote.topic}</span></div>
      </section>}
      {ballot && <section className="voting" aria-labelledby="vote-title">
        <h1 id="vote-title">Choose tomorrow’s passage</h1>
        <p className="intro">The leading passage appears on {dateLabel(ballot.day)}.<br/>Voting closes at midnight, New York time.</p>
        <ol>
          {ballot.choices.map((quote,index) => <li key={quote.id} className={ballot.selected === quote.id ? 'selected' : ''}>
            <span className="number" aria-hidden="true">{index+1}.</span>
            <div className="passage"><p>{quote.text}</p><div className="details"><a href={quote.source}>Notebook {quote.section}</a><span>{quote.topic}</span></div></div>
            <div className="vote-control"><button disabled={busy || loading} aria-pressed={ballot.selected === quote.id} aria-label={`Vote for passage ${index+1}: ${quote.topic}`} onClick={() => void vote(quote.id)}>{ballot.selected === quote.id ? 'Selected' : 'Vote'}</button><span>{ballot.counts[quote.id] || 0} {(ballot.counts[quote.id] || 0) === 1 ? 'vote' : 'votes'}</span></div>
          </li>)}
        </ol>
        <p className="status" role="status" aria-live="polite">{busy ? 'Saving your vote…' : message || (ballot.selected ? 'Your vote is saved. Choose another passage to change it.' : 'No choice yet. Which passage should appear tomorrow?')}</p>
        <p className="rules">One vote per browser. You can change your choice until voting closes. Ties, including days with no votes, go to the first passage listed.</p>
      </section>}
      {!loading && !error && !edition && <p>No passage is available yet. Please return shortly.</p>}
    </main>
    <footer><p>From the notebooks, selected for their strangeness.</p><details><summary>Sources &amp; voting</summary><p>54 passages from Jean Paul Richter’s 1883 edition of Leonardo’s notebooks. Original wording is preserved. The “Prophecies” are riddles about everyday things, not predictions. Each passage links to its source.</p><p>Tomorrow offers three passages from a rotating collection. Adjacent days have different choices; passages eventually return. The winning passage is fixed after midnight in America/New_York. GitHub updates shortly afterward, subject to scheduled workflow delays.</p><p>This site saves a signed browser cookie and your daily choice. No account or email is needed. A daily, irreversible network identifier limits voting to ten browsers per network. This is a casual vote, not an identity-verified election.</p><a href="https://www.gutenberg.org/ebooks/5000">Read the complete notebooks</a></details></footer>
  </div>;
}
