import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Doctor — AI Health Clinic for Codebases",
  description:
    "An AI-powered repository health platform that examines codebases, identifies problems, and helps developers safely fix issues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <ThemeProvider>
          <Providers>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
