import { AvgCounter, MaxAverageCounter, MeanAverageCounter } from './avgCalc'
import { Program } from './common'
import {
  DefaultGradeRowParser,
  DefaultGradeTableParser,
  Grade,
  GradeRowParser,
  GradeTableParser,
} from './grade'
import { DefaultGradesTableHandler, GradesTableHandler } from './gradeTable'
import { getLinkage, Linkage } from './linkage'

async function main(
  gradesTableHandler: GradesTableHandler,
  gradeTableParser: GradeTableParser,
  gradeRowParser: GradeRowParser,
  avgCounter: AvgCounter,
) {
  const linkages = await getLinkage()

  gradesTableHandler.addCheckboxes(() =>
    handleAverages(
      gradesTableHandler,
      gradeTableParser,
      gradeRowParser,
      avgCounter,
      linkages,
    ),
  )
  handleAverages(
    gradesTableHandler,
    gradeTableParser,
    gradeRowParser,
    avgCounter,
    linkages,
  )
}

function handleAverages(
  gradesTableHandler: GradesTableHandler,
  gradeTableParser: GradeTableParser,
  gradeRowParser: GradeRowParser,
  avgCounter: AvgCounter,
  linkages: Linkage[],
) {
  gradesTableHandler.removeOld()

  const grades = gradeTableParser.parseTable(gradesTableHandler, gradeRowParser)

  handleGlobalAverage(grades, gradesTableHandler, avgCounter)
  handleProgramToGrade(grades, gradesTableHandler, avgCounter, linkages)
  handleProgramStageToGrade(grades, gradesTableHandler, avgCounter, linkages)
  handleYearlyAverage(grades, gradesTableHandler, avgCounter)
  handleMimErasmusAverage(grades, gradesTableHandler)
}

function handleProgramToGrade(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
  linkages: Linkage[],
) {
  const programs = getPrograms(linkages)

  for (const pName of programs) {
    const matchingLinkages = linkages.filter(
      ({ program, includeInProgram }) =>
        program.name === pName && includeInProgram,
    )
    const matchingCodes = matchingLinkages.map(({ subject: { code } }) => code)

    const avg = avgCounter.getAverage(
      grades,
      ({ subject: { code }, programs }) =>
        matchingCodes.includes(code) &&
        programs.some(({ name }) => name === pName),
    )
    const row = gradesTableHandler.addRow()
    gradesTableHandler.formatAverageRow(row, avg, `Średnia za ${pName}`)
  }
}

function handleProgramStageToGrade(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
  linkages: Linkage[],
) {
  const programStages = getProgramStages(linkages)

  for (const pS of programStages) {
    const matchingLinkages = linkages.filter(
      ({ program, includeInProgram, includeInStage }) =>
        programsEqual(program, pS) && includeInProgram && includeInStage,
    )
    const matchingCodes = matchingLinkages.map(({ subject: { code } }) => code)

    const avg = avgCounter.getAverage(
      grades,
      ({ subject: { code }, programs }) =>
        matchingCodes.includes(code) &&
        programs.some((program) => programsEqual(program, pS)),
    )
    const row = gradesTableHandler.addRow()
    gradesTableHandler.formatAverageRow(
      row,
      avg,
      `Średnia za ${pS.name} (${pS.stage})`,
    )
  }
}

function programsEqual(program: Program, program2: Program) {
  return program.name === program2.name && program.stage === program2.stage
}

function handleYearlyAverage(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  const years = getYears(grades)

  for (const year of years) {
    const avg = avgCounter.getAverage(grades, (grade) =>
      grade.period.includes(year),
    )
    const row = gradesTableHandler.addRow()
    gradesTableHandler.formatAverageRow(
      row,
      avg,
      `Średnia za rok akademicki ${year}`,
    )
  }
}

function handleMimErasmusAverage(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
) {
  const avgCounter = new MaxAverageCounter()

  const avg = avgCounter.getAverage(
    grades,
    ({ subject: { code } }) => code?.startsWith('1000-') ?? false,
  )

  if (avg.isNaN()) {
    return
  }

  const row = gradesTableHandler.addRow()
  gradesTableHandler.formatAverageRow(
    row,
    avg,
    `Średnia rankingowa na ERASMUS (MIM UW)`,
  )
}

function getYears(grades: Grade[]): string[] {
  const years = new Set<string>()
  for (const grade of grades) {
    years.add(getYear(grade.period))
  }
  return Array.from(years)
}

function getPrograms(linkages: Linkage[]): string[] {
  const programs = new Set<string>()
  for (const {
    program: { name },
  } of linkages) {
    if (name !== null) {
      programs.add(name)
    }
  }
  return Array.from(programs)
}

function getProgramStages(linkages: Linkage[]): Program[] {
  const programs: Program[] = []
  for (const { program } of linkages) {
    if (
      program.name !== null &&
      program.stage !== null &&
      !programPresent(program, programs)
    ) {
      programs.push(program)
    }
  }
  return programs
}

function programPresent(program: Program, programs: Program[]): boolean {
  for (const p of programs) {
    if (programsEqual(p, program)) {
      return true
    }
  }
  return false
}

function getYear(periodName: string): string {
  return <string>periodName.split(' ').at(-1)
}

function handleGlobalAverage(
  grades: Grade[],
  tableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  const avg = avgCounter.getAverage(grades)

  const row = tableHandler.addRow()
  tableHandler.formatAverageRow(row, avg, 'Średnia')
}

main(
  new DefaultGradesTableHandler(),
  new DefaultGradeTableParser(),
  new DefaultGradeRowParser(),
  new MeanAverageCounter(),
)
