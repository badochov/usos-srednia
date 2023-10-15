import { AvgCounter, MeanAverageCounter } from '../avgCalc'
import { AvgHandler, avgHandlers } from '../avgHandlers'
import {
  ECTSForSubject,
  GradeRowParser,
  GradesTableHandler,
  GradeTableParser,
  Handler,
  Linkage,
  Subject,
  ECTSInfoGetter,
} from '../types'
import { copyGrade } from '../utils'
import { DefaultECTSInfoGetter } from './ects'
import { DefaultGradeRowParser, DefaultGradeTableParser } from './gradeParser'
import { DefaultGradesTableHandler } from './gradeTable'
import { LinkageGetter } from './linkage'

export class Usos6_7Handler implements Handler {
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

  handlesCurrentVersion(): boolean {
    const versionString = this.getUsosVersionString()
    if (versionString === undefined) {
      return false
    }
    const version = this.convertUsosVersion(versionString)

    return this.supportedVersions.some(
      supportedVersion => supportedVersion.every(
        (a: number, idx: number) => isNaN(a) || a === version[idx]
      )
    )
  }

  protected supportedVersions: [number, number, number][] = [[6, 7, NaN]]

  protected getUsosVersionString(): string | undefined {
    return document.body.textContent?.match(/(?<=USOSweb )\S+/)?.at(0)
  }

  protected convertUsosVersion(version: string): [number, number, number] {
    const split = version.split(".")
    const major = parseInt(split[0])
    const minor = parseInt(split[1])
    const patch = parseInt(split[2]) // May be NaN
    return [major, minor, patch]
  }

  protected async getLinkage(): Promise<Linkage[]> {
    return new LinkageGetter(this.cellToSubject.bind(this)).getLinkage()
  }

  protected cellToSubject(cell: HTMLTableCellElement): Subject {
    const code = cell.lastElementChild?.textContent?.trim() || null
    let name: string
    if (cell.childElementCount == 1) {
      name = cell.firstChild?.textContent?.trim() ?? ''
    } else {
      name = cell.firstElementChild?.textContent?.trim() ?? ''
    }
    return { name, code }
  }

  protected async _handle(
    gradesTableHandler: GradesTableHandler,
    gradeTableParser: GradeTableParser,
    gradeRowParser: GradeRowParser,
    avgCounter: AvgCounter,
    ectsIntoGetter: ECTSInfoGetter,
    avgHandlers: AvgHandler[],
  ): Promise<void> {
    const linkages = await this.getLinkage()
    const ectsInfo = ectsIntoGetter.getECTSInfo()

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
    ectsInfo: Promise<ECTSForSubject[]>,
  ) {
    gradesTableHandler.removeOld()

    const grades = gradeTableParser.parseTable(
      gradesTableHandler,
      gradeRowParser,
    )

    for (const handler of avgHandlers) {
      const results = handler(grades.map(copyGrade), avgCounter, linkages, ectsInfo)
      for (const { avg, label, color } of results) {
        const row = gradesTableHandler.addRow()
        gradesTableHandler.formatAverageRow(row, avg, label, color)
      }
    }
  }
}