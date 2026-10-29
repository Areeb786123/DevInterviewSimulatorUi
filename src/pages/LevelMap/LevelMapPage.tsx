import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../../audio/AudioProvider'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import { LevelNode } from '../../components/LevelNode/LevelNode'
import {
  CAMERA_FOCUS,
  DEFAULT_ZOOM,
  LEVEL_NODES,
  MAP_TILE_COLS,
  MAP_TILE_ROWS,
  MAP_TILE_SRC,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_HEIGHT,
  TILE_WIDTH,
  ZOOM_STEP,
} from './mapConfig'

const CURSOR_HAND =
  "url('/assets/cursors/cartoon-hand.svg') 20 12, grab"
const CURSOR_HAND_GRAB =
  "url('/assets/cursors/cartoon-hand-grab.svg') 22 18, grabbing"

const DRAG_THRESHOLD_PX = 4

export function LevelMapPage() {
  const navigate = useNavigate()
  const { playSfx, unlockAudio, armDefaultMusic } = useAudio()
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [panning, setPanning] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const centeredRef = useRef(false)
  const panRef = useRef<{
    active: boolean
    moved: boolean
    lastX: number
    lastY: number
    startX: number
    startY: number
  }>({
    active: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  })

  const mapWidth = TILE_WIDTH * MAP_TILE_COLS * zoom
  const mapHeight = TILE_HEIGHT * MAP_TILE_ROWS * zoom
  const tileW = TILE_WIDTH * zoom
  const tileH = TILE_HEIGHT * zoom

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || centeredRef.current) return
    const id = requestAnimationFrame(() => {
      el.scrollLeft = Math.max(
        0,
        (mapWidth * CAMERA_FOCUS.leftPct) / 100 - el.clientWidth / 2,
      )
      el.scrollTop = Math.max(
        0,
        (mapHeight * CAMERA_FOCUS.topPct) / 100 - el.clientHeight / 2,
      )
      centeredRef.current = true
    })
    return () => cancelAnimationFrame(id)
  }, [mapWidth, mapHeight])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!panRef.current.active) return
      const el = scrollerRef.current
      if (!el) return

      const dx = e.clientX - panRef.current.lastX
      const dy = e.clientY - panRef.current.lastY
      const totalDx = e.clientX - panRef.current.startX
      const totalDy = e.clientY - panRef.current.startY
      if (
        !panRef.current.moved &&
        (Math.abs(totalDx) > DRAG_THRESHOLD_PX ||
          Math.abs(totalDy) > DRAG_THRESHOLD_PX)
      ) {
        panRef.current.moved = true
        setPanning(true)
      }

      panRef.current.lastX = e.clientX
      panRef.current.lastY = e.clientY
      if (panRef.current.moved) {
        el.scrollLeft -= dx
        el.scrollTop -= dy
      }
    }

    const onUp = () => {
      if (!panRef.current.active) return
      panRef.current.active = false
      panRef.current.moved = false
      setPanning(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const clampZoom = useCallback((next: number) => {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100))
  }, [])

  function zoomBy(delta: number) {
    setZoom((z) => clampZoom(z + delta))
    playSfx('click')
  }

  function startLeftPan(e: React.MouseEvent) {
    if (e.button !== 0) return
    // Ignore UI / level node (they stopPropagation)
    panRef.current = {
      active: true,
      moved: false,
      lastX: e.clientX,
      lastY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    }
  }

  return (
    <div
      className="relative flex h-full min-h-full flex-col overflow-hidden"
      style={{ background: '#1a6bb5' }}
      onPointerDown={() => {
        void armDefaultMusic()
      }}
    >
      <AudioDock />

      <div className="relative z-30 flex shrink-0 items-start justify-between gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
        <Link
          to="/system-design"
          className="inline-flex items-center gap-1 rounded px-3 py-1.5 font-fighter text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(180deg, #8b5a2b 0%, #5c3a18 100%)',
            boxShadow: '0 3px 0 #2a1808, inset 0 1px 0 rgba(255,255,255,0.25)',
            textShadow: '0 1px 1px #000',
          }}
          onClick={() => playSfx('click')}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ← Back
        </Link>
        <div className="text-right">
          <p
            className="font-fighter text-lg font-bold italic tracking-wide text-white sm:text-2xl"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            SOCIAL MEDIA
          </p>
          <p className="font-fighter text-[11px] tracking-[0.2em] text-white/80 sm:text-xs">
            SELECT LEVEL
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-16 right-3 z-30 flex flex-col gap-1 sm:bottom-20 sm:right-5"
        role="group"
        aria-label="Map zoom"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Zoom in"
          className="font-fighter h-9 w-9 rounded text-lg font-bold text-white"
          style={{
            background: 'linear-gradient(180deg, #3a5a8a 0%, #1a3048 100%)',
            boxShadow: '0 2px 0 #0a1520, inset 0 0 0 1px rgba(255,255,255,0.2)',
          }}
          onClick={() => zoomBy(ZOOM_STEP)}
        >
          +
        </button>
        <span
          className="font-fighter py-0.5 text-center text-[10px] text-white/80"
          aria-live="polite"
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          aria-label="Zoom out"
          className="font-fighter h-9 w-9 rounded text-lg font-bold text-white"
          style={{
            background: 'linear-gradient(180deg, #3a5a8a 0%, #1a3048 100%)',
            boxShadow: '0 2px 0 #0a1520, inset 0 0 0 1px rgba(255,255,255,0.2)',
          }}
          onClick={() => zoomBy(-ZOOM_STEP)}
        >
          −
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="relative z-10 min-h-0 flex-1 overflow-auto overscroll-contain select-none"
        style={{
          WebkitOverflowScrolling: 'touch',
          cursor: panning ? CURSOR_HAND_GRAB : CURSOR_HAND,
        }}
        onMouseDown={startLeftPan}
        onWheel={(e) => {
          if (!(e.ctrlKey || e.metaKey)) return
          e.preventDefault()
          zoomBy(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
        }}
      >
        <div
          className="relative"
          style={{
            width: mapWidth,
            height: mapHeight,
            minWidth: mapWidth,
            minHeight: mapHeight,
            backgroundImage: `url(${MAP_TILE_SRC})`,
            backgroundRepeat: 'repeat',
            backgroundSize: `${tileW}px ${tileH}px`,
          }}
          aria-label="Tiled level world map"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,40,80,0.25) 100%)',
            }}
          />
          {LEVEL_NODES.map((node) => (
            <LevelNode
              key={node.id}
              label={node.label}
              shortLabel={node.shortLabel}
              caption={node.caption}
              left={`${node.leftPct}%`}
              top={`${node.topPct}%`}
              onEnter={() => {
                void (async () => {
                  await unlockAudio()
                  playSfx('enter')
                  navigate(node.route)
                })()
              }}
            />
          ))}
        </div>
      </div>

      <p
        className="relative z-20 shrink-0 bg-black/40 py-2 text-center font-fighter text-[11px] text-white/80 sm:text-xs"
        style={{ textShadow: '0 1px 2px #000' }}
      >
        Left-drag to pan · +/− zoom · Tap ★ L1 or L2
      </p>
    </div>
  )
}
