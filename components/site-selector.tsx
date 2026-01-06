"use client"

import { useEffect, useState } from "react"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Site {
  id: string
  name: string
}

export function SiteSelector({
  value,
  onChange,
  required = false,
}: {
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch("/api/sites")
        if (response.ok) {
          const data = await response.json()
          setSites(data)
        }
      } catch (error) {
        console.error("Failed to fetch sites:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSites()
  }, [])

  if (loading) {
    return (
      <div>
        <Label>Site</Label>
        <Select disabled>
          <option>Loading sites...</option>
        </Select>
      </div>
    )
  }

  return (
    <div>
      <Label htmlFor="siteId">Site {required && "*"}</Label>
      <Select
        id="siteId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Select a site</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </Select>
    </div>
  )
}

