import { useEffect, useState } from 'react'
import { search, type Hit } from '../search'
import { Empty, Skeleton } from '../components/States'
import { Icon } from '../icons'

export function SearchScreen() {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const needle = q.trim()
    if (needle.length < 2) {
      setHits(null)
      setBusy(false)
      return
    }
    let live = true
    setBusy(true)
    const t = setTimeout(() => {
      search(needle).then((r) => {
        if (!live) return
        setHits(r)
        setBusy(false)
      })
    }, 180)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [q])

  return (
    <>
      <header className="page-head">
        <h1>Find a line</h1>
        <p className="lede">Key phrases, tricky words and the first line of every meaning. All of it runs on this device.</p>
      </header>

      <div className="field">
        <label htmlFor="search-input">Search chapters</label>
        <input
          id="search-input"
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="nucleoid, middle lamella, enzyme"
        />
      </div>

      <div aria-live="polite" className="search-status">
        {q.trim().length < 2
          ? 'Type at least two letters.'
          : busy
            ? 'Searching.'
            : hits
              ? `${hits.length} ${hits.length === 1 ? 'result' : 'results'} for ${q.trim()}.`
              : ''}
      </div>

      {busy && <Skeleton lines={5} />}

      {hits && hits.length === 0 && !busy && (
        <Empty art="search" title="No match" text="Try a single word from the paragraph, or a term from its margin." />
      )}

      {hits && hits.length > 0 && (
        <ul className="result-list">
          {hits.map((h) => (
            <li key={`${h.chapter}-${h.paragraph}`}>
              <a className="result" href={`#/c/${h.chapter}/${h.paragraph}`}>
                <span className="result-title">
                  {h.title}
                  <Icon name="right" size={16} />
                </span>
                <span className="result-phrase">{h.phrase}</span>
                <span className="result-snippet">{h.snippet}</span>
                {h.term && <span className="result-term">Word: {h.term}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
