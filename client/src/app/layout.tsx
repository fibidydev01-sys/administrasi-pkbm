// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, NotificationProvider } from "@/components/providers";
import { PWAInstallPrompt, OfflineDetector } from "@/components/shared";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Absensi Yayasan Al Barakah",
    template: "%s | Absensi Yayasan",
  },
  description: "Sistem Absensi Digital Yayasan Al Barakah - Madiun",
  manifest: "/manifest.json",

  // ✅ PWA Meta Tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Absensi Yayasan",
  },

  // ✅ Open Graph for sharing
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://absensi-yayasan.vercel.app", // Ganti dengan URL production
    siteName: "Absensi Yayasan Al Barakah",
    title: "Absensi Yayasan Al Barakah",
    description: "Sistem Absensi Digital untuk Guru dan Tutor",
    images: [
      {
        url: "/icon/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Absensi Yayasan Logo",
      },
    ],
  },

  // ✅ Twitter Card
  twitter: {
    card: "summary",
    title: "Absensi Yayasan Al Barakah",
    description: "Sistem Absensi Digital",
    images: ["/icon/icon-512x512.png"],
  },

  // ✅ Icons (Fixed favicon paths)
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // ✅ Other metadata
  applicationName: "Absensi Yayasan",
  authors: [{ name: "Yayasan Al Barakah" }],
  keywords: [
    "absensi",
    "yayasan",
    "al barakah",
    "madiun",
    "digital",
    "guru",
    "tutor",
    "pendidikan",
  ],
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // ✅ For notch/safe area
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* ✅ PWA Meta Tags */}
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/icon/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Absensi Yayasan" />

        {/* ✅ Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ✅ Microsoft Tile */}
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-TileImage" content="/icon/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* ✅ Preconnect to External Services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
          crossOrigin="anonymous"
        />
      </head>

      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            {children}

            {/* ✅ PWA Components */}
            <OfflineDetector />
            <PWAInstallPrompt />
          </NotificationProvider>
        </AuthProvider>

        {/* ✅ Toast Notifications */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}