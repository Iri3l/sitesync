"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface StockTransaction {
  id: string
  type: string
  quantity: number
  notes: string | null
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

interface StockItem {
  id: string
  name: string
  category: string | null
  unit: string
  quantity: number
  minQuantity: number | null
  createdAt: Date
  site: {
    name: string
  }
  transactions: StockTransaction[]
}

export function StockViewForm({ stockItem }: { stockItem: StockItem }) {
  return (
    <div className="space-y-8">
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

