import * as cheerio from "cheerio"
import fs from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"

const MYINSTANTS_BASE = "https://www.myinstants.com"
const PUBLIC_SOUNDS_DIR = path.join(process.cwd(), "public", "sounds")
const SCRAPE_COOLDOWN_HOURS = 24
const MAX_SOUNDS_PER_PAGE = 50

// Pages to scrape: homepage + popular category pages
const SCRAPE_TARGETS: { url: string; categoryName: string; categorySlug: string }[] = [
  {
    url: "/en/index/IN/",
    categoryName: "Trending",
    categorySlug: "trending",
  },
  {
    url: "/en/index/US/",
    categoryName: "Popular",
    categorySlug: "popular",
  },
  {
    url: "/en/categories/memes%20sound%20effects",
    categoryName: "Memes",
    categorySlug: "memes",
  },
  {
    url: "/en/categories/anime%20and%20manga%20sound%20effects",
    categoryName: "Anime",
    categorySlug: "anime",
  },
  {
    url: "/en/categories/video%20games%20sound%20effects",
    categoryName: "Games",
    categorySlug: "games",
  },
  {
    url: "/en/categories/movies%20and%20tv%20sound%20effects",
    categoryName: "Movies & TV",
    categorySlug: "movies-tv",
  },
]

export interface ScrapeStatus {
  id: number | null
  status: "idle" | "running" | "completed" | "failed"
  soundsFound: number
  soundsAdded: number
  soundsSkipped: number
  page: number
  totalPages: number
  cooldownRemaining: number | null // seconds until next scrape allowed
  error: string | null
  lastScrapeAt: string | null
}

export interface ExtractedSound {
  name: string
  slug: string
  mp3Path: string
  sourceUrl: string
}

/**
 * Extract sound data from a myinstants.com page HTML.
 * Structure: div.instant > button.small-button[onclick="play(...)"]
 */
export function extractSounds(html: string, pageUrl: string): ExtractedSound[] {
  const $ = cheerio.load(html)
  const sounds: ExtractedSound[] = []

  $(".instant .small-button").each((_, el) => {
    const onclick = $(el).attr("onclick")
    const title = $(el).attr("title") || "" // "Play SOUND NAME sound"
    const $btn = $(el)

    if (!onclick) return

    // Parse play('/media/sounds/xxx.mp3', 'loader-id', 'slug-id')
    const playMatch = onclick.match(
      /play\(['"]([^'"]+)['"],\s*['"]([^'"]*)['"],\s*['"]([^'"]*)['"]\)/
    )
    if (!playMatch) return

    const mp3Path = playMatch[1] // e.g. /media/sounds/fart.mp3
    const slugRaw = playMatch[3] // e.g. fart-12345

    // Derive clean name from title: "Play FAHHH sound" → "FAHHH"
    const nameFromTitle = title.replace(/^Play\s+/i, "").replace(/\s+sound$/i, "").trim()
    // Fallback: button text content
    const nameFromText = $btn.clone().children().remove().end().text().trim()
    const name = nameFromTitle || nameFromText || slugRaw.replace(/-\d+$/, "")

    // Derive clean slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const sourceUrl = `${MYINSTANTS_BASE}${pageUrl}`

    sounds.push({
      name,
      slug: `${slug}-${slugRaw.split("-").pop()}`,
      mp3Path,
      sourceUrl,
    })
  })

  return sounds
}

/**
 * Download a single MP3 file from myinstants.com.
 * Returns the local path relative to /public.
 */
export async function downloadMp3(mp3Path: string): Promise<string | null> {
  const url = `${MYINSTANTS_BASE}${mp3Path}`
  const fileName = mp3Path.split("/").pop() || `sound-${Date.now()}.mp3`
  const localPath = path.join(PUBLIC_SOUNDS_DIR, fileName)
  const publicPath = `/sounds/${fileName}`

  // Skip if already downloaded
  if (fs.existsSync(localPath)) {
    const stat = fs.statSync(localPath)
    if (stat.size > 0) return publicPath
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30_000)

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: MYINSTANTS_BASE,
      },
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 100) return null // too small, probably an error page
    fs.writeFileSync(localPath, buffer)
    return publicPath
  } catch {
    return null
  }
}

/**
 * Ensure a category exists; return its ID.
 */
async function ensureCategory(
  name: string,
  slug: string
): Promise<number> {
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return existing.id

  const created = await prisma.category.create({
    data: { name, slug },
  })
  return created.id
}

/**
 * Upsert a sound into the database.
 */
async function upsertSound(
  sound: ExtractedSound,
  localUrl: string,
  categoryId: number,
  fileSize: number | null
): Promise<"added" | "skipped"> {
  const existing = await prisma.sound.findUnique({
    where: { slug: sound.slug },
  })
  if (existing) return "skipped"

  await prisma.sound.create({
    data: {
      name: sound.name,
      slug: sound.slug,
      audioUrl: localUrl,
      sourceUrl: sound.sourceUrl,
      emoji: null,
      tags: [],
      categoryId,
      fileSize,
    },
  })
  return "added"
}

/**
 * Ensure the public/sounds directory exists.
 */
function ensureSoundsDir(): void {
  if (!fs.existsSync(PUBLIC_SOUNDS_DIR)) {
    fs.mkdirSync(PUBLIC_SOUNDS_DIR, { recursive: true })
  }
}

/**
 * Check if a scrape is allowed (24h cooldown).
 */
export async function canScrape(): Promise<{
  allowed: boolean
  cooldownRemaining: number | null
}> {
  const lastCompleted = await prisma.scrapeLog.findFirst({
    where: { status: "completed" },
    orderBy: { endedAt: "desc" },
  })

  if (!lastCompleted || !lastCompleted.endedAt) {
    return { allowed: true, cooldownRemaining: null }
  }

  const elapsed = (Date.now() - lastCompleted.endedAt.getTime()) / 1000
  const cooldownSeconds = SCRAPE_COOLDOWN_HOURS * 3600
  if (elapsed >= cooldownSeconds) {
    return { allowed: true, cooldownRemaining: null }
  }

  return {
    allowed: false,
    cooldownRemaining: Math.ceil(cooldownSeconds - elapsed),
  }
}

/**
 * Get the current scrape status.
 */
export async function getScrapeStatus(): Promise<ScrapeStatus> {
  const latest = await prisma.scrapeLog.findFirst({
    orderBy: { startedAt: "desc" },
  })

  const lastCompleted = await prisma.scrapeLog.findFirst({
    where: { status: "completed" },
    orderBy: { endedAt: "desc" },
  })

  const { cooldownRemaining } = await canScrape()

  if (!latest) {
    return {
      id: null,
      status: "idle",
      soundsFound: 0,
      soundsAdded: 0,
      soundsSkipped: 0,
      page: 0,
      totalPages: SCRAPE_TARGETS.length,
      cooldownRemaining,
      error: null,
      lastScrapeAt: lastCompleted?.endedAt?.toISOString() ?? null,
    }
  }

  return {
    id: latest.id,
    status: latest.status as ScrapeStatus["status"],
    soundsFound: latest.soundsFound,
    soundsAdded: latest.soundsAdded,
    soundsSkipped: latest.soundsSkipped,
    page: latest.page,
    totalPages: SCRAPE_TARGETS.length,
    cooldownRemaining,
    error: latest.error,
    lastScrapeAt: lastCompleted?.endedAt?.toISOString() ?? null,
  }
}

/**
 * Run the full scrape job.
 */
export async function runScrape(): Promise<ScrapeStatus> {
  const { allowed } = await canScrape()
  if (!allowed) {
    const status = await getScrapeStatus()
    throw new Error(
      `Cooldown active. Try again in ${Math.ceil((status.cooldownRemaining ?? 0) / 3600)}h ${Math.ceil(((status.cooldownRemaining ?? 0) % 3600) / 60)}m.`
    )
  }

  ensureSoundsDir()

  const log = await prisma.scrapeLog.create({
    data: {
      status: "running",
      soundsFound: 0,
      soundsAdded: 0,
      soundsSkipped: 0,
      page: 0,
    },
  })

  let totalFound = 0
  let totalAdded = 0
  let totalSkipped = 0

  try {
    for (let i = 0; i < SCRAPE_TARGETS.length; i++) {
      const target = SCRAPE_TARGETS[i]
      const pageNum = i + 1

      // Fetch page
      const html = await fetchPage(target.url)

      if (!html) {
        // Update log and continue
        await prisma.scrapeLog.update({
          where: { id: log.id },
          data: { page: pageNum },
        })
        continue
      }

      // Extract sounds
      const extracted = extractSounds(html, target.url)
      totalFound += extracted.length

      // Ensure category
      const categoryId = await ensureCategory(
        target.categoryName,
        target.categorySlug
      )

      // Download and insert each sound (limit per page)
      const batch = extracted.slice(0, MAX_SOUNDS_PER_PAGE)
      for (const sound of batch) {
        try {
          const localUrl = await downloadMp3(sound.mp3Path)
          if (!localUrl) {
            totalSkipped++
            continue
          }

          const filePath = path.join(
            PUBLIC_SOUNDS_DIR,
            sound.mp3Path.split("/").pop()!
          )
          let fileSize: number | null = null
          try {
            fileSize = fs.statSync(filePath).size
          } catch {
            // ignore
          }

          const result = await upsertSound(sound, localUrl, categoryId, fileSize)
          if (result === "added") totalAdded++
          else totalSkipped++
        } catch {
          totalSkipped++
        }
      }

      // Update progress
      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: {
          page: pageNum,
          soundsFound: totalFound,
          soundsAdded: totalAdded,
          soundsSkipped: totalSkipped,
        },
      })
    }

    // Mark completed
    await prisma.scrapeLog.update({
      where: { id: log.id },
      data: {
        status: "completed",
        endedAt: new Date(),
        soundsFound: totalFound,
        soundsAdded: totalAdded,
        soundsSkipped: totalSkipped,
      },
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"

    await prisma.scrapeLog.update({
      where: { id: log.id },
      data: {
        status: "failed",
        endedAt: new Date(),
        error: errorMsg,
        soundsFound: totalFound,
        soundsAdded: totalAdded,
        soundsSkipped: totalSkipped,
      },
    })

    throw err
  }

  return getScrapeStatus()
}

/**
 * Fetch a page from myinstants.com and return HTML.
 */
async function fetchPage(path: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30_000)

    const res = await fetch(`${MYINSTANTS_BASE}${path}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}
