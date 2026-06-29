import Link from "next/link"
import { SITE_NAME } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_NAME}. Soundboard publik — tanpa login.
        </p>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link
            href="/categories"
            className="hover:text-foreground transition-colors"
          >
            Kategori
          </Link>
          <Link
            href="/search"
            className="hover:text-foreground transition-colors"
          >
            Cari
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
