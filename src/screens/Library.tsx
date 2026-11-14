import { useMemo, useState } from 'react'
import { chapterIndex, totalParagraphs } from '../content'
import { saveChaptersOffline, formatBytes } from '../offline'
import * as store from '../store'
import { ChapterList } from '../components/ChapterList'
import { Cover } from '../components/Cover'
import { Icon } from '../icons'

export function Library({ only }: { only?: string }) {
  const prog = store.getProgress()
  const [saved, setSaved] = useState('')
  const groups = useMemo(() => {
    const map = new Map<string, typeof chapterIndex>()
    for (const c of chapterIndex) map.set(c.subject, [...(map.get(c.subject) ?? []), c])
    return [...map.entries()]
  }, [])

  const shown = only ? groups.filter(([s]) => s.toLowerCase() === only.toLowerCase()) : groups
  const at = only ? groups.findIndex(([s]) => s.toLowerCase() === only.toLowerCase()) : -1
  const next = at >= 0 ? groups[(at + 1) % groups.length] : undefined

  const save = async (ids: string[]) => {
    setSaved('Saving the chapters and their diagrams.')
    const { ok, usage } = await saveChaptersOffline(ids)
    setSaved(
      ok
        ? `Saved for offline. This site now uses ${formatBytes(usage)} of storage.`
        : 'Offline saving needs the installed app. Install it first from Settings.',
    )
  }

  return (
    <>
      <header className="page-head">
        <p className="hero-subject">
          {chapterIndex.length} chapters · {totalParagraphs} paragraphs
        </p>
        <h1>{only ?? 'Library'}</h1>
        <p className="lede">
          Every chapter written so far, by subject. Chapters that are not here have not been written yet; nothing is
          listed twice and no chapter is faked.
        </p>
      </header>

      {shown.length === 0 ? (
        <p className="inline-note">No subject matches that name.</p>
      ) : (
        shown.map(([subject, list]) => {
          const read = list.reduce((n, c) => n + (prog[c.id] ?? []).length, 0)
          const total = list.reduce((n, c) => n + c.paragraphs, 0)
          return (
            <section className="library-subject" key={subject} data-subject={subject} aria-labelledby={`lib-${subject}`}>
              <div className="library-head">
                <Cover subject={subject} size={72} />
                <div>
                  <h2 id={`lib-${subject}`}>{subject}</h2>
                  <p className="group-count">
                    Class {list[0].class} · {list.length} {list.length === 1 ? 'chapter' : 'chapters'} · {read} of {total}{' '}
                    paragraphs read
                  </p>
                </div>
              </div>
              <ChapterList chapters={list} progress={prog} />

              {only && (
                <div className="save-row">
                  <button className="link-btn" onClick={() => save(list.map((c) => c.id))}>
                    <Icon name="download" size={16} /> Save {subject.toLowerCase()} for offline
                  </button>
                  {saved && (
                    <p className="inline-note" role="status">
                      {saved}
                    </p>
                  )}
                </div>
              )}
            </section>
          )
        })
      )}

      {only && shown.length > 0 && (
        <nav className="end-nav" aria-label="Next subject">
          {next ? (
            <a href={`#/s/${encodeURIComponent(next[0])}`} data-subject={next[0]}>
              <span>Next subject</span>
              <strong>{next[0]}</strong>
            </a>
          ) : (
            <a href="#/library">
              <span>That is every subject</span>
              <strong>Back to the library</strong>
            </a>
          )}
        </nav>
      )}

      <section className="not-yet" aria-labelledby="not-yet">
        <h2 id="not-yet">Not written yet</h2>
        <p>
          The rest of Class 11 Biology, Class 12 in all three subjects, and the UPSC base books in History, Geography,
          Polity and Economics. Each one needs the NCERT edition checked before its first paragraph can ship.
        </p>
      </section>
    </>
  )
}
