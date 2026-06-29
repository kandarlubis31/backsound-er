"use client"

import Link from "next/link"
import { useCategories } from "@/hooks/use-sounds"
import { cn } from "@/lib/utils"

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          📂 Semua Kategori
        </h1>
        <p className="mt-1 text-muted-foreground">
          Jelajahi sound berdasarkan kategori
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : !categories ? (
        <p className="text-muted-foreground">Gagal memuat kategori.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(categories as { id: number; name: string; slug: string; icon?: string | null; _count?: { sounds: number } }[]).map(
            (cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-all duration-200",
                  "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                )}
              >
                <span className="text-3xl">{cat.icon || "🎵"}</span>
                <span className="text-sm font-medium text-foreground">
                  {cat.name}
                </span>
                {cat._count && (
                  <span className="text-xs text-muted-foreground">
                    {cat._count.sounds} sound
                  </span>
                )}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}
