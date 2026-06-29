"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ScrapeStatus } from "@/lib/scraper"

async function fetchScrapeStatus(): Promise<ScrapeStatus & { error?: string }> {
  const res = await fetch("/api/scrape")
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "Failed to fetch scrape status")
  }
  return res.json()
}

async function triggerScrape(): Promise<ScrapeStatus> {
  const res = await fetch("/api/scrape", { method: "POST" })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "Scrape failed")
  return data
}

export function useScrapeStatus() {
  return useQuery({
    queryKey: ["scrape-status"],
    queryFn: fetchScrapeStatus,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === "running") return 2000 // poll every 2s while running
      return false
    },
    staleTime: 5000,
  })
}

export function useTriggerScrape() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triggerScrape,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrape-status"] })
      queryClient.invalidateQueries({ queryKey: ["sounds"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["scrape-status"] })
    },
  })
}
