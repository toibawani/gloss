import { useEffect, useState } from 'react'
import { setPrefs, useSettings, type SettingsT } from '../settings'
import { useInstallPrompt } from '../hooks'
import * as store from '../store'
import { formatBytes, storageUsage } from '../offline'

function Seg<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="seg">
        {options.map((o) => (
          <label className="seg-item" key={o.value}>
            <input
              type="radio"
              name={name}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Settings() {
  const s = useSettings()
  const install = useInstallPrompt()
  const [usage, setUsage] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const health = store.getHealth()

  useEffect(() => {
    storageUsage().then(setUsage)
  }, [])

  useEffect(() => {
    if (!confirmClear) return
    const t = setTimeout(() => setConfirmClear(false), 5000)
    return () => clearTimeout(t)
  }, [confirmClear])

  const set = <K extends keyof SettingsT>(key: K, value: SettingsT[K]) => setPrefs({ [key]: value } as Partial<SettingsT>)

  const exportFile = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gloss-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Backup downloaded.')
  }

  const importFile = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    const res = store.importJSON(text, 'merge')
    setMessage(
      res.ok
        ? `Imported. ${res.progress} paragraphs read, ${res.words} words and ${res.cards} review cards now on this device.`
        : res.error,
    )
  }

  return (
    <>
      <header className="page-head">
        <h1>Settings</h1>
        <p className="lede">Everything here is stored on this device. Nothing is sent anywhere.</p>
      </header>

      {(health.corrupted || health.writeError) && (
        <div className="alert" role="alert">
          <p className="rail-label">Saved data</p>
          {health.corrupted && (
            <p>Saved progress could not be read and was set aside. The app is working from a clean copy.</p>
          )}
          {health.writeError && <p>{health.writeError}</p>}
        </div>
      )}

      <section className="settings-block" aria-labelledby="look">
        <h2 id="look">Reading</h2>
        <Seg
          legend="Theme"
          name="theme"
          value={s.theme}
          onChange={(v) => set('theme', v)}
          options={[
            { value: 'system', label: 'Device' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
        <Seg
          legend="Text size"
          name="textSize"
          value={s.textSize}
          onChange={(v) => set('textSize', v)}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Default' },
            { value: 'lg', label: 'Large' },
          ]}
        />
        <Seg
          legend="Line spacing"
          name="leading"
          value={s.leading}
          onChange={(v) => set('leading', v)}
          options={[
            { value: 'tight', label: 'Tight' },
            { value: 'normal', label: 'Normal' },
            { value: 'loose', label: 'Loose' },
          ]}
        />
      </section>

      <section className="settings-block" aria-labelledby="study">
        <h2 id="study">Exam goal</h2>
        <Seg
          legend="Which lens to show"
          name="goal"
          value={s.goal}
          onChange={(v) => set('goal', v)}
          options={[
            { value: 'NEET', label: 'NEET' },
            { value: 'JEE', label: 'JEE' },
            { value: 'UPSC', label: 'UPSC' },
          ]}
        />
        <p className="muted small">The paragraph stays the same. The exam note only shows when it is written for your goal.</p>
      </section>

      <section className="settings-block" aria-labelledby="data">
        <h2 id="data">Your progress</h2>
        <div className="row">
          <button className="btn" onClick={exportFile}>
            Export a backup
          </button>
          <label className="btn" htmlFor="import-file">
            Import a backup
          </label>
          <input
            id="import-file"
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(e) => void importFile(e.target.files?.[0])}
          />
        </div>
        <p className="muted small">
          A backup is a JSON file with your reading progress, opened words and review dates. It never leaves this device
          unless you share it.
        </p>
        <div className="row">
          <button
            className={confirmClear ? 'btn btn-danger' : 'btn btn-quiet'}
            onClick={() => {
              if (!confirmClear) {
                setConfirmClear(true)
                return
              }
              store.clearAll()
              setConfirmClear(false)
              setMessage('Progress cleared. Settings were kept.')
            }}
          >
            {confirmClear ? 'Tap again to clear everything' : 'Clear all progress'}
          </button>
        </div>
        {message && (
          <p className="inline-note" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="settings-block" aria-labelledby="app">
        <h2 id="app">App</h2>
        <p className="muted small">Storage used by Gloss on this device: {formatBytes(usage)}.</p>
        {install.available ? (
          <button className="btn" onClick={() => void install.install()}>
            Install Gloss
          </button>
        ) : (
          <p className="muted small">
            To install, open the browser menu and choose Add to Home screen. Installing gives Gloss its own window and
            keeps chapters available offline.
          </p>
        )}
        <p className="muted small">Version {__APP_VERSION__}. Content is draft until a named expert signs it off.</p>
      </section>
    </>
  )
}
