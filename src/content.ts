import { Chapter, type ChapterT } from './schema'
import index from './generated/content-index.json'

// Chapter JSON is fetched on demand, one chunk per chapter. The initial bundle only carries
// this index, so adding a thousand chapters does not grow the app shell.

export type ChapterMeta = {
  id: string
  file: string
  subject: string
  class: number
  title: string
  book: string | null
  paragraphs: number
  words: number
  first: string | null
}

export const chapterIndex = index.chapters as ChapterMeta[]

const loaders = import.meta.glob('./content/*.json')

export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

const cache = new Map<string, ChapterT>()

export function metaOf(id: string): ChapterMeta | undefined {
  return chapterIndex.find((c) => c.id === id)
}

export const subjects = [...new Set(chapterIndex.map((c) => c.subject))]

export const totalParagraphs = chapterIndex.reduce((n, c) => n + c.paragraphs, 0)

export async function loadChapter(id: string): Promise<ChapterT> {
  const hit = cache.get(id)
  if (hit) return hit
  const meta = metaOf(id)
  if (!meta) throw new ContentError('Chapter not found')
  const load = loaders[`./content/${meta.file}`]
  if (!load) throw new ContentError('Chapter file is missing from the build')
  let raw: unknown
  try {
    raw = (await load()) as { default?: unknown }
    raw = (raw as { default?: unknown }).default ?? raw
  } catch {
    throw new ContentError('Chapter could not be downloaded')
  }
  const parsed = Chapter.safeParse(raw)
  if (!parsed.success) {
    throw new ContentError('Chapter failed validation')
  }
  cache.set(id, parsed.data)
  return parsed.data
}

/** Loads only the chapters that hold review cards. */
export async function loadChapters(ids: Iterable<string>): Promise<Map<string, ChapterT>> {
  const out = new Map<string, ChapterT>()
  await Promise.all(
    [...new Set(ids)].map(async (id) => {
      try {
        out.set(id, await loadChapter(id))
      } catch {
        // A missing chapter still lets the rest of the app work.
      }
    }),
  )
  return out
}
