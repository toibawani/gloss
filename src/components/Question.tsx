import { useState } from 'react'
import type { RecallT } from '../schema'
import * as store from '../store'
import { isDue, nextCard, usableCard } from '../srs'

export function Question({
  id,
  r,
  chapterId,
  onAnswered,
}: {
  id: string
  r: RecallT
  chapterId: string
  onAnswered?: (correct: boolean) => void
}) {
  const [pick, setPick] = useState<number | null>(null)
  const [card, setCard] = useState(() => usableCard(store.getSrs()[id], Date.now()))

  if (pick === null && card && !isDue(card, Date.now())) {
    return (
      <p className="note">
        Scheduled. Comes back on {new Date(card.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.
      </p>
    )
  }

  const answer = (i: number) => {
    if (pick !== null) return
    setPick(i)
    const next = { ...nextCard(card ?? undefined, i === r.answer, Date.now()), ch: chapterId }
    setCard(next)
    store.saveCard(id, next)
    onAnswered?.(i === r.answer)
  }

  const right = pick !== null && pick === r.answer

  return (
    <div className="q">
      <p className="q-text" id={`${id}-q`}>
        {r.q}
      </p>
      <ul className="opts" aria-labelledby={`${id}-q`}>
        {r.options.map((o, i) => {
          const state = pick === null ? '' : i === r.answer ? 'right' : i === pick ? 'wrong' : ''
          return (
            <li key={i}>
              <button className={`opt ${state}`} aria-disabled={pick !== null} onClick={() => answer(i)}>
                <span>{o}</span>
                {state === 'right' && <span className="opt-tag">Answer</span>}
                {state === 'wrong' && <span className="opt-tag">Your pick</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <div aria-live="polite" className="why-wrap">
        {pick !== null && (
          <p className="why">
            <strong>{right ? 'Right. ' : 'Not quite. '}</strong>
            {r.why}
          </p>
        )}
      </div>
    </div>
  )
}
