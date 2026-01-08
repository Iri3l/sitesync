import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendStockAlertEmail } from "@/lib/email"

const createTransactionSchema = z.object({
  stockItemId: z.string(),
  type: z.enum(["in", "out"]),
  quantity: z.number().min(0.01),
  notes: z.string().optional(),
})

// Helper function to check stock levels and send notifications
async function checkAndNotifyStockLevels(
  stockItemId: string,
  newQuantity: number,
  previousQuantity: number
) {
  try {
    // Get the stock item with site info
    const stockItem = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
      include: {
        site: {
          select: { name: true, managerId: true },
        },
      },
    })

    if (!stockItem) return

    const minQuantity = stockItem.minQuantity || 0
    const isOutOfStock = newQuantity === 0
    const isBelowThreshold = newQuantity > 0 && newQuantity <= minQuantity
    
    // Check if we crossed the threshold (was above, now below or out)
    const wasAboveThreshold = previousQuantity > minQuantity
    const wasInStock = previousQuantity > 0
    
    // Only notify if:
    // 1. Item just went out of stock (was > 0, now = 0)
    // 2. Item just went below threshold (was above minQuantity, now at or below)
    const shouldNotifyOutOfStock = isOutOfStock && wasInStock
    const shouldNotifyLowStock = isBelowThreshold && wasAboveThreshold && !isOutOfStock

    if (!shouldNotifyOutOfStock && !shouldNotifyLowStock) return

    // Get all managers and directors to notify
    const recipients = await prisma.user.findMany({
      where: {
        role: { in: ["manager", "director"] },
      },
      select: { email: true },
    })

    // Send email notifications
    for (const recipient of recipients) {
      try {
        await sendStockAlertEmail({
          email: recipient.email,
          stock: {
            itemName: stockItem.name,
            siteName: stockItem.site.name,
            currentQuantity: newQuantity,
            minQuantity: minQuantity,
            unit: stockItem.unit,
            isOutOfStock: shouldNotifyOutOfStock,
          },
        })
        console.log(`Stock alert sent to ${recipient.email} for ${stockItem.name}`)
      } catch (emailError) {
        console.error(`Failed to send stock alert to ${recipient.email}:`, emailError)
      }
    }
  } catch (error) {
    console.error("Error checking stock levels:", error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Block regular users from creating transactions
    const userRole = session.user.role || "user"
    if (userRole === "user") {
      return NextResponse.json(
        { error: "You don't have permission to create stock transactions" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = createTransactionSchema.parse(body)

    // Get current stock item
    const stockItem = await prisma.stockItem.findUnique({
      where: {
        id: validated.stockItemId,
      },
    })

    if (!stockItem) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      )
    }

    // Check if out transaction would result in negative quantity
    if (
      validated.type === "out" &&
      stockItem.quantity - validated.quantity < 0
    ) {
      return NextResponse.json(
        { error: "Insufficient stock quantity" },
        { status: 400 }
      )
    }

    // Calculate new quantity
    const newQuantity =
      validated.type === "in"
        ? stockItem.quantity + validated.quantity
        : stockItem.quantity - validated.quantity

    // Create transaction and update stock quantity in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.stockTransaction.create({
        data: {
          stockItemId: validated.stockItemId,
          userId: session.user.id,
          type: validated.type,
          quantity: validated.quantity,
          notes: validated.notes || null,
        },
      })

      await tx.stockItem.update({
        where: {
          id: validated.stockItemId,
        },
        data: {
          quantity: newQuantity,
        },
      })

      return transaction
    })

    // Check stock levels for notifications (only for "out" transactions)
    let stockAlert = null
    if (validated.type === "out") {
      const minQuantity = stockItem.minQuantity || 0
      const isOutOfStock = newQuantity === 0
      const isBelowThreshold = newQuantity > 0 && newQuantity <= minQuantity
      const wasAboveThreshold = stockItem.quantity > minQuantity
      const wasInStock = stockItem.quantity > 0
      
      const shouldNotifyOutOfStock = isOutOfStock && wasInStock
      const shouldNotifyLowStock = isBelowThreshold && wasAboveThreshold && !isOutOfStock

      if (shouldNotifyOutOfStock || shouldNotifyLowStock) {
        // Get site name for notification
        const itemWithSite = await prisma.stockItem.findUnique({
          where: { id: validated.stockItemId },
          include: { site: { select: { name: true } } },
        })
        
        stockAlert = {
          itemName: stockItem.name,
          siteName: itemWithSite?.site.name || "Unknown Site",
          currentQuantity: newQuantity,
          minQuantity: minQuantity,
          unit: stockItem.unit,
          isOutOfStock: shouldNotifyOutOfStock,
          stockItemId: stockItem.id,
        }
      }

      // Send email notifications async
      checkAndNotifyStockLevels(
        validated.stockItemId,
        newQuantity,
        stockItem.quantity
      ).catch(console.error)
    }

    return NextResponse.json({ 
      ...result, 
      stockAlert,
      newQuantity,
    }, { status: 201 })
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

