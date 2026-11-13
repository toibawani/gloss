import { useEffect, useRef, useState } from 'react'
import { metaOf } from '../content'
import { useChapter } from '../hooks'
import { Card } from '../components/Card'
import { Empty, Skeleton } from '../components/States'
import { Icon } from '../icons'

export function Reader({ id, para }: { id: string; para?: string }) {
  const { ch, error, loading } = useChapter(id)
  const [i, setI] = useState(0)
  const [ready, setReady] = useState(false)
  const [dir, setDir] = useState<1 | -1>(1)
  const x0 = useRef(0)
  const n = ch?.paragraphs.length ?? 0
  const meta = metaOf(id)

  const go = (d: 1 | -1) => {
    setDir(d)
    setI((v) => Math.min(n - 1, Math.max(0, v + d)))
  }

  // Resolve the deep link before the first card mounts, so the paragraph at the top of the
  // chapter is not marked as read on the way to the linked one.
  useEffect(() => {
    if (!ch) return
    const at = para ? ch.paragraphs.findIndex((p) => p.id === para) : 0
    setI(at >= 0 ? at : 0)
    setReady(true)
  }, [ch, para])

  useEffect(() => {
    if (!ch || !ch.paragraphs[i]) return
    const target = `#/c/${id}/${ch.paragraphs[i].id}`
    if (location.hash !== target) history.replaceState(null, '', target)
  }, [ch, i, id])

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  })

  if (loading || !ready) {
    // The title comes from the index, so the page paints its heading before the chapter
    // chunk arrives. That keeps the largest text on screen early and the layout stable.
    return (
      <section>
        <header className="reader-head">
          <a className="back" href="#/">
            <Icon name="left" size={16} /> Chapters
          </a>
          <h1 className="chapter-title">{meta?.title ?? 'Opening chapter'}</h1>
          <p className="chapter-sub">
            {meta ? `Class ${meta.class} ${meta.subject} · ${meta.paragraphs} paragraphs` : 'Loading the index'}
          </p>
        </header>
        <Skeleton lines={9} rail />
      </section>
    )
  }

  if (error || !ch) {
    const missing = error === 'missing'
    return (
      <Empty
        title={missing ? 'That chapter is not here' : 'This chapter did not load'}
        text={
          missing
            ? 'The link may be old. Pick a chapter from Home.'
            : error === 'offline'
              ? 'You are offline and this chapter was not saved. Reconnect once, or open a chapter you have already read.'
              : 'Reload the page. If it keeps failing, open a different chapter and come back.'
        }
        action={{ label: 'Go to Home', href: '#/' }}
      />
    )
  }

  const p = ch.paragraphs[i]

  return (
    <section
      className="reader"
      onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - x0.current
        if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1)
      }}
    >
      <header className="reader-head">
        <a className="back" href="#/">
          <Icon name="left" size={16} /> Chapters
        </a>
        <h1 className="chapter-title">{ch.title}</h1>
        <p className="chapter-sub">
          Class {ch.class} {ch.subject}
          {meta ? ` · ${meta.paragraphs} paragraphs` : ''}
        </p>
      </header>

      <div className="pager">
        <button className="btn btn-icon btn-quiet" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous paragraph">
          <Icon name="left" />
        </button>
        <div className="pager-mid">
          <p className="pager-count">
            {i + 1} of {n}
          </p>
          <progress className="progress" max={n} value={i + 1} aria-label="Paragraph progress" />
        </div>
        <button className="btn btn-icon btn-quiet" onClick={() => go(1)} disabled={i === n - 1} aria-label="Next paragraph">
          <Icon name="right" />
        </button>
      </div>

      <div className="card-slot">
        <Card ch={ch} p={p} index={i} dir={dir} />
      </div>

      <nav className="pager pager-bottom" aria-label="Paragraph">
        <button className="btn btn-quiet" onClick={() => go(-1)} disabled={i === 0}>
          Previous
        </button>
        <button className="btn btn-quiet" onClick={() => go(1)} disabled={i === n - 1}>
          Next paragraph
        </button>
      </nav>
    </section>
  )
}
