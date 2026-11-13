import { useMemo, useState } from 'react'
import * as store from '../store'
import { Empty } from '../components/States'
import { Icon } from '../icons'

export function Words() {
  const [q, setQ] = useState('')
  const opened = store.getWords()
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return opened
      .filter((w) => `${w.t} ${w.meaning ?? ''} ${w.breakdown ?? ''}`.toLowerCase().includes(needle))
      .sort((a, b) => a.t.localeCompare(b.t))
  }, [opened, q])

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">
          <span className="eyebrow-rule" aria-hidden="true" />
          Word bank
        </p>
        <h1>Words you opened</h1>
        <p className="lede">Every tap is saved on this device, with the breakdown you read in the margin.</p>
      </header>

      <div className="field">
        <label htmlFor="word-search">Search your words</label>
        <input
          id="word-search"
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="osmosis, nucleoid, stroma"
        />
      </div>

      {opened.length === 0 ? (
        <Empty
          title="No words yet"
          text="Open a chapter and tap an underlined word. It lands here with its meaning and the place students slip."
          action={{ label: 'Open a chapter', href: '#/' }}
        />
      ) : list.length === 0 ? (
        <Empty title="No word matches" text="Try a shorter search, or clear the box." />
      ) : (
        <ul className="word-grid">
          {list.map((w) => (
            <li className="word-entry" key={`${w.p}-${w.t}`}>
              <div className="word-entry-head">
                <h2>{w.t}</h2>
                {w.hi && (
                  <span className="word-hi" lang="hi">
                    {w.hi}
                  </span>
                )}
              </div>
              {w.meaning ? (
                <>
                  <p>{w.meaning}</p>
                  {w.breakdown && <p className="word-breakdown">{w.breakdown}</p>}
                  {w.trap && (
                    <p className="word-trap">
                      <span className="rail-label">Where it trips you</span>
                      {w.trap}
                    </p>
                  )}
                </>
              ) : (
                <p className="muted">Saved before notes were kept. Open the paragraph to read the full note.</p>
              )}
              {w.ch && (
                <a className="word-source" href={`#/c/${w.ch}/${w.p}`}>
                  <Icon name="book" size={16} /> Open the paragraph
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
