// One 24px grid, 1.6 stroke, round caps, currentColor only. No icon library.

export type IconName =
  | 'home'
  | 'words'
  | 'revise'
  | 'search'
  | 'settings'
  | 'bookmark'
  | 'download'
  | 'check'
  | 'close'
  | 'left'
  | 'right'
  | 'book'
  | 'offline'
  | 'install'
  | 'library'
  | 'today'
  | 'note'
  | 'profile'
  | 'bookmarks'
  | 'trash'
  | 'plus'
  | 'external'

const paths: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-6h5v6',
  words: 'M4 4.5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 4.5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z',
  revise: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 20 20',
  settings: 'M3.5 8.5h5M13 8.5h7.5M3.5 15.5h9M17 15.5h3.5M10.5 5.5v6M15 12.5v6',
  bookmark: 'M6.5 3.5h11v17l-5.5-4-5.5 4z',
  download: 'M12 3v11M7.5 10l4.5 4.5 4.5-4.5M4.5 19.5h15',
  check: 'M5 12.5 10 17.5 19.5 7',
  close: 'M6 6l12 12M18 6 6 18',
  left: 'M14.5 5 7.5 12l7 7',
  right: 'M9.5 5l7 7-7 7',
  book: 'M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12.5H7.5A2.5 2.5 0 0 1 5 17zM5 17a2.5 2.5 0 0 1 2.5-2.5H17',
  offline: 'M3 3l18 18M8.5 8.6A7 7 0 0 1 19 12M5 12a7 7 0 0 1 1.6-4.4M12 17.5v.1M12 12a3 3 0 0 1 3 3',
  install: 'M12 3v9M8.5 8.5 12 12l3.5-3.5M4.5 15v4.5h15V15',
  library: 'M4 5.5h3.5v15H4zM9.5 5.5H13v15H9.5zM15.5 6.5l2.8-.6 3 14.4-2.8.6zM3.5 20.5h17',
  today: 'M4.5 6.5h15v14h-15zM8 3.5v5M16 3.5v5M4.5 11h15',
  note: 'M5 4.5h10l4.5 4.5v11H5zM15 4.5V9h4.5M8.5 13h7M8.5 16.5h4.5',
  profile: 'M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5zM4.5 21c.6-4 3.7-6.2 7.5-6.2s6.9 2.2 7.5 6.2',
  bookmarks: 'M6.5 3.5h8v17l-4-3-4 3zM10.5 3.5V9l2-1.4 2 1.4',
  trash: 'M4.5 6.5h15M9 6.5V4h6v2.5M6.5 6.5l1 14h9l1-14M10 10.5v6M14 10.5v6',
  plus: 'M12 5v14M5 12h14',
  external: 'M13 4.5h6.5V11M19.5 4.5 11 13M17 14.5v5H4.5v-12H10',
}

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  )
}
