import { cellToSubject, getCell, Program, Subject } from './common'

export async function getLinkage(): Promise<Linkage[]> {
  const html = await getLinkageHTML()
  const template = getTemplate(html)
  const rows = getLinkageRows(template)
  return parseLinkages(rows)
}

export interface Linkage {
  subject: Subject
  program: Program
  includeInProgram: boolean
  includeInStage: boolean
}

function parseLinkages(rows: HTMLTableRowElement[]): Linkage[] {
  return rows.map(parseLinkage)
}

function parseLinkage(row: HTMLTableRowElement): Linkage {
  const subject = parseSubject(row)
  const program = parseProgram(row)
  const [includeInProgram, includeInStage] = parseIncludeIn(row)

  return { subject, program, includeInProgram, includeInStage }
}

function getLinkageRows(template: HTMLTemplateElement): HTMLTableRowElement[] {
  const tables = getLinkageTables(template)
  return tables.flatMap((table) =>
    Array.from(table.rows).filter((_, i) => i % 2 === 1),
  )
}

function getLinkageTables(template: HTMLTemplateElement): HTMLTableElement[] {
  const cycles = <NodeListOf<HTMLTableElement>>(
    template.content.querySelectorAll('table.cycle')
  )
  return Array.from(cycles)
}

async function getLinkageHTML(): Promise<string> {
  const response = await fetch(
    'https://usosweb.mimuw.edu.pl/kontroler.php?_action=dla_stud/studia/podpiecia/lista',
  )
  return response.text()
}

function getTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}

function parseSubject(row: HTMLTableRowElement): Subject {
  const cell = getCell(row, 1)
  return cellToSubject(cell)
}

function parseProgram(row: HTMLTableRowElement): Program {
  if (!isLinkedToAnyProgram(row)) {
    return { name: null, stage: null }
  }

  const programCell = getCell(row, 3)
  const stageCell = getCell(row, 4)

  const name = programCell.textContent?.trim() ?? null
  let stage = stageCell.textContent?.trim() ?? null

  if (stage === 'BRAK') {
    stage = null
  }

  return { name, stage }
}

function parseIncludeIn(row: HTMLTableRowElement): [boolean, boolean] {
  if (!isLinkedToAnyProgram(row)) {
    return [false, false]
  }
  const cell = getCell(row, 5)
  const text = cell.textContent?.trim() ?? '/'
  const [inProgram, inStage] = text.split('/')
  console.log(text, inProgram, inStage)

  return [inProgram.trim() === 'TAK', inStage.trim() === 'TAK']
}

function isLinkedToAnyProgram(row: HTMLTableRowElement): boolean {
  return row.cells.length > 3
}
