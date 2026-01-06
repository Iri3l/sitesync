import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addPhotoSchema = z.object({
  // Accept both absolute URLs (https://...) and relative paths (/uploads/...)
  url: z.string().min(1),
  caption: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = addPhotoSchema.parse(body)

    // Check if snag exists
    const snag = await prisma.snag.findUnique({
      where: { id: params.id },
    })

    if (!snag) {
      return NextResponse.json({ error: "Snag not found" }, { status: 404 })
    }

    // Block regular users from adding photos
    const userRole = session.user.role || "user"
    if (userRole === "user") {
      return NextResponse.json(
        { error: "You don't have permission to add photos" },
        { status: 403 }
      )
    }

    // Add photo
    const photo = await prisma.snagPhoto.create({
      data: {
        snagId: params.id,
        url: validated.url,
        caption: validated.caption || null,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get("photoId")

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      )
    }

    // Check if photo exists and belongs to this snag
    const photo = await prisma.snagPhoto.findUnique({
      where: { id: photoId },
    })

    if (!photo || photo.snagId !== params.id) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Block regular users from deleting photos
    const userRole = session.user.role || "user"
    if (userRole === "user") {
      return NextResponse.json(
        { error: "You don't have permission to delete photos" },
        { status: 403 }
      )
    }

    await prisma.snagPhoto.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ message: "Photo deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

