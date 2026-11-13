import { useEffect, useState } from 'react'
import type { ChapterT, ParagraphT } from '../schema'
import { useSettings } from '../settings'
import * as store from '../store'
import { Icon } from '../icons'
import { Visual } from '../Visual'
import { Question } from './Question'

export function Card({
  ch,
  p,
  index,
  dir = 1,
  sample = false,
}: {
  ch: ChapterT
  p: ParagraphT
  index: number
  dir?: 1 | -1
  sample?: boolean
}) {
  const [open, setOpen] = useState<string | null>(null)
  const settings = useSettings()
  const word = p.words.find((x) => x.term === open)

  useEffect(() => {
    if (!sample) store.markSeen(ch.id, p.id)
  }, [ch.id, p.id, sample])

  const refLine = [p.ncert_ref, p.ref_page ? `printed page ${p.ref_page}` : null, p.ref_lines ?? null]
    .filter(Boolean)
    .join(', ')

  const goalServed = p.exam_tags.includes(settings.goal)

  return (
    <article className="card" data-dir={dir}>
      <div className="card-main">
        <p className="eyebrow">
          <span className="eyebrow-rule" aria-hidden="true" />
          {sample ? 'A real paragraph' : `Paragraph ${index + 1}`}
        </p>

        <p className="phrase">
          <q>{p.key_phrase}</q>
        </p>

        <h2 className="sr-only">Plain meaning</h2>
        <p className="lede">{p.meaning}</p>

        <figure className="visual-wrap">
          <Visual svg={p.visual_svg} alt={p.visual_alt} />
        </figure>

        <div className="hook-block">
          <p className="rail-label">Never forget it</p>
          <p className="hook">{p.hook}</p>
        </div>

        <div className="trap-block">
          <p className="rail-label">
            <Icon name="bookmark" size={14} /> The trap
          </p>
          <p>{p.trap}</p>
        </div>

        <section className="recall" aria-labelledby={`recall-${p.id}`}>
          <p className="rail-label" id={`recall-${p.id}`}>
            Recall check
          </p>
          {p.recall.map((r, k) => (
            <Question key={k} id={`${p.id}#${k}`} r={r} chapterId={ch.id} />
          ))}
        </section>
      </div>

      <aside className="card-margin" aria-label="Margin notes">
        <h2 className="sr-only">Margin notes</h2>

        <div className="ref-block">
          <p className="rail-label">NCERT</p>
          <p className="ref-line">{refLine}</p>
          <p className={p.review_status === 'expert_reviewed' ? 'status ok' : 'status'}>
            {p.review_status === 'expert_reviewed'
              ? `Checked by ${p.reviewed_by} on ${p.reviewed_on}`
              : 'Draft, not expert checked'}
          </p>
          {p.review_status === 'draft' && p.review_note && <p className="review-note">{p.review_note}</p>}
        </div>

        {p.words.length > 0 && (
          <div className="words-block">
            <p className="rail-label">Tricky words</p>
            <ul className="word-list">
              {p.words.map((w) => (
                <li key={w.term}>
                  <button
                    className="word"
                    aria-expanded={open === w.term}
                    onClick={() => {
                      const next = open === w.term ? null : w.term
                      setOpen(next)
                      if (next) {
                        store.addWord(p.id, w.term, {
                          ch: ch.id,
                          ref: p.ncert_ref,
                          meaning: w.meaning,
                          breakdown: w.breakdown,
                          trap: w.trap,
                          ...(w.hi ? { hi: w.hi } : {}),
                        })
                      }
                    }}
                  >
                    {w.term}
                  </button>
                </li>
              ))}
            </ul>
            {word && (
              <div className="word-card">
                <p className="word-card-term">
                  {word.term}
                  {word.hi && (
                    <span className="word-hi" lang="hi">
                      {word.hi}
                    </span>
                  )}
                </p>
                <p>{word.meaning}</p>
                <p className="word-breakdown">{word.breakdown}</p>
                <p className="word-trap">
                  <span className="rail-label">Where it trips you</span>
                  {word.trap}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="exam-block">
          <p className="rail-label">Exam lens</p>
          <p className="tags">
            {p.exam_tags.map((t) => (
              <span key={t} className={t === settings.goal ? 'tag tag-on' : 'tag'}>
                {t}
              </span>
            ))}
          </p>
          {goalServed ? (
            <p>{p.exam_note}</p>
          ) : (
            <p className="muted">
              Written for {p.exam_tags.join(' and ')}. Your goal is {settings.goal}, so this lens stays folded.
            </p>
          )}
          {p.exam_source && (
            <p className="source">
              Source:{' '}
              <a href={p.exam_source.url} rel="noreferrer">
                {p.exam_source.label}
              </a>
            </p>
          )}
        </div>
      </aside>
    </article>
  )
}
