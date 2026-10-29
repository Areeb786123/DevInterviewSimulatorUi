import { useMemo, useRef, useState } from 'react'
import type { ComponentKind, Edge, LevelConfig, PlacedNode } from '../../levels/types'
import { DND_KIND_MIME } from './ComponentPalette'

const NODE_W = 96
const NODE_H = 88
const DRAG_THRESHOLD = 5

export type DesignBoardProps = {
  level: LevelConfig
  nodes: PlacedNode[]
  edges: Edge[]
  packetProgress: number | null
  packetEdgeId: string | null
  onPlace: (kind: ComponentKind, x: number, y: number) => void
  onNodeMove: (id: string, x: number, y: number) => void
  onConnect: (fromId: string, toId: string) => void
  onNodeRemove: (id: string) => void
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function hitNode(
  nodes: PlacedNode[],
  x: number,
  y: number,
  excludeId?: string,
): PlacedNode | undefined {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]!
    if (excludeId && n.id === excludeId) continue
    if (x >= n.x && x <= n.x + NODE_W && y >= n.y && y <= n.y + NODE_H) {
      return n
    }
  }
  return undefined
}

export function DesignBoard({
  level,
  nodes,
  edges,
  packetProgress,
  packetEdgeId,
  onPlace,
  onNodeMove,
  onConnect,
  onNodeRemove,
}: DesignBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  /** Last pointer position during inventory drag — drop events can report 0,0 */
  const lastDragPos = useRef<{ x: number; y: number } | null>(null)
  const moveRef = useRef<{
    id: string
    startX: number
    startY: number
    origX: number
    origY: number
    moved: boolean
  } | null>(null)
  const [linkDrag, setLinkDrag] = useState<{
    fromId: string
    x1: number
    y1: number
    x2: number
    y2: number
  } | null>(null)
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null)

  const iconByKind = useMemo(() => {
    const m = new Map(level.palette.map((p) => [p.kind, p]))
    return m
  }, [level.palette])

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  function localPoint(clientX: number, clientY: number) {
    const el = boardRef.current
    if (!el) return { x: NaN, y: NaN }
    const rect = el.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function placeAtClient(kind: ComponentKind, clientX: number, clientY: number) {
    const el = boardRef.current
    if (!el) return

    let { x, y } = localPoint(clientX, clientY)
    // Prefer last dragover coords when drop coords are junk (common browser quirk)
    if (
      (!Number.isFinite(clientX) || !Number.isFinite(clientY) || (clientX === 0 && clientY === 0)) &&
      lastDragPos.current
    ) {
      x = lastDragPos.current.x
      y = lastDragPos.current.y
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      if (lastDragPos.current) {
        x = lastDragPos.current.x
        y = lastDragPos.current.y
      } else {
        return
      }
    }

    const maxX = Math.max(0, (el.clientWidth || 400) - NODE_W)
    const maxY = Math.max(0, (el.clientHeight || 280) - NODE_H)
    onPlace(
      kind,
      clamp(x - NODE_W / 2, 0, maxX),
      clamp(y - NODE_H / 2, 0, maxY),
    )
    lastDragPos.current = null
  }

  function portCenter(n: PlacedNode) {
    return { x: n.x + NODE_W - 2, y: n.y + NODE_H / 2 }
  }

  return (
    <div
      ref={boardRef}
      data-testid="design-board"
      className="relative h-full min-h-[280px] w-full overflow-hidden rounded-md"
      style={{
        border: '3px solid rgba(255,255,255,0.25)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35), 0 8px 0 rgba(0,0,0,0.4)',
        background: 'rgba(6,12,22,0.35)',
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
        const p = localPoint(e.clientX, e.clientY)
        if (Number.isFinite(p.x) && Number.isFinite(p.y)) {
          lastDragPos.current = p
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const kind = (e.dataTransfer.getData(DND_KIND_MIME) ||
          e.dataTransfer.getData('text/plain')) as ComponentKind
        if (!kind || !level.palette.some((p) => p.kind === kind)) return
        placeAtClient(kind, e.clientX, e.clientY)
      }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <marker
            id="arrowhead"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#c4b5fd" />
          </marker>
          <marker
            id="arrowhead-drag"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#e9d5ff" />
          </marker>
        </defs>

        {edges.map((e) => {
          const a = nodeById.get(e.from)
          const b = nodeById.get(e.to)
          if (!a || !b) return null
          const x1 = a.x + NODE_W - 4
          const y1 = a.y + NODE_H / 2
          const x2 = b.x + 4
          const y2 = b.y + NODE_H / 2
          const hot =
            packetEdgeId === e.id && packetProgress != null
          return (
            <g key={e.id}>
              {/* Soft underlay so gaps read as a continuous pipe */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="edge-stream-base"
                markerEnd="url(#arrowhead)"
              />
              {/* Lavender dashes streaming along the connection */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={hot ? 'edge-stream edge-stream-hot' : 'edge-stream'}
              />
              {hot ? (
                <circle
                  className="edge-packet-ball"
                  r={7}
                  fill="#ffe566"
                  stroke="#1a1208"
                  strokeWidth={2}
                  cx={x1 + (x2 - x1) * packetProgress!}
                  cy={y1 + (y2 - y1) * packetProgress!}
                />
              ) : null}
            </g>
          )
        })}

        {linkDrag ? (
          <line
            x1={linkDrag.x1}
            y1={linkDrag.y1}
            x2={linkDrag.x2}
            y2={linkDrag.y2}
            stroke="#ffe566"
            strokeWidth={3}
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead-drag)"
          />
        ) : null}
      </svg>

      {nodes.map((n) => {
        const meta = iconByKind.get(n.kind)
        const isTarget = hoverTargetId === n.id
        return (
          <div
            key={n.id}
            data-node-id={n.id}
            className="absolute z-10 touch-none"
            style={{ left: n.x, top: n.y, width: NODE_W }}
          >
            <div
              className="relative cursor-grab rounded-md px-1 pb-1 pt-1 active:cursor-grabbing"
              style={{
                background: isTarget
                  ? 'linear-gradient(180deg,#3a6a40,#1a3020)'
                  : 'linear-gradient(180deg,#243044,#101820)',
                border: isTarget
                  ? '2px solid var(--color-mint)'
                  : '2px solid rgba(255,255,255,0.35)',
                boxShadow: isTarget
                  ? '0 0 14px rgba(125,207,182,0.55), 0 4px 0 #000'
                  : '0 4px 0 #000',
              }}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest('[data-port]')) return
                if ((e.target as HTMLElement).closest('button')) return
                e.preventDefault()
                e.stopPropagation()
                ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                moveRef.current = {
                  id: n.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: n.x,
                  origY: n.y,
                  moved: false,
                }
              }}
              onPointerMove={(e) => {
                const d = moveRef.current
                if (!d || d.id !== n.id) return
                const dx = e.clientX - d.startX
                const dy = e.clientY - d.startY
                if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
                d.moved = true
                const el = boardRef.current
                if (!el) return
                const maxX = Math.max(0, el.clientWidth - NODE_W)
                const maxY = Math.max(0, el.clientHeight - NODE_H)
                onNodeMove(
                  n.id,
                  clamp(d.origX + dx, 0, maxX),
                  clamp(d.origY + dy, 0, maxY),
                )
              }}
              onPointerUp={(e) => {
                const d = moveRef.current
                if (!d || d.id !== n.id) return
                moveRef.current = null
                try {
                  ;(e.currentTarget as HTMLElement).releasePointerCapture(
                    e.pointerId,
                  )
                } catch {
                  /* ignore */
                }
              }}
            >
              <button
                type="button"
                aria-label={`Remove ${meta?.label ?? n.kind}`}
                className="absolute -right-2 -top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onNodeRemove(n.id)
                }}
              >
                ×
              </button>
              <img
                src={meta?.iconUrl}
                alt=""
                className="pointer-events-none mx-auto h-12 w-12"
                draggable={false}
              />
              <p
                className="font-fighter pointer-events-none mt-1 text-center text-xs leading-tight text-white sm:text-sm"
                style={{ textShadow: '0 1px 0 #000' }}
              >
                {meta?.label}
              </p>

              <button
                type="button"
                data-port="out"
                aria-label={`Connect from ${meta?.label ?? n.kind}`}
                className="absolute -right-3 top-1/2 z-30 flex h-6 w-6 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full"
                style={{
                  background: 'linear-gradient(180deg,#ffe566,#e8b84a)',
                  border: '2px solid #1a1208',
                  boxShadow: '0 2px 0 #000',
                }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const fromId = n.id
                  const port = portCenter(n)
                  const start = localPoint(e.clientX, e.clientY)
                  setLinkDrag({
                    fromId,
                    x1: port.x,
                    y1: port.y,
                    x2: start.x,
                    y2: start.y,
                  })

                  const onMove = (ev: PointerEvent) => {
                    const p = localPoint(ev.clientX, ev.clientY)
                    setLinkDrag({
                      fromId,
                      x1: port.x,
                      y1: port.y,
                      x2: p.x,
                      y2: p.y,
                    })
                    const target = hitNode(nodes, p.x, p.y, fromId)
                    setHoverTargetId(target?.id ?? null)
                  }
                  const onUp = (ev: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    const p = localPoint(ev.clientX, ev.clientY)
                    const target = hitNode(nodes, p.x, p.y, fromId)
                    if (target) onConnect(fromId, target.id)
                    setLinkDrag(null)
                    setHoverTargetId(null)
                  }
                  window.addEventListener('pointermove', onMove)
                  window.addEventListener('pointerup', onUp)
                }}
              >
                <span className="pointer-events-none font-fighter text-xs text-[#1a1208]">
                  →
                </span>
              </button>
            </div>
          </div>
        )
      })}

      {nodes.length === 0 ? (
        <p className="font-fighter pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/80 sm:text-base">
          Drag parts from inventory onto the board (drop where you want them)
        </p>
      ) : null}
    </div>
  )
}
