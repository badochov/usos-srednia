import { AvgCounter, MeanAverageCounter } from './avgCalc'
import { AvgHandler, avgHandlers, copyGrade } from './avgHandlers'
import {
  DefaultGradeRowParser,
  DefaultGradeTableParser,
  GradeRowParser,
  GradeTableParser,
} from './grade'
import { DefaultGradesTableHandler, GradesTableHandler } from './gradeTable'
import { getLinkage, Linkage } from './linkage'

function handleAverages(
  gradesTableHandler: GradesTableHandler,
  gradeTableParser: GradeTableParser,
  gradeRowParser: GradeRowParser,
  avgCounter: AvgCounter,
  linkages: Linkage[],
  avgHandlers: AvgHandler[],
) {
  gradesTableHandler.removeOld()

  const grades = gradeTableParser.parseTable(gradesTableHandler, gradeRowParser)

  for (const handler of avgHandlers) {
    const results = handler(grades.map(copyGrade), avgCounter, linkages)
    for (const { avg, label, color } of results) {
      const row = gradesTableHandler.addRow()
      gradesTableHandler.formatAverageRow(row, avg, label, color)
    }
  }
}

async function usosVersion6_7(
  gradesTableHandler: GradesTableHandler,
  gradeTableParser: GradeTableParser,
  gradeRowParser: GradeRowParser,
  avgCounter: AvgCounter,
  avgHandlers: AvgHandler[],
) {
  const linkages = await getLinkage()

  gradesTableHandler.addCheckboxes(() =>
    handleAverages(
      gradesTableHandler,
      gradeTableParser,
      gradeRowParser,
      avgCounter,
      linkages,
      avgHandlers,
    ),
  )
  handleAverages(
    gradesTableHandler,
    gradeTableParser,
    gradeRowParser,
    avgCounter,
    linkages,
    avgHandlers,
  )
}

async function main() {
  const version = getUsosVersion()
  if (version === undefined) {
    console.error("Couldn't determine USOSweb version")
    return
  }
  const handler = getHandlerForUsosVersion(version)
  if (handler === null) {
    console.error(`No handler for USOSweb version ${version}`)
    return
  }
  await handler()
}

function getUsosVersion(): string | undefined {
  return document.body.textContent?.match(/(?<=USOSweb )\S+/)?.at(0)
}

function getHandlerForUsosVersion(
  version: string,
): (() => Promise<void>) | null {
  if (version.startsWith('6.7')) {
    return async () =>
      usosVersion6_7(
        new DefaultGradesTableHandler(),
        new DefaultGradeTableParser(),
        new DefaultGradeRowParser(),
        new MeanAverageCounter(),
        avgHandlers,
      )
  }
  return null
}

main()
