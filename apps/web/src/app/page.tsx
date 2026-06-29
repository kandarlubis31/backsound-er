import { Suspense } from "react"
import HomePage from "./home-page"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 space-y-8">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-muted rounded animate-pulse" />
          </div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  )
}
