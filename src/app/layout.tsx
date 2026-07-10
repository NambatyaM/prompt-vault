import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "PromptVault - AI Prompts That Made Money",
    template: "%s | PromptVault",
  },
  description:
    "Discover AI prompts with proven outcomes. Real results from real creators. Browse prompts that actually worked.",
  openGraph: {
    title: "PromptVault - AI Prompts That Made Money",
    description:
      "Discover AI prompts with proven outcomes. Real results from real creators.",
    type: "website",
    siteName: "PromptVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptVault - AI Prompts That Made Money",
    description:
      "Discover AI prompts with proven outcomes. Real results from real creators.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
