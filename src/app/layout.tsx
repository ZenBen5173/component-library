import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { MotionProvider } from "@/components/gallery/motion-provider";
import { ThemeProvider } from "@/components/gallery/theme-provider";
import "./globals.css";

/**
 * Display face. Self-hosted by next/font, so there's no render-blocking
 * stylesheet and no flash of the fallback.
 */
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Component Library",
  description: "A personal library of components, sections and animations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={instrumentSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
