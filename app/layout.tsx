import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiteSync - Construction Site Management",
  description: "Manage construction sites with Site Diary, Snags, and Stock management",
  icons: {
    icon: [
      { url: "/icon-32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icon-16.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SiteSync",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icon-32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icon-16.svg" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

