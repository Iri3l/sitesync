import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExportButtons } from "@/components/export-buttons"

// Icons
function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: { siteId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const isManager = userRole === "manager"
  const isUser = userRole === "user"
  const siteId = searchParams?.siteId

  const whereClause: any = {}
  
  if (siteId) {
    whereClause.siteId = siteId
  }

  const site = siteId
    ? await prisma.site.findUnique({
        where: { id: siteId },
        select: { name: true, address: true },
      })
    : null

  const stockItems = await prisma.stockItem.findMany({
    where: whereClause,
    include: {
      site: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  })

  // Stats
  const totalItems = stockItems.length
  const lowStockItems = stockItems.filter(i => i.minQuantity !== null && i.quantity <= i.minQuantity && i.quantity > 0).length
  const outOfStockItems = stockItems.filter(i => i.quantity <= 0).length
  const totalValue = stockItems.reduce((sum, item) => sum + item.quantity, 0)

  const getStockStatus = (quantity: number, minQuantity: number | null) => {
    if (quantity <= 0) return "out"
    if (minQuantity !== null && quantity <= minQuantity) return "low"
    return "normal"
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "out":
        return { bg: "bg-red-50", text: "text-red-700", icon: "🔴", label: "Out of Stock" }
      case "low":
        return { bg: "bg-amber-50", text: "text-amber-700", icon: "🟡", label: "Low Stock" }
      default:
        return { bg: "bg-emerald-50", text: "text-emerald-700", icon: "🟢", label: "In Stock" }
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* View Only Banner */}
      {isUser && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <EyeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">View Only Mode</p>
            <p className="text-sm text-blue-600">You can view stock items but cannot make changes.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {siteId && (
            <Link href="/dashboard/sites">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {site ? site.name : "Stock Management"}
            </h1>
            <p className="text-slate-500 mt-1">
              {site ? site.address || "Site inventory" : "Manage site inventory and materials"}
            </p>
          </div>
        </div>
        
        {isManager && (
          <div className="flex items-center gap-3 flex-wrap">
            <ExportButtons type="stock" />
            <Link href="/dashboard/stock/delivery-note">
              <Button variant="outline" className="rounded-xl">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Delivery Note
              </Button>
            </Link>
            <Link href={`/dashboard/stock/new${siteId ? `?siteId=${siteId}` : ""}`}>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 rounded-xl">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Stock Item
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <BoxIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
              <p className="text-sm text-slate-500">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalValue.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Units</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{lowStockItems}</p>
              <p className="text-sm text-slate-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              <p className="text-sm text-slate-500">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Items Grid */}
      {stockItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <BoxIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No stock items found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {isManager 
              ? "Get started by adding your first stock item or uploading a delivery note."
              : "No stock items have been added yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stockItems.map((item, index) => {
            const status = getStockStatus(item.quantity, item.minQuantity)
            const statusConfig = getStatusConfig(status)
            const stockPercentage = item.minQuantity 
              ? Math.min(100, (item.quantity / (item.minQuantity * 2)) * 100)
              : 100
            
            return (
              <Link 
                key={item.id}
                href={`/dashboard/stock/${item.id}${siteId ? `?siteId=${siteId}` : ""}`}
                className={`block slide-up opacity-0 stagger-${(index % 5) + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover">
                  {/* Top Color Bar */}
                  <div className={`h-1.5 ${
                    status === 'out' ? 'bg-red-500' : 
                    status === 'low' ? 'bg-amber-500' : 
                    'bg-emerald-500'
                  }`} />
                  
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{item.site.name}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Quantity Display */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl font-bold text-slate-900">{item.quantity}</span>
                          <span className="text-slate-500 ml-1">{item.unit}</span>
                        </div>
                        {item.minQuantity !== null && (
                          <span className="text-sm text-slate-500">
                            Min: {item.minQuantity} {item.unit}
                          </span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {item.minQuantity !== null && (
                        <div className="mt-3">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                status === 'out' ? 'bg-red-500' : 
                                status === 'low' ? 'bg-amber-500' : 
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category & Actions */}
                    <div className="flex items-center justify-between">
                      {item.category ? (
                        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No category</span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
