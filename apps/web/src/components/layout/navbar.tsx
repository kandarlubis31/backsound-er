"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrapeButton } from "@/components/scrape/scrape-button"
import { SITE_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDark = theme === "dark"

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">🎵</span>
          <span className="hidden sm:inline">{SITE_NAME}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link
            href="/categories"
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all",
              "hover:bg-muted hover:text-foreground"
            )}
          >
            Kategori
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Scrape Button */}
        <ScrapeButton />

        {/* Search */}
        {searchOpen ? (
          <form
            onSubmit={handleSearch}
            className="flex flex-1 max-w-md items-center gap-1"
          >
            <Input
              name="q"
              placeholder="Cari sound..."
              autoFocus
              className="h-8 text-sm"
            />
            <Button type="submit" size="icon-sm" variant="ghost">
              <Search className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setSearchOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Search className="size-4" />
          </Button>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden bg-background animate-in slide-in-from-top-2">
          <div className="px-4 py-3 space-y-2">
            <form onSubmit={handleSearch} className="flex gap-1">
              <Input
                name="q"
                placeholder="Cari sound..."
                className="h-8 text-sm"
              />
              <Button type="submit" size="icon-sm" variant="ghost">
                <Search className="size-3.5" />
              </Button>
            </form>
            <Link
              href="/categories"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kategori
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
