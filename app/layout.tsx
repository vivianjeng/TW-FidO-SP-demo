import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TW FidO SP Demo",
  description:
    "Service-Provider-side demo/sandbox for Taiwan's 行動自然人憑證 (Mobile Citizen Digital Certificate) API — build, sign, and inspect every request against the real MOICA backend.",
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
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <Nav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-black/10 dark:border-white/10 py-4">
          <div className="max-w-6xl mx-auto px-4 text-xs opacity-60">
            Unofficial demo/sandbox client for the 行動自然人憑證應用程式介面規格書 (MOI_CA_DEV_API v2.9). Not
            affiliated with the Ministry of the Interior.
          </div>
        </footer>
      </body>
    </html>
  );
}
