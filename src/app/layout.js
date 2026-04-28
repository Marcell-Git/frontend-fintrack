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
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
