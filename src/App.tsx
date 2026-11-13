import { useEffect, useRef } from 'react'
import { useHash, useOnline } from './hooks'
import { initSettings } from './settings'
import { applyUpdate, dismissUpdate, useUpdateReady } from './sw'
import { ErrorBoundary, UpdateBar } from './components/Chrome'
import { Home } from './screens/Home'
import { Reader } from './screens/Reader'
import { Words } from './screens/Words'
import { Revise } from './screens/Revise'
import { SearchScreen } from './screens/SearchScreen'
import { Settings } from './screens/Settings'
import { NotFound } from './screens/NotFound'
import { Privacy, Terms } from './Legal'
import { Icon, type IconName } from './icons'

initSettings()

const NAV: { route: string; href: string; label: string; icon: IconName }[] = [
  { route: '', href: '#/', label: 'Home', icon: 'home' },
  { route: 'words', href: '#/words', label: 'Words', icon: 'words' },
  { route: 'revise', href: '#/revise', label: 'Revise', icon: 'revise' },
]

export default function App() {
  const h = useHash()
  const online = useOnline()
  const main = useRef<HTMLElement>(null)
  const updateReady = useUpdateReady()

  const parts = h.split('/').filter(Boolean)
  const route = parts[0] ?? ''
  const id = parts[1] ?? ''
  const para = parts[2]

  useEffect(() => {
    scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [h])

  const current = route === 'c' ? '' : route

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="top">
        <div className="top-inner">
          <a className="brand" href="#/">
            Gloss
            <span className="brand-mark" aria-hidden="true" />
          </a>
          <nav className="main-nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} aria-current={current === n.route ? 'page' : undefined}>
                <Icon name={n.icon} size={18} />
                <span>{n.label}</span>
              </a>
            ))}
          </nav>
          <div className="top-tools">
            <a className="icon-btn" href="#/search" aria-label="Search" aria-current={route === 'search' ? 'page' : undefined}>
              <Icon name="search" size={20} />
            </a>
            <a
              className="icon-btn"
              href="#/settings"
              aria-label="Settings"
              aria-current={route === 'settings' ? 'page' : undefined}
            >
              <Icon name="settings" size={20} />
            </a>
          </div>
        </div>
      </header>

      {!online && (
        <p className="offline" role="status">
          <Icon name="offline" size={16} /> Offline. Chapters you have opened still work.
        </p>
      )}

      <main className="wrap" ref={main} tabIndex={-1} id="main">
        <ErrorBoundary resetKey={h}>
          {route === '' ? (
            <Home />
          ) : route === 'c' ? (
            <Reader id={id} para={para} />
          ) : route === 'words' ? (
            <Words />
          ) : route === 'revise' ? (
            <Revise />
          ) : route === 'search' ? (
            <SearchScreen />
          ) : route === 'settings' ? (
            <Settings />
          ) : route === 'terms' ? (
            <Terms />
          ) : route === 'privacy' ? (
            <Privacy />
          ) : (
            <NotFound />
          )}
        </ErrorBoundary>
      </main>

      <footer className="foot">
        <div className="wrap foot-inner">
          <p>Gloss explains NCERT in original words. Not affiliated with NCERT.</p>
          <p className="foot-links">
            <a href="#/terms">Terms</a>
            <a href="#/privacy">Privacy</a>
            <span className="muted">v{__APP_VERSION__}</span>
          </p>
        </div>
      </footer>

      {updateReady && <UpdateBar onReload={applyUpdate} onLater={dismissUpdate} />}
    </>
  )
}
