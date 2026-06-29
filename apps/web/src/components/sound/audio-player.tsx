"use client"

import { useRef, useCallback } from "react"
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioStore } from "@/stores/audio-store"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { cn } from "@/lib/utils"

export function AudioPlayer() {
  // Create and manage the actual Audio element
  useAudioPlayer()
  const {
    currentSound,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    toggle,
    stop,
    setCurrentTime,
    setVolume,
    toggleMute,
  } = useAudioStore()

  const progressRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || duration <= 0) return
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = Math.max(0, Math.min(1, x / rect.width))
      setCurrentTime(pct * duration)
    },
    [duration, setCurrentTime]
  )

  if (!currentSound) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg shadow-2xl shadow-zinc-900/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        {/* Emoji + Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none sm:w-48">
          <span className="text-xl shrink-0">{currentSound.emoji || "🔊"}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {currentSound.name}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            className="shrink-0"
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
        </div>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="relative flex-1 h-1.5 rounded-full bg-muted cursor-pointer max-w-xl hidden sm:block"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleMute}
            className="shrink-0"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-primary cursor-pointer"
          />
        </div>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={stop}
          className="shrink-0"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
