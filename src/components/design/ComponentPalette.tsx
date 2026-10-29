import type { PaletteItem } from '../../levels/types'

export const DND_KIND_MIME = 'application/x-sysdesign-kind'

export type ComponentPaletteProps = {
  items: PaletteItem[]
}

export function ComponentPalette({ items }: ComponentPaletteProps) {
  return (
    <div
      className="relative z-20 w-full overflow-x-auto overscroll-x-contain px-2 py-2"
      style={{
        background:
          'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(8,12,20,0.88) 100%)',
        boxShadow: '0 6px 0 rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.08)',
        scrollbarWidth: 'thin',
      }}
      aria-label="System components"
    >
      <p className="font-fighter mb-2 px-1 text-[10px] tracking-[0.25em] text-[var(--color-gold)]">
        INVENTORY · DRAG TO BOARD
      </p>
      <div className="flex w-max gap-2 pb-1">
        {items.map((item) => {
          return (
            <button
              key={item.kind}
              type="button"
              draggable
              aria-label={item.label}
              className="group relative shrink-0 cursor-grab rounded-md active:cursor-grabbing"
              style={{
                width: 92,
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 0 #000',
                background:
                  'linear-gradient(160deg, #2a3a55 0%, #121a28 100%)',
              }}
              onClick={(e) => {
                // Inventory is drag-only — prevent accidental “selected then click board” places
                e.preventDefault()
              }}
              onDragStart={(e) => {
                e.dataTransfer.setData(DND_KIND_MIME, item.kind)
                e.dataTransfer.setData('text/plain', item.kind)
                e.dataTransfer.effectAllowed = 'copy'
              }}
            >
              <div className="pointer-events-none flex flex-col items-center px-1.5 pb-2 pt-2">
                <img
                  src={item.iconUrl}
                  alt=""
                  className="h-12 w-12 drop-shadow-md"
                  draggable={false}
                />
                <span
                  className="font-fighter mt-1 text-center text-[9px] leading-tight text-white"
                  style={{ textShadow: '0 1px 0 #000' }}
                >
                  {item.label}
                </span>
                <span className="font-fighter mt-0.5 text-center text-[7px] text-white/55">
                  {item.tagline}
                </span>
                <span
                  className="font-fighter mt-1 rounded px-1 text-[8px] text-[#1a1208]"
                  style={{
                    background:
                      item.cost === 0
                        ? '#7dcfb6'
                        : item.cost <= 20
                          ? '#ffe566'
                          : '#ff8a7a',
                  }}
                >
                  {item.cost === 0 ? 'FREE' : `$${item.cost}`}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
