/**
 * The syllabus shelf. A subject page lists its sections; a section page lists its chapters.
 * Chapters keep their NCERT chapter number, which is why a section can hold 2 and 7 without
 * renumbering anything.
 */
export type Section = {
  subject: string
  slug: string
  name: string
  blurb: string
  ids: string[]
}

export const SECTIONS: Section[] = [
  {
    subject: 'Physics',
    slug: 'units-and-measurement',
    name: 'Units and measurement',
    blurb: 'What a number means before it means anything physical: units, dimensions, errors.',
    ids: ['phy-11-ch1'],
  },
  {
    subject: 'Physics',
    slug: 'mechanics',
    name: 'Mechanics',
    blurb: 'Motion in a line, in a plane, and the laws that explain why it changes.',
    ids: ['phy-11-ch2', 'phy-11-ch3', 'phy-11-ch4', 'phy-11-ch5', 'phy-11-ch6', 'phy-11-ch7'],
  },
  {
    subject: 'Physics',
    slug: 'properties-of-matter',
    name: 'Properties of matter',
    blurb: 'How solids hold their shape and fluids do not, both described by the same pressure idea.',
    ids: ['phy-11-ch8', 'phy-11-ch9'],
  },
  {
    subject: 'Chemistry',
    slug: 'some-basic-concepts',
    name: 'Some basic concepts',
    blurb: 'Moles, formulae and the arithmetic every later chapter assumes.',
    ids: ['chem-11-ch1'],
  },
  {
    subject: 'Chemistry',
    slug: 'atomic-structure',
    name: 'Atomic structure',
    blurb: 'Light as packets, orbits as standing waves, and four numbers that describe an electron.',
    ids: ['chem-11-ch2'],
  },
  {
    subject: 'Chemistry',
    slug: 'periodicity-and-bonding',
    name: 'Periodicity and bonding',
    blurb: 'Why the table repeats, and what holds two atoms together once it does.',
    ids: ['chem-11-ch3', 'chem-11-bonding'],
  },
  {
    subject: 'Chemistry',
    slug: 'physical-chemistry',
    name: 'Physical chemistry',
    blurb: 'Energy, balance and electron transfer: thermodynamics, equilibrium and redox.',
    ids: ['chem-11-ch5', 'chem-11-ch6', 'chem-11-ch7'],
  },
  {
    subject: 'Biology',
    slug: 'diversity-in-the-living-world',
    name: 'Diversity in the living world',
    blurb: 'How life is named, sorted, and spread across five kingdoms.',
    ids: ['bio-11-ch1', 'bio-11-ch2', 'bio-11-ch3', 'bio-11-ch4'],
  },
  {
    subject: 'Biology',
    slug: 'structural-organisation',
    name: 'Structural organisation',
    blurb: 'Tissues that build organs, and the body plans animals are assembled from.',
    ids: ['bio-11-ch7'],
  },
  {
    subject: 'Biology',
    slug: 'cell-structure-and-function',
    name: 'Cell structure and function',
    blurb: 'The unit itself, the molecules inside it, and how it divides.',
    ids: ['bio-11-ch8', 'bio-11-ch9', 'bio-11-cell-cycle'],
  },
]

export function sectionsOf(subject: string): Section[] {
  return SECTIONS.filter((s) => s.subject.toLowerCase() === subject.toLowerCase())
}

export function sectionOf(subject: string, slug: string): Section | undefined {
  return sectionsOf(subject).find((s) => s.slug === slug)
}
