import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [totalSounds, totalCategories, playResult] = await Promise.all([
      prisma.sound.count(),
      prisma.category.count(),
      prisma.sound.aggregate({ _sum: { playCount: true } }),
    ])

    return NextResponse.json({
      totalSounds,
      totalCategories,
      totalPlays: playResult._sum.playCount ?? 0,
    })
  } catch (error) {
    console.error("GET /api/stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
