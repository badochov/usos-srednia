import {
  Average,
  AvgCounter,
  GPA4AverageCounter,
  MaxAverageCounter,
} from './avgCalc'
import { Grade, Linkage, Program } from './types'
import { programsEqual } from './utils'

export interface AvgData {
  label: string
  avg: Average
  color?: string
}

export type AvgHandler = (
  grades: Grade[],
  avgCounter: AvgCounter,
  linkages: Linkage[],
) => AvgData[]

// Average handlers to be run.
export const avgHandlers = new Array<AvgHandler>(
  handleGlobalAverage,
  handleProgramToGrade,
  handleProgramStageToGrade,
  handleYearlyAverage,
  handleMimSpecific,
  gpa4,
)

// DEFAULT HANDLERS

function handleProgramToGrade(
  grades: Grade[],
  avgCounter: AvgCounter,
  linkages: Linkage[],
): AvgData[] {
  const programs = getPrograms(linkages)

  const res = new Array<AvgData>()
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
    res.push({ avg, label: `Średnia za ${pName}` })
  }

  return res
}

function handleMimSpecific(
  grades: Grade[],
  _avgCounter: AvgCounter,
  _linkers: Linkage[],
): AvgData[] {
  const res = new Array<AvgData[]>()
  res.push(handleMimErasmusAverage(grades))
  res.push(handleAverageForMimCsMaster(grades))
  res.push(handleAverageForMimMathMaster(grades))

  return res.flat()
}

function handleAverageForMimMathMaster(grades: Grade[]) {
  return handleAverageForRecrutationByCodes(
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
  )
}

function handleAverageForMimCsMaster(grades: Grade[]) {
  return handleAverageForRecrutationByCodes(
    [
      '1000-211bAM1', // analiza matematyczna I
      '1000-212bAM2', // analiza matematyczna II
      '1000-211bGAL', // geometria z algebrą liniową
      '1000-211bPM', // podstawy matematyki
      '1000-211bWP', // wstęp do programowania
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
  )
}

function handleAverageForRecrutationByCodes(
  codes: string[],
  label: string,
  grades: Grade[],
): AvgData[] {
  const gradesToCount: Grade[][] = []
  let any = false
  for (const c of codes) {
    const cGrades = grades.filter(
      ({ subject: { code } }) => code !== null && code.startsWith(c),
    )
    if (cGrades.length === 0) {
      gradesToCount.push([getDeansTwoForCode(c)])
    } else {
      gradesToCount.push(cGrades)
      any = true
    }
  }

  if (!any) {
    return []
  }

  const gradesFilter = (_: Grade) => true
  const sameCodeGradeAction = (grades: Grade[]) => {
    if (grades.length === 0) {
      return []
    }
    const firstGrade = copyGrade(grades[0])
    firstGrade.grades = grades.flatMap(({ grades }) => grades)

    return [firstGrade]
  }
  const avg = new MaxAverageCounter().getAverage(
    gradesToCount.flat(),
    gradesFilter,
    sameCodeGradeAction,
  )

  return [{ avg, label }]
}

export function copyGrade(grade: Grade): Grade {
  return JSON.parse(JSON.stringify(grade))
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
  avgCounter: AvgCounter,
  linkages: Linkage[],
): AvgData[] {
  const programStages = getProgramStages(linkages)

  const res = new Array<AvgData>()
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
    res.push({ avg, label: `Średnia za ${pS.name} (${pS.stage})` })
  }
  return res
}

function handleYearlyAverage(
  grades: Grade[],
  avgCounter: AvgCounter,
  _: Linkage[],
): AvgData[] {
  const years = getYears(grades)

  const res = new Array<AvgData>()
  for (const year of years) {
    const avg = avgCounter.getAverage(grades, (grade) =>
      grade.period.includes(year),
    )
    res.push({ avg, label: `Średnia za rok akademicki ${year}` })
  }
  return res
}

function handleMimErasmusAverage(grades: Grade[]): AvgData[] {
  const avgCounter = new MaxAverageCounter()

  const avg = avgCounter.getAverage(
    grades,
    ({ subject: { code } }) => code?.startsWith('1000-') ?? false,
  )

  if (avg.isNaN()) {
    return []
  }
  return [{ avg, label: `Średnia rankingowa na ERASMUS (MIM UW)` }]
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
  avgCounter: AvgCounter,
  _: Linkage[],
): AvgData[] {
  const avg = avgCounter.getAverage(grades)
  return [{ avg, label: 'Średnia' }]
}

function gpa4(grades: Grade[], _: AvgCounter, linkages: Linkage[]): AvgData[] {
  const programs = getPrograms(linkages)

  const res = new Array<AvgData>()
  for (const pName of programs) {
    const matchingLinkages = linkages.filter(
      ({ program, includeInProgram }) =>
        program.name === pName && includeInProgram,
    )
    const matchingCodes = matchingLinkages.map(({ subject: { code } }) => code)

    const avg = new GPA4AverageCounter().getAverage(
      grades,
      ({ subject: { code }, programs }) =>
        matchingCodes.includes(code) &&
        programs.some(({ name }) => name === pName),
    )
    res.push({
      avg,
      label: `GPA za ${pName} <a href="https://github.com/badochov/usos-srednia#wyliczanie-gpa">[Szczegóły]</a>`,
    })
  }

  return res
}
