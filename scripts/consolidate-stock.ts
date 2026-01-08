/**
 * Script to consolidate duplicate stock items within each site
 * 
 * This script:
 * 1. Finds all stock items grouped by site
 * 2. Within each site, identifies items with the same name (case-insensitive)
 * 3. Merges duplicates by keeping the oldest one and summing quantities
 * 4. Moves transactions from deleted items to the kept item
 * 5. Deletes the duplicate items
 * 
 * Run with: npx ts-node scripts/consolidate-stock.ts
 * Or: npx tsx scripts/consolidate-stock.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface StockItemWithTransactions {
  id: string
  siteId: string
  name: string
  category: string | null
  unit: string
  quantity: number
  minQuantity: number | null
  createdAt: Date
  transactions: { id: string }[]
}

async function consolidateStock() {
  console.log("🔍 Starting stock consolidation...")

  // Get all stock items with their transactions
  const allItems = await prisma.stockItem.findMany({
    include: {
      transactions: {
        select: { id: true },
      },
      site: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "asc", // Keep the oldest item
    },
  })

  console.log(`📦 Found ${allItems.length} total stock items`)

  // Group items by site
  const itemsBySite = new Map<string, (typeof allItems)[0][]>()
  for (const item of allItems) {
    const existing = itemsBySite.get(item.siteId) || []
    existing.push(item)
    itemsBySite.set(item.siteId, existing)
  }

  let totalMerged = 0
  let totalDeleted = 0

  // Process each site
  for (const [siteId, siteItems] of itemsBySite) {
    const siteName = siteItems[0]?.site?.name || siteId
    console.log(`\n📍 Processing site: ${siteName}`)

    // Group items by normalized name (lowercase, trimmed)
    const itemsByName = new Map<string, (typeof siteItems)[0][]>()
    for (const item of siteItems) {
      const normalizedName = item.name.trim().toLowerCase()
      const existing = itemsByName.get(normalizedName) || []
      existing.push(item)
      itemsByName.set(normalizedName, existing)
    }

    // Find and merge duplicates
    for (const [normalizedName, duplicates] of itemsByName) {
      if (duplicates.length <= 1) continue

      console.log(`  🔄 Found ${duplicates.length} items named "${duplicates[0].name}"`)

      // Keep the first (oldest) item, merge others into it
      const [keepItem, ...toMerge] = duplicates

      // Calculate total quantity
      const totalQuantity = duplicates.reduce((sum, item) => sum + item.quantity, 0)
      const maxMinQuantity = Math.max(
        ...duplicates.map((item) => item.minQuantity || 0)
      )

      // Collect all transaction IDs that need to be moved
      const transactionIdsToMove = toMerge.flatMap((item) =>
        item.transactions.map((t) => t.id)
      )

      // Perform the merge in a transaction
      await prisma.$transaction(async (tx) => {
        // Update the kept item with total quantity
        await tx.stockItem.update({
          where: { id: keepItem.id },
          data: {
            quantity: totalQuantity,
            minQuantity: maxMinQuantity > 0 ? maxMinQuantity : keepItem.minQuantity,
            // Use the name from the first item (preserves original casing)
            name: keepItem.name.trim(),
          },
        })

        // Move transactions from deleted items to the kept item
        if (transactionIdsToMove.length > 0) {
          await tx.stockTransaction.updateMany({
            where: { id: { in: transactionIdsToMove } },
            data: { stockItemId: keepItem.id },
          })
          console.log(`    📝 Moved ${transactionIdsToMove.length} transactions`)
        }

        // Delete the duplicate items
        await tx.stockItem.deleteMany({
          where: { id: { in: toMerge.map((item) => item.id) } },
        })
      })

      console.log(
        `    ✅ Merged: ${duplicates.map((d) => `${d.quantity}`).join(" + ")} = ${totalQuantity} ${keepItem.unit}`
      )

      totalMerged += duplicates.length
      totalDeleted += toMerge.length
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log(`✅ Consolidation complete!`)
  console.log(`   Items processed: ${totalMerged}`)
  console.log(`   Duplicates removed: ${totalDeleted}`)
  console.log(`   Remaining items: ${allItems.length - totalDeleted}`)
}

// Run the script
consolidateStock()
  .catch((error) => {
    console.error("❌ Error during consolidation:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


