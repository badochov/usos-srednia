import { copyGrade } from '../avgHandlers'
import { cellToSubject, getCell, getTemplate } from './common'
import { ECTSForSubject, Grade, Subject } from '../types'
import { fetchInternalHTML, subjectsEqual } from '../utils'

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

export async function getECTSInfo(): Promise<ECTSForSubject[]> {
  const html = await fetchInternalHTML(
    'kontroler.php?_action=dla_stud/studia/polon',
  )
  const template = getTemplate(html)
  const rows = getECTSInfoRows(template)
  return parseRows(rows)
}

function getECTSInfoRows(template: HTMLTemplateElement): HTMLTableRowElement[] {
  const ectsTable = getECTSTable(template)
  if (ectsTable === null) {
    console.error("Couldn't find ECTS table")
    return []
  }
  return Array.from(ectsTable.rows).filter((row, i) => {
    if (i === 0) {
      return false // Remove header
    }
    return !row.classList.contains('headnote') // Remove info about linkage
  })
}

function getECTSTable(template: HTMLTemplateElement): HTMLTableElement | null {
  return <HTMLTableElement | null>(
    template.content.querySelector('#p645138 > table:nth-child(4)')
  )
}

function parseRows(rows: HTMLTableRowElement[]): ECTSForSubject[] {
  return rows.map(parseRow)
}

function parseRow(row: HTMLTableRowElement): ECTSForSubject {
  return {
    subject: parseSubject(row),
    ects: parseECTS(row),
    cycle: parseCycle(row),
  }
}

function parseSubject(row: HTMLTableRowElement): Subject {
  const subjectCell = getCell(row, 0)
  return cellToSubject(subjectCell)
}

function parseECTS(row: HTMLTableRowElement): number {
  const text = getCell(row, 2).textContent
  if (text === null) {
    throw new Error("Couldn't parse ECTS cell text")
  }
  return parseFloat(text)
}

function parseCycle(row: HTMLTableRowElement): string {
  const text = getCell(row, 1).textContent
  if (text === null) {
    throw new Error("Couldn't parse cycle cell text")
  }
  return text.trim()
}
