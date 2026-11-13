import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons'

type Art = 'page' | 'words' | 'review' | 'search' | 'lost'

/** A drawn mark, 56px, one stroke weight. Cheap to ship and specific to the state. */
function EmptyArt({ art }: { art: Art }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg className="empty-art" width={56} height={56} viewBox="0 0 56 56" aria-hidden="true" focusable="false">
      {art === 'page' && (
        <>
          <path {...common} d="M14 8h22l6 6v34H14z" />
          <path {...common} d="M36 8v6h6M20 22h16M20 28h16M20 34h10" strokeWidth={1.1} />
          <path d="M40 40h6" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="square" />
        </>
      )}
      {art === 'words' && (
        <>
          <rect {...common} x="10" y="10" width="36" height="36" rx="1" />
          <path {...common} d="M17 21h16M17 28h22M17 35h12" strokeWidth={1.1} />
          <path {...common} d="M17 42h8" strokeDasharray="1 4" />
        </>
      )}
      {art === 'review' && (
        <>
          <circle {...common} cx="28" cy="28" r="17" />
          <path {...common} d="M28 18v10l7 5" />
        </>
      )}
      {art === 'search' && (
        <>
          <circle {...common} cx="25" cy="25" r="12" />
          <path {...common} d="M34 34l9 9" />
          <path {...common} d="M20 25h10" strokeWidth={1.1} />
        </>
      )}
      {art === 'lost' && (
        <>
          <path {...common} d="M16 9h24v38l-12-7-12 7z" />
          <path {...common} d="M23 22h10M23 28h10" strokeWidth={1.1} />
          <path {...common} d="M12 44h32" strokeDasharray="3 4" />
        </>
      )}
    </svg>
  )
}

export function Empty({
  title,
  text,
  action,
  art = 'page',
}: {
  title: string
  text: string
  action?: { label: string; href: string }
  art?: Art
}) {
  return (
    <div className="empty">
      <EmptyArt art={art} />
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <a className="btn" href={action.href}>
          {action.label}
        </a>
      )}
    </div>
  )
}

export function Skeleton({ lines = 4, rail = false }: { lines?: number; rail?: boolean }) {
  return (
    <div className={rail ? 'skeleton skeleton-card' : 'skeleton'} aria-hidden="true">
      <div>
        <span className="skel skel-ref" />
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={i % 3 === 2 ? 'skel skel-short' : 'skel'} />
        ))}
      </div>
      {rail && (
        <div className="skeleton-rail">
          <span className="skel skel-ref" />
          <span className="skel" />
          <span className="skel skel-short" />
        </div>
      )}
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  )
}

export function InlineNote({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <p className="inline-note">
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </p>
  )
}
