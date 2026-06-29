import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SOUNDS_PER_PAGE } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? String(SOUNDS_PER_PAGE))))

    if (!q) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        totalPages: 0,
        hasMore: false,
      })
    }

    const where = {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { tags: { hasSome: [q] } },
      ],
    }

    const [sounds, total] = await Promise.all([
      prisma.sound.findMany({
        where,
        orderBy: { playCount: "desc" },
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
    console.error("GET /api/search error:", error)
    return NextResponse.json(
      { error: "Failed to search sounds" },
      { status: 500 }
    )
  }
}
