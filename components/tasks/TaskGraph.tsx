"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TaskWithOwners } from "@/types"

const ROW_H = 52
const BAR_H = 28
const BAR_OFF = (ROW_H - BAR_H) / 2
const SIDEBAR_W = 220
const HEADER_H = 52
const PAD_X = 20
const MIN_BAR_PX = 14
const MIN_CHART_W = 500

const STATUS_COLORS: Record<string, { fill: string; stroke: string }> = {
  SCHEDULED: { fill: "#dbeafe", stroke: "#3b82f6" },
  ONGOING:   { fill: "#fef3c7", stroke: "#f59e0b" },
  COMPLETED: { fill: "#dcfce7", stroke: "#22c55e" },
  CANCELED:  { fill: "#fee2e2", stroke: "#ef4444" },
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  ONGOING:   "Ongoing",
  COMPLETED: "Completed",
  CANCELED:  "Canceled",
}

interface TaskGraphProps {
  tasks: TaskWithOwners[]
}

export function TaskGraph({ tasks }: TaskGraphProps) {
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [chartW, setChartW] = useState(MIN_CHART_W)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      setChartW(Math.max(e.contentRect.width - SIDEBAR_W - PAD_X * 2 - 2, MIN_CHART_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sort tasks chronologically by start date
  const sorted = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          +new Date(a.scheduledAt ?? a.createdAt) -
          +new Date(b.scheduledAt ?? b.createdAt)
      ),
    [tasks]
  )

  // Compute time bounds with padding
  const { t0, t1 } = useMemo(() => {
    if (!sorted.length) {
      const now = Date.now()
      return { t0: now - 7 * 86_400_000, t1: now + 7 * 86_400_000 }
    }
    let lo = Infinity,
      hi = -Infinity
    for (const t of sorted) {
      const s = +new Date(t.scheduledAt ?? t.createdAt)
      const e = +new Date(t.dueAt ?? t.scheduledAt ?? t.createdAt)
      if (s < lo) lo = s
      if (e > hi) hi = e
    }
    const span = Math.max(hi - lo, 3 * 86_400_000)
    return { t0: lo - span * 0.08, t1: hi + span * 0.08 }
  }, [sorted])

  const span = t1 - t0

  const xOf = (d: Date | string | null | undefined): number =>
    PAD_X + ((+new Date(d as string) - t0) / span) * chartW

  const rowOf = useMemo(() => {
    const m: Record<string, number> = {}
    sorted.forEach((t, i) => (m[t.id] = i))
    return m
  }, [sorted])

  // Axis ticks
  const ticks = useMemo(() => {
    const DAY = 86_400_000
    const step =
      span > 365 * DAY ? 30 * DAY :
      span >  90 * DAY ? 14 * DAY :
      span >  30 * DAY ?  7 * DAY :
      span >  14 * DAY ?  3 * DAY :
      DAY
    const out: Date[] = []
    let cur = Math.ceil(t0 / step) * step
    while (cur <= t1) {
      out.push(new Date(cur))
      cur += step
    }
    return out
  }, [t0, t1, span])

  // Today marker
  const todayX = xOf(new Date())

  // Dependency pairs
  const deps = useMemo(
    () => sorted.flatMap((t) => t.dependsOn.map((d) => ({ from: d.dependencyId, to: t.id }))),
    [sorted]
  )

  const svgH = HEADER_H + sorted.length * ROW_H + 16

  if (!tasks.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No tasks to display.
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="flex h-full w-full flex-col gap-3 overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1 text-xs text-muted-foreground">
        {Object.entries(STATUS_LABELS).map(([status, label]) => {
          const c = STATUS_COLORS[status]
          return (
            <span key={status} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-5 rounded-sm"
                style={{ background: c.fill, border: `1.5px solid ${c.stroke}` }}
              />
              {label}
            </span>
          )
        })}
        <span className="flex items-center gap-1.5">
          <svg width="24" height="12">
            <line x1="0" y1="6" x2="18" y2="6" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M14,3 L20,6 L14,9 z" fill="#94a3b8" />
          </svg>
          Dependency
        </span>
      </div>

      {/* Chart */}
      <div className="flex min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200">
        <div className="flex" style={{ minWidth: SIDEBAR_W + MIN_CHART_W + PAD_X * 2 }}>
          {/* Sidebar */}
          <div
            className="sticky left-0 z-10 flex-shrink-0 border-r border-gray-200 bg-white"
            style={{ width: SIDEBAR_W, paddingTop: HEADER_H }}
          >
            {sorted.map((task) => (
              <div
                key={task.id}
                className="flex cursor-pointer items-center border-b border-gray-100 px-4 transition-colors hover:bg-gray-50"
                style={{ height: ROW_H }}
                onClick={() => router.push(`/tasks/${task.id}`)}
                title={task.title}
              >
                <span className="truncate text-sm font-medium">{task.title}</span>
              </div>
            ))}
          </div>

          {/* SVG timeline */}
          <div className="flex-1 overflow-x-auto">
            <svg width={chartW + PAD_X * 2} height={svgH} style={{ display: "block" }}>
              <defs>
                <marker id="dep-arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
                </marker>
              </defs>

              {/* Row bands */}
              {sorted.map((_, i) => (
                <rect
                  key={i}
                  x={0}
                  y={HEADER_H + i * ROW_H}
                  width={chartW + PAD_X * 2}
                  height={ROW_H}
                  fill={i % 2 === 0 ? "#f9fafb" : "#fff"}
                />
              ))}

              {/* Vertical grid lines + date labels */}
              {ticks.map((d, i) => {
                const x = xOf(d)
                return (
                  <g key={i}>
                    <line x1={x} y1={HEADER_H} x2={x} y2={svgH - 4} stroke="#e5e7eb" strokeWidth={1} />
                    <text
                      x={x}
                      y={HEADER_H - 10}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#6b7280"
                      fontFamily="system-ui,sans-serif"
                    >
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </text>
                  </g>
                )
              })}

              {/* Header separator */}
              <line x1={0} y1={HEADER_H} x2={chartW + PAD_X * 2} y2={HEADER_H} stroke="#e5e7eb" />

              {/* Today line */}
              {todayX >= PAD_X && todayX <= chartW + PAD_X && (
                <g>
                  <line
                    x1={todayX} y1={HEADER_H}
                    x2={todayX} y2={svgH - 4}
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    opacity={0.6}
                  />
                  <text x={todayX + 4} y={HEADER_H - 10} fontSize={10} fill="#ef4444" fontFamily="system-ui,sans-serif">
                    Today
                  </text>
                </g>
              )}

              {/* Task bars */}
              {sorted.map((task, i) => {
                const x1 = xOf(task.scheduledAt ?? task.createdAt)
                let x2 = xOf(task.dueAt ?? task.scheduledAt ?? task.createdAt)
                if (x2 - x1 < MIN_BAR_PX) x2 = x1 + MIN_BAR_PX

                const y = HEADER_H + i * ROW_H + BAR_OFF
                const c = STATUS_COLORS[task.status] ?? STATUS_COLORS.SCHEDULED

                return (
                  <g
                    key={task.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <title>{task.title}</title>
                    <rect
                      x={x1} y={y}
                      width={x2 - x1} height={BAR_H}
                      rx={5}
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth={2}
                    />
                    {/* Invisible wider hit area */}
                    <rect
                      x={x1} y={HEADER_H + i * ROW_H}
                      width={x2 - x1} height={ROW_H}
                      fill="transparent"
                    />
                  </g>
                )
              })}

              {/* Dependency arrows — drawn on top of bars */}
              {deps.map(({ from, to }, i) => {
                const fromTask = sorted.find((t) => t.id === from)
                const toTask   = sorted.find((t) => t.id === to)
                if (!fromTask || !toTask) return null

                // Right edge of dependency bar
                let fx = xOf(fromTask.dueAt ?? fromTask.scheduledAt ?? fromTask.createdAt)
                const fxStart = xOf(fromTask.scheduledAt ?? fromTask.createdAt)
                if (fx - fxStart < MIN_BAR_PX) fx = fxStart + MIN_BAR_PX
                const fy = HEADER_H + rowOf[from] * ROW_H + BAR_OFF + BAR_H / 2

                // Left edge of dependent bar
                const toX = xOf(toTask.scheduledAt ?? toTask.createdAt)
                const toY = HEADER_H + rowOf[to] * ROW_H + BAR_OFF + BAR_H / 2

                const dx = Math.abs(toX - fx)
                const cp = Math.min(dx * 0.5, 64)

                return (
                  <path
                    key={i}
                    d={`M${fx},${fy} C${fx + cp},${fy} ${toX - cp},${toY} ${toX},${toY}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    markerEnd="url(#dep-arr)"
                  />
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
