import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers";
import { OfflineDetector } from "@/components/shared";

export const metadata: Metadata = {
  title: {
    default: "Administrasi PKBM - Yayasan Al Barakah",
    template: "%s | Administrasi PKBM",
  },
  description: "Sistem Persuratan & Administrasi PKBM Yayasan Al Barakah",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Administrasi PKBM",
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Administrasi PKBM - Yayasan Al Barakah",
    title: "Administrasi PKBM - Yayasan Al Barakah",
    description: "Sistem Persuratan & Administrasi PKBM Yayasan Al Barakah",
    images: [
      {
        url: "/icon/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Administrasi PKBM Logo",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Administrasi PKBM - Yayasan Al Barakah",
    description: "Sistem Persuratan & Administrasi PKBM",
    images: ["/icon/icon-512x512.png"],
  },

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

  applicationName: "Administrasi PKBM",
  authors: [{ name: "Yayasan Al Barakah" }],
  keywords: [
    "administrasi",
    "pkbm",
    "persuratan",
    "yayasan",
    "al barakah",
    "surat",
    "digital",
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/icon/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Administrasi PKBM" />

        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-TileImage" content="/icon/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
          crossOrigin="anonymous"
        />
      </head>

      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <OfflineDetector />
        </AuthProvider>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
