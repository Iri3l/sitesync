import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createDiarySchema = z.object({
  siteId: z.string(),
  date: z.string(),
  weather: z.string().optional(),
  workers: z.number().nullable().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = createDiarySchema.parse(body)

    const diaryEntry = await prisma.siteDiary.create({
      data: {
        siteId: validated.siteId,
        userId: session.user.id,
        date: new Date(validated.date),
        weather: validated.weather || null,
        workers: validated.workers || null,
        notes: validated.notes || null,
      },
    })

    return NextResponse.json(diaryEntry, { status: 201 })
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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entries = await prisma.siteDiary.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        site: true,
        photos: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

