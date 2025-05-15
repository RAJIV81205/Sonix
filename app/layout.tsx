import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

// ✅ Metadata (no themeColor here)
export const metadata: Metadata = {
  title: "Sonix - Your Music, Elevated",
  description:
    "Experience music like never before with Sonix. High-quality streaming, personalized playlists, and a beautiful interface.",
};

// ✅ Viewport (themeColor goes here now)
export const viewport: Viewport = {
  themeColor: "#121212", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
