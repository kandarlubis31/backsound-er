export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  _count?: {
    sounds: number
  }
  createdAt: string
}

export interface Sound {
  id: number
  name: string
  slug: string
  description: string | null
  audioUrl: string
  duration: number | null
  fileSize: number | null
  playCount: number
  sourceUrl: string | null
  emoji: string | null
  tags: string[]
  categoryId: number
  category?: Category
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface Stats {
  totalSounds: number
  totalCategories: number
  totalPlays: number
}

export type SortOption = "popular" | "new" | "name-asc" | "name-desc"

export interface SoundFilters {
  category?: string
  sort?: SortOption
  page?: number
  limit?: number
}
