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
  handleMimSpecific(grades, gradesTableHandler, avgCounter)
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

function handleMimSpecific(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  handleMimErasmusAverage(grades, gradesTableHandler)
  handleAverageForMimCsMaster(grades, gradesTableHandler, avgCounter)
  handleAverageForMimMathMaster(grades, gradesTableHandler, avgCounter)
}

function handleAverageForMimMathMaster(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  return handleAverageByCodes(
    [
      '1000-111bAM1', // analiza matematyczna I.1
      '1000-112bAM2', // analiza matematyczna I.2
      '1000-113bAM3', // analiza matematyczna II.1
      '1000-114bAM4', // analiza matematyczna II.2
      '1000-111bGA1', // geometria z algebrą liniową I
      '1000-112bGA2', // geometria z algebrą liniową II
      '1000-111bWMA', // wstęp do matematyki
      '1000-111bWI1', // wstęp do informatyki
      '1000-112bWI2', // wstęp do informatyki II
      '1000-113bAG1', // algebra I
      '1000-113bTP1', // topologia I
      '1000-114bMOB', // matematyka obliczeniowa
      '1000-114bRRZ', // równania różniczkowe zwyczajne
      '1000-114bRP1', // rachunek prawdopodobieństwa I
      '1000-134FAN', // funkcje analityczne
    ],
    'Średnia rekrutacyjna na S2-MAT (MIM UW)',
    grades,
    gradesTableHandler,
    avgCounter,
    false,
    true,
  )
}

function handleAverageForMimCsMaster(
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
) {
  return handleAverageByCodes(
    [
      '1000-211bAM1', // analiza matematyczna I
      '1000-212bAM2', // analiza matematyczna II
      '1000-211bGAL', // geometria z algebrą liniową
      '1000-211bPM', // podstawy matematyki
      '1000-211bWPF', // wstęp do programowania(podejście funkcyjne)
      '1000-211bWPI', // wstęp do programowania
      '1000-212bMD', // matematyka dyskretna
      '1000-212bPO', // programowanie obiektowe
      '1000-222bIPP', // indywidualny projekt programistyczny
      '1000-213bASD', // algorytmy i struktury danych
      '1000-2N09ZBD', // bazy danych
      '1000-213bPW', // programowanie współbieżne
      '1000-214bSOB', // systemy operacyjne
      '1000-214bSIK', // sieci komputerowe
      '1000-214bWWW', // aplikacje WWW
      '1000-214bJAO', // języki, automaty i obliczenia
      '1000-214bIOP', // inżynieria oprogramowania
      '1000-213bRPS', // rachunek prawdopodobieństwa i statystyka
      '1000-223bJNP1', // języki i narzędzia programowania I
      '1000-215bBSK', // bezpieczeństwo systemów komputerowych
      '1000-215bMNU', // metody numeryczne
      '1000-215bSWP', // semantyka i weryfikacja programów
    ],
    'Średnia rekrutacyjna na S2-INF (MIM UW)',
    grades,
    gradesTableHandler,
    avgCounter,
  )
}

function handleAverageByCodes(
  codes: string[],
  label: string,
  grades: Grade[],
  gradesTableHandler: GradesTableHandler,
  avgCounter: AvgCounter,
  includeIfEmpty = false,
  prefixIsSufficient = false,
) {
  const gradesToCount: Grade[][] = []
  let any = false
  for (const c of codes) {
    const cGrades = grades.filter(({ subject: { code } }) => {
      if (code === null) return false
      if (prefixIsSufficient) {
        return codes.some((c) => c.startsWith(code))
      }
      return codes.includes(code)
    })
    if (cGrades.length === 0) {
      gradesToCount.push([getDeansTwoForCode(c)])
    } else {
      gradesToCount.push(cGrades)
      any = true
    }
  }

  if (!includeIfEmpty && !any) {
    return
  }

  const avg = avgCounter.getAverage(gradesToCount.flat())

  const row = gradesTableHandler.addRow()
  gradesTableHandler.formatAverageRow(row, avg, label)
}

function getDeansTwoForCode(code: string): Grade {
  return {
    grades: [
      {
        initialGrade: null,
        finalGrade: null,
        name: null,
        isDeansTwo: true,
      },
    ],
    subject: { name: '', code },
    programs: [],
    period: '',
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
