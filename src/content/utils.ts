import { ECTSForSubject, Grade, Program, Subject } from './types'

async function defaultWaitNextRetry(): Promise<boolean> {
  await new Promise(res => setTimeout(res, 5 * 1000))
  return true
}

export async function fetchInternalHTML(url: string, waitNextRetry: ((i: number) => Promise<boolean>) = defaultWaitNextRetry): Promise<string> {
  const origin = window.location.origin
  const uri = `${origin}/${url}`

  let i = 0;
  do {
    try {
      const response = await fetch(uri)
      if (response.ok) {
        return response.text()
      }
    } catch (e) {
      console.error(e)
    }
    i++
  } while (await waitNextRetry(i))

  throw new Error(`Couldn't fetch ${uri}`)
}

export function programsEqual(program: Program, program2: Program): boolean {
  return program.name === program2.name && program.stage === program2.stage
}

export function subjectsEqual(subject: Subject, subject2: Subject): boolean {
  return subject.name === subject2.name && subject.code === subject2.code
}

export function findECTSForGrade(ectsInfo: ECTSForSubject[], grade: Grade): number | undefined {
  const info = ectsInfo.find((i) => subjectsEqual(i.subject, grade.subject))
  return info?.ects
}

export function copyGrade(grade: Grade): Grade {
  return JSON.parse(JSON.stringify(grade))
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

export function getTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}
