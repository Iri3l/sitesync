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
    const exportFormat = searchParams.get("format") || "excel"

    const stockItems = await prisma.stockItem.findMany({
      where: {
        site: {
          managerId: session.user.id,
        },
      },
      include: {
        site: true,
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    if (exportFormat === "pdf") {
      // PDF export
      const PDFDocument = require("pdfkit")
      const doc = new PDFDocument()
      
      doc.fontSize(20).text("Stock Report", { align: "center" })
      doc.moveDown()
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`)
      doc.moveDown()

      stockItems.forEach((item, index) => {
        doc.fontSize(14).text(`${index + 1}. ${item.name}`, { underline: true })
        doc.fontSize(10)
        doc.text(`Site: ${item.site.name}`)
        doc.text(`Quantity: ${item.quantity} ${item.unit}`)
        if (item.category) {
          doc.text(`Category: ${item.category}`)
        }
        if (item.minQuantity !== null) {
          doc.text(`Min Quantity: ${item.minQuantity} ${item.unit}`)
          if (item.quantity <= item.minQuantity) {
            doc.text("⚠️ Low Stock", { color: "red" })
          }
        }
        doc.moveDown()
      })

      const chunks: Buffer[] = []
      doc.on("data", (chunk: Buffer) => chunks.push(chunk))
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="stock-${Date.now()}.pdf"`,
          },
        })
      })
      doc.end()
    } else {
      // Excel export
      const XLSX = require("xlsx")
      const data = stockItems.map((item) => ({
        Name: item.name,
        Site: item.site.name,
        Category: item.category || "",
        Quantity: item.quantity,
        Unit: item.unit,
        "Min Quantity": item.minQuantity || "",
        Status: item.quantity <= 0 ? "Out of Stock" : item.minQuantity && item.quantity <= item.minQuantity ? "Low Stock" : "Normal",
        "Created Date": format(new Date(item.createdAt), "PPP"),
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock")
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="stock-${Date.now()}.xlsx"`,
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

