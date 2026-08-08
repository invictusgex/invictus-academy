import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl, siteDescription, siteName } from "@/config/site";
import { AuthProvider } from "@/providers/AuthProvider";
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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  icons: {
    apple: "/apple-icon.png",
    icon: [
      { sizes: "any", type: "image/x-icon", url: "/favicon.ico" },
      { sizes: "192x192", type: "image/png", url: "/icon.png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    description: siteDescription,
    locale: "es_US",
    siteName,
    title: siteName,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    description: siteDescription,
    title: siteName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
