import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShipLink — short links with click stats",
  description: "Shorten a link, share it anywhere, and see who clicks: by day, country and referrer.",
};

export const viewport: Viewport = {
  themeColor: "#09090f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The app has one theme, dark. The `dark` class turns on the dark
    // variants built into the shadcn/ui components.
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
