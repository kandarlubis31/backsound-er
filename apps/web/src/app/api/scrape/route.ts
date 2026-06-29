import { NextResponse } from "next/server"
import { runScrape, getScrapeStatus } from "@/lib/scraper"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 min timeout for scraping

export async function POST() {
  try {
    const status = await runScrape()
    return NextResponse.json(status)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed"
    const isCooldown = message.toLowerCase().includes("cooldown")
    return NextResponse.json({ error: message }, { status: isCooldown ? 429 : 500 })
  }
}

export async function GET() {
  try {
    const status = await getScrapeStatus()
    return NextResponse.json(status)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get status"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
