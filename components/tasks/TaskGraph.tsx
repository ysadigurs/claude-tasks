"use client"

import "@xyflow/react/dist/style.css"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
} from "@xyflow/react"
import { TaskWithOwners } from "@/types"
import { TaskStatus } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const NODE_WIDTH = 280
const NODE_HEIGHT = 160
const COL_SPACING = 320
const ROW_SPACING = 200
const COLS = 4

const statusBorderColor: Record<TaskStatus, string> = {
  SCHEDULED: "#93c5fd",
  ONGOING: "#fde68a",
  COMPLETED: "#86efac",
  CANCELED: "#fca5a5",
}

const statusLabel: Record<TaskStatus, string> = {
  SCHEDULED: "Scheduled",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
}

const statusBadgeClass: Record<TaskStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  ONGOING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}

function initials(name: string | null, email: string | null): string {
  return ((name ?? email ?? "U") as string)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface TaskNodeData {
  task: TaskWithOwners
  onClick: (id: string) => void
  [key: string]: unknown
}

function TaskNode({ data }: NodeProps) {
  const { task, onClick } = data as TaskNodeData
  const borderColor = statusBorderColor[task.status as TaskStatus]
  const badgeClass = statusBadgeClass[task.status as TaskStatus]
  const label = statusLabel[task.status as TaskStatus]

  return (
    <div
      className="rounded-lg bg-white shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      style={{
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
        border: `2px solid ${borderColor}`,
        padding: "12px",
        boxSizing: "border-box",
      }}
      onClick={() => onClick(task.id)}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <p className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
        {task.title}
      </p>

      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${badgeClass}`}>
        {label}
      </span>

      {task.owners.length > 0 && (
        <div className="flex -space-x-1">
          {task.owners.slice(0, 4).map((o) => (
            <Avatar key={o.userId} className="h-6 w-6 border-2 border-white">
              <AvatarFallback className="text-[9px]">
                {initials(o.user.name, o.user.email)}
              </AvatarFallback>
            </Avatar>
          ))}
          {task.owners.length > 4 && (
            <span className="ml-2 text-xs text-muted-foreground self-center">
              +{task.owners.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const nodeTypes = { taskNode: TaskNode }

interface TaskGraphProps {
  tasks: TaskWithOwners[]
}

export function TaskGraph({ tasks }: TaskGraphProps) {
  const router = useRouter()

  const handleNodeClick = useCallback(
    (id: string) => {
      router.push(`/tasks/${id}`)
    },
    [router]
  )

  const nodes: Node[] = tasks.map((task, index) => {
    const col = index % COLS
    const row = Math.floor(index / COLS)
    return {
      id: task.id,
      type: "taskNode",
      position: { x: col * COL_SPACING, y: row * ROW_SPACING },
      data: { task, onClick: handleNodeClick },
    }
  })

  const edges: Edge[] = tasks.flatMap((task) =>
    task.dependsOn.map((dep) => ({
      id: `${dep.dependencyId}-${dep.dependentId}`,
      source: dep.dependencyId,
      target: dep.dependentId,
      animated: true,
      style: { strokeDasharray: "5 5" },
    }))
  )

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 600 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  )
}
