import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "FinTrack - Kelola Keuanganmu",
  description: "Aplikasi pencatat pengeluaran harian yang modern dan mudah digunakan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinTrack",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FinTrack" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased bg-[#f5f5f7] text-[#1a1a2e]`}
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 10% 30%, rgba(168,85,247,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 20%, rgba(236,72,153,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)
          `
        }}
      >
        {children}
      </body>
    </html>
  );
}
