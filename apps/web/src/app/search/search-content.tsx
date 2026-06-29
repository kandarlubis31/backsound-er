"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SoundGrid } from "@/components/sound/sound-grid"
import { CategoryPills } from "@/components/category/category-pills"
import { useCategories } from "@/hooks/use-sounds"
import type { PaginatedResponse, Sound } from "@/types"

export default function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""

  const { data: categories } = useCategories()

  const { data: result, isLoading } = useQuery<PaginatedResponse<Sound>>({
    queryKey: ["search", q],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: q.length > 0,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          🔍 Hasil Pencarian
        </h1>
        {q && (
          <p className="mt-1 text-muted-foreground">
            Menampilkan hasil untuk &quot;{q}&quot;
            {result?.total !== undefined && ` — ${result.total} sound ditemukan`}
          </p>
        )}
      </div>

      <CategoryPills
        categories={categories as { id: number; name: string; slug: string }[]}
        isLoading={!categories}
      />

      {!q ? (
        <p className="text-center py-16 text-muted-foreground">
          Ketik kata kunci untuk mencari sound.
        </p>
      ) : (
        <SoundGrid
          sounds={result?.data}
          isLoading={isLoading}
          emptyMessage={`Gak ada sound untuk "${q}".`}
          emptyIcon="🤷"
        />
      )}
    </div>
  )
}
