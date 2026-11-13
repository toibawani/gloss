import { useMemo } from 'react'
import { useChapters } from '../hooks'
import * as store from '../store'
import { isDue, usableCard } from '../srs'
import { Question } from '../components/Question'
import { Empty, Skeleton } from '../components/States'

export function Revise() {
  const srs = store.getSrs()
  const now = Date.now()

  const due = useMemo(
    () =>
      Object.entries(srs)
        .map(([id, card]) => ({ id, card: usableCard(card, now) }))
        .filter((x): x is { id: string; card: NonNullable<ReturnType<typeof usableCard>> } => Boolean(x.card && isDue(x.card, now))),
    [srs, now],
  )

  const chapterIds = useMemo(() => [...new Set(due.map((d) => d.card.ch).filter((x): x is string => Boolean(x)))], [due])
  const chapters = useChapters(chapterIds)

  const questions = useMemo(() => {
    if (!chapters) return null
    const map = new Map<string, { chapter: string; title: string; q: string; options: string[]; answer: number; why: string }>()
    for (const ch of chapters.values()) {
      for (const p of ch.paragraphs) {
        p.recall.forEach((r, k) => {
          map.set(`${p.id}#${k}`, { chapter: ch.id, title: ch.title, ...r })
        })
      }
    }
    return map
  }, [chapters])

  if (due.length === 0) {
    return (
      <>
        <header className="page-head">
          <h1>Nothing due</h1>
          <p className="lede">
            Recall questions come back after 1, 3, 7 and 21 days. Answer a question in any chapter and it appears here
            on the right day.
          </p>
        </header>
        <Empty
          art="review"
          title="Your day is clear"
          text="Read a paragraph and answer its two questions. The first review lands tomorrow."
          action={{ label: 'Read a paragraph', href: '#/c/bio-11-ch8' }}
        />
      </>
    )
  }

  return (
    <>
      <header className="page-head">
        <h1>
          {due.length} {due.length === 1 ? 'question' : 'questions'} today
        </h1>
        <p className="lede">Answer from memory first. The explanation opens after your pick.</p>
      </header>

      {!questions ? (
        <Skeleton lines={6} />
      ) : (
        <div className="review-list">
          {due.map(({ id }) => {
            const q = questions.get(id)
            if (!q) return null
            return (
              <section className="review-item" key={id} aria-label={q.title}>
                <p className="rail-label">{q.title}</p>
                <Question id={id} r={q} chapterId={q.chapter} />
              </section>
            )
          })}
          {questions.size === 0 && (
            <p className="inline-note">These cards point at chapters that are not in this build. They will clear as you answer new questions.</p>
          )}
        </div>
      )}
    </>
  )
}
