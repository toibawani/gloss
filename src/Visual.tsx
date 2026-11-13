import { createElement, useMemo, type ReactNode } from 'react'

// Content SVG is parsed and rebuilt from an allow-list. It is never injected as raw HTML.
const TAGS = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'text', 'tspan'])
const ATTRS = new Set([
  'viewBox', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points',
  'transform', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'text-anchor', 'font-size', 'opacity', 'class',
])
// Semantic names only. A raw class or a style attribute would let content reach the stylesheet.
const CLASSES = new Set(['d-line', 'd-fill', 'd-accent', 'd-label', 'd-muted', 'd-guide'])

function safeClass(value: string): string | undefined {
  const kept = value.split(/\s+/).filter((c) => CLASSES.has(c))
  return kept.length > 0 ? kept.join(' ') : undefined
}

function build(n: Node, key: number, depth: number): ReactNode {
  if (n.nodeType === 3) return n.textContent
  if (n.nodeType !== 1 || depth > 8) return null
  const el = n as Element
  const tag = el.localName
  if (!TAGS.has(tag)) return null
  const props: Record<string, unknown> = { key }
  for (const a of Array.from(el.attributes)) {
    if (!ATTRS.has(a.name) || /url\(|javascript:|data:/i.test(a.value)) continue
    if (a.name === 'class') {
      const cls = safeClass(a.value)
      if (cls) props.className = cls
      continue
    }
    props[a.name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())] = a.value
  }
  const kids = Array.from(el.childNodes).map((c, i) => build(c, i, depth + 1))
  return createElement(tag, props, ...kids)
}

export function Visual({ svg, alt }: { svg: string; alt: string }) {
  const tree = useMemo(() => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const root = doc.documentElement
    if (root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) return null
    return build(root, 0, 0)
  }, [svg])
  if (!tree) return <p className="note">This diagram could not be shown.</p>
  return (
    <figure className="visual" role="img" aria-label={alt}>
      {tree}
    </figure>
  )
}
