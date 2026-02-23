import { Task, User, TaskOwner, TaskStatus } from "@prisma/client"

export type TaskWithOwners = Task & {
  owners: (TaskOwner & { user: User })[]
}

export type SafeUser = Pick<User, "id" | "name" | "email" | "image">

export { TaskStatus }
