import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({ variable: '--font-heebo', subsets: ['hebrew', 'latin'] });

export const metadata: Metadata = {
  title: 'FlowFit — האימון שלך, מותאם לחיים',
  description: 'מאמן אישי דינמי שמחבר אימוני כוח, גלישה, Garmin ויומן.',
  openGraph: {
    title: 'FlowFit — האימון שלך, מותאם לחיים',
    description: 'מאמן אישי דינמי שמחבר אימוני כוח, גלישה, Garmin ויומן.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'FlowFit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowFit — האימון שלך, מותאם לחיים',
    description: 'מאמן אישי דינמי שמחבר אימוני כוח, גלישה, Garmin ויומן.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body className={`${heebo.variable} antialiased`}>{children}</body></html>;
}
