"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/hooks/use-favorites"

interface FavoriteButtonProps {
  soundId: number
  className?: string
}

export function FavoriteButton({ soundId, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(soundId)

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => toggleFavorite(soundId)}
      className={cn(className)}
      title={favorited ? "Hapus favorit" : "Tambah favorit"}
    >
      <Heart
        className={cn(
          "size-3 transition-all duration-200",
          favorited && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  )
}
