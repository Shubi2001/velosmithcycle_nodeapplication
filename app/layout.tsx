import type {Metadata} from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'VELO CORE | Precision Engineering',
  description: 'Redefining the human machine through aerospace-grade engineering.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-[#050505] text-white selection:bg-[#FF4D00] selection:text-white font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
