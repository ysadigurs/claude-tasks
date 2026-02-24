import { prisma } from "@/lib/prisma"
import { TaskForm } from "@/components/tasks/TaskForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewTaskPage() {
  const [users, allTasks] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, image: true },
      orderBy: { name: "asc" },
    }),
    prisma.task.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Task</h1>
        <p className="text-sm text-muted-foreground">
          Create a new task and assign owners.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm users={users} allTasks={allTasks} />
        </CardContent>
      </Card>
    </div>
  )
}
