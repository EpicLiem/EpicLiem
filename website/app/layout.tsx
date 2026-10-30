import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const terminess = localFont({src:'../public/fonts/terminess-latin.woff2',display:'swap',variable:'--font-terminess',fallback:['monospace'],adjustFontFallback:false});
export const metadata: Metadata = {
  metadataBase: new URL('https://profile.epicliem.com'),
  title: 'Leonardo, tomorrow',
  description: 'Uncommon passages from Leonardo da Vinci’s notebooks. Choose tomorrow’s quote for Liem’s GitHub profile.',
};
export default function Layout({children}: {children:React.ReactNode}) {
  return <html lang="en" className={terminess.variable}><body>{children}</body></html>;
}
