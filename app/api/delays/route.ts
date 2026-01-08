import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List all delays
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    const whereClause: any = {}
    if (siteId) {
      whereClause.siteId = siteId
    }

    const delays = await prisma.delay.findMany({
      where: whereClause,
      include: {
        site: {
          select: { name: true, address: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
        photos: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(delays)
  } catch (error) {
    console.error("Error fetching delays:", error)
    return NextResponse.json(
      { error: "Failed to fetch delays" },
      { status: 500 }
    )
  }
}

// POST - Create a new delay
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role || "user"
    
    // Only managers and supervisors can create delays
    if (userRole !== "manager" && userRole !== "supervisor" && userRole !== "director") {
      return NextResponse.json(
        { error: "Only managers and supervisors can create delays" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      siteId,
      title,
      description,
      category,
      severity,
      daysLost,
      startDate,
      endDate,
      impactArea,
      mitigation,
    } = body

    if (!siteId || !title || !category) {
      return NextResponse.json(
        { error: "Site, title, and category are required" },
        { status: 400 }
      )
    }

    // Create the delay
    const delay = await prisma.delay.create({
      data: {
        siteId,
        createdById: session.user.id,
        title,
        description,
        category,
        severity: severity || "moderate",
        daysLost: daysLost || 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        impactArea,
        mitigation,
      },
      include: {
        site: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    // Send email notification to managers (optional - you can expand this)
    try {
      // Get all managers and directors
      const managers = await prisma.user.findMany({
        where: {
          role: { in: ["manager", "director"] },
        },
        select: { email: true, name: true },
      })

      // Import and send emails (simplified - you could use a queue in production)
      const { sendDelayNotificationEmail } = await import("@/lib/email")
      
      for (const manager of managers) {
        if (manager.email !== session.user.email) {
          try {
            await sendDelayNotificationEmail({
              email: manager.email,
              delay: {
                title,
                category,
                severity: severity || "moderate",
                daysLost: daysLost || 1,
                siteName: delay.site.name,
                createdBy: session.user.name || session.user.email || "Unknown",
              },
            })
          } catch (emailError) {
            console.error("Failed to send email to", manager.email, emailError)
          }
        }
      }
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(delay, { status: 201 })
  } catch (error) {
    console.error("Error creating delay:", error)
    return NextResponse.json(
      { error: "Failed to create delay" },
      { status: 500 }
    )
  }
}
