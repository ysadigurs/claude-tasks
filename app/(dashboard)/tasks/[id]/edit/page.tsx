import { notFound } from "next/navigation"
import Link from "next/link"
import { getTaskById } from "@/actions/task.actions"
import { prisma } from "@/lib/prisma"
import { TaskForm } from "@/components/tasks/TaskForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [task, users] = await Promise.all([
    getTaskById(id),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, image: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!task) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/tasks/${id}`}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Task
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
        <p className="text-sm text-muted-foreground">
          Update the task details below.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm task={task} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
