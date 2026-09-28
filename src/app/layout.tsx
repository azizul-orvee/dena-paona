import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

/**
 * Fonts are self-hosted (latin + latin-ext variable subsets) so neither the
 * build nor the browser ever has to reach Google.
 */
const inter = localFont({
  src: [
    { path: "./fonts/inter-latin.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/inter-latin-ext.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: "Arial",
});

const sora = localFont({
  src: [
    { path: "./fonts/sora-latin.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/sora-latin-ext.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-sora",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: "Arial",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}`
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dena-Paona — Track what you owe and what you're owed",
    template: "%s · Dena-Paona",
  },
  description:
    "A calm, private ledger for money between friends and family. Track your dena and paona, settle up, and share a read-only view of your wallet with people you trust.",
  applicationName: "Dena-Paona",
  keywords: [
    "dena paona",
    "debt tracker",
    "IOU",
    "loan tracker",
    "personal finance",
    "receivables",
    "money between friends",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Dena-Paona",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "Dena-Paona",
    title: "Dena-Paona — Track what you owe and what you're owed",
    description:
      "A calm, private ledger for money between friends and family. Track dena and paona, settle up, and share read-only access.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dena-Paona",
    description:
      "A calm, private ledger for money between friends and family.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-dvh antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
