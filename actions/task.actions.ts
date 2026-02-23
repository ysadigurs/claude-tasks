"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { taskSchema, updateStatusSchema, TaskInput } from "@/lib/validations/task"
import { TaskStatus } from "@prisma/client"

async function requireSession() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  return session
}

export async function getTasks(params?: {
  status?: TaskStatus
  ownerId?: string
  from?: string
  to?: string
}) {
  await requireSession()

  const where: Record<string, unknown> = {}

  if (params?.status) {
    where.status = params.status
  }

  if (params?.ownerId) {
    where.owners = { some: { userId: params.ownerId } }
  }

  if (params?.from || params?.to) {
    where.dueAt = {}
    if (params.from) (where.dueAt as Record<string, unknown>).gte = new Date(params.from)
    if (params.to) (where.dueAt as Record<string, unknown>).lte = new Date(params.to)
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      owners: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return tasks
}

export async function getTaskById(id: string) {
  await requireSession()

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      owners: {
        include: { user: true },
      },
    },
  })

  return task
}

export async function createTask(data: TaskInput) {
  await requireSession()

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, description, scheduledAt, dueAt, status, ownerIds } = parsed.data

  await prisma.task.create({
    data: {
      title,
      description,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      dueAt: dueAt ? new Date(dueAt) : null,
      status,
      owners: {
        create: ownerIds.map((userId) => ({ userId })),
      },
    },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function updateTask(id: string, data: TaskInput) {
  await requireSession()

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, description, scheduledAt, dueAt, status, ownerIds } = parsed.data

  await prisma.$transaction([
    prisma.taskOwner.deleteMany({ where: { taskId: id } }),
    prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        dueAt: dueAt ? new Date(dueAt) : null,
        status,
        owners: {
          create: ownerIds.map((userId) => ({ userId })),
        },
      },
    }),
  ])

  revalidatePath("/dashboard")
  revalidatePath(`/tasks/${id}`)
  redirect(`/tasks/${id}`)
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await requireSession()

  const parsed = updateStatusSchema.safeParse({ taskId, status })
  if (!parsed.success) {
    return { error: "Invalid input" }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTask(id: string) {
  await requireSession()

  await prisma.task.delete({ where: { id } })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
