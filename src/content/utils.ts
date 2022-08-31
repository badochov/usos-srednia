import { ECTSForSubject, Grade, Program, Subject } from './types'

export async function fetchInternalHTML(url: string): Promise<string> {
  const origin = window.location.origin
  const response = await fetch(`${origin}/${url}`)
  return response.text()
}

export function programsEqual(program: Program, program2: Program): boolean {
  return program.name === program2.name && program.stage === program2.stage
}

export function subjectsEqual(subject: Subject, subject2: Subject): boolean {
  return subject.name === subject2.name && subject.code === subject2.code
}

export function copyGrade(grade: Grade): Grade {
  return JSON.parse(JSON.stringify(grade))
}

export function addECTSInfo(
  grades: Grade[],
  ectsInfo: ECTSForSubject[],
): Grade[] {
  return grades.map(copyGrade).map((grade) => {
    const info = ectsInfo.find((i) => subjectsEqual(i.subject, grade.subject))
    grade.ects = info?.ects
    return grade
  })
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
