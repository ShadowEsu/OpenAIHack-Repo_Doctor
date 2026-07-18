import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PixelGrid } from "@/components/PixelGrid";
import { SmoothScroll } from "@/components/SmoothScroll";
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
  title: "Repo Doctor — An AI health clinic for messy codebases",
  description:
    "Repo Doctor examines messy repositories, explains what is wrong, and safely repairs maintainability issues one treatment at a time.",
  openGraph: {
    title: "Repo Doctor — An AI health clinic for messy codebases",
    description:
      "Repo Doctor examines messy repositories, explains what is wrong, and safely repairs maintainability issues one treatment at a time.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Repo Doctor — An AI health clinic for messy codebases",
    description:
      "Repo Doctor examines messy repositories, explains what is wrong, and safely repairs maintainability issues one treatment at a time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <PixelGrid />
        <div className="relative z-10 flex min-h-full flex-col">
          <SmoothScroll>{children}</SmoothScroll>
        </div>
      </body>
    </html>
  );
}
