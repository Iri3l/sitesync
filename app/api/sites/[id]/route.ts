import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get a single site
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const site = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error("Error fetching site:", error)
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    )
  }
}

// PATCH - Update a site (status, name, address)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role || "user"

    // Only directors can update sites
    if (userRole !== "director") {
      return NextResponse.json(
        { error: "Only directors can update sites" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, address, status } = body

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: params.id },
    })

    if (!existingSite) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (status !== undefined) updateData.status = status

    const site = await prisma.site.update({
      where: { id: params.id },
      data: updateData,
      include: {
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(site)
  } catch (error) {
    console.error("Error updating site:", error)
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a site
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role || "user"

    // Only directors can delete sites
    if (userRole !== "director") {
      return NextResponse.json(
        { error: "Only directors can delete sites" },
        { status: 403 }
      )
    }

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: params.id },
    })

    if (!existingSite) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Delete the site (cascading delete will remove related items)
    await prisma.site.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Site deleted successfully" })
  } catch (error) {
    console.error("Error deleting site:", error)
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    )
  }
}
