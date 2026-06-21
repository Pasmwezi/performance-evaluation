import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import SecurityBanner from "@/components/SecurityBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PerfEval - Procurement Performance Tracker",
  description: "Track and evaluate contractor and consultant performance for smarter procurement decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <Providers>
          <Navbar />
          <SecurityBanner />
          <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}


