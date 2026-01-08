import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const formatType = searchParams.get("format") || "json"
    const siteId = searchParams.get("siteId")

    const whereClause: any = {}
    if (siteId) {
      whereClause.siteId = siteId
    }

    const delays = await prisma.delay.findMany({
      where: whereClause,
      include: {
        site: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (formatType === "csv") {
      const headers = [
        "Title",
        "Site",
        "Category",
        "Severity",
        "Days Lost",
        "Status",
        "Start Date",
        "End Date",
        "Impact Area",
        "Mitigation",
        "Created By",
        "Created At",
      ]

      const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
          weather: "Weather",
          materials: "Materials",
          labor: "Labor",
          permits: "Permits",
          equipment: "Equipment",
          access: "Access",
          other: "Other",
        }
        return labels[cat] || cat
      }

      const rows = delays.map((delay) => [
        '"' + delay.title.replace(/"/g, '""') + '"',
        '"' + delay.site.name + '"',
        getCategoryLabel(delay.category),
        delay.severity.charAt(0).toUpperCase() + delay.severity.slice(1),
        delay.daysLost,
        delay.status.charAt(0).toUpperCase() + delay.status.slice(1),
        format(new Date(delay.startDate), "yyyy-MM-dd"),
        delay.endDate ? format(new Date(delay.endDate), "yyyy-MM-dd") : "",
        '"' + (delay.impactArea || "").replace(/"/g, '""') + '"',
        '"' + (delay.mitigation || "").replace(/"/g, '""') + '"',
        '"' + (delay.createdBy.name || delay.createdBy.email) + '"',
        format(new Date(delay.createdAt), "yyyy-MM-dd HH:mm"),
      ])

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="delays-' + format(new Date(), "yyyy-MM-dd") + '.csv"',
        },
      })
    }

    return NextResponse.json(delays)
  } catch (error) {
    console.error("Error exporting delays:", error)
    return NextResponse.json({ error: "Failed to export delays" }, { status: 500 })
  }
}
