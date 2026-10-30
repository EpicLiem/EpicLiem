import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
const NAME = 'leonardo-voter';
function sign(value: string) {
  const key = process.env.VOTER_SECRET;
  if (!key || key.length < 32) throw new Error('A strong VOTER_SECRET is required.');
  return createHmac('sha256', key).update(value).digest('hex');
}
export function networkKey(request: Request, day: string) {
  // Vercel overwrites x-vercel-forwarded-for. Never trust client-selected forwarding headers.
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : 'local';
  if (!ip) throw new Error('Client network unavailable.');
  return sign(`network:${day}:${ip}`);
}
export async function voter() {
  const jar = await cookies();
  const value = jar.get(NAME)?.value;
  if (value) {
    const [id, signature] = value.split('.');
    if (/^[a-f0-9-]{36}$/.test(id) && /^[a-f0-9]{64}$/.test(signature ?? '') && timingSafeEqual(Buffer.from(sign(id)), Buffer.from(signature))) return id;
  }
  const id = randomUUID();
  jar.set(NAME, `${id}.${sign(id)}`, {httpOnly:true, secure:process.env.NODE_ENV === 'production', sameSite:'lax', path:'/', maxAge:60 * 60 * 24 * 365});
  return id;
}
