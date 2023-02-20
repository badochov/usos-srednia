import { Subject } from '../types'
import { cellToSubject } from './common'
import {
  DefaultGradeRowParser as DefaultGradeRowParserv6_8_0,
  DefaultGradeTableParser as DefaultGradeTableParserv6_8_0,
} from '../v6.8.0/gradeParser'
import { getCell } from '../utils'

export class DefaultGradeRowParser extends DefaultGradeRowParserv6_8_0 {
  protected getSubject(row: HTMLTableRowElement): Subject {
    const cell = getCell(row, 0)
    return cellToSubject(cell)
  }
}

export class DefaultGradeTableParser extends DefaultGradeTableParserv6_8_0 {}
