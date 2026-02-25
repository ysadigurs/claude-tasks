import { getGraphData } from "@/actions/task.actions"
import { TaskGraph } from "@/components/tasks/TaskGraph"

export default async function GraphPage() {
  const tasks = await getGraphData()

  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Graph View</h1>
        <p className="text-sm text-muted-foreground">
          Visual overview of tasks and their dependencies.
        </p>
      </div>
      <div className="min-h-[600px] flex-1">
        <TaskGraph tasks={tasks} />
      </div>
    </div>
  )
}
