"use client"

import { useMemo } from "react"
import { Download, Loader2, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useScrapeStatus, useTriggerScrape } from "@/hooks/use-scraper"
import { cn } from "@/lib/utils"

function formatCooldown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Show green completed state for 60s after scrape finishes, then cooldown. */
function useCompletedGrace(lastScrapeAt: string | null): boolean {
  if (!lastScrapeAt) return false
  const elapsed = (Date.now() - new Date(lastScrapeAt).getTime()) / 1000
  return elapsed < 60
}

export function ScrapeButton() {
  const { data } = useScrapeStatus()
  const { mutate: trigger, isPending } = useTriggerScrape()

  const status = data?.status ?? "idle"
  const isRunning = status === "running"
  const justCompleted = useCompletedGrace(data?.lastScrapeAt ?? null)
  const isCooldown = !isRunning && !justCompleted && (data?.cooldownRemaining ?? 0) > 0
  const isFailed = status === "failed"
  const isCompleted = justCompleted
  const isIdle = status === "idle"

  const disabled = isPending || isRunning || isCooldown
  const loading = isPending || isRunning

  function handleClick() {
    if (disabled) return
    trigger()
  }

  const tooltipText = useMemo(() => {
    if (isRunning) return `Found ${data?.soundsFound ?? 0} sounds, added ${data?.soundsAdded ?? 0}…`
    if (isCompleted) return `Done! ${data?.soundsAdded ?? 0} sounds added.`
    if (isCooldown) return `Next scrape in ${formatCooldown(data?.cooldownRemaining ?? 0)}`
    if (isFailed) return `Failed: ${data?.error ?? "Unknown error"} — click to retry`
    return "Scrape sounds from myinstants.com"
  }, [isRunning, isCompleted, isCooldown, isFailed, data])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="secondary"
            size="xs"
            className={cn(
              "gap-1.5 rounded-full transition-all",
              isCooldown && "text-muted-foreground",
              isRunning && "bg-primary/10 text-primary border-primary/20",
              isFailed && "bg-destructive/10 text-destructive border-destructive/20",
              isCompleted && "bg-green-500/10 text-green-600 border-green-500/20"
            )}
            disabled={disabled}
            onClick={handleClick}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isCooldown ? (
              <Clock className="size-3.5" />
            ) : isFailed ? (
              <AlertCircle className="size-3.5" />
            ) : isCompleted ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {loading
                ? `Scraping... ${data?.page ?? 0}/${data?.totalPages ?? 6}`
                : isCooldown
                ? `Cooldown ${formatCooldown(data?.cooldownRemaining ?? 0)}`
                : isFailed
                ? "Retry Scrape"
                : isCompleted
                ? "Done!"
                : "Scrape"}
            </span>
          </Button>
        }
      />
      <TooltipContent side="bottom" className="text-xs max-w-64">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}
