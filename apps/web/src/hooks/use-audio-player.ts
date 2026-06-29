"use client"

import { useEffect, useRef } from "react"
import { useAudioStore } from "@/stores/audio-store"

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const {
    currentSound,
    isPlaying,
    volume,
    isMuted,
    play,
    pause,
    resume,
    toggle,
    stop,
    setDuration,
    setCurrentTime,
  } = useAudioStore()

  // Create audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = "auto"
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  // Sync audio element with store state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (currentSound && isPlaying) {
      if (audio.src !== currentSound.audioUrl) {
        audio.src = currentSound.audioUrl
        audio.currentTime = 0
      }
      audio.play().catch(() => {
        // Autoplay blocked
        pause()
      })
    } else if (!isPlaying && audio.src) {
      audio.pause()
    }
  }, [currentSound, isPlaying, pause])

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => setDuration(audio.duration)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => stop()
    const onError = () => {
      console.error("Audio playback error")
      stop()
    }

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
    }
  }, [setDuration, setCurrentTime, stop])

  return {
    currentSound,
    isPlaying,
    play,
    pause,
    resume,
    toggle,
    stop,
  }
}
