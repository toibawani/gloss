import { useMemo, useState } from 'react'
import { chapterIndex, totalParagraphs } from '../content'
import { useChapter } from '../hooks'
import { saveChaptersOffline, formatBytes } from '../offline'
import * as store from '../store'
import { Card } from '../components/Card'
import { Empty, Skeleton } from '../components/States'
import { Icon } from '../icons'
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
  const firstRun = words.length === 0 && Object.values(prog).every((a) => a.length === 0)
  const first = chapterIndex[0]
  const sample = useChapter(first?.id ?? '')
  const [saved, setSaved] = useState<Record<string, string>>({})

  const groups = useMemo(() => {
    const map = new Map<string, typeof chapterIndex>()
    for (const c of chapterIndex) map.set(c.subject, [...(map.get(c.subject) ?? []), c])
    return [...map.entries()]
  }, [])

  if (chapterIndex.length === 0) {
    return <Empty art="lost" title="No chapters in this build" text="The content index is empty. Rebuild the site and reload." />
  }

  const save = async (subject: string, ids: string[]) => {
    setSaved((s) => ({ ...s, [subject]: 'Saving the chapters and their diagrams.' }))
    const { ok, usage } = await saveChaptersOffline(ids)
    setSaved((s) => ({
      ...s,
      [subject]: ok
        ? `Saved for offline. This site now uses ${formatBytes(usage)} of storage.`
        : 'Offline saving needs the installed app. Install it first from Settings.',
    }))
  }

  const read = Object.values(prog).reduce((n, ids) => n + ids.length, 0)

  return (
    <>
      <header className="page-head hero">
        <p className="hero-subject">Class 11 · Biology</p>
        <h1>Every paragraph, with a margin note.</h1>
        <p className="lede">
          NCERT lines explained where students get stuck. {totalParagraphs} paragraphs are written across {chapterIndex.length}{' '}
          chapters. Every one is a draft until a subject expert checks it.
        </p>
      </header>

      {due > 0 && (
        <a className="due" href="#/revise">
          <span>
            <strong>{due}</strong> {due === 1 ? 'review is' : 'reviews are'} due today
          </span>
          <Icon name="right" size={18} />
        </a>
      )}

      {groups.map(([subject, list]) => {
        const seen = list.reduce((n, c) => n + (prog[c.id] ?? []).length, 0)
        const total = list.reduce((n, c) => n + c.paragraphs, 0)
        return (
          <section className="group" key={subject} data-subject={subject} aria-labelledby={`subject-${subject}`}>
            <div className="group-head">
              <h2 id={`subject-${subject}`}>{subject}</h2>
              <span className="group-count">
                {list.length} {list.length === 1 ? 'chapter' : 'chapters'} · {seen} of {total} paragraphs read
              </span>
            </div>

            <ul className="chapter-list">
              {list.map((c, n) => {
                const read = (prog[c.id] ?? []).length
                return (
                  <li key={c.id}>
                    <a className="chapter-row" href={`#/c/${c.id}`}>
                      <span className="chapter-no" aria-hidden="true">
                        {String(n + 1).padStart(2, '0')}
                      </span>
                      <span className="chapter-body">
                        <span className="chapter-name">{c.title}</span>
                        <span className="chapter-meta">
                          <span>{c.paragraphs} paragraphs</span>
                          <span className="dot" aria-hidden="true">
                            ·
                          </span>
                          <span>{read} read</span>
                        </span>
                        <progress
                          className="progress"
                          max={c.paragraphs}
                          value={read}
                          aria-label={`${c.title}: ${read} of ${c.paragraphs} paragraphs read`}
                        />
                      </span>
                      <span className="chapter-go" aria-hidden="true">
                        <Icon name="right" size={18} />
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>

            <div className="row">
              <button className="link-btn" onClick={() => save(subject, list.map((c) => c.id))}>
                <Icon name="download" size={16} /> Save {subject.toLowerCase()} for offline
              </button>
            </div>

            {saved[subject] && (
              <p className="inline-note" role="status">
                {saved[subject]}
              </p>
            )}
          </section>
        )
      })}

      {firstRun && (
        <section className="sample" aria-labelledby="sample-title">
          <div className="group-head">
            <h2 id="sample-title">Try one paragraph</h2>
            <span className="group-count">Tap a dotted word. Answer both questions.</span>
          </div>
          {sample.loading && <Skeleton lines={6} rail />}
          {sample.ch && sample.ch.paragraphs[0] && <Card ch={sample.ch} p={sample.ch.paragraphs[0]} index={0} sample />}
          {sample.error && (
            <p className="inline-note">The sample did not load. Open chapter 8 from the list above.</p>
          )}
        </section>
      )}

      <p className="page-note">
        {read} of {totalParagraphs} paragraphs read on this device. Gloss is not affiliated with NCERT; references point
        at the book and the explanations are original.
      </p>
    </>
  )
}
