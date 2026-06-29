import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid sound ID" }, { status: 400 })
    }

    const sound = await prisma.sound.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    })

    if (!sound) {
      return NextResponse.json({ error: "Sound not found" }, { status: 404 })
    }

    return NextResponse.json(sound)
  } catch (error) {
    console.error("GET /api/sounds/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sound" },
      { status: 500 }
    )
  }
}
