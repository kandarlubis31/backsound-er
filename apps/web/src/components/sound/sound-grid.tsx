"use client"

import type { Sound } from "@/types"
import { SoundCard } from "@/components/sound/sound-card"
import { SkeletonCard } from "@/components/shared/skeleton-card"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"

interface SoundGridProps {
  sounds?: Sound[]
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: string
  className?: string
}

export function SoundGrid({
  sounds,
  isLoading,
  emptyMessage = "Belum ada sound nih.",
  emptyIcon = "🎵",
  className,
}: SoundGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
          className
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!sounds || sounds.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyMessage}
        description="Coba kata kunci lain atau jelajahi kategori."
      />
    )
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {sounds.map((sound) => (
        <SoundCard key={sound.id} sound={sound} />
      ))}
    </div>
  )
}
