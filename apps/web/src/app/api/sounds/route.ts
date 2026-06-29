import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SOUNDS_PER_PAGE } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? String(SOUNDS_PER_PAGE))))
    const category = searchParams.get("category")
    const sort = searchParams.get("sort") ?? "popular"

    const where = category ? { category: { slug: category } } : {}

    const orderBy =
      sort === "new"
        ? { createdAt: "desc" as const }
        : sort === "name-asc"
          ? { name: "asc" as const }
          : sort === "name-desc"
            ? { name: "desc" as const }
            : { playCount: "desc" as const }

    const [sounds, total] = await Promise.all([
      prisma.sound.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.sound.count({ where }),
    ])

    return NextResponse.json({
      data: sounds,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    })
  } catch (error) {
    console.error("GET /api/sounds error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sounds" },
      { status: 500 }
    )
  }
}
