import { useMemo } from 'react'
import { chapterIndex, totalParagraphs } from '../content'
import * as store from '../store'
import { ChapterList } from '../components/ChapterList'
import { Cover } from '../components/Cover'

export function Library({ only }: { only?: string }) {
  const prog = store.getProgress()
  const groups = useMemo(() => {
    const map = new Map<string, typeof chapterIndex>()
    for (const c of chapterIndex) map.set(c.subject, [...(map.get(c.subject) ?? []), c])
    return [...map.entries()]
  }, [])

  const shown = only ? groups.filter(([s]) => s.toLowerCase() === only.toLowerCase()) : groups

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
            </section>
          )
        })
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
