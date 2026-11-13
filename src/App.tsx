import { useEffect, useMemo, useRef, useState } from 'react'
import { chapterIndex, loadChapter, loadChapters, type ChapterMeta } from './content'
import type { ChapterT, ParagraphT, RecallT } from './schema'
import * as store from './store'
import { isDue, nextCard } from './srs'
import { Visual } from './Visual'
import { Privacy, Terms } from './Legal'

function useHash() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => setH(location.hash.slice(1) || '/')
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return h
}

function useOnline() {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const a = () => setOn(true)
    const b = () => setOn(false)
    addEventListener('online', a)
    addEventListener('offline', b)
    return () => {
      removeEventListener('online', a)
      removeEventListener('offline', b)
    }
  }, [])
  return on
}

type Loaded = { ch: ChapterT | null; error: string | null; loading: boolean }

function useChapter(id: string): Loaded {
  const [state, setState] = useState<Loaded>({ ch: null, error: null, loading: true })
  useEffect(() => {
    let live = true
    setState({ ch: null, error: null, loading: true })
    loadChapter(id)
      .then((ch) => live && setState({ ch, error: null, loading: false }))
      .catch((e: Error) => live && setState({ ch: null, error: e.message, loading: false }))
    return () => {
      live = false
    }
  }, [id])
  return state
}

function useAllChapters() {
  const [all, setAll] = useState<ChapterT[] | null>(null)
  useEffect(() => {
    let live = true
    loadChapters(chapterIndex.map((c) => c.id)).then((m) => live && setAll([...m.values()]))
    return () => {
      live = false
    }
  }, [])
  return all
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function Skeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="skel-line" />
      ))}
    </div>
  )
}

function Question({ id, r }: { id: string; r: RecallT }) {
  const [pick, setPick] = useState<number | null>(null)
  const card = store.getSrs()[id]
  if (pick === null && card && !isDue(card, Date.now())) {
    return <p className="note">Scheduled. Next review on {new Date(card.due).toLocaleDateString()}.</p>
  }
  const answer = (i: number) => {
    if (pick !== null) return
    setPick(i)
    store.saveCard(id, nextCard(card, i === r.answer, Date.now()))
  }
  return (
    <div className="q">
      <p className="q-text">{r.q}</p>
      <ul className="opts">
        {r.options.map((o, i) => {
          const state = pick === null ? '' : i === r.answer ? 'right' : i === pick ? 'wrong' : ''
          return (
            <li key={i}>
              <button className={`opt ${state}`} aria-disabled={pick !== null} onClick={() => answer(i)}>
                {o}
                {state === 'right' && <span className="tag">Correct answer</span>}
                {state === 'wrong' && <span className="tag">Your pick</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {pick !== null && (
        <p className="why" role="status">
          <strong>{pick === r.answer ? 'Correct. ' : 'Not quite. '}</strong>
          {r.why}
        </p>
      )}
    </div>
  )
}

function Card({ chapterId, p }: { chapterId: string; p: ParagraphT }) {
  const [open, setOpen] = useState<string | null>(null)
  const w = p.words.find((x) => x.term === open)
  useEffect(() => store.markSeen(chapterId, p.id), [chapterId, p.id])
  return (
    <article className="card">
      <header className="card-head">
        <p className="ref">
          <span className="label">NCERT</span> {p.ncert_ref}
        </p>
        <p className={p.review_status === 'expert_reviewed' ? 'mark ok' : 'mark'}>
          {p.review_status === 'expert_reviewed' ? 'Reviewed by expert' : 'Draft'}
        </p>
      </header>
      {p.review_status === 'draft' && p.review_note && <p className="note">{p.review_note}</p>}
      <p className="phrase">
        Key phrase: <q>{p.key_phrase}</q>
      </p>

      <h3>Plain meaning</h3>
      <p className="body">{p.meaning}</p>

      {p.words.length > 0 && (
        <>
          <h3>Tricky words</h3>
          <p className="words">
            {p.words.map((x) => (
              <button
                key={x.term}
                className="word"
                aria-expanded={open === x.term}
                onClick={() => {
                  setOpen(open === x.term ? null : x.term)
                  store.addWord(p.id, x.term)
                }}
              >
                {x.term}
              </button>
            ))}
          </p>
          {w && (
            <dl className="wordcard">
              <dt>Meaning</dt>
              <dd>{w.meaning}</dd>
              <dt>Breakdown</dt>
              <dd>{w.breakdown}</dd>
              <dt>Where students trip</dt>
              <dd>{w.trap}</dd>
              {w.hi && (
                <>
                  <dt>Hindi</dt>
                  <dd lang="hi">{w.hi}</dd>
                </>
              )}
            </dl>
          )}
        </>
      )}

      <h3>Visual</h3>
      <Visual svg={p.visual_svg} alt={p.visual_alt} />

      <h3>Never-forget hook</h3>
      <p className="hook">{p.hook}</p>

      <h3>Exam lens</h3>
      <p className="chips">
        {p.exam_tags.map((t) => (
          <span className="chip" key={t}>
            {t}
          </span>
        ))}
      </p>
      <p className="body">{p.exam_note}</p>
      <p className="trap">
        <strong>Classic trap.</strong> {p.trap}
      </p>

      <h3>Recall check</h3>
      {p.recall.map((r, k) => (
        <Question key={k} id={`${p.id}#${k}`} r={r} />
      ))}
    </article>
  )
}

function Reader({ id, initial }: { id: string; initial?: string }) {
  const { ch, error, loading } = useChapter(id)
  const [i, setI] = useState(0)
  const x0 = useRef(0)
  const n = ch?.paragraphs.length ?? 0
  const go = (d: number) => setI((v) => Math.min(n - 1, Math.max(0, v + d)))
  useEffect(() => {
    if (!ch || !initial) return
    const at = ch.paragraphs.findIndex((p) => p.id === initial)
    if (at >= 0) setI(at)
  }, [ch, initial])
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  })
  if (loading) {
    return (
      <section>
        <Skeleton lines={2} />
        <div className="card">
          <Skeleton lines={8} />
        </div>
      </section>
    )
  }
  if (error || !ch) {
    return (
      <Empty
        title={navigator.onLine ? 'This chapter did not load' : 'This chapter is not saved offline'}
        text={
          navigator.onLine
            ? 'Reload the page. If it still fails, go back to Home and open the chapter again.'
            : 'Go back to Home and open a chapter you have already read, or reconnect once.'
        }
      />
    )
  }
  return (
    <section
      onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - x0.current
        if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1)
      }}
    >
      <h2 className="chapter-title">
        {ch.title}
        <span className="sub">
          Class {ch.class} {ch.subject}
        </span>
      </h2>
      <div className="pager">
        <button className="btn" disabled={i === 0} onClick={() => go(-1)}>
          Previous
        </button>
        <label className="progress-label">
          Paragraph {i + 1} of {n}
          <progress max={n} value={i + 1} />
        </label>
        <button className="btn" disabled={i === n - 1} onClick={() => go(1)}>
          Next
        </button>
      </div>
      <Card key={ch.paragraphs[i].id} chapterId={ch.id} p={ch.paragraphs[i]} />
    </section>
  )
}

function Home() {
  const prog = store.getProgress()
  if (chapterIndex.length === 0) {
    return <Empty title="Content did not load" text="Reload the page. If it keeps happening, check your connection once and try again." />
  }
  const subjects = [...new Set(chapterIndex.map((c) => c.subject))]
  return (
    <section>
      {subjects.map((s) => (
        <div key={s}>
          <h2>{s}</h2>
          <ul className="chapters">
            {chapterIndex
              .filter((c) => c.subject === s)
              .map((c: ChapterMeta) => {
                const seen = (prog[c.id] ?? []).length
                return (
                  <li key={c.id}>
                    <a className="chapter" href={`#/c/${c.id}`}>
                      <span className="chapter-name">{c.title}</span>
                      <span className="sub">Class {c.class}</span>
                      <progress max={c.paragraphs} value={seen} aria-label="Paragraphs read" />
                      <span className="sub">
                        {seen} of {c.paragraphs} paragraphs read
                      </span>
                    </a>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </section>
  )
}

function Words() {
  const [q, setQ] = useState('')
  const all = useAllChapters()
  const opened = store.getWords()
  const list = useMemo(
    () =>
      (all ?? []).flatMap((c) =>
        c.paragraphs.flatMap((p) =>
          p.words
            .filter((w) => opened.some((o) => o.p === p.id && o.t === w.term))
            .map((w) => ({ w, pid: p.id, ref: p.ncert_ref })),
        ),
      ),
    [all, opened],
  )
  const filtered = list.filter((x) => `${x.w.term} ${x.w.meaning}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <section>
      <h2>Word bank</h2>
      <label htmlFor="search" className="field-label">
        Search your words
      </label>
      <input id="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} />
      {!all ? (
        <Skeleton lines={4} />
      ) : opened.length === 0 ? (
        <Empty title="No words yet" text="Tap an underlined word in a chapter and it will be saved here." />
      ) : filtered.length === 0 ? (
        <Empty title="No match" text="Try a shorter search." />
      ) : (
        <ul className="wordlist">
          {filtered.map((x) => (
            <li key={x.pid + x.w.term} className="wordcard">
              <h3>{x.w.term}</h3>
              <p>{x.w.meaning}</p>
              <p className="sub">{x.w.breakdown}</p>
              <p className="sub">Where students trip: {x.w.trap}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Revise() {
  const all = useAllChapters()
  const due = useMemo(() => {
    if (!all) return []
    const idx = new Map<string, RecallT>()
    all.forEach((c) => c.paragraphs.forEach((p) => p.recall.forEach((r, k) => idx.set(`${p.id}#${k}`, r))))
    return Object.entries(store.getSrs())
      .filter(([k, c]) => idx.has(k) && isDue(c, Date.now()))
      .map(([k]) => ({ id: k, r: idx.get(k)! }))
  }, [all])
  return (
    <section>
      <h2>Revision</h2>
      {!all ? (
        <Skeleton lines={4} />
      ) : due.length === 0 ? (
        <Empty title="Nothing due today" text="Answer recall questions in a chapter. They come back here after 1, 3, 7 and 21 days." />
      ) : (
        <>
          <p className="sub">{due.length} due today</p>
          {due.map((d) => (
            <div className="card" key={d.id}>
              <Question id={d.id} r={d.r} />
            </div>
          ))}
        </>
      )}
    </section>
  )
}

export default function App() {
  const h = useHash()
  const online = useOnline()
  const main = useRef<HTMLElement>(null)
  const [, route, arg, para] = h.split('/')
  useEffect(() => {
    scrollTo(0, 0)
    main.current?.focus()
  }, [h])
  const link = (to: string, label: string, on: boolean) => (
    <a href={`#/${to}`} aria-current={on ? 'page' : undefined}>
      {label}
    </a>
  )
  return (
    <>
      <button className="skip" onClick={() => main.current?.focus()}>
        Skip to content
      </button>
      <header className="top">
        <a className="brand" href="#/">
          Gloss
        </a>
        <nav aria-label="Main">
          {link('', 'Home', !route || route === 'c')}
          {link('words', 'Words', route === 'words')}
          {link('revise', 'Revise', route === 'revise')}
        </nav>
      </header>
      {!online && (
        <p className="offline" role="status">
          You are offline. Everything here still works.
        </p>
      )}
      <main ref={main} tabIndex={-1} id="main">
        {route === 'c' ? (
          <Reader id={arg} initial={para} />
        ) : route === 'words' ? (
          <Words />
        ) : route === 'revise' ? (
          <Revise />
        ) : route === 'terms' ? (
          <Terms />
        ) : route === 'privacy' ? (
          <Privacy />
        ) : (
          <Home />
        )}
      </main>
      <footer>
        <p>Gloss explains NCERT in original words. Not affiliated with NCERT.</p>
        <p>
          <a href="#/terms">Terms of Service</a> <a href="#/privacy">Privacy Policy</a>
        </p>
      </footer>
    </>
  )
}
