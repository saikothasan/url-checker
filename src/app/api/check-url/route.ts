import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    // Type assertion with interface
    interface RequestBody {
      url: string
    }

    // Parse the request body
    const body = (await request.json()) as RequestBody
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 })
    }

    const startTime = performance.now()

    try {
      // Create an AbortController for timeout
      const controller = new AbortController()
      const { signal } = controller

      // Set timeout for the fetch request
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 10000)

      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; URLChecker/1.0; +https://example.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      // Get headers as an object
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      // For successful responses, try to get the page title and meta description
      let pageTitle = null
      let metaDescription = null
      let canonical = null

      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.headers.get("content-type")?.includes("text/html")
      ) {
        try {
          // Create a new controller for the HTML request
          const htmlController = new AbortController()
          const htmlTimeoutId = setTimeout(() => {
            htmlController.abort()
          }, 10000)

          // Make a GET request to get the HTML content
          const htmlResponse = await fetch(url, {
            method: "GET",
            redirect: "follow",
            signal: htmlController.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; URLChecker/1.0; +https://example.com)",
            },
          })

          clearTimeout(htmlTimeoutId)

          const html = await htmlResponse.text()

          // Extract title
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          if (titleMatch) {
            pageTitle = titleMatch[1].trim()
          }

          // Extract meta description
          const descriptionMatch =
            html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)
          if (descriptionMatch) {
            metaDescription = descriptionMatch[1].trim()
          }

          // Extract canonical URL
          const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
          if (canonicalMatch) {
            canonical = canonicalMatch[1].trim()
          }
        } catch (error) {
          // Silently fail - we'll just return without the extra SEO data
          console.error("Error fetching HTML content:", error)
        }
      }

      return NextResponse.json({
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        redirected: response.redirected,
        redirectUrl: response.redirected ? response.url : undefined,
        headers,
        pageTitle,
        metaDescription,
        canonical,
      })
    } catch (error) {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      return NextResponse.json({
        url,
        status: null,
        statusText: "Failed",
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

