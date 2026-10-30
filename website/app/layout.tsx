import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://profile.epicliem.com'),
  title: 'Leonardo, tomorrow',
  description: 'Uncommon passages from Leonardo da Vinci’s notebooks. Choose tomorrow’s quote for Liem’s GitHub profile.',
};
export default function Layout({children}: {children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
