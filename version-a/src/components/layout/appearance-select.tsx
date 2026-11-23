'use client'

import { useId, useSyncExternalStore } from 'react'
import { Icon } from '@/components/ui/icon'
import { useHydrated } from '@/lib/use-hydrated'

const serverPreference = () => 'system' as const
const currentPreference = () => window.giuntiAppearance?.get() ?? serverPreference()
const subscribe = (listener: () => void) => window.giuntiAppearance?.subscribe(listener) ?? (() => {})

const options = [
  ['light', 'Chiaro', 'sun'],
  ['dark', 'Scuro', 'moon'],
  ['system', 'Sistema', 'monitor']
] as const

export function AppearanceSelect() {
  const id = useId()
  const preference = useSyncExternalStore(subscribe, currentPreference, serverPreference)
  const hydrated = useHydrated()

  return (
    <fieldset disabled={!hydrated} className="min-w-0">
      <legend className="sr-only">Aspetto</legend>
      <div className="appearance-control">
        {options.map(([value, label, icon]) => (
          <label key={value} data-preference={value} className="appearance-option">
            <input type="radio" name={id} value={value} checked={preference === value} className="absolute inset-0 z-10 size-full cursor-[inherit] opacity-0"
              onChange={() => window.giuntiAppearance?.set(value)} />
            <span className="appearance-icon"><Icon name={icon} size={18} /></span>
            <span className="sr-only">{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
