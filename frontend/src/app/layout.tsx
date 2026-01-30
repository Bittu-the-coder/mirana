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
  title: "Mirana - Brain Training & Puzzle Community",
  description: "Improve your cognitive skills through interactive brain games and join a community of puzzle enthusiasts",
  keywords: ["brain training", "puzzles", "games", "memory", "logic", "multiplayer"],
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
