"use client"

import { useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SORT_OPTIONS } from "@/lib/constants"
import type { SortOption } from "@/types"

interface CategoryPillsProps {
  categories?: { id: number; name: string; slug: string }[]
  isLoading?: boolean
  activeCategory?: string | null
  activeSort?: SortOption
  className?: string
}

export function CategoryPills({
  categories,
  isLoading,
  activeCategory,
  activeSort,
  className,
}: CategoryPillsProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCategoryClick = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams()
      if (slug) params.set("category", slug)
      if (activeSort && activeSort !== "popular") params.set("sort", activeSort)
      router.push(`/${params.toString() ? `?${params}` : ""}`)
    },
    [router, activeSort]
  )

  if (isLoading) {
    return (
      <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 shrink-0 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-1.5 overflow-x-auto pb-1 scrollbar-none",
        className
      )}
    >
      <Button
        variant={!activeCategory ? "default" : "secondary"}
        size="xs"
        className="rounded-full shrink-0"
        onClick={() => handleCategoryClick(null)}
      >
        Semua
      </Button>
      {categories?.map((cat) => (
        <Button
          key={cat.id}
          variant={activeCategory === cat.slug ? "default" : "secondary"}
          size="xs"
          className="rounded-full shrink-0"
          onClick={() => handleCategoryClick(cat.slug)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
