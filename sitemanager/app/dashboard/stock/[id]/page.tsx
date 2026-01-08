import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { StockTransactionForm } from "@/components/stock-transaction-form"

export default async function StockItemPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const stockItem = await prisma.stockItem.findUnique({
    where: {
      id: params.id,
    },
    include: {
      site: true,
      transactions: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!stockItem) {
    return (
      <div>
        <p>Stock item not found</p>
        <Link href="/dashboard/stock">
          <Button variant="outline">Back to Stock</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{stockItem.name}</h1>
          <p className="text-muted-foreground">{stockItem.site.name}</p>
        </div>
        <Link href="/dashboard/stock">
          <Button variant="outline">Back to Stock</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
              <p className="text-2xl font-bold">
                {stockItem.quantity} {stockItem.unit}
              </p>
            </div>
            {stockItem.category && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-lg">{stockItem.category}</p>
              </div>
            )}
            {stockItem.minQuantity !== null && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minimum Quantity</p>
                <p className="text-lg">
                  {stockItem.minQuantity} {stockItem.unit}
                </p>
                {stockItem.quantity <= stockItem.minQuantity && (
                  <p className="text-sm text-yellow-600 mt-2">
                    ⚠️ Stock is at or below minimum level
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>Record stock movement</CardDescription>
          </CardHeader>
          <CardContent>
            <StockTransactionForm stockItemId={stockItem.id} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent stock movements</CardDescription>
        </CardHeader>
        <CardContent>
          {stockItem.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {stockItem.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.type === "in" ? (
                        <span className="text-green-600">+{transaction.quantity} {stockItem.unit}</span>
                      ) : (
                        <span className="text-red-600">-{transaction.quantity} {stockItem.unit}</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.user.name || transaction.user.email} • {format(new Date(transaction.createdAt), "PPP p")}
                    </p>
                    {transaction.notes && (
                      <p className="text-sm mt-1">{transaction.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

