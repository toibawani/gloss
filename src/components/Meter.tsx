import { useEffect, useState } from 'react'

/**
 * A two-pixel meter that fills when it mounts. Native <progress> cannot animate its value across
 * browsers, and on a reading product the fill is the one piece of motion worth having.
 */
export function Meter({
  value,
  max,
  label,
  className = 'meter',
}: {
  value: number
  max: number
  label: string
  className?: string
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(ratio))
    return () => cancelAnimationFrame(frame)
  }, [ratio])

  return (
    <div
      className={className}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <span className="meter-fill" style={{ transform: `scaleX(${shown})` }} />
    </div>
  )
}
