"use client"

import { SafeUser } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OwnerSelectProps {
  users: SafeUser[]
  value: string[]
  onChange: (ids: string[]) => void
}

export function OwnerSelect({ users, value, onChange }: OwnerSelectProps) {
  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  function initials(user: SafeUser) {
    return (user.name ?? user.email ?? "U")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((user) => {
        const selected = value.includes(user.id)
        return (
          <Button
            key={user.id}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            className="h-auto gap-2 py-1"
            onClick={() => toggle(user.id)}
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {initials(user)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{user.name ?? user.email}</span>
            {selected && <Check className="h-3 w-3" />}
          </Button>
        )
      })}
    </div>
  )
}
