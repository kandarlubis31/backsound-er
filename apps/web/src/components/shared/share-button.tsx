"use client"

import { useState, useCallback } from "react"
import { Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  soundSlug: string
  soundName: string
  className?: string
}

export function ShareButton({ soundSlug, soundName, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/sound/${soundSlug}`

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: soundName,
          text: `Dengerin "${soundName}" di backsound-er!`,
          url,
        })
        return
      } catch {
        // user cancelled, fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard failed
    }
  }, [soundSlug, soundName])

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleShare}
      className={cn("relative", className)}
      title="Share"
    >
      {copied ? (
        <Check className="size-3 text-green-500" />
      ) : (
        <Share2 className="size-3" />
      )}
    </Button>
  )
}
