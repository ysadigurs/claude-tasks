"use client"

import { useTransition } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { MoreVertical, Calendar, Pencil } from "lucide-react"
import { TaskWithOwners, TaskStatus } from "@/types"
import { updateTaskStatus } from "@/actions/task.actions"
import { StatusBadge } from "./StatusBadge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const STATUSES: TaskStatus[] = ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELED"]

export function TaskCard({ task }: { task: TaskWithOwners }) {
  const [, startTransition] = useTransition()

  function changeStatus(status: TaskStatus) {
    startTransition(async () => {
      await updateTaskStatus(task.id, status)
    })
  }

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/tasks/${task.id}`}
            className="font-semibold leading-tight hover:underline line-clamp-2"
          >
            {task.title}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => changeStatus(s)}
                  className={task.status === s ? "font-semibold" : ""}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/tasks/${task.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <StatusBadge status={task.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {task.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {task.scheduledAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Start: {format(new Date(task.scheduledAt), "MMM d, yyyy")}
            </span>
          )}
          {task.dueAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due: {format(new Date(task.dueAt), "MMM d, yyyy")}
            </span>
          )}
        </div>

        {task.owners.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {task.owners.slice(0, 4).map(({ user }: { user: { id: string; name: string | null; email: string } }) => {
                const initials = (user.name ?? user.email ?? "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
            {task.owners.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{task.owners.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
