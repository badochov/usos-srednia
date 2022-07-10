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
  return tables.flatMap(extractRowsFromTable)
}

function extractRowsFromTable(table: HTMLTableElement): HTMLTableRowElement[] {
  const rows: HTMLTableRowElement[] = []
  let previousSubjectCell: HTMLTableCellElement | null = null
  for (const row of Array.from(table.rows)) {
    if (row.cells.length === 8) {
      if (row.firstElementChild?.nodeName === 'TH') {
        // Filter out header row.
        continue
      }
      previousSubjectCell = row.cells[1]
      rows.push(row)
    } else if (row.cells.length === 6) {
      // Other linkage for same subject
      const rowCopy = <HTMLTableRowElement>row.cloneNode(true)
      rowCopy.insertCell(0)
      const subjectCell = rowCopy.insertCell(1)
      if (previousSubjectCell !== null) {
        subjectCell.outerHTML = previousSubjectCell.outerHTML
      }
      rows.push(rowCopy)
    }
    // Filter out helper rows.
  }
  return rows
}

function getLinkageTables(template: HTMLTemplateElement): HTMLTableElement[] {
  const cycles = <NodeListOf<HTMLTableElement>>(
    template.content.querySelectorAll('table.cycle')
  )
  return Array.from(cycles)
}

async function getLinkageHTML(): Promise<string> {
  const response = await fetch(
    '/kontroler.php?_action=dla_stud/studia/podpiecia/lista',
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

  return [inProgram.trim() === 'TAK', inStage.trim() === 'TAK']
}

function isLinkedToAnyProgram(row: HTMLTableRowElement): boolean {
  return row.cells.length > 3
}
