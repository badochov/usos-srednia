import { MeanAverageCounter } from '../avgCalc'
import { avgHandlers } from '../avgHandlers'
import { Linkage } from '../types'
import { Usos6_8_0Handler } from '../v6.8.0/handler'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'
import { LinkageGetter } from './linkage'

export class Usos6_8_1Handler extends Usos6_8_0Handler {
  handlesVersion(version: string): boolean {
    return version.startsWith('6.8.1')
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
}
