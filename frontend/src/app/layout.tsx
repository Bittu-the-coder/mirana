import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { SocketProvider } from "@/lib/socket-context";
import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mirana.bittuthecoder.me"),
  title: {
    default: "Mirana | Free Brain Games, Multiplayer Puzzles & Daily Riddles 2025",
    template: "%s | Mirana - Brain Training Games",
  },
  description: "Challenge your mind with Mirana - the ultimate free platform for brain teasers, multiplayer logic puzzles, and daily riddles. Compete with friends, track progress, and train your brain with 10+ unique games. Join thousands of puzzle enthusiasts today!",
  keywords: [
    // Core brain games keywords
    "brain games",
    "brain training",
    "brain teasers",
    "brain exercise games online",
    "brain games online free",
    "best brain games for adults",
    "brain games for kids",
    "brain games for students",
    "free brain games for adults",
    "mind games for students in classroom",
    "brain development games for 7 year olds",

    // General free games keywords
    "best free online games",
    "play free online games",
    "free games",
    "1000 free games to play",
    "crazy games",
    "play free games online without downloading",
    "free online games for PC",
    "game online",
    "free games no download",
    "browser games",

    // Puzzle and logic keywords
    "puzzles",
    "logic puzzles",
    "riddles with answers",
    "puzzle games online",
    "daily puzzles",
    "logic games free",
    "math puzzles",
    "number puzzles",
    "word puzzles",

    // Multiplayer and competitive
    "multiplayer brain games",
    "competitive logic games",
    "online multiplayer games",
    "play with friends online",

    // Specific game types
    "memory games",
    "pattern recognition games",
    "word games",
    "word connect game",
    "mental math games",
    "sliding puzzle",
    "number games",

    // Educational and cognitive
    "cognitive training",
    "mind games",
    "IQ games",
    "educational games",
    "learning games for kids",
    "brain teasers for adults",
    "brain workout",

    // Year and trending
    "free online games 2025",
    "best games 2025",
    "new online games",
  ],
  authors: [
    { name: "Bittu the Coder", url: "https://github.com/Bittu-the-coder" }
  ],
  creator: "Bittu the Coder",
  publisher: "Mirana",
  applicationName: "Mirana",
  category: "Games",
  classification: "Brain Training Games",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mirana.bittuthecoder.me",
    siteName: "Mirana",
    title: "Mirana | Free Multiplayer Brain Games & Puzzles",
    description: "The ultimate community for brain game enthusiasts. Play 10+ unique puzzle games, compete with friends in real-time, and train your brain daily. 100% free!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mirana - Brain Training Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirana | Best Free Brain Games 2025",
    description: "Challenge your mind with multiplayer puzzles, daily riddles, and 10+ brain training games. Join free!",
    images: ["/og-image.png"],
    creator: "@bittuthecoder",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mirana.bittuthecoder.me",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "google-site-verification": "google-verification-code",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mirana",
  description: "Free brain training games, multiplayer puzzles, and daily riddles.",
  url: "https://mirana.bittuthecoder.me",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Bittu the Coder",
    url: "https://github.com/Bittu-the-coder",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
