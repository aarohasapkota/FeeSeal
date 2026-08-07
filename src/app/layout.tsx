import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const menuSerif = Libre_Baskerville({
  variable: "--font-menu-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FeeSeal",
  description:
    "The menu price is the bill price. Verified. Digital menus with on-chain provenance and three-way price checks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${menuSerif.variable} h-full antialiased`}
      // Tunnel / remote-browser tooling injects attrs (e.g. __gcrremoteframetoken)
      // onto <html> before hydrate — suppress the benign mismatch warning.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
