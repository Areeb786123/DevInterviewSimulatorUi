import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArcadeHud } from '../../components/ArcadeHud/ArcadeHud'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import { BrandTitle } from '../../components/BrandTitle/BrandTitle'
import { FightRing } from '../../components/FightRing/FightRing'
import { ModeSelect } from '../../components/ModeSelect/ModeSelect'

export function HomePage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  return (
    <div className="relative min-h-full overflow-hidden">
      <img
        src="/assets/bg/adventure-map.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'brightness(0.72) contrast(1.05) saturate(1.05)' }}
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,12,20,0.45) 0%, rgba(8,12,20,0.15) 35%, rgba(8,12,20,0.1) 55%, rgba(8,12,20,0.7) 100%)',
        }}
      />

      <AudioDock />

      <div className="relative z-10 flex min-h-full flex-col items-center gap-4 px-2 pb-6 pt-1 sm:gap-5 sm:pt-2">
        <ArcadeHud />
        <BrandTitle />

        {/* Arena centered in the viewport */}
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
          <FightRing ready={ready} />
          <ModeSelect
            onSystemDesignEnter={() => navigate('/system-design')}
            onSystemDesignHoverChange={setReady}
          />
        </div>

        <p className="font-display px-3 text-center text-[6px] text-[var(--color-text-dim)] sm:text-[8px]">
          Stage: Adventure Map · Music stays off until you tap MUSIC ON
        </p>
      </div>
    </div>
  )
}
