export interface Subject {
  name: string
  code: string | null
}

export interface Program {
  name: string | null
  stage: string | null
}

export function cellToSubject(cell: HTMLTableCellElement): Subject {
  const code = cell.lastElementChild?.textContent?.trim() || null
  let name: string
  if (cell.childElementCount == 1) {
    name = cell.firstChild?.textContent?.trim() ?? ''
  } else {
    name = cell.firstElementChild?.textContent?.trim() ?? ''
  }
  return { name, code }
}

export function getCell(
  row: HTMLTableRowElement,
  cell: number,
): HTMLTableCellElement {
  return row.cells[cell] ?? throwMissingCellError(row)
}

function throwMissingCellError(row: HTMLTableRowElement): never {
  throw new Error('row missing cells: ' + row.outerHTML)
}

export async function fetchInternalHTML(url: string): Promise<string> {
  const origin = window.location.origin
  const response = await fetch(`${origin}/${url}`)
  return response.text()
}

export function getTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}

export function programsEqual(program: Program, program2: Program) {
  return program.name === program2.name && program.stage === program2.stage
}

export function subjectsEqual(subject: Subject, subject2: Subject) {
  return subject.name === subject2.name && subject.code === subject2.code
}
