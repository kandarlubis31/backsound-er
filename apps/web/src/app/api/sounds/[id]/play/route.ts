import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid sound ID" }, { status: 400 })
    }

    await prisma.sound.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/sounds/[id]/play error:", error)
    return NextResponse.json(
      { error: "Failed to update play count" },
      { status: 500 }
    )
  }
}
