"use client"

import { useCallback, useEffect, useState } from "react"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.favorites)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.favorites,
        JSON.stringify(favorites)
      )
    } catch {
      // ignore storage errors
    }
  }, [favorites])

  const toggleFavorite = useCallback((soundId: number) => {
    setFavorites((prev) =>
      prev.includes(soundId)
        ? prev.filter((id) => id !== soundId)
        : [...prev, soundId]
    )
  }, [])

  const isFavorite = useCallback(
    (soundId: number) => favorites.includes(soundId),
    [favorites]
  )

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    count: favorites.length,
  }
}
