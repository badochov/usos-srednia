import { MeanAverageCounter } from '../avgCalc'
import { avgHandlers } from '../avgHandlers'
import { DefaultGradeRowParser, DefaultGradeTableParser } from '../v6.8.0/gradeParser'
import { DefaultGradesTableHandler } from '../v6.8.0/gradeTable'
import { Usos6_8_1Handler } from '../v6.8.1/handler'
import { DefaultECTSInfoGetter } from './ects'

export class Usos7_0_0Handler extends Usos6_8_1Handler {
  protected supportedVersions: [number, number, number][] = [[7, 0, 0]]

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