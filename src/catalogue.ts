/**
 * File names are alphabetical, not pedagogical. This map holds the NCERT chapter number for
 * every chapter, and everything that lists or numbers chapters reads it, so a section page
 * cannot show Cell Cycle as chapter one when the book calls it chapter ten.
 */
export const NUMBER_OF: Record<string, number> = {
  'phy-11-ch1': 1,
  'phy-11-ch2': 2,
  'phy-11-ch3': 3,
  'phy-11-ch4': 4,
  'phy-11-ch5': 5,
  'phy-11-ch6': 6,
  'phy-11-ch7': 7,
  'phy-11-ch8': 8,
  'phy-11-ch9': 9,
  'chem-11-ch1': 1,
  'chem-11-ch2': 2,
  'chem-11-ch3': 3,
  'chem-11-bonding': 4,
  'chem-11-ch5': 5,
  'chem-11-ch6': 6,
  'chem-11-ch7': 7,
  'bio-11-ch1': 1,
  'bio-11-ch2': 2,
  'bio-11-ch3': 3,
  'bio-11-ch4': 4,
  'bio-11-ch7': 7,
  'bio-11-ch8': 8,
  'bio-11-ch9': 9,
  'bio-11-cell-cycle': 10,
}

export function numberOf(id: string): number {
  return NUMBER_OF[id] ?? 99
}

/** Orders chapters by their real number inside a subject, never by file name. */
export function inChapterOrder<T extends { id: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => numberOf(a.id) - numberOf(b.id))
}
