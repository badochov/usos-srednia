import { MeanAverageCounter } from '../avgCalc'
import { avgHandlers } from '../avgHandlers'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'
import { Usos7_0_0Handler } from '../v7.0.0/handler'
import { DefaultECTSInfoGetter } from '../v7.0.0/ects'

export class Usos7_1_0Handler extends Usos7_0_0Handler {
  protected supportedVersions: [number, number, number][] = [[7, 1, 0]]

  async handle(): Promise<void> {
    if (document.documentElement.lang !== "pl") {
      console.error("Only Polish version of USOSweb is supported!")
      return
    }
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
