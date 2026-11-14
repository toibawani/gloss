import { useMemo, useState } from 'react'
import { chapterIndex, totalParagraphs, type ChapterMeta } from '../content'
import { inChapterOrder } from '../catalogue'
import { saveChaptersOffline, formatBytes } from '../offline'
import { sectionsOf, sectionOf } from '../sections'
import * as store from '../store'
import { ChapterList } from '../components/ChapterList'
import { Cover } from '../components/Cover'
import { Icon } from '../icons'

export function Library({ only, section }: { only?: string; section?: string }) {
  const prog = store.getProgress()
  const [saved, setSaved] = useState('')

  const groups = useMemo(() => {
    const map = new Map<string, typeof chapterIndex>()
    for (const c of chapterIndex) map.set(c.subject, [...(map.get(c.subject) ?? []), c])
    return [...map.entries()]
  }, [])

  const shown = only ? groups.filter(([s]) => s.toLowerCase() === only.toLowerCase()) : groups
  const at = only ? groups.findIndex(([s]) => s.toLowerCase() === only.toLowerCase()) : -1
  const nextSubject = at >= 0 ? groups[(at + 1) % groups.length] : undefined
  const shelf = only ? sectionsOf(only) : []
  const open = only && section ? sectionOf(only, section) : undefined
  const openAt = open ? shelf.findIndex((s) => s.slug === open.slug) : -1
  const nextSection = openAt >= 0 ? shelf[openAt + 1] : undefined

  const byId = useMemo(() => new Map(chapterIndex.map((c) => [c.id, c])), [])
  const chaptersOf = (ids: string[]): ChapterMeta[] =>
    inChapterOrder(ids.map((id) => byId.get(id)).filter((c): c is ChapterMeta => Boolean(c)))

  const save = async (ids: string[]) => {
    setSaved('Saving the chapters and their diagrams.')
    const { ok, usage } = await saveChaptersOffline(ids)
    setSaved(
      ok
        ? `Saved for offline. This site now uses ${formatBytes(usage)} of storage.`
        : 'Offline saving needs the installed app. Install it first from Settings.',
    )
  }

  if (only && section && !open) {
    return (
      <>
        <header className="page-head">
          <p className="hero-subject">Section not found</p>
          <h1>That section is not in this subject</h1>
          <p className="lede">The link may be old. Every section is listed on the subject page.</p>
        </header>
        <p>
          <a className="link-btn" href={`#/s/${encodeURIComponent(only)}`}>
            All {only.toLowerCase()} sections <Icon name="right" size={14} />
          </a>
        </p>
      </>
    )
  }

  /* A section page: one shelf of the subject, in chapter order. */
  if (only && open) {
    const list = chaptersOf(open.ids)
    const read = list.reduce((n, c) => n + (prog[c.id] ?? []).length, 0)
    const total = list.reduce((n, c) => n + c.paragraphs, 0)
    return (
      <>
        <header className="page-head">
          <a className="back" href={`#/s/${encodeURIComponent(only)}`}>
            <Icon name="left" size={16} /> {only}
          </a>
          <p className="hero-subject">
            Section {openAt + 1} of {shelf.length} · Class {list[0]?.class ?? 11} {only}
          </p>
          <h1>{open.name}</h1>
          <p className="lede">{open.blurb}</p>
          <p className="group-count">
            {list.length} {list.length === 1 ? 'chapter' : 'chapters'} · {read} of {total} paragraphs read
          </p>
        </header>

        <ChapterList chapters={list} progress={prog} />

        <div className="save-row">
          <button className="link-btn" onClick={() => save(list.map((c) => c.id))}>
            <Icon name="download" size={16} /> Save this section for offline
          </button>
          {saved && (
            <p className="inline-note" role="status">
              {saved}
            </p>
          )}
        </div>

        <nav className="end-nav" aria-label="Next section">
          {nextSection ? (
            <a href={`#/s/${encodeURIComponent(only)}/${nextSection.slug}`} data-subject={only}>
              <span>Next section</span>
              <strong>{nextSection.name}</strong>
            </a>
          ) : (
            <a href="#/library">
              <span>End of this subject</span>
              <strong>Back to the library</strong>
            </a>
          )}
        </nav>
      </>
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
          {only
            ? `${only} is organised by section. Open a section to see its chapters; the chapter number is the NCERT number, not a running count.`
            : 'Every chapter written so far, by subject. Chapters that are not here have not been written yet; nothing is listed twice and no chapter is faked.'}
        </p>
      </header>

      {shown.length === 0 && <p className="inline-note">No subject matches that name.</p>}

      {/* A subject page: its sections, not its chapters. */}
      {only &&
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
                    Class {list[0].class} · {shelf.length} sections · {list.length} chapters · {read} of {total} paragraphs
                    read
                  </p>
                </div>
              </div>
              <ul className="subject-index section-index">
                {shelf.map((s, n) => {
                  const sec = chaptersOf(s.ids)
                  const secRead = sec.reduce((sum, c) => sum + (prog[c.id] ?? []).length, 0)
                  const secTotal = sec.reduce((sum, c) => sum + c.paragraphs, 0)
                  return (
                    <li key={s.slug}>
                      <a href={`#/s/${encodeURIComponent(subject)}/${s.slug}`} data-subject={subject}>
                        <span className="index-no" aria-hidden="true">
                          {String(n + 1).padStart(2, '0')}
                        </span>
                        <span className="index-name">
                          {s.name}
                          <span className="index-meta">
                            {sec.length} {sec.length === 1 ? 'chapter' : 'chapters'} · {secTotal} paragraphs
                          </span>
                        </span>
                        <span className="index-read">
                          {secRead} of {secTotal} read
                        </span>
                        <span className="index-go" aria-hidden="true">
                          <Icon name="right" size={18} />
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

      {/* Library with no subject: the three shelves side by side in ruled rows. */}
      {!only &&
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
                    Class {list[0].class} · {sectionsOf(subject).length} sections · {list.length} chapters · {read} of{' '}
                    {total} paragraphs read
                  </p>
                </div>
              </div>
              <ChapterList chapters={inChapterOrder(list)} progress={prog} />
              <div className="save-row">
                <a className="link-btn" href={`#/s/${encodeURIComponent(subject)}`}>
                  Open {subject.toLowerCase()} by section <Icon name="right" size={14} />
                </a>
              </div>
            </section>
          )
        })}

      {only && shown.length > 0 && (
        <nav className="end-nav" aria-label="Next subject">
          {nextSubject ? (
            <a href={`#/s/${encodeURIComponent(nextSubject[0])}`} data-subject={nextSubject[0]}>
              <span>Next subject</span>
              <strong>{nextSubject[0]}</strong>
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
