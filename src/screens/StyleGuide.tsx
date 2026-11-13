import { useState } from 'react'
import { Empty, Skeleton } from '../components/States'
import { Visual } from '../Visual'

const SWATCHES = [
  ['paper', 'var(--paper)'],
  ['panel', 'var(--panel)'],
  ['band', 'var(--band)'],
  ['ink', 'var(--ink)'],
  ['muted', 'var(--muted)'],
  ['rule', 'var(--rule)'],
  ['accent', 'var(--accent)'],
  ['biology', 'var(--bio)'],
  ['physics', 'var(--phy)'],
  ['chemistry', 'var(--chem)'],
  ['history', 'var(--hist)'],
] as const

const TYPE = [
  ['display', 'var(--fs-display)', 'Newsreader 600'],
  ['3xl', 'var(--fs-3xl)', 'Newsreader 600'],
  ['2xl', 'var(--fs-2xl)', 'Newsreader 600'],
  ['xl', 'var(--fs-xl)', 'Newsreader 600'],
  ['lg', 'var(--fs-lg)', 'Newsreader 600'],
  ['read', 'var(--read)', 'Newsreader 400, reading'],
  ['md', 'var(--fs-md)', 'Public Sans 400'],
  ['sm', 'var(--fs-sm)', 'Public Sans 400'],
  ['xs', 'var(--fs-xs)', 'Public Sans 600, label'],
] as const

const DIAGRAM = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
  <rect class="d-fill" x="20" y="40" width="90" height="60" rx="2"/>
  <rect class="d-line" x="150" y="40" width="90" height="60" rx="2"/>
  <path class="d-accent" d="M128 70h14"/>
  <path class="d-guide" d="M245 70h40M285 70v60h-60"/>
  <text class="d-label" x="20" y="30">membrane</text>
  <text class="d-label" x="240" y="150">nucleus</text>
  <text class="d-label" x="240" y="30">label</text>
</svg>`

export function StyleGuide() {
  const [seg, setSeg] = useState('normal')
  return (
    <>
      <header className="page-head">
        <p className="hero-subject">Design reference</p>
        <h1>Style guide</h1>
        <p className="lede">
          Every token and component on one page. This route is not linked from the app; it exists so a reviewer can see
          states side by side in both themes.
        </p>
      </header>

      <section className="sg-section" aria-labelledby="sg-color">
        <h2 id="sg-color">Color</h2>
        <div className="sg-swatches">
          {SWATCHES.map(([name, value]) => (
            <p className="sg-swatch" key={name} style={{ ['--swatch' as string]: value }}>
              {name}
            </p>
          ))}
        </div>
      </section>

      <section className="sg-section" aria-labelledby="sg-type">
        <h2 id="sg-type">Type</h2>
        {TYPE.map(([name, size, note]) => (
          <p key={name} style={{ fontSize: size, fontFamily: name === 'read' || /xl|3xl|display/.test(name) ? 'var(--serif)' : undefined }}>
            {name} · {note}
          </p>
        ))}
      </section>

      <section className="sg-section" aria-labelledby="sg-buttons">
        <h2 id="sg-buttons">Actions</h2>
        <div className="sg-row">
          <button className="btn">Primary</button>
          <button className="btn btn-quiet">Secondary</button>
          <button className="btn btn-small">Small</button>
          <button className="btn" disabled>
            Disabled
          </button>
          <button className="link-btn">Text action</button>
        </div>
        <p>
          Body text with a <a href="#/styleguide">link inside it</a> and a <span className="status">draft mark</span>.
        </p>
      </section>

      <section className="sg-section" aria-labelledby="sg-input">
        <h2 id="sg-input">Input and segmented</h2>
        <label className="field">
          <span>Search</span>
          <input className="input" placeholder="nucleoid, middle lamella" />
        </label>
        <fieldset className="field">
          <legend>Line spacing</legend>
          <div className="seg">
            {['tight', 'normal', 'loose'].map((v) => (
              <label className="seg-item" key={v}>
                <input type="radio" name="sg-leading" checked={seg === v} onChange={() => setSeg(v)} />
                <span>{v}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="sg-section" aria-labelledby="sg-list" data-subject="Biology">
        <h2 id="sg-list">Chapter row and progress</h2>
        <ul className="chapter-list">
          <li>
            <a className="chapter-row" href="#/styleguide">
              <span className="chapter-no" aria-hidden="true">
                01
              </span>
              <span className="chapter-body">
                <span className="chapter-name">Cell: The Unit of Life</span>
                <span className="chapter-meta">
                  <span>17 paragraphs</span>
                  <span className="dot" aria-hidden="true">
                    ·
                  </span>
                  <span>4 read</span>
                </span>
                <progress className="progress" max={17} value={4} aria-label="example progress" />
              </span>
              <span className="chapter-go" aria-hidden="true">
                →
              </span>
            </a>
          </li>
          <li>
            <a className="chapter-row" href="#/styleguide">
              <span className="chapter-no" aria-hidden="true">
                02
              </span>
              <span className="chapter-body">
                <span className="chapter-name">Biomolecules</span>
                <span className="chapter-meta">
                  <span>17 paragraphs</span>
                  <span className="dot" aria-hidden="true">
                    ·
                  </span>
                  <span>0 read</span>
                </span>
                <progress className="progress" max={17} value={0} aria-label="example progress" />
              </span>
              <span className="chapter-go" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section className="sg-section" aria-labelledby="sg-diagram">
        <h2 id="sg-diagram">Diagram language</h2>
        <div className="visual-wrap">
          <Visual svg={DIAGRAM} alt="Two shapes joined by an accent link, with leader lines to labels" />
        </div>
      </section>

      <section className="sg-section" aria-labelledby="sg-states">
        <h2 id="sg-states">States</h2>
        <Skeleton lines={4} />
        <Empty art="words" title="No words yet" text="Open a chapter and tap an underlined word." action={{ label: 'Open a chapter', href: '#/' }} />
      </section>
    </>
  )
}
