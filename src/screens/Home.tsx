import { useMemo } from 'react'
import { chapterIndex, totalParagraphs } from '../content'
import { inChapterOrder } from '../catalogue'
import { useChapter } from '../hooks'
import * as store from '../store'
import { Card } from '../components/Card'
import { ChapterList } from '../components/ChapterList'
import { Cover } from '../components/Cover'
import { Icon } from '../icons'
import { Empty, Skeleton } from '../components/States'
import { isDue, usableCard } from '../srs'

function dueCount(): number {
  const now = Date.now()
  return Object.values(store.getSrs()).filter((c) => {
    const safe = usableCard(c, now)
    return safe ? isDue(safe, now) : false
  }).length
}

export function Home() {
  const prog = store.getProgress()
  const words = store.getWords()
  const due = dueCount()
  const read = Object.values(prog).reduce((n, ids) => n + ids.length, 0)
  const firstRun = words.length === 0 && read === 0
  const first = chapterIndex[0]
  const sample = useChapter(first?.id ?? '')

  const groups = useMemo(() => {
    const map = new Map<string, typeof chapterIndex>()
    for (const c of chapterIndex) map.set(c.subject, [...(map.get(c.subject) ?? []), c])
    return [...map.entries()]
  }, [])

  const started = inChapterOrder(chapterIndex.filter((c) => (prog[c.id] ?? []).length > 0)).slice(0, 3)
  // Three ways in: the first chapter of each subject, in number order.
  const starts = groups.map(([, list]) => inChapterOrder(list)[0]).filter(Boolean)

  if (chapterIndex.length === 0) {
    return <Empty art="lost" title="No chapters in this build" text="The content index is empty. Rebuild the site and reload." />
  }

  return (
    <>
      <header className="masthead">
        <p className="masthead-kicker">Class 11 · Physics, Chemistry and Biology</p>
        <h1>Every paragraph, with a margin note.</h1>
        <dl className="masthead-stats">
          <div>
            <dt>subjects written</dt>
            <dd>{groups.length}</dd>
          </div>
          <div>
            <dt>chapters</dt>
            <dd>{chapterIndex.length}</dd>
          </div>
          <div>
            <dt>paragraphs</dt>
            <dd>{totalParagraphs}</dd>
          </div>
          <div>
            <dt>read on this device</dt>
            <dd>{read}</dd>
          </div>
        </dl>
        <p className="masthead-note">
          NCERT lines explained where students get stuck. Choose a subject to see its chapters. Every paragraph is a
          draft until a subject expert checks it against the book.
        </p>
      </header>

      <section className="subject-index-block" aria-labelledby="subjects-title">
        <div className="section-head">
          <h2 id="subjects-title">Subjects</h2>
          <span>Three books, one reference for each line</span>
        </div>
        <ul className="subject-index">
          {groups.map(([subject, list], n) => {
            const total = list.reduce((sum, c) => sum + c.paragraphs, 0)
            const seen = list.reduce((sum, c) => sum + (prog[c.id] ?? []).length, 0)
            return (
              <li key={subject}>
                <a href={`#/s/${encodeURIComponent(subject)}`} data-subject={subject}>
                  <span className="index-no" aria-hidden="true">
                    {String(n + 1).padStart(2, '0')}
                  </span>
                  <Cover subject={subject} size={56} />
                  <span className="index-name">
                    {subject}
                    <span className="index-meta">
                      {list.length} {list.length === 1 ? 'chapter' : 'chapters'} · {total} paragraphs
                    </span>
                  </span>
                  <span className="index-read">{seen} read</span>
                  <span className="index-go" aria-hidden="true">
                    <Icon name="right" size={18} />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      {due > 0 && (
        <a className="due" href="#/revise">
          <span>
            <strong>{due}</strong> {due === 1 ? 'review is' : 'reviews are'} due today
          </span>
          <Icon name="right" size={18} />
        </a>
      )}

      {started.length > 0 && (
        <section className="home-block" aria-labelledby="continue-title">
          <div className="section-head">
            <h2 id="continue-title">Continue</h2>
            <span>
              {read} of {totalParagraphs} paragraphs read on this device
            </span>
          </div>
          <ChapterList chapters={started} progress={prog} />
        </section>
      )}

      <section className="home-block" aria-labelledby="start-title">
        <div className="section-head">
          <h2 id="start-title">Start here</h2>
          <a href="#/library">All chapters</a>
        </div>
        <ChapterList chapters={starts} progress={prog} />
      </section>

      {firstRun && (
        <section className="sample" aria-labelledby="sample-title">
          <div className="group-head">
            <h2 id="sample-title">Try one paragraph</h2>
            <span className="group-count">Tap a dotted word. Answer both questions.</span>
          </div>
          {sample.loading && <Skeleton lines={6} rail />}
          {sample.ch && sample.ch.paragraphs[0] && <Card ch={sample.ch} p={sample.ch.paragraphs[0]} index={0} sample />}
          {sample.error && <p className="inline-note">The sample did not load. Open a chapter from the library.</p>}
        </section>
      )}

      <p className="page-note">
        {read} of {totalParagraphs} paragraphs read on this device. Gloss is not affiliated with NCERT; references point
        at the book and the explanations are original.
      </p>
    </>
  )
}
