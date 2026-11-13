import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS, getSettings, setSettings, type SettingsT } from './store'

export type { SettingsT }

let current: SettingsT = { ...DEFAULT_SETTINGS }
const listeners = new Set<() => void>()

function ensure() {
  if (typeof window === 'undefined') return
  current = getSettings()
  applySettings(current)
}

function emit() {
  for (const l of listeners) l()
}

export function initSettings() {
  ensure()
  const mq = matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (current.theme === 'system') applySettings(current)
  })
}

export function getPrefs(): SettingsT {
  return current
}

export function setPrefs(patch: Partial<SettingsT>) {
  setSettings(patch)
  current = getSettings()
  applySettings(current)
  emit()
}

export function subscribePrefs(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useSettings(): SettingsT {
  return useSyncExternalStore(subscribePrefs, getPrefs, () => DEFAULT_SETTINGS)
}

export function applySettings(s: SettingsT) {
  const root = document.documentElement
  root.dataset.theme = s.theme
  root.dataset.textSize = s.textSize
  root.dataset.leading = s.leading
  const dark = s.theme === 'dark' || (s.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  root.style.colorScheme = dark ? 'dark' : 'light'
}
