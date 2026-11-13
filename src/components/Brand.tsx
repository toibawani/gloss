// The mark is a page with a margin note: a rectangle, a single ruled line, and one rust tick
// where the note sits. Drawn on a 24 grid, one stroke weight, no fills except the tick.

export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Gloss"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
    >
      <path d="M4.5 2.5h15v19h-15z" />
      <path d="M8 8h8M8 12h4.5" strokeWidth={1.3} />
      <path d="M14.5 16.5h5" stroke="var(--accent)" strokeWidth={2.6} />
    </svg>
  )
}

export function Wordmark() {
  return (
    <svg viewBox="0 0 108 30" role="img" aria-label="Gloss" fill="none">
      <path d="M3 4.5h15v21H3z" stroke="currentColor" strokeWidth={1.2} />
      <path d="M7 10h7M7 14h4" stroke="currentColor" strokeWidth={1} />
      <path d="M13 20.5h5" stroke="var(--accent)" strokeWidth={2.2} />
      <text
        x="25"
        y="23"
        fill="currentColor"
        fontFamily="Newsreader, Georgia, serif"
        fontSize="21"
        fontWeight="600"
        letterSpacing="-0.6"
      >
        Gloss
      </text>
    </svg>
  )
}
