import { MeanAverageCounter } from '../avgCalc'
import { avgHandlers } from '../avgHandlers'
import { Usos6_7Handler } from '../v6.7/handler'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'

export class Usos6_8_0Handler extends Usos6_7Handler {
  handlesVersion(version: string): boolean {
    return version.startsWith('6.8.0')
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
}
