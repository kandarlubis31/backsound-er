"use client"

import { useCallback } from "react"
import { Play, Pause, Download, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/components/shared/favorite-button"
import { ShareButton } from "@/components/shared/share-button"
import { useAudioStore } from "@/stores/audio-store"
import { cn } from "@/lib/utils"
import type { Sound } from "@/types"

interface SoundCardProps {
  sound: Sound
  className?: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function SoundCard({ sound, className }: SoundCardProps) {
  const { currentSound, isPlaying, play } = useAudioStore()
  const isThisPlaying =
    isPlaying && currentSound?.id === sound.id

  const handlePlay = useCallback(() => {
    play({
      id: sound.id,
      name: sound.name,
      slug: sound.slug,
      audioUrl: sound.audioUrl,
      emoji: sound.emoji,
    })
  }, [sound, play])

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const a = document.createElement("a")
      a.href = sound.audioUrl
      a.download = `${sound.slug}.mp3`
      a.click()
    },
    [sound.audioUrl, sound.slug]
  )

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        isThisPlaying && "border-primary ring-1 ring-primary/30 shadow-lg shadow-primary/10",
        className
      )}
    >
      {/* Top: Emoji + Play count */}
      <div className="flex items-start justify-between">
        <button
          onClick={handlePlay}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-200",
            "bg-muted hover:bg-muted/80 hover:scale-110 active:scale-95",
            isThisPlaying && "bg-primary/20"
          )}
        >
          {sound.emoji || "🔊"}
        </button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {sound.playCount > 0 && (
            <>
              <TrendingUp className="size-3" />
              <span>{formatNumber(sound.playCount)}</span>
            </>
          )}
        </div>
      </div>

      {/* Name + Description */}
      <div className="flex flex-col min-w-0">
        <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
          {sound.name}
        </h3>
        {sound.description && (
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {sound.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {sound.tags && sound.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sound.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
          {sound.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{sound.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Bottom: Actions */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-0.5">
          <Button
            variant={isThisPlaying ? "default" : "secondary"}
            size="xs"
            onClick={handlePlay}
          >
            {isThisPlaying ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3" />
            )}
            <span className="ml-1 text-[11px]">
              {isThisPlaying ? "Pause" : sound.duration ? formatDuration(sound.duration) : "Play"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="size-3" />
          </Button>
        </div>
        <div className="flex items-center gap-0.5">
          <FavoriteButton soundId={sound.id} />
          <ShareButton soundSlug={sound.slug} soundName={sound.name} />
        </div>
      </div>
    </div>
  )
}
