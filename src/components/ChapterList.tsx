import type { ChapterMeta } from '../content'
import { Icon } from '../icons'

/** One ruled row per chapter. No boxes; the rule is the separator. */
export function ChapterList({
  chapters,
  progress,
  offset = 0,
}: {
  chapters: ChapterMeta[]
  progress: Record<string, string[]>
  offset?: number
}) {
  return (
    <ul className="chapter-list">
      {chapters.map((c, n) => {
        const read = (progress[c.id] ?? []).length
        return (
          <li key={c.id}>
            <a className="chapter-row" href={`#/c/${c.id}`}>
              <span className="chapter-no" aria-hidden="true">
                {String(offset + n + 1).padStart(2, '0')}
              </span>
              <span className="chapter-body">
                <span className="chapter-name">{c.title}</span>
                <span className="chapter-meta">
                  <span>
                    Class {c.class} {c.subject}
                  </span>
                  <span className="dot" aria-hidden="true">
                    ·
                  </span>
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
  )
}
