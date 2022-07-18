import { cellToSubject, getCell, Program, Subject } from './common'
import { GradesTableHandler } from './gradeTable'

export interface GradePrimitive {
  finalGrade: number | null
  initialGrade: number | null
  isDeansTwo: boolean
  name: string | null
}

export interface Grade {
  grades: GradePrimitive[]
  subject: Subject
  programs: Program[]
  period: string
  ects?: number
}

export interface GradeRowParser {
  parseRow(
    row: HTMLTableRowElement,
    period: string,
    tableHandler: GradesTableHandler,
  ): Grade | null
}

export interface GradeTableParser {
  parseTable(
    tableHandler: GradesTableHandler,
    gradeRowParser: GradeRowParser,
  ): Grade[]
}

export class DefaultGradeRowParser {
  parseRow(
    row: HTMLTableRowElement,
    period: string,
    tableHandler: GradesTableHandler,
  ): Grade | null {
    if (tableHandler.isSelected(row)) {
      return null
    }
    const subject = this.getSubject(row)
    const programs = this.getPrograms(row)
    const grades = this.getGradePrimitives(row)

    return { grades, subject, programs, period }
  }

  protected getGradePrimitives(row: HTMLTableRowElement): GradePrimitive[] {
    if (this.isDeansTwo(row)) {
      return [
        { finalGrade: null, isDeansTwo: true, initialGrade: null, name: null },
      ]
    }
    const cell = getCell(row, 2)
    return Array.from(cell.children).map((d) =>
      this.getGradePromitivesFromDiv(d),
    )
  }

  protected getGradePromitivesFromDiv(gradeDiv: Element): GradePrimitive {
    const nameNode = gradeDiv.firstElementChild
    const ret: GradePrimitive = {
      name: null,
      isDeansTwo: false,
      initialGrade: null,
      finalGrade: null,
    }
    if (nameNode?.nodeName === 'A') {
      ret.name = nameNode.textContent?.trim() ?? null
    }
    const finalGradeNode = gradeDiv.lastElementChild
    if (finalGradeNode?.nodeName === 'SPAN') {
      ret.finalGrade = this.parseGrade(finalGradeNode.textContent)
    }
    const initialGradeNode = gradeDiv.lastElementChild?.previousElementSibling
    if (initialGradeNode?.nodeName === 'SPAN') {
      const text = initialGradeNode.textContent?.trim() ?? ''
      const noParentesis = text.substring(1, text.length - 1)
      ret.initialGrade = this.parseGrade(noParentesis)
    }
    return ret
  }

  protected parseGrade(gradeText: string | null): number | null {
    if (gradeText === null) {
      return null
    }
    const normalized = gradeText.replace(',', '.')
    const grade = parseFloat(normalized)
    if (isNaN(grade)) {
      return null
    }
    return grade
  }

  protected isDeansTwo(row: HTMLTableRowElement): boolean {
    const cell = getCell(row, 1)
    const text = cell.textContent ?? ''

    return text.includes('otrzymujesz dwóję regulaminową')
  }

  protected getPrograms(row: HTMLTableRowElement): Program[] {
    const cell = getCell(row, 1)
    if (cell.firstElementChild?.textContent?.trim() === '(niepodpięty)') {
      return []
    }
    const programs: Program[] = []

    for (const child of Array.from(cell.children)) {
      const programSpanText = child.firstElementChild?.textContent?.trim() ?? ''

      const split = programSpanText.split(' ')
      const name = split[0]
      let stage = null
      if (split.length === 2) {
        stage = split[1].substring(1, split[1].length - 1)
      }
      programs.push({
        name,
        stage,
      })
    }

    return programs
  }

  protected getSubject(row: HTMLTableRowElement): Subject {
    const cell = getCell(row, 0)
    return cellToSubject(cell)
  }
}

export class DefaultGradeTableParser {
  parseTable(
    tableHandler: GradesTableHandler,
    gradeRowParser: GradeRowParser,
  ): Grade[] {
    const periodTables = this.getPeriodTables(tableHandler)
    const grades: Grade[] = []
    for (const [periodName, table] of periodTables) {
      for (const row of Array.from(table.rows)) {
        const grade = gradeRowParser.parseRow(row, periodName, tableHandler)
        if (grade !== null) {
          grades.push(grade)
        }
      }
    }
    return grades
  }

  protected getPeriodTables(
    tableHandler: GradesTableHandler,
  ): Map<string, HTMLTableSectionElement> {
    const periodNamesTables = tableHandler.getPeriodNamesTables()
    const names = Array.from(periodNamesTables).map((t) =>
      this.getPeriodName(t, tableHandler),
    )
    const periodGradesTables = tableHandler.getPeriodGradesTables()
    const ret = new Map<string, HTMLTableSectionElement>()
    for (const i in names) {
      ret.set(names[i], periodGradesTables[i])
    }
    return ret
  }

  protected getPeriodName(
    table: HTMLTableSectionElement,
    tableHandler: GradesTableHandler,
  ): string {
    const text = table.textContent ?? ''
    const re = new RegExp(tableHandler.INCLUDE_IN_AVERAGE_TEXT, 'g')
    return text.replace(re, '').trim().replace(/ - .*/g, '')
  }
}
