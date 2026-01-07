const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function mergeDuplicateStockItems() {
  try {
    console.log('🔍 Searching for duplicate stock items...\n')

    // Get all stock items
    const allItems = await prisma.stockItem.findMany({
      include: {
        site: true,
        transactions: true,
      },
      orderBy: [
        { siteId: 'asc' },
        { name: 'asc' },
        { createdAt: 'asc' }, // Keep the oldest one
      ],
    })

    // Group by site and name (case-insensitive)
    const groups = {}
    
    for (const item of allItems) {
      const key = `${item.siteId}:${item.name.toLowerCase().trim()}`
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    }

    // Find and merge duplicates
    let mergedCount = 0
    let totalQuantityMerged = 0

    for (const [key, items] of Object.entries(groups)) {
      if (items.length > 1) {
        console.log(`\n📦 Found ${items.length} duplicates: "${items[0].name}" in site "${items[0].site.name}"`)
        
        // Keep the first (oldest) item
        const keepItem = items[0]
        const duplicates = items.slice(1)
        
        // Calculate total quantity
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
        
        console.log(`   Keeping: ID ${keepItem.id} (${keepItem.quantity} ${keepItem.unit})`)
        
        for (const dup of duplicates) {
          console.log(`   Merging: ID ${dup.id} (${dup.quantity} ${dup.unit})`)
          
          // Move transactions to the kept item
          if (dup.transactions.length > 0) {
            await prisma.stockTransaction.updateMany({
              where: { stockItemId: dup.id },
              data: { stockItemId: keepItem.id },
            })
            console.log(`     ✓ Moved ${dup.transactions.length} transactions`)
          }
          
          // Delete the duplicate
          await prisma.stockItem.delete({
            where: { id: dup.id },
          })
          console.log(`     ✓ Deleted duplicate`)
          
          mergedCount++
          totalQuantityMerged += dup.quantity
        }
        
        // Update the kept item with total quantity
        await prisma.stockItem.update({
          where: { id: keepItem.id },
          data: { quantity: totalQuantity },
        })
        
        console.log(`   ✅ Final quantity: ${totalQuantity} ${keepItem.unit}`)
      }
    }

    console.log(`\n✅ Merge complete!`)
    console.log(`   Merged ${mergedCount} duplicate items`)
    console.log(`   Total quantity consolidated: ${totalQuantityMerged}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
mergeDuplicateStockItems()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })

