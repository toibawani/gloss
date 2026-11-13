import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Icon } from '../icons'

export class ErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No personal data and no stack trace in the UI. The console keeps the detail for the developer.
    console.error('Gloss render error:', error.message, info.componentStack)
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="empty" role="alert">
        <h2>This page stopped drawing</h2>
        <p>Reload it. Your progress is safe on this device. If it happens again, open a different chapter from Home.</p>
        <div className="row">
          <button className="btn" onClick={() => location.reload()}>
            Reload the page
          </button>
          <a className="btn btn-quiet" href="#/">
            Go to Home
          </a>
        </div>
      </div>
    )
  }
}

export function UpdateBar({ onReload, onLater }: { onReload: () => void; onLater: () => void }) {
  return (
    <div className="update-bar" role="status">
      <span>
        <Icon name="check" size={18} /> A new version is ready.
      </span>
      <span className="update-actions">
        <button className="btn btn-small" onClick={onReload}>
          Reload
        </button>
        <button className="link-btn" onClick={onLater}>
          Later
        </button>
      </span>
    </div>
  )
}
