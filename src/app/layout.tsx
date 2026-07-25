import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

  return {
    title: "Zekora",
    description: "A calm, cozy personal storage system",
    metadataBase: new URL(baseUrl),
    icons: { icon: "/zekora.png" },
    openGraph: {
      images: "/zekora.png",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh">
        {children}
        <div className="grain-overlay" />
      </body>
    </html>
  )
}
