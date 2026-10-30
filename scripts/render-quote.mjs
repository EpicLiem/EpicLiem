import opentype from 'opentype.js';
import sharp from 'sharp';
const font = opentype.loadSync(new URL('../assets/terminess-regular.ttf', import.meta.url).pathname);
export async function encodeReadmeImage(png) {
  return sharp(png).webp({lossless:true, effort:6}).toBuffer();
}
export function wrap(text, size, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.getAdvanceWidth(next, size) > maxWidth && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
export async function renderQuote(quote, destination, day) {
  if (!quote || typeof quote.text !== 'string' || quote.text.length > 1200) throw new Error('Invalid quote.');
  const date = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
  const width = 1600, padding = 100, size = 56, leading = 70;
  const lines = wrap(quote.text, size, width - padding * 2);
  const height = Math.max(580, padding * 2 + lines.length * leading + 220);
  const paths = lines.map((line, index) => font.getPath(line, padding, padding + 70 + size + index * leading, size).toSVG());
  paths.push(font.getPath('Leonardo da Vinci', padding, height - padding - 70, 36).toSVG());
  const datePath = font.getPath(date, padding, padding, 32).toSVG();
  const votePath = font.getPath('Click to vote for tomorrow’s quote', padding, height - padding, 36).toSVG();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#171c1e"/><g fill="#aab5ae">${datePath}</g><g fill="#ede2ce">${paths.join('')}</g><g fill="#d79a76">${votePath}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(destination);
  return {width,height,lines:lines.length};
}
