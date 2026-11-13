import { useMemo, useState } from 'react'
import { chapterIndex, totalParagraphs } from '../content'
import { useChapter } from '../hooks'
import { saveChaptersOffline, formatBytes } from '../offline'
import * as store from '../store'
import { Card } from '../components/Card'
import { ChapterList } from '../components/ChapterList'
import { Cover } from '../components/Cover'
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
  const subjects = groups.length

  return (
    <>
      <header className="page-head hero">
        <p className="hero-subject">Class 11 · Physics, Chemistry and Biology</p>
        <h1>Every paragraph, with a margin note.</h1>
        <p className="lede">
          NCERT lines explained where students get stuck. {subjects} subjects, {chapterIndex.length} chapters and{' '}
          {totalParagraphs} paragraphs are written so far. Every one is a draft until a subject expert checks it.
        </p>
      </header>

      <section className="covers" aria-label="Subjects">
        {groups.map(([subject, list]) => {
          const total = list.reduce((n, c) => n + c.paragraphs, 0)
          const seen = list.reduce((n, c) => n + (prog[c.id] ?? []).length, 0)
          return (
            <a className="cover-card" key={subject} href={`#/s/${encodeURIComponent(subject)}`} data-subject={subject}>
              <Cover subject={subject} size={96} />
              <span className="cover-name">{subject}</span>
              <span className="cover-meta">
                {list.length} {list.length === 1 ? 'chapter' : 'chapters'} · {seen} of {total} read
              </span>
            </a>
          )
        })}
      </section>

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

            <ChapterList chapters={list} progress={prog} />

            <div className="row">
              <button className="link-btn" onClick={() => save(subject, list.map((c) => c.id))}>
                <Icon name="download" size={16} /> Save {subject.toLowerCase()} for offline
              </button>
              <a className="link-btn" href={`#/s/${encodeURIComponent(subject)}`}>
                All {subject.toLowerCase()} chapters <Icon name="right" size={14} />
              </a>
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
