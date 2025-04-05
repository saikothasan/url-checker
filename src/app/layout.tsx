import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bulk URL Checker - Check Hundreds of URLs at Once",
  description:
    "Quickly check the status of hundreds of URLs at once. Verify HTTP status codes, response times, redirects, and SEO elements like titles and meta descriptions.",
  keywords:
    "URL checker, bulk URL validator, SEO tool, website status checker, HTTP status codes, redirect checker, broken link finder",
  authors: [{ name: "saikothasan" }],
  creator: "saikothasan",
  publisher: "saikothasan",
  metadataBase: new URL("https://url-check.pages.dev/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://url-check.pages.dev/",
    title: "Bulk URL Checker - Check Hundreds of URLs at Once",
    description:
      "Quickly check the status of hundreds of URLs at once. Verify HTTP status codes, response times, redirects, and SEO elements.",
    siteName: "Bulk URL Checker",
    images: [
      {
        url: "https://url-check.pages.dev/website_4810757.png",
        width: 1200,
        height: 630,
        alt: "Bulk URL Checker - Check Hundreds of URLs at Once",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bulk URL Checker - Check Hundreds of URLs at Once",
    description:
      "Quickly check the status of hundreds of URLs at once. Verify HTTP status codes, response times, redirects, and SEO elements.",
    images: ["https://url-check.pages.dev/website_4810757.png"],
  },
  verification: {
    google: "YOUR-GOOGLE-VERIFICATION-CODE", // Replace with your actual verification code
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/web-app-manifest-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/web-app-manifest-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "https://url-check.pages.dev/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
}

// Add link to the head element
export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `,
          }}
        />
      </body>
    </html>
  )
}

