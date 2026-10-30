export const TIME_ZONE = 'America/New_York';
export function dayAt(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone: TIME_ZONE, year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
}
export function nextDay(day) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
export function midnight(day) {
  const utc = Date.parse(`${day}T00:00:00Z`);
  // Iterate because the offset at UTC midnight may differ on a DST transition.
  let result = utc;
  for (let i = 0; i < 3; i++) {
    const offset = new Intl.DateTimeFormat('en', {timeZone: TIME_ZONE, timeZoneName:'shortOffset'}).formatToParts(new Date(result)).find(p => p.type === 'timeZoneName').value;
    const hours = Number(offset.replace('GMT', '') || 0);
    result = utc - hours * 3600000;
  }
  return result / 1000;
}
export function candidates(day, quotes) {
  if (quotes.length < 6) throw new Error('At least six passages are required.');
  const n = Math.floor(Date.parse(`${day}T12:00:00Z`) / 86400000);
  // Adjacent days have disjoint groups, so a winner cannot repeat tomorrow.
  const start = ((n * 3) % quotes.length + quotes.length) % quotes.length;
  return [0, 1, 2].map(i => quotes[(start + i) % quotes.length]);
}
export function selectWinner(choices, counts) {
  return choices.reduce((best, quote) => (counts[quote.id] || 0) > (counts[best.id] || 0) ? quote : best);
}
