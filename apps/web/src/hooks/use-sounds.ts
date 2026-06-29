"use client"

import { useQuery } from "@tanstack/react-query"
import type {
  Category,
  PaginatedResponse,
  Sound,
  SoundFilters,
  Stats,
} from "@/types"
import { SOUNDS_PER_PAGE } from "@/lib/constants"

async function fetchSounds(
  filters: SoundFilters = {}
): Promise<PaginatedResponse<Sound>> {
  const params = new URLSearchParams()
  if (filters.category) params.set("category", filters.category)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.page) params.set("page", String(filters.page))
  params.set("limit", String(filters.limit ?? SOUNDS_PER_PAGE))

  const res = await fetch(`/api/sounds?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch sounds")
  return res.json()
}

export function useSounds(filters?: SoundFilters) {
  return useQuery({
    queryKey: ["sounds", filters],
    queryFn: () => fetchSounds(filters),
    placeholderData: (prev) => prev,
  })
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  })
}

async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/stats")
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
  })
}

async function incrementPlay(soundId: number): Promise<void> {
  await fetch(`/api/sounds/${soundId}/play`, { method: "POST" })
}

export function useIncrementPlay() {
  return incrementPlay
}
