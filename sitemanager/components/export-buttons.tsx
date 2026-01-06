"use client"

import { Button } from "@/components/ui/button"

interface ExportButtonsProps {
  type: "snags" | "stock"
}

export function ExportButtons({ type }: ExportButtonsProps) {
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const response = await fetch(`/api/export/${type}?format=${format}`)
      
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to export")
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error(error)
      alert("An error occurred while exporting")
    }
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("excel")}
      >
        Export Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
      >
        Export PDF
      </Button>
    </div>
  )
}

