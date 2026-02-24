"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { taskSchema, TaskInput } from "@/lib/validations/task"
import { TaskWithOwners, SafeUser } from "@/types"
import { createTask, updateTask } from "@/actions/task.actions"
import { TaskStatus } from "@/types"
import { OwnerSelect } from "./OwnerSelect"
import { DependencySelect } from "./DependencySelect"

const TASK_STATUSES = Object.values(TaskStatus)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { useState } from "react"

interface TaskFormProps {
  task?: TaskWithOwners
  users: SafeUser[]
  allTasks?: { id: string; title: string }[]
}

function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return ""
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm")
}

export function TaskForm({ task, users, allTasks = [] }: TaskFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isEdit = !!task

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      scheduledAt: toDatetimeLocal(task?.scheduledAt),
      dueAt: toDatetimeLocal(task?.dueAt),
      status: task?.status ?? TaskStatus.SCHEDULED,
      ownerIds: task?.owners.map((o: { userId: string }) => o.userId) ?? [],
      dependencyIds: task?.dependsOn.map((d) => d.dependencyId) ?? [],
    },
  })

  async function onSubmit(data: TaskInput) {
    setServerError(null)
    const result = isEdit
      ? await updateTask(task.id, data)
      : await createTask(data)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" placeholder="Task title" {...register("title")} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the task..."
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="scheduledAt">Scheduled Start</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            {...register("scheduledAt")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dueAt">Due Date</Label>
          <Input id="dueAt" type="datetime-local" {...register("dueAt")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Owners *</Label>
        <Controller
          name="ownerIds"
          control={control}
          render={({ field }) => (
            <OwnerSelect
              users={users}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.ownerIds && (
          <p className="text-xs text-destructive">{errors.ownerIds.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Dependencies</Label>
        <Controller
          name="dependencyIds"
          control={control}
          render={({ field }) => (
            <DependencySelect
              tasks={allTasks}
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? isEdit
            ? "Saving..."
            : "Creating..."
          : isEdit
          ? "Save Changes"
          : "Create Task"}
      </Button>
    </form>
  )
}
