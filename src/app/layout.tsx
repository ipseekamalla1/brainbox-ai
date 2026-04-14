// src/app/layout.tsx — Root Layout

import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// ─── Fonts ──────────────────────────────────────────

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// ─── Metadata ───────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Brainbox AI — AI-Powered University LMS",
    template: "%s | Brainbox AI",
  },
  description:
    "AI-powered university learning management system. Smart quizzes, exams, video learning, AI tutoring, and analytics — all in one platform.",
  keywords: [
    "LMS",
    "AI education",
    "university",
    "online learning",
    "quizzes",
    "exams",
    "AI tutor",
  ],
};

// ─── Layout ─────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        playfair.variable,
        jetbrainsMono.variable,
        geist.variable,
        "font-sans dark" // default dark ON (can be changed by toggle)
      )}
    >
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}