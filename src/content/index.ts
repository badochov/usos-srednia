import { AvgCounter, ClassicAverageCounter } from './avgCalc'
import {
  DefaultGradeRowParser,
  DefaultGradeTableParser,
  Grade,
  GradeRowParser,
  GradeTableParser,
  Program,
} from './grade'
import { DefaultGradesTableHandler, GradesTableHandler } from './gradeTable'

function main(
  gradesTableHandler: GradesTableHandler,
  gradeTableParser: GradeTableParser,
  gradeRowParser: GradeRowParser,
  avgCounter: AvgCounter,
) {
  gradesTableHandler.addCheckboxes(() =>
    handleAverages(
      gradesTableHandler,
      gradeTableParser,
      gradeRowParser,
      avgCounter,
    ),
  )
  handleAverages(
    gradesTableHandler,
    gradeTableParser,
    gradeRowParser,
    avgCounter,
  )
}

function handleAverages(
  gradesTableHandler: GradesTableHandler,
  gradeTableParser: GradeTableParser,
  gradeRowParser: GradeRowParser,
  avgCounter: AvgCounter,
) {
  gradesTableHandler.removeOld()

  const grades = gradeTableParser.parseTable(gradesTableHandler, gradeRowParser)

  handleGlobalAverage(grades, gradesTableHandler, avgCounter)
  handleProgramToGrade(grades, gradesTableHandler, avgCounter)
  handleProgramStageToGrade(grades, gradesTableHandler, avgCounter)
  handleYearlyAverage(grades, gradesTableHandler, avgCounter)
}

function handleProgramToGrade(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  const programs = getPrograms(grades)

  for (const program of programs) {
    handleAllForProgram(program, grades, gradesTableHandler, avgCounter)
    handleStageForProgram(program, grades, gradesTableHandler, avgCounter)
  }
}

function handleProgramStageToGrade(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  const programStages = getProgramStages(grades)

  for (const pS of programStages) {
    const avg = avgCounter.getAverage(grades, ({ program }) =>
      programsEqual(pS, program),
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

function handleAllForProgram(
  program: string,
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  const avg = avgCounter.getAverage(
    grades,
    (grade) => grade.program.name === program,
  )
  const row = gradesTableHandler.addRow()
  gradesTableHandler.formatAverageRow(row, avg, `Średnia za ${program}`)
}

function handleStageForProgram(
  program: string,
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  const avg = avgCounter.getAverage(
    grades,
    (grade) => grade.program.name === program && grade.program.stage !== null,
  )
  const row = gradesTableHandler.addRow()
  gradesTableHandler.formatAverageRow(
    row,
    avg,
    `Średnia za podpięcia pod etap w ${program}`,
  )
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

function getYears(grades: Grade[]): string[] {
  const years = new Set<string>()
  for (const grade of grades) {
    years.add(getYear(grade.period))
  }
  return Array.from(years)
}

function getPrograms(grades: Grade[]): string[] {
  const programs = new Set<string>()
  for (const grade of grades) {
    const name = grade.program.name
    if (name !== null) {
      programs.add(name)
    }
  }
  return Array.from(programs)
}

function getProgramStages(grades: Grade[]): Program[] {
  const programs: Program[] = []
  for (const { program } of grades) {
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
  new ClassicAverageCounter(),
)
