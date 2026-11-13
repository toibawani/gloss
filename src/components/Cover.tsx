// Subject covers, drawn on paper. One line weight, one accent, no images, no gradients.
type Subject = 'Biology' | 'Physics' | 'Chemistry' | string

const ART: Record<string, React.ReactNode> = {
  Biology: (
    <>
      <circle className="d-line" cx="62" cy="52" r="26" />
      <circle className="d-accent" cx="62" cy="46" r="8" />
      <path className="d-muted" d="M30 88c14 10 34 12 50 2M92 30c8 10 12 22 10 34" />
      <path className="d-guide" d="M96 64h28M124 64v22" />
    </>
  ),
  Physics: (
    <>
      <path className="d-line" d="M22 18v62h72" />
      <path className="d-accent" d="M26 62c12 0 16-26 28-26s18 22 30 22" />
      <circle className="d-fill" cx="54" cy="36" r="4" />
      <path className="d-muted" d="M22 46h72M46 18v62" />
      <path className="d-guide" d="M84 32h34M118 32v30" />
    </>
  ),
  Chemistry: (
    <>
      <path className="d-line" d="M50 18h24v20l18 34a8 8 0 0 1-7 12H39a8 8 0 0 1-7-12l18-34z" />
      <path className="d-muted" d="M40 62h44" />
      <circle className="d-accent" cx="54" cy="72" r="4" />
      <circle className="d-accent" cx="68" cy="78" r="4" />
      <circle className="d-line" cx="62" cy="14" r="6" />
    </>
  ),
}

export function Cover({ subject, size = 120 }: { subject: Subject; size?: number }) {
  return (
    <svg
      className="cover-art"
      width={size}
      height={(size * 110) / 160}
      viewBox="0 0 160 110"
      aria-hidden="true"
      focusable="false"
      data-subject={subject}
    >
      {ART[subject] ?? ART.Biology}
    </svg>
  )
}
