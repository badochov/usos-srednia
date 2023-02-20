import { Program, Subject } from '../types'
import { cellToSubject } from './common'
import {
  DefaultGradeRowParser as DefaultGradeRowParserv6_7,
  DefaultGradeTableParser as DefaultGradeTableParserv6_7,
} from '../v6.7/gradeParser'
import { getCell } from '../utils'

export class DefaultGradeRowParser extends DefaultGradeRowParserv6_7 {
  protected getSubject(row: HTMLTableRowElement): Subject {
    const cell = getCell(row, 0)
    return cellToSubject(cell)
  }

  protected getPrograms(row: HTMLTableRowElement): Program[] {
    const cell = getCell(row, 1)
    if (cell.firstElementChild?.textContent?.trim() === '(niepodpięty)') {
      return []
    }
    const programs: Program[] = []

    for (const child of Array.from(cell.children)) {
      const programSpanText = child.firstChild?.textContent?.trim() ?? ''

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
}

export class DefaultGradeTableParser extends DefaultGradeTableParserv6_7 {}
