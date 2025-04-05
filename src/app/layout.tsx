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
  verification: {
    google: "YOUR-GOOGLE-VERIFICATION-CODE", // Replace with your actual verification code
  },
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

