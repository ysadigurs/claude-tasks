import { Task, User, TaskOwner, TaskDependency, TaskStatus } from "@prisma/client"

export type TaskWithOwners = Task & {
  owners: (TaskOwner & { user: User })[]
  dependsOn: TaskDependency[]
  dependencies: TaskDependency[]
}

export type SafeUser = Pick<User, "id" | "name" | "email" | "image">

export { TaskStatus }
