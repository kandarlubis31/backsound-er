import { Suspense } from "react"
import SearchContent from "./search-content"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
