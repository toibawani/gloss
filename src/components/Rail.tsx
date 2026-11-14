import { chapterIndex, totalParagraphs } from '../content'
import { Icon } from '../icons'
import { NAV } from '../nav'
import { Wordmark } from './Brand'

/**
 * The desktop spine: brand, sections, then the three subjects with their chapter counts.
 * On a phone this is replaced by the top bar and the tab bar; it never renders twice.
 */
export function Rail({ route }: { route: string }) {
  const subjects = new Map<string, number>()
  for (const c of chapterIndex) subjects.set(c.subject, (subjects.get(c.subject) ?? 0) + 1)

  return (
    <aside className="rail" aria-label="Gloss">
      <a className="rail-brand" href="#/" aria-label="Gloss">
        <Wordmark />
      </a>

      <nav className="rail-nav" aria-label="Main">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} aria-current={route === n.route ? 'page' : undefined}>
            <Icon name={n.icon} size={18} />
            <span>{n.label}</span>
          </a>
        ))}
      </nav>

      <div className="rail-block">
        <p className="rail-label">subjects</p>
        <div className="rail-subjects">
          {[...subjects.entries()].map(([subject, count]) => (
            <a key={subject} href={`#/s/${encodeURIComponent(subject)}`} data-subject={subject}>
              <span className="rail-dot" aria-hidden="true" />
              <span>{subject}</span>
              <span className="rail-count">{count}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rail-foot">
        <a href="#/search">
          <Icon name="search" size={16} /> Search
        </a>
        <a href="#/settings">
          <Icon name="settings" size={16} /> Settings
        </a>
        <p>
          {chapterIndex.length} chapters · {totalParagraphs} paragraphs
          <br />
          v{__APP_VERSION__}
        </p>
      </div>
    </aside>
  )
}
