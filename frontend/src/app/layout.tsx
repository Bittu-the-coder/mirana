import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { SocketProvider } from "@/lib/socket-context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mirana | Multiplayer Brain Teasers, Logic Riddles & Free Brain Games 2025",
  description: "Challenge your mind with Mirana - the ultimate community for free brain teasers, multiplayer logic puzzles, and daily riddles. Compete with friends and track your progress in the best brain training games of 2025.",
  keywords: [
    "brain training", "puzzles", "logic puzzles", "riddles with answers",
    "multiplayer brain games", "memory games", "daily puzzles",
    "free online games 2025", "brain teasers for adults", "competitive logic games"
  ],
  authors: [{ name: "Mirana Team" }],
  openGraph: {
    title: "Mirana | Multiplayer Brain Teasers & Logic Riddles",
    description: "The ultimate community for brain game enthusiasts. Play, solve, and compete!",
    type: "website",
    locale: "en_US",
    url: "https://mirana-games.vercel.app", // Adjust if user provides a final domain
    siteName: "Mirana",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirana | Best Brain Games 2025",
    description: "Challenge your mind with multiplayer puzzles and riddles.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <AuthProvider>
          <SocketProvider>
            <Navigation />
            <main className="pb-20 md:pb-0 md:pl-64">
              {children}
            </main>
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
