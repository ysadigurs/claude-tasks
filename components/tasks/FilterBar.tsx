"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SafeUser } from "@/types"

const TASK_STATUSES = ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELED"] as const
type TaskStatus = (typeof TASK_STATUSES)[number]
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FilterBarProps {
  users: SafeUser[]
}

export function FilterBar({ users }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      return params.toString()
    },
    [searchParams]
  )

  function update(key: string, value: string | null) {
    router.push(`/dashboard?${createQueryString({ [key]: value })}`)
  }

  function clearAll() {
    router.push("/dashboard")
  }

  const hasFilters =
    searchParams.has("status") ||
    searchParams.has("ownerId") ||
    searchParams.has("from") ||
    searchParams.has("to")

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(v) => update("status", v === "all" ? null : v)}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Owner</Label>
        <Select
          value={searchParams.get("ownerId") ?? "all"}
          onValueChange={(v) => update("ownerId", v === "all" ? null : v)}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="All owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name ?? u.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Due from</Label>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value || null)}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Due to</Label>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value || null)}
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={clearAll}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
