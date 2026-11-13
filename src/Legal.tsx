const Draft = () => (
  <p className="note">Draft. These pages are plain-language drafts and need review by a lawyer before launch.</p>
)

export function Terms() {
  return (
    <article className="prose">
      <h2>Terms of Service</h2>
      <Draft />
      <p>Gloss is a study aid. It explains NCERT paragraphs in original words. It does not replace the textbook, a teacher or your own checking.</p>
      <p>Some content is marked Draft. Draft means it has not been checked by a subject expert yet. Check facts against your NCERT edition before an exam.</p>
      <p>Gloss is not affiliated with or endorsed by NCERT. NCERT text belongs to NCERT. Gloss only points to it with short references.</p>
      <p>The app is provided as it is, with no promise that it is free of mistakes or always available. Do not copy or resell the explanations without permission.</p>
      <p>Questions or corrections: open an issue at github.com/toibawani/gloss/issues.</p>
    </article>
  )
}

export function Privacy() {
  return (
    <article className="prose">
      <h2>Privacy Policy</h2>
      <Draft />
      <p>Gloss collects no personal data. There are no accounts, no names, no emails and no phone numbers.</p>
      <p>Your progress, opened words and revision schedule are saved only in your own browser, on your own device. They are never sent to us. Clearing your browser data removes them.</p>
      <p>Gloss has no ads, no trackers and no analytics. The website host may keep standard technical logs such as IP addresses, under its own policy.</p>
      <p>Many Gloss users are under 18. If accounts or sync are ever added, we will ask for verifiable parental consent as India&apos;s Digital Personal Data Protection Act 2023 requires, and have this policy reviewed first.</p>
    </article>
  )
}
