import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons'

export function Empty({
  title,
  text,
  action,
}: {
  title: string
  text: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <a className="btn btn-quiet" href={action.href}>
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
