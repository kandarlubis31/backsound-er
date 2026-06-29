export const SITE_NAME = "backsound-er"
export const SITE_DESCRIPTION = "Instant soundboard — play, download, and share sound effects"

export const SOUNDS_PER_PAGE = 24
export const SEARCH_DEBOUNCE_MS = 300

export const LOCAL_STORAGE_KEYS = {
  favorites: "backsound-favorites",
  history: "backsound-history",
  theme: "backsound-theme",
} as const

export const SORT_OPTIONS = [
  { label: "Trending", value: "popular" },
  { label: "Terbaru", value: "new" },
  { label: "Nama A-Z", value: "name-asc" },
  { label: "Nama Z-A", value: "name-desc" },
] as const
