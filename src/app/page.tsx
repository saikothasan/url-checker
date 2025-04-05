"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Save,
  Upload,
  Clipboard,
  Globe,
  Link2,
  AlertTriangle,
  BarChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type UrlStatus = {
  url: string
  status: number | null
  statusText: string
  responseTime: number
  error?: string
  redirected?: boolean
  redirectUrl?: string
  headers?: Record<string, string>
  pageTitle?: string
  metaDescription?: string
  canonical?: string
}

export default function UrlChecker() {
  const [urls, setUrls] = useState<string>("")
  const [results, setResults] = useState<UrlStatus[]>([])
  const [isChecking, setIsChecking] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [groupByDomains, setGroupByDomains] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const parseUrls = (text: string): string[] => {
    return text
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .map((url) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return `https://${url}`
        }
        return url
      })
      .filter((url) => {
        const isValid = validateUrl(url)
        if (!isValid) {
          console.warn(`Invalid URL skipped: ${url}`)
        }
        return isValid
      })
  }

  const checkUrl = async (url: string): Promise<UrlStatus> => {
    try {
      const response = await fetch("/api/check-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "API request failed")
      }

      return await response.json()
    } catch (error) {
      return {
        url,
        status: null,
        statusText: "Failed",
        responseTime: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const checkUrls = async () => {
    const urlList = parseUrls(urls)
    if (urlList.length === 0) {
      toast({
        title: "No URLs found",
        description: "Please enter at least one valid URL",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)
    setResults([])
    setProgress(0)

    toast({
      title: "URL check started",
      description: `Checking ${urlList.length} URLs. This may take a while.`,
    })

    const batchSize = 10 // Process 10 URLs at a time
    const results: UrlStatus[] = []

    try {
      for (let i = 0; i < urlList.length; i += batchSize) {
        const batch = urlList.slice(i, i + batchSize)
        const batchResults = await Promise.all(batch.map(checkUrl))

        results.push(...batchResults)
        setResults([...results])
        setProgress(Math.round((results.length / urlList.length) * 100))

        // Small delay between batches
        if (i + batchSize < urlList.length) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      }

      toast({
        title: "URL check completed",
        description: `Successfully checked ${results.length} URLs.`,
        action: (
          <ToastAction
            altText="View Results"
            onClick={() =>
              window.scrollTo({ top: document.getElementById("results-section")?.offsetTop || 0, behavior: "smooth" })
            }
          >
            View Results
          </ToastAction>
        ),
      })
    } catch (error) {
      toast({
        title: "Error checking URLs",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
      setProgress(100)
    }
  }

  const getStatusColor = (status: number | null): string => {
    if (status === null) return "bg-gray-100 text-gray-800"
    if (status === 200) return "bg-emerald-100 text-emerald-800" // Perfect status
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800" // Success
    if (status >= 300 && status < 400) return "bg-amber-100 text-amber-800" // Redirects
    if (status === 404) return "bg-rose-100 text-rose-800" // Not found
    if (status >= 400 && status < 500) return "bg-orange-100 text-orange-800" // Client errors
    return "bg-red-100 text-red-800" // Server errors
  }

  const getStatusDescription = (status: number | null): string => {
    if (status === null) return "Failed to connect"
    if (status === 200) return "OK"
    if (status === 201) return "Created"
    if (status === 204) return "No Content"
    if (status === 301) return "Moved Permanently"
    if (status === 302) return "Found (Temporary Redirect)"
    if (status === 304) return "Not Modified"
    if (status === 400) return "Bad Request"
    if (status === 401) return "Unauthorized"
    if (status === 403) return "Forbidden"
    if (status === 404) return "Not Found"
    if (status === 429) return "Too Many Requests"
    if (status === 500) return "Internal Server Error"
    if (status === 502) return "Bad Gateway"
    if (status === 503) return "Service Unavailable"
    if (status === 504) return "Gateway Timeout"
    return "Unknown Status"
  }

  const getStatusIcon = (status: number | null) => {
    if (status === null) return <AlertTriangle className="h-4 w-4 text-gray-600" />
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status >= 300 && status < 400) return <Link2 className="h-4 w-4 text-amber-600" />
    if (status >= 400 && status < 500) return <AlertCircle className="h-4 w-4 text-orange-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const filteredResults = () => {
    if (activeTab === "all") return results
    if (activeTab === "success") return results.filter((r) => r.status && r.status >= 200 && r.status < 300)
    if (activeTab === "redirects") return results.filter((r) => r.status && r.status >= 300 && r.status < 400)
    if (activeTab === "clientErrors") return results.filter((r) => r.status && r.status >= 400 && r.status < 500)
    if (activeTab === "serverErrors") return results.filter((r) => r.status && r.status >= 500)
    return results.filter((r) => r.status === null)
  }

  const statusCounts = {
    all: results.length,
    success: results.filter((r) => r.status && r.status >= 200 && r.status < 300).length,
    redirects: results.filter((r) => r.status && r.status >= 300 && r.status < 400).length,
    clientErrors: results.filter((r) => r.status && r.status >= 400 && r.status < 500).length,
    serverErrors: results.filter((r) => r.status && r.status >= 500).length,
    failed: results.filter((r) => r.status === null).length,
  }

  const exportToCsv = () => {
    if (results.length === 0) return

    // Create CSV content
    const headers = [
      "URL",
      "Status",
      "Status Text",
      "Response Time (ms)",
      "Redirected",
      "Redirect URL",
      "Page Title",
      "Meta Description",
      "Canonical URL",
      "Error",
    ]
    const rows = results.map((r) => [
      r.url,
      r.status || "",
      r.statusText || "",
      r.responseTime,
      r.redirected ? "Yes" : "No",
      r.redirectUrl || "",
      r.pageTitle || "",
      r.metaDescription || "",
      r.canonical || "",
      r.error || "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `url-check-results-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `Exported ${results.length} results to CSV`,
    })
  }

  const exportValidUrls = () => {
    const validUrls = results.filter((r) => r.status && r.status >= 200 && r.status < 400)

    if (validUrls.length === 0) {
      toast({
        title: "No valid URLs",
        description: "There are no valid URLs to export",
        variant: "destructive",
      })
      return
    }

    // Create text content with one URL per line
    const content = validUrls.map((r) => (r.redirected ? r.redirectUrl : r.url)).join("\n")

    // Create and download the file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `valid-urls-${new Date().toISOString().slice(0, 10)}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `Exported ${validUrls.length} valid URLs to text file`,
    })
  }

  const openValidUrls = () => {
    const validUrls = results.filter((r) => r.status && r.status >= 200 && r.status < 300)

    if (validUrls.length === 0) {
      toast({
        title: "No valid URLs",
        description: "There are no valid URLs to open",
        variant: "destructive",
      })
      return
    }

    if (validUrls.length > 10) {
      toast({
        title: "Warning: Opening multiple tabs",
        description: `You're about to open ${validUrls.length} tabs. Proceed?`,
        action: (
          <ToastAction
            altText="Open URLs"
            onClick={() => {
              validUrls.forEach((result) => {
                window.open(result.url, "_blank")
              })
            }}
          >
            Open All
          </ToastAction>
        ),
        variant: "destructive",
      })
      return
    }

    validUrls.forEach((result) => {
      window.open(result.url, "_blank")
    })

    toast({
      title: "URLs opened",
      description: `Opened ${validUrls.length} URLs in new tabs`,
    })
  }

  const saveUrlList = () => {
    if (urls.trim().length === 0) return

    const blob = new Blob([urls], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `url-list-${new Date().toISOString().slice(0, 10)}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "URL list saved",
      description: "Your URL list has been saved as a text file",
    })
  }

  const loadUrlList = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        setUrls(content)
        toast({
          title: "URL list loaded",
          description: `Loaded ${parseUrls(content).length} URLs from file`,
        })
      }
    }
    reader.readAsText(file)

    // Reset the input
    if (event.target) {
      event.target.value = ""
    }
  }

  const copyUrlsToClipboard = (urls: string[]) => {
    if (urls.length === 0) return

    navigator.clipboard
      .writeText(urls.join("\n"))
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: `${urls.length} URLs copied to clipboard`,
        })
      })
      .catch((err) => {
        toast({
          title: "Failed to copy",
          description: "Could not copy URLs to clipboard",
          variant: "destructive",
        })
      })
  }

  const groupByDomain = (urls: UrlStatus[]): Record<string, UrlStatus[]> => {
    const groups: Record<string, UrlStatus[]> = {}

    urls.forEach((result) => {
      try {
        const url = new URL(result.url)
        const domain = url.hostname

        if (!groups[domain]) {
          groups[domain] = []
        }

        groups[domain].push(result)
      } catch (e) {
        // If URL parsing fails, group under "Unknown"
        if (!groups["Unknown"]) {
          groups["Unknown"] = []
        }
        groups["Unknown"].push(result)
      }
    })

    return groups
  }

  const ResultItem = ({ result }: { result: UrlStatus }) => (
    <Accordion type="single" collapsible>
      <AccordionItem value={`item-${result.url}`}>
        <div className="border rounded-lg">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="font-medium truncate flex items-center">
                {getStatusIcon(result.status)}
                <span className="ml-2">{result.url}</span>
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(result.status)}>
                  {result.status ? result.status : "Error"}
                </Badge>
                <Badge variant="outline" className="bg-blue-50">
                  <Clock className="mr-1 h-3 w-3" />
                  {result.responseTime}ms
                </Badge>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {result.status ? (
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <span>{result.statusText || getStatusDescription(result.status)}</span>

                {result.redirected && (
                  <div className="mt-1">
                    <span className="text-muted-foreground">Redirected to: </span>
                    <a
                      href={result.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate inline-block max-w-full"
                    >
                      {result.redirectUrl}
                    </a>
                  </div>
                )}

                {result.pageTitle && (
                  <div className="mt-1">
                    <span className="text-muted-foreground">Title: </span>
                    <span className="font-medium">{result.pageTitle}</span>
                  </div>
                )}

                {result.metaDescription && (
                  <div className="mt-1">
                    <span className="text-muted-foreground">Meta Description: </span>
                    <span className="text-xs">{result.metaDescription}</span>
                  </div>
                )}

                {result.canonical && result.canonical !== result.url && (
                  <div className="mt-1">
                    <span className="text-muted-foreground">Canonical URL: </span>
                    <a
                      href={result.canonical}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate inline-block max-w-full"
                    >
                      {result.canonical}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{result.error || "Failed to fetch"}</span>
              </div>
            )}
          </div>

          <AccordionTrigger className="px-4 py-2 border-t">
            <span className="text-sm flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2 border-t bg-muted/20">
            {result.headers ? (
              <div className="text-sm">
                <h4 className="font-medium mb-2">Response Headers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(result.headers).map(([key, value]) => (
                    <div key={key} className="overflow-hidden">
                      <span className="font-medium">{key}: </span>
                      <span className="text-muted-foreground break-words">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No additional details available</div>
            )}
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  )

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Bulk URL Status Checker</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Check the status of hundreds of URLs at once. Verify HTTP status codes, response times, redirects, and SEO
          elements like titles and meta descriptions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5 text-primary" />
            URL Input
          </CardTitle>
          <CardDescription>
            Enter one URL per line or separate with commas. The tool will automatically add https:// if missing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={loadUrlList} disabled={isChecking}>
                    <Upload className="mr-2 h-4 w-4" />
                    Load URLs
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Load URLs from a text file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.csv" className="hidden" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveUrlList}
                    disabled={isChecking || urls.trim().length === 0}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save URLs
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save current URL list to a text file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {results.length > 0 && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={exportToCsv}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Results
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export results to CSV file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={exportValidUrls}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Export Valid URLs
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export only valid (200-399) URLs to a text file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={openValidUrls}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Valid URLs
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open all valid (200-299) URLs in new tabs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyUrlsToClipboard(
                            results.filter((r) => r.status && r.status >= 200 && r.status < 300).map((r) => r.url),
                          )
                        }
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy Valid URLs
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy all valid URLs to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>

          <Textarea
            placeholder="Enter URLs here (one per line or comma-separated)
Example:
google.com
https://github.com
vercel.com, nextjs.org"
            className="min-h-[150px] mb-4"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            disabled={isChecking}
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={checkUrls} disabled={isChecking || urls.trim().length === 0} className="w-full sm:w-auto">
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking URLs...
                </>
              ) : (
                "Check URLs"
              )}
            </Button>

            {isChecking && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsChecking(false)
                  toast({
                    title: "Check cancelled",
                    description: "URL checking has been cancelled",
                  })
                }}
              >
                Cancel
              </Button>
            )}
          </div>

          {isChecking && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                Processed {results.length} of {parseUrls(urls).length} URLs ({progress}%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="mt-6" id="results-section">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Results
                </CardTitle>
                <CardDescription>{results.length} URLs checked in total</CardDescription>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="group-domains" checked={groupByDomains} onCheckedChange={setGroupByDomains} />
                <Label htmlFor="group-domains">Group by domains</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                <TabsTrigger value="all" className="flex items-center">
                  <Globe className="mr-1 h-3 w-3" />
                  All ({statusCounts.all})
                </TabsTrigger>
                <TabsTrigger value="success" className="flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                  Success ({statusCounts.success})
                </TabsTrigger>
                <TabsTrigger value="redirects" className="flex items-center">
                  <Link2 className="mr-1 h-3 w-3 text-amber-600" />
                  Redirects ({statusCounts.redirects})
                </TabsTrigger>
                <TabsTrigger value="clientErrors" className="flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3 text-orange-600" />
                  Client Errors ({statusCounts.clientErrors})
                </TabsTrigger>
                <TabsTrigger value="serverErrors" className="flex items-center">
                  <AlertTriangle className="mr-1 h-3 w-3 text-red-600" />
                  Server Errors ({statusCounts.serverErrors})
                </TabsTrigger>
                <TabsTrigger value="failed" className="flex items-center">
                  <AlertTriangle className="mr-1 h-3 w-3 text-gray-600" />
                  Failed ({statusCounts.failed})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {groupByDomains ? (
                  // Grouped by domain view
                  Object.entries(groupByDomain(filteredResults())).map(([domain, domainResults]) => (
                    <Accordion type="single" collapsible key={domain} className="mb-4">
                      <AccordionItem value={domain}>
                        <AccordionTrigger className="bg-muted/30 px-4 rounded-t-lg">
                          <div className="flex items-center justify-between w-full">
                            <div className="font-medium flex items-center">
                              <Globe className="mr-2 h-4 w-4 text-primary" />
                              {domain}
                            </div>
                            <Badge variant="outline">{domainResults.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="border border-t-0 rounded-b-lg">
                          <div className="space-y-4 p-2">
                            {domainResults.map((result, index) => (
                              <ResultItem key={index} result={result} />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))
                ) : (
                  // Regular view
                  <div className="space-y-4">
                    {filteredResults().map((result, index) => (
                      <ResultItem key={index} result={result} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="text-sm text-muted-foreground">
              <CheckCircle className="inline-block mr-1 h-4 w-4 text-green-600" />
              {statusCounts.success} successful,
              <Link2 className="inline-block mx-1 h-4 w-4 text-amber-600" />
              {statusCounts.redirects} redirects,
              <AlertCircle className="inline-block mx-1 h-4 w-4 text-red-600" />
              {statusCounts.clientErrors + statusCounts.serverErrors + statusCounts.failed} errors
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to top
            </Button>
          </CardFooter>
        </Card>
      )}

      <footer className="mt-10 text-center text-sm text-muted-foreground">
        <p>Bulk URL Checker - Check the status of hundreds of URLs at once</p>
        <p className="mt-1">Perfect for SEO professionals, web developers, and content managers</p>
      </footer>
    </div>
  )
}

