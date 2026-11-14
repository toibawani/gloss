import { chapterIndex, totalParagraphs } from '../content'
import { useChapter } from '../hooks'
import * as store from '../store'
import { Card } from '../components/Card'
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

/**
 * The landing page. It answers what this is and where to go, then stops. Chapters, progress,
 * sections and the catalogue live on Library and below it, so no page is the whole app.
 */
export function Home() {
  const prog = store.getProgress()
  const words = store.getWords()
  const due = dueCount()
  const read = Object.values(prog).reduce((n, ids) => n + ids.length, 0)
  const firstRun = words.length === 0 && read === 0
  const first = chapterIndex[0]
  const sample = useChapter(first?.id ?? '')

  if (chapterIndex.length === 0) {
    return <Empty art="lost" title="No chapters in this build" text="The content index is empty. Rebuild the site and reload." />
  }

  return (
    <>
      <header className="masthead masthead-short">
        <p className="masthead-kicker">Class 11 · Physics, Chemistry and Biology</p>
        <h1>Every paragraph, with a margin note.</h1>
        <p className="masthead-note">
          Gloss explains an NCERT paragraph in the margin beside it: the meaning, the words students stumble on, the
          exam angle and a way to remember it. {chapterIndex.length} chapters and {totalParagraphs} paragraphs are
          written so far, every one a draft until a subject expert checks it.
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

      <section className="route-block" aria-labelledby="routes-title">
        <div className="section-head">
          <h2 id="routes-title">Three ways in</h2>
          <span>{read} of {totalParagraphs} paragraphs read on this device</span>
        </div>
        <ul className="route-list">
          <li>
            <a href="#/library">
              <span className="index-no" aria-hidden="true">
                01
              </span>
              <span className="route-name">
                Library
                <span className="route-meta">
                  Three subjects, split into sections, then chapters. Chapter numbers are the NCERT numbers.
                </span>
              </span>
              <span className="index-go" aria-hidden="true">
                <Icon name="right" size={18} />
              </span>
            </a>
          </li>
          <li>
            <a href="#/revise">
              <span className="index-no" aria-hidden="true">
                02
              </span>
              <span className="route-name">
                Revise
                <span className="route-meta">
                  Questions you opened earlier, resurfaced on a 1, 3, 7 and 21 day schedule.
                </span>
              </span>
              <span className="index-go" aria-hidden="true">
                <Icon name="right" size={18} />
              </span>
            </a>
          </li>
          <li>
            <a href="#/words">
              <span className="index-no" aria-hidden="true">
                03
              </span>
              <span className="route-name">
                Words
                <span className="route-meta">
                  Every term you tapped, with its meaning, origin and the mistake it protects you from.
                </span>
              </span>
              <span className="index-go" aria-hidden="true">
                <Icon name="right" size={18} />
              </span>
            </a>
          </li>
        </ul>
      </section>

      {firstRun && (
        <section className="sample" aria-labelledby="sample-title">
          <div className="section-head">
            <h2 id="sample-title">One paragraph, before you commit</h2>
            <span>Tap a dotted word. Answer both questions.</span>
          </div>
          {sample.loading && <Skeleton lines={6} rail />}
          {sample.ch && sample.ch.paragraphs[0] && <Card ch={sample.ch} p={sample.ch.paragraphs[0]} index={0} sample />}
          {sample.error && <p className="inline-note">The sample did not load. Open a chapter from the library.</p>}
        </section>
      )}

      <p className="page-note">
        Gloss is not affiliated with NCERT. References point at the book; the explanations are original.
      </p>
    </>
  )
}
