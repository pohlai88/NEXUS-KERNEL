import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "NEXUS-KERNEL Dashboard",
  description: "Production-grade ERP kernel with metadata catalog, lineage explorer, and ERPNext gap analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b border-border bg-canvas-overlay">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold text-primary hover:text-primary-hover">
                  NEXUS-KERNEL
                </Link>
                <div className="flex items-center gap-4">
                  <Link 
                    href="/" 
                    className="text-sm text-text-sub hover:text-text-main transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/catalog" 
                    className="text-sm text-text-sub hover:text-text-main transition-colors"
                  >
                    Metadata Catalog
                  </Link>
                  <Link 
                    href="/lineage" 
                    className="text-sm text-text-sub hover:text-text-main transition-colors"
                  >
                    Data Lineage
                  </Link>
                  <Link 
                    href="/erp-analysis" 
                    className="text-sm text-text-sub hover:text-text-main transition-colors"
                  >
                    ERPNext Analysis
                  </Link>
                </div>
              </div>
              <div className="text-xs text-text-muted font-mono">v1.1.0</div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
