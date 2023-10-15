import { MeanAverageCounter } from '../avgCalc'
import { avgHandlers } from '../avgHandlers'
import { Subject } from '../types'
import { DefaultECTSInfoGetter } from '../v6.7/ects'
import { Usos6_7Handler } from '../v6.7/handler'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'

export class Usos6_8_0Handler extends Usos6_7Handler {
  protected supportedVersions: [number, number, number][] = [[6, 8, 0]]

  protected cellToSubject(cell: HTMLTableCellElement): Subject {
    let code: string | null = null
    let name: string
    if (cell.childElementCount === 0) {
      const txt = cell.firstChild?.textContent?.trim() ?? ''
      const split = txt.split(' ')
      name = split[0]
      if (split.length === 2) {
        // FIXME I'm preetty sure it's a bug but I don't have any way of testing it.
        code = split[0].split(']')[0]
      }
    } else {
      name = cell.firstElementChild?.textContent?.trim() ?? ''
      code = cell.lastChild?.textContent?.trim() ?? null
      code = code?.substring(1, code.length - 1) ?? null // remove square brackets
    }
    return { name, code }
  }

  async handle(): Promise<void> {
    return this._handle(
      new DefaultGradesTableHandler(),
      new DefaultGradeTableParser(),
      new DefaultGradeRowParser(this.cellToSubject.bind(this)),
      new MeanAverageCounter(),
      new DefaultECTSInfoGetter(this.cellToSubject.bind(this)),
      avgHandlers,
    )
  }
}
