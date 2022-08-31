import { AvgCounter, MeanAverageCounter } from '../avgCalc'
import { AvgHandler, avgHandlers } from '../avgHandlers'
import { ECTSForSubject, Handler, Linkage } from '../types'
import { addECTSInfo, copyGrade } from '../utils'
import { getECTSInfo } from './ects'
import {
  DefaultGradeRowParser,
  DefaultGradeTableParser,
  GradeRowParser,
  GradeTableParser,
} from './gradeParser'
import { DefaultGradesTableHandler, GradesTableHandler } from './gradeTable'
import { getLinkage } from './linkage'

export class Usos6_8Handler implements Handler {
  handlesVersion(version: string): boolean {
    return version.startsWith('6.8')
  }

  async handle(): Promise<void> {
    return this._handle(
      new DefaultGradesTableHandler(),
      new DefaultGradeTableParser(),
      new DefaultGradeRowParser(),
      new MeanAverageCounter(),
      avgHandlers,
    )
  }

  async _handle(
    gradesTableHandler: GradesTableHandler,
    gradeTableParser: GradeTableParser,
    gradeRowParser: GradeRowParser,
    avgCounter: AvgCounter,
    avgHandlers: AvgHandler[],
  ): Promise<void> {
    const linkages = await getLinkage()
    const ectsInfo = await getECTSInfo()

    gradesTableHandler.addCheckboxes(() =>
      this.handleAverages(
        gradesTableHandler,
        gradeTableParser,
        gradeRowParser,
        avgCounter,
        linkages,
        avgHandlers,
        ectsInfo,
      ),
    )
    this.handleAverages(
      gradesTableHandler,
      gradeTableParser,
      gradeRowParser,
      avgCounter,
      linkages,
      avgHandlers,
      ectsInfo,
    )
  }

  private handleAverages(
    gradesTableHandler: GradesTableHandler,
    gradeTableParser: GradeTableParser,
    gradeRowParser: GradeRowParser,
    avgCounter: AvgCounter,
    linkages: Linkage[],
    avgHandlers: AvgHandler[],
    ectsInfo: ECTSForSubject[],
  ) {
    gradesTableHandler.removeOld()

    const grades = gradeTableParser.parseTable(
      gradesTableHandler,
      gradeRowParser,
    )
    const withEcts = addECTSInfo(grades, ectsInfo)

    for (const handler of avgHandlers) {
      const results = handler(withEcts.map(copyGrade), avgCounter, linkages)
      for (const { avg, label, color } of results) {
        const row = gradesTableHandler.addRow()
        gradesTableHandler.formatAverageRow(row, avg, label, color)
      }
    }
  }
}
