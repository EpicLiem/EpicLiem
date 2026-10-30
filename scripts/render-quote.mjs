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
export function quoteArtwork(quote, day) {
  if (!quote || typeof quote.text !== 'string' || quote.text.length > 1200) throw new Error('Invalid quote.');
  const date = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
  const width = 1600, padding = 100, size = 56, leading = 70;
  const lines = wrap(quote.text, size, width - padding * 2);
  const height = Math.max(580, padding * 2 + lines.length * leading + 220);
  const glyphs = new Map();
  const definitions = [];
  function outline(text, x, y, fontSize) {
    const uses = [];
    font.forEachGlyph(text,x,y,fontSize,{},(glyph,gx,gy) => {
      const key = `${glyph.index}:${fontSize}`;
      const path = glyph.getPath(0,0,fontSize);
      if (!path.commands.length) return;
      if (!glyphs.has(key)) {
        const id = `g${glyphs.size}`;
        glyphs.set(key,id);
        definitions.push(`<path id="${id}" d="${path.toPathData(2)}"/>`);
      }
      uses.push(`<use href="#${glyphs.get(key)}" x="${Number(gx.toFixed(2))}" y="${Number(gy.toFixed(2))}"/>`);
    });
    return uses.join('');
  }
  const paths = lines.map((line, index) => outline(line,padding,padding + 70 + size + index * leading,size));
  paths.push(outline('Leonardo da Vinci',padding,height - padding - 70,36));
  const datePath = outline(date,padding,padding,32);
  const votePath = outline('Click to vote for tomorrow’s quote',padding,height - padding,36);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${definitions.join('')}</defs><rect width="100%" height="100%" rx="32" fill="#171c1e"/><g shape-rendering="geometricPrecision"><g fill="#aab5ae">${datePath}</g><g fill="#ede2ce">${paths.join('')}</g><g fill="#d79a76">${votePath}</g></g></svg>`;
  return {svg,width,height,lines:lines.length};
}
export async function renderQuote(quote, destination, day, scale = 2) {
  if (!Number.isFinite(scale) || scale < 1 || scale > 4) throw new Error('Invalid render scale.');
  const {svg,width,height,lines} = quoteArtwork(quote,day);
  await sharp(Buffer.from(svg), {density:72 * scale}).png().toFile(destination);
  return {width:Math.round(width * scale),height:Math.round(height * scale),lines};
}
