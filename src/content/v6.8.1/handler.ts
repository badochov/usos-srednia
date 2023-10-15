import { MeanAverageCounter } from '../avgCalc'
import { avgHandlers } from '../avgHandlers'
import { Linkage, Subject } from '../types'
import { Usos6_8_0Handler } from '../v6.8.0/handler'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'
import { LinkageGetter } from './linkage'

export class Usos6_8_1Handler extends Usos6_8_0Handler {
  protected supportedVersions: [number, number, number][] = [[6, 8, 1], [7, 0, 0]]

  protected cellToSubject(cell: HTMLTableCellElement): Subject {
    switch (cell.childElementCount) {
      case 0: {
        const txt = cell.firstChild?.textContent?.trim() ?? ''
        const split = txt.split('[')
        const name = split[0]
        const code = split.at(1)?.split(']').at(0)?.trim() ?? null

        return { name, code }
      }
      case 1: {
        const codeSpan = cell.lastElementChild?.firstElementChild
        if (codeSpan?.nodeName === "SPAN") {
          // POLON
          const name = cell.firstChild?.textContent?.trim() ?? ''
          const code = codeSpan.textContent?.trim() ?? null

          return { name, code }
        }
        // grades
        const name = cell.firstElementChild?.textContent?.trim() ?? ''
        const codeHelper = cell.lastChild?.textContent?.trim()
        let code: string | null = null
        if (codeHelper !== undefined) {
          code = codeHelper.substring(1, codeHelper.length - 1) // remove square brackets
        }
        return { name, code }
      }
      case 2: {
        // Used in linkages.
        const name = cell.firstElementChild?.textContent?.trim() ?? ''
        const codeHelper = cell.lastElementChild?.textContent?.trim()
        let code: string | null = null
        if (codeHelper !== undefined) {
          code = codeHelper.substring(1, codeHelper.length - 1) // remove square brackets
        }

        return { name, code }
      }
      default: {
        throw new Error("unexpected cell")
      }
    }
  }

  async handle(): Promise<void> {
    return this._handle(
      new DefaultGradesTableHandler(),
      new DefaultGradeTableParser(),
      new DefaultGradeRowParser(this.cellToSubject.bind(this)),
      new MeanAverageCounter(),
      avgHandlers,
    )
  }

  protected getLinkage(): Promise<Linkage[]> {
    return new LinkageGetter(this.cellToSubject.bind(this)).getLinkage()
  }
}