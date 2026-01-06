import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

// Note: Install required packages: npm install pdfkit xlsx

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only managers can export
    const userRole = session.user.role || "user"
    if (userRole !== "manager") {
      return NextResponse.json(
        { error: "Only managers can export data" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "excel"

    const snags = await prisma.snag.findMany({
      include: {
        site: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        photos: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (format === "pdf") {
      // PDF export
      const PDFDocument = require("pdfkit")
      const doc = new PDFDocument()
      
      doc.fontSize(20).text("Snags Report", { align: "center" })
      doc.moveDown()
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`)
      doc.moveDown()

      snags.forEach((snag, index) => {
        doc.fontSize(14).text(`${index + 1}. ${snag.title}`, { underline: true })
        doc.fontSize(10)
        doc.text(`Site: ${snag.site.name}`)
        doc.text(`Status: ${snag.status}`)
        doc.text(`Priority: ${snag.priority}`)
        doc.text(`Created: ${format(new Date(snag.createdAt), "PPP")}`)
        if (snag.description) {
          doc.text(`Description: ${snag.description}`)
        }
        if (snag.location) {
          doc.text(`Location: ${snag.location}`)
        }
        doc.text(`Photos: ${snag.photos.length}`)
        doc.moveDown()
      })

      const chunks: Buffer[] = []
      doc.on("data", (chunk: Buffer) => chunks.push(chunk))
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="snags-${Date.now()}.pdf"`,
          },
        })
      })
      doc.end()
    } else {
      // Excel export
      const XLSX = require("xlsx")
      const data = snags.map((snag) => ({
        Title: snag.title,
        Site: snag.site.name,
        Status: snag.status,
        Priority: snag.priority,
        Location: snag.location || "",
        Description: snag.description || "",
        "Created By": snag.createdBy.name || snag.createdBy.email,
        "Assigned To": snag.assignedTo?.name || snag.assignedTo?.email || "",
        "Created Date": format(new Date(snag.createdAt), "PPP"),
        "Resolved Date": snag.resolvedAt ? format(new Date(snag.resolvedAt), "PPP") : "",
        Photos: snag.photos.length,
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Snags")
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="snags-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

