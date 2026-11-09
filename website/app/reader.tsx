'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { midnight, nextDay } from '@/lib/calendar.mjs';
type Quote = {id:string;text:string;section:string;topic:string;source:string};
type Edition = {day:string;quote:Quote};
type Ballot = {day:string;closesAt:number;choices:Quote[];counts:Record<string,number>;selected:string|null};
function dateLabel(day: string) { return new Intl.DateTimeFormat('en-US', {month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z')); }
async function read<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {cache:'no-store',signal:signal ? AbortSignal.any([signal,AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000)});
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Could not load this page.');
  return body;
}
export function Today({initialEdition = null}: {initialEdition?:Edition|null}) {
  const [edition,setEdition] = useState<Edition|null>(initialEdition);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(!initialEdition);
  const load = useCallback(async (signal?:AbortSignal) => {
    setLoading(true);
    try {
      const current = await read<Edition>('/api/today',signal);
      if (!signal?.aborted) { setEdition(current); setError(''); }
    } catch {
      if (!signal?.aborted) setError('The latest passage could not load. Please retry.');
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    if (initialEdition && Date.now() < midnight(nextDay(initialEdition.day))*1000) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [initialEdition,load]);
  const editionDay = edition?.day;
  useEffect(() => {
    if (!editionDay) return;
    const timer = setTimeout(()=>void load(),Math.max(0,midnight(nextDay(editionDay))*1000-Date.now())+1000);
    return () => clearTimeout(timer);
  }, [editionDay,load]);
  return <section className="today" aria-labelledby="today-title">
    <div className="section-heading"><h1 id="today-title">Today’s passage</h1>{edition && <time dateTime={edition.day}>{dateLabel(edition.day)}</time>}</div>
    <a className="jump-link" href="#voting">Vote for tomorrow ↓</a>
    {loading && !edition && <p className="loading" role="status">Opening the notebooks…</p>}
    {error && <div className="notice" role="alert"><p>{error}</p><button onClick={() => void load()} disabled={loading}>{loading ? 'Reconnecting…' : 'Retry reading'}</button></div>}
    {edition && <>
      <blockquote>{edition.quote.text}</blockquote><p className="author">Leonardo da Vinci</p>
      <div className="source"><a href={edition.quote.source}>Notebook {edition.quote.section}</a><span>{edition.quote.topic}</span></div>
      <div className="today-actions"><p className="profile-note">On <a href="https://github.com/EpicLiem">Liem’s GitHub profile</a> today.</p></div>
    </>}
    {!loading && !error && !edition && <p className="empty-state">No passage is available yet. Please return shortly.</p>}
  </section>;
}

export function Voting({initialBallot = null}: {initialBallot?:Ballot|null}) {
  const [ballot,setBallot] = useState<Ballot|null>(initialBallot);
  const [error,setError] = useState('');
  const [savingId,setSavingId] = useState<string|null>(null);
  const [loading,setLoading] = useState(true);
  const [failedId,setFailedId] = useState<string|null>(null);
  const [message,setMessage] = useState('');
  const version = useRef(0);
  const load = useCallback(async (signal?:AbortSignal) => {
    const request = ++version.current;
    setLoading(true); setMessage('');
    try {
      const next = await read<Ballot>('/api/ballot',signal);
      if (!signal?.aborted && request === version.current) { setBallot(next); setError(''); setFailedId(null); }
    } catch {
      if (!signal?.aborted && request === version.current) setError('Your saved vote could not load. Retry voting to check your choice.');
    } finally { if (!signal?.aborted && request === version.current) setLoading(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    // The public HTML has the passages; only the browser's private vote needs loading.
    void load(controller.signal);
    return () => { controller.abort(); version.current++; };
  }, [load]);
  const closesAt = ballot?.closesAt;
  useEffect(() => {
    if (!closesAt) return;
    const timer = setTimeout(()=>void load(),Math.max(0,closesAt-Date.now())+1000);
    return () => clearTimeout(timer);
  }, [closesAt,load]);
  const closed = ballot ? Date.now() >= ballot.closesAt : false;
  async function vote(id:string) {
    if (!ballot || savingId || loading || error || Date.now() >= ballot.closesAt) return;
    const request = ++version.current;
    setSavingId(id); setMessage(''); setError(''); setFailedId(null);
    try {
      const response = await fetch('/api/vote', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({day:ballot.day,quoteId:id}),signal:AbortSignal.timeout(15000)});
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Your vote could not be saved.');
      if (request !== version.current) return;
      const counts = {...ballot.counts};
      if (ballot.selected !== id) {
        if (ballot.selected) counts[ballot.selected] = Math.max(0,(counts[ballot.selected] || 0)-1);
        counts[id] = (counts[id] || 0)+1;
      } else counts[id] = Math.max(1,counts[id] || 0);
      setBallot({...ballot,selected:id,counts});
      setMessage('Your vote is saved. You can change it until midnight.');
      setSavingId(null);
      // A totals refresh must not delay confirmation or overwrite a newer vote.
      void read<Ballot>('/api/ballot').then(next => {
        if (request === version.current) { setBallot(next); if (next.day !== ballot.day) setMessage(''); }
      }).catch(() => {
        if (request === version.current) setMessage('Your vote is saved. Totals could not refresh; reload to see them.');
      });
    } catch (e) {
      if (request === version.current) {
        setFailedId(id);
        setError(e instanceof Error && e.name === 'Error' ? e.message : 'Your latest choice could not be confirmed. Check your vote before trying again.');
      }
    } finally { setSavingId(null); }
  }
  return <section id="voting" className="voting" aria-labelledby="vote-title" aria-busy={!!savingId}>
    <h2 id="vote-title">{closed ? 'Voting has closed' : 'Choose tomorrow’s passage'}</h2>
    {ballot && <><p className="ballot-date">For <time dateTime={ballot.day}>{dateLabel(ballot.day)}</time></p><p className="closing">{closed ? 'Reload to see the next choices.' : <>Closes tonight at <time dateTime={new Date(ballot.closesAt).toISOString()}>midnight, New York time.</time></>}</p></>}
    {error && !failedId && <div className="notice" role="alert"><p>{error}</p><button onClick={() => void load()} disabled={loading || !!savingId}>{loading ? 'Reconnecting…' : 'Retry voting'}</button></div>}
    {closed && !error && <button onClick={() => void load()} disabled={loading}>{loading ? 'Loading choices…' : 'Reload choices'}</button>}
    {loading && !ballot && <p className="loading" role="status">Loading tomorrow’s choices…</p>}
    {ballot && <>
      <ol className="choices">
        {ballot.choices.map((quote,index) => {
          const selected = ballot.selected === quote.id;
          return <li key={quote.id} className={`choice${selected ? ' selected' : ''}`}>
            <span className="number" aria-hidden="true">{index+1}.</span>
            <div className="passage"><p>{quote.text}</p><div className="details"><a href={quote.source}>Notebook {quote.section}</a><span>{quote.topic}</span></div></div>
            <div className="vote-control"><button disabled={!!savingId || loading || !!error || closed} aria-pressed={selected} aria-describedby={failedId === quote.id && error ? `vote-error-${quote.id}` : undefined} aria-label={`${selected ? 'Your vote' : 'Vote'} for passage ${index+1}: ${quote.topic}`} onClick={() => void vote(quote.id)}>{savingId === quote.id ? 'Saving…' : selected ? 'Your vote' : 'Vote'}</button><span>{ballot.counts[quote.id] || 0} {(ballot.counts[quote.id] || 0) === 1 ? 'vote' : 'votes'}</span></div>
            {error && failedId === quote.id && <div className="notice vote-error" id={`vote-error-${quote.id}`} role="alert"><p>{error}</p><p>{ballot.selected ? `Last confirmed vote: passage ${ballot.choices.findIndex(choice => choice.id === ballot.selected)+1}.` : 'No vote has been confirmed.'}</p><button onClick={() => void load()} disabled={loading}>{loading ? 'Reconnecting…' : 'Check my vote'}</button></div>}
          </li>;
        })}
      </ol>
      <p className={`status${ballot.selected && !error ? ' saved' : ''}`} role="status" aria-live="polite">{savingId ? 'Saving your choice…' : loading ? 'Checking your saved vote…' : error ? 'Your latest choice is not confirmed. Check your vote before trying again.' : closed ? 'This ballot has closed. Reload to see the next choices.' : message || (ballot.selected ? 'Your vote is saved. Choose another passage to change it.' : 'Choose one passage. No account needed.')}</p>
      <p className="rules">One vote per browser, changeable until midnight. Ties go to the first passage.</p>
    </>}
    {!loading && !error && !ballot && <p className="empty-state">Tomorrow’s choices are not available yet.</p>}
  </section>;
}
