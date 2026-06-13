import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Numera — AI Math Tutor',
  description: 'AI-powered maths tutoring for KS3–KS4 students by Nablix',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-[#e2e2e2] font-sans">
        {children}
      </body>
    </html>
  );
}
