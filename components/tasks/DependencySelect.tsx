"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface DependencySelectProps {
  tasks: { id: string; title: string }[]
  value: string[]
  onChange: (ids: string[]) => void
}

export function DependencySelect({ tasks, value, onChange }: DependencySelectProps) {
  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground">No other tasks available.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tasks.map((task) => {
        const selected = value.includes(task.id)
        return (
          <Button
            key={task.id}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            className="h-auto py-1 text-xs"
            onClick={() => toggle(task.id)}
          >
            {task.title}
            {selected && <Check className="ml-1 h-3 w-3" />}
          </Button>
        )
      })}
    </div>
  )
}
