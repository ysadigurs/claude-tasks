import { format } from "date-fns"
import Link from "next/link"
import { TaskWithOwners } from "@/types"
import { StatusBadge } from "./StatusBadge"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Pencil, Calendar } from "lucide-react"

export function TaskDetail({ task }: { task: TaskWithOwners }) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-xl">{task.title}</CardTitle>
            <StatusBadge status={task.status} />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/tasks/${task.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeleteTaskButton taskId={task.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && (
          <>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {task.description}
            </p>
            <Separator />
          </>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Scheduled Start
            </p>
            <p className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {task.scheduledAt
                ? format(new Date(task.scheduledAt), "PPp")
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Due Date
            </p>
            <p className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {task.dueAt ? format(new Date(task.dueAt), "PPp") : "—"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Owners
          </p>
          <div className="flex flex-wrap gap-2">
            {task.owners.map(({ user }: { user: { id: string; name: string | null; email: string } }) => {
              const initials = (user.name ?? user.email ?? "U")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
              return (
                <div key={user.id} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name ?? user.email}</span>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Created {format(new Date(task.createdAt), "PPp")}</span>
          <span>Updated {format(new Date(task.updatedAt), "PPp")}</span>
        </div>
      </CardContent>
    </Card>
  )
}
