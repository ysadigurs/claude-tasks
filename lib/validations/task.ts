import { z } from "zod"
import { TaskStatus } from "@prisma/client"

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  dueAt: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  ownerIds: z.array(z.string()).min(1, "At least one owner is required"),
  dependencyIds: z.array(z.string()).optional(),
})

export const updateStatusSchema = z.object({
  taskId: z.string().cuid(),
  status: z.nativeEnum(TaskStatus),
})

export type TaskInput = z.infer<typeof taskSchema>
