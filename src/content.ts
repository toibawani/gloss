import { Chapter, type ChapterT } from './schema'

// Add a chapter by dropping a JSON file in src/content. No code changes needed.
const files = import.meta.glob('./content/**/*.json', { eager: true, import: 'default' })

export const chapters: ChapterT[] = []
export let failed = 0

for (const raw of Object.values(files)) {
  const r = Chapter.safeParse(raw)
  if (r.success) chapters.push(r.data)
  else failed++
}

chapters.sort((a, b) => a.class - b.class || a.id.localeCompare(b.id))
