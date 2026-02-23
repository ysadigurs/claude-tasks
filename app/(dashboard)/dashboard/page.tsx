import { Suspense } from "react"
import Link from "next/link"
import { getTasks } from "@/actions/task.actions"
import { prisma } from "@/lib/prisma"
import { TaskStatus, TaskWithOwners } from "@/types"
import { TaskCard } from "@/components/tasks/TaskCard"
import { FilterBar } from "@/components/tasks/FilterBar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface SearchParams {
  status?: string
  ownerId?: string
  from?: string
  to?: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true },
    orderBy: { name: "asc" },
  })

  const tasks = await getTasks({
    status: params.status as TaskStatus | undefined,
    ownerId: params.ownerId,
    from: params.from,
    to: params.to,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <Suspense>
        <FilterBar users={users} />
      </Suspense>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">No tasks found</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/tasks/new">Create your first task</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task: TaskWithOwners) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
