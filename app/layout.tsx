import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sonix - Your Music, Elevated",
  description:
    "Experience music like never before with Sonix. High-quality streaming, personalized playlists, and a beautiful interface.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}
