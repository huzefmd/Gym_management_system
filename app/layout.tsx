import './globals.css';
import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';
import { AdminProvider } from '@/components/providers/admin-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RockGym.fit — Train Hard. Track Progress. Level Up.',
  description:
    'RockGym.fit is a modern gym management platform for members and coaches — track progress, manage meal & workout plans, and crush your fitness goals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${bebas.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          <AdminProvider>{children}</AdminProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
