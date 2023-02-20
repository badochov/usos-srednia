import { AvgCounter, MeanAverageCounter } from '../avgCalc'
import { AvgHandler, avgHandlers } from '../avgHandlers'
import {
  ECTSForSubject,
  GradeRowParser,
  GradesTableHandler,
  GradeTableParser,
  Handler,
  Linkage,
} from '../types'
import { addECTSInfo, copyGrade } from '../utils'
import { getECTSInfo } from './ects'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'
import { LinkageGetter } from './linkage'

export class Usos6_7Handler implements Handler {
  handlesVersion(version: string): boolean {
    return version.startsWith('6.7')
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

  protected async getLinkage(): Promise<Linkage[]> {
    return new LinkageGetter().getLinkage()
  }

  protected async _handle(
    gradesTableHandler: GradesTableHandler,
    gradeTableParser: GradeTableParser,
    gradeRowParser: GradeRowParser,
    avgCounter: AvgCounter,
    avgHandlers: AvgHandler[],
  ): Promise<void> {
    const linkages = await this.getLinkage()
    const ectsInfo = await getECTSInfo()

    const averagesHandler = () =>
      this.handleAverages(
        gradesTableHandler,
        gradeTableParser,
        gradeRowParser,
        avgCounter,
        linkages,
        avgHandlers,
        ectsInfo,
      )

    gradesTableHandler.addCheckboxes(averagesHandler)
    averagesHandler()
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
