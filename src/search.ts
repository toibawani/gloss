type Entry = { c: string; p: string; t: string; k: string; w: string[]; s: string }

let cache: Entry[] | null = null

async function entries(): Promise<Entry[]> {
  if (cache) return cache
  const mod = (await import('./generated/search-index.json')) as unknown as { default?: { entries: Entry[] } }
  const data = mod.default ?? (mod as unknown as { entries: Entry[] })
  cache = data.entries ?? []
  return cache
}

export type Hit = { chapter: string; paragraph: string; title: string; phrase: string; snippet: string; term?: string }

const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

export async function search(query: string, limit = 30): Promise<Hit[]> {
  const q = normalise(query)
  if (q.length < 2) return []
  const list = await entries()
  const hits: (Hit & { score: number })[] = []
  for (const e of list) {
    const phrase = normalise(e.k)
    const terms = e.w.map(normalise)
    const meaning = normalise(e.s)
    let score = 0
    let term: string | undefined
    if (phrase.includes(q)) score += 6
    const at = terms.findIndex((t) => t.includes(q))
    if (at >= 0) {
      score += 5
      term = e.w[at]
    }
    if (meaning.includes(q)) score += 2
    if (normalise(e.t).includes(q)) score += 1
    if (score > 0) hits.push({ chapter: e.c, paragraph: e.p, title: e.t, phrase: e.k, snippet: e.s, term, score })
  }
  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ score: _score, ...h }) => h)
}
