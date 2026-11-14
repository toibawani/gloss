import type { IconName } from './icons'

/** The four sections, shared by the desktop rail, the top bar and the phone tab bar. */
export const NAV: { route: string; href: string; label: string; icon: IconName }[] = [
  { route: '', href: '#/', label: 'Home', icon: 'home' },
  { route: 'library', href: '#/library', label: 'Library', icon: 'library' },
  { route: 'revise', href: '#/revise', label: 'Revise', icon: 'revise' },
  { route: 'words', href: '#/words', label: 'Words', icon: 'words' },
]

export const TABS = [...NAV, { route: 'settings', href: '#/settings', label: 'Settings', icon: 'settings' as IconName }]
