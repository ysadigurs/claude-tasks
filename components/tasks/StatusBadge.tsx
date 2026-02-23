import { Badge } from "@/components/ui/badge"
import { TaskStatus } from "@/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  },
  ONGOING: {
    label: "Ongoing",
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className)}
    >
      {config.label}
    </Badge>
  )
}
