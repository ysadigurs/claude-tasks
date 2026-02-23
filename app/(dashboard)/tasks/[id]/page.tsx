import { notFound } from "next/navigation"
import Link from "next/link"
import { getTaskById } from "@/actions/task.actions"
import { TaskDetail } from "@/components/tasks/TaskDetail"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const task = await getTaskById(id)

  if (!task) notFound()

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <TaskDetail task={task} />
    </div>
  )
}
