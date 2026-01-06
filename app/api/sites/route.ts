import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSiteSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  status: z.string().default("active"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = createSiteSchema.parse(body)

    const site = await prisma.site.create({
      data: {
        name: validated.name,
        address: validated.address || null,
        status: validated.status,
        managerId: session.user.id,
      },
    })

    return NextResponse.json(site, { status: 201 })
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

    const userRole = session.user.role || "user"
    const isManager = userRole === "manager"

    // For managers: show only their sites
    // For users/supervisors: show all sites (created by managers)
    const sites = await prisma.site.findMany({
      where: isManager
        ? {
            managerId: session.user.id,
          }
        : {}, // Show all sites for non-managers
      include: {
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

