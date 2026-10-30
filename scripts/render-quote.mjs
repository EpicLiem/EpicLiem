import opentype from 'opentype.js';
import sharp from 'sharp';
const font = opentype.loadSync(new URL('../assets/terminess-regular.ttf', import.meta.url).pathname);
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
export async function renderQuote(quote, destination) {
  if (!quote || typeof quote.text !== 'string' || quote.text.length > 1200) throw new Error('Invalid quote.');
  const width = 1600, padding = 100, size = 56, leading = 70;
  const lines = wrap(quote.text, size, width - padding * 2);
  const height = Math.max(440, padding * 2 + lines.length * leading + 80);
  const paths = lines.map((line, index) => font.getPath(line, padding, padding + size + index * leading, size).toSVG());
  paths.push(font.getPath('Leonardo da Vinci', padding, height - padding, 36).toSVG());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#171c1e"/><g fill="#ede2ce">${paths.join('')}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(destination);
  return {width,height,lines:lines.length};
}
