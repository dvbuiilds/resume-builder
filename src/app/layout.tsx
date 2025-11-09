import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from 'downloader/components/common/Navbar';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resume Builder | Dhairya Varshney',
  description:
    'Generate, edit, and manage professional resumes with an AI-assisted builder and rich customization tools.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Resume Builder | Dhairya Varshney',
    description:
      'Generate, edit, and manage professional resumes with an AI-assisted builder and rich customization tools.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
