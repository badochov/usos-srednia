import {
  Average,
  AvgCounter,
  GPA4AverageCounter,
  MaxAverageCounter,
} from './avgCalc'
import { ECTSForSubject, Grade, Linkage, Program } from './types'
import { copyGrade, programsEqual } from './utils'

export interface AvgData {
  label: string
  avg: Promise<Average>
  color?: string
}

export type AvgHandler = (
  grades: Grade[],
  avgCounter: AvgCounter,
  linkages: Linkage[],
  ectsInfo: Promise<ECTSForSubject[]>,
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
        includeInProgram && program.name === pName,
    )
    const matchingCodes = matchingLinkages.map(({ subject: { code } }) => code)

    const avg = avgCounter.getAverage(
      grades,
      ({ subject: { code }, programs }) =>
        matchingCodes.includes(code) &&
        programs.some(({ name }) => name === pName),
    )
    res.push({ avg: new Promise(res => res(avg)), label: `Średnia za ${pName}` })
  }

  return res
}

function handleMimSpecific(grades: Grade[]): AvgData[] {
  if (window.location.hostname === "usosweb.mimuw.edu.pl/") {
    return [];
  }
  const res = new Array<AvgData[]>()
  res.push(handleMimErasmusAverage(grades))
  res.push(handleAverageForMimCsMaster(grades))
  res.push(handleAverageForMimMathMaster(grades))

  return res.flat()
}

function handleAverageForMimMathMaster(grades: Grade[]) {
  return handleAverageForRecrutationByCodes(
    [
      '1000-111bAM1a', // analiza matematyczna I.1
      '1000-111bAM1b', // analiza matematyczna I.1
      '1000-112bAM2a', // analiza matematyczna I.2
      '1000-112bAM2b', // analiza matematyczna I.2
      '1000-112bAM2*', // analiza matematyczna I.2
      '1000-113bAM3a', // analiza matematyczna II.1
      '1000-113bAM3*', // analiza matematyczna II.1
      '1000-114bAM4a', // analiza matematyczna II.2
      '1000-114bAM4*', // analiza matematyczna II.2
      '1000-111bGA1a', // geometria z algebrą liniową I
      '1000-111bGA1b', // geometria z algebrą liniową I
      '1000-112bGA2*', // geometria z algebrą liniową II
      '1000-112bGA2a', // geometria z algebrą liniową II
      '1000-112bGA2b', // geometria z algebrą liniową II
      '1000-111ADM1', // Algebra dla MSEM I 
      '1000-112ADM2', // Algebra dla MSEM I 
      '1000-111bWMAa', // wstęp do matematyki
      '1000-111bWMAb', // wstęp do matematyki
      '1000-211bPM', // podstawy matematyki
      '1000-111bWI1a', // wstęp do informatyki
      '1000-111bWI1b', // wstęp do informatyki
      '1000-112bWI2a', // wstęp do informatyki II
      '1000-112bWI2b', // wstęp do informatyki II
      '1000-113bAG1a', // algebra I
      '1000-113bAG1*', // algebra I
      '1000-113bTP1a', // topologia I
      '1000-113bTP1*', // topologia I
      '1000-215bMNU', // metody numeryczne
      '1000-114bMOBa', // matematyka obliczeniowa
      '1000-114bMOB*', // matematyka obliczeniowa
      '1000-114bRRZa', // równania różniczkowe zwyczajne
      '1000-114bRRZb', // równania różniczkowe zwyczajne
      '1000-114bRP1a', // rachunek prawdopodobieństwa I
      '1000-114bRP1*', // rachunek prawdopodobieństwa I
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
      '1000-111bAM1a', // analiza matematyczna I.1
      '1000-111bAM1b', // analiza matematyczna I.1
      '1000-112bAM2a', // analiza matematyczna I.2
      '1000-112bAM2b', // analiza matematyczna I.2
      '1000-112bAM2*', // analiza matematyczna I.2
      '1000-211bGAL', // geometria z algebrą liniową
      '1000-111bGA1a', // geometria z algebrą liniową I
      '1000-111bGA1b', // geometria z algebrą liniową I
      '1000-111ADM1', // Algebra dla MSEM I 
      '1000-211bPM', // podstawy matematyki
      '1000-111bWMAa', // wstęp do matematyki
      '1000-111bWMAb', // wstęp do matematyki
      '1000-212bAM2', // analiza matematyczna II
      '1000-113bAM3a', // analiza matematyczna II.1
      '1000-113bAM3*', // analiza matematyczna II.1
      '1000-211bWPI', // wstęp do programowania
      '1000-211bWPF', // wstęp do programowania
      '1000-212bMD', // matematyka dyskretna
      '1000-212bPO', // programowanie obiektowe
      '1000-222bIPP', // indywidualny projekt programistyczny
      '1000-213bASD', // algorytmy i struktury danych
      '1000-2N09ZBD', // bazy danych
      '1000-213bPW', // programowanie współbieżne
      '1000-214bSOB', // systemy operacyjne
      '1000-214b', // systemy operacyjne
      '1000-214bSIK', // sieci komputerowe
      '1000-214bWWW', // aplikacje WWW
      '1000-214bJAO', // języki, automaty i obliczenia
      '1000-214bIOP', // inżynieria oprogramowania
      '1000-213bRPS', // rachunek prawdopodobieństwa i statystyka
      '1000-114bRP1', // Rachunek prawdopodobieństwa I
      '1000-114bRP1*', // Rachunek prawdopodobieństwa I
      '1000-135ST1', // Statystyka I
      '1000-115ST1', // Statystyka I 
      '1000-714SAD', // Statystyczna analiza danych
      '1000-223bJNP1', // języki i narzędzia programowania I
      '1000-215bBSK', // bezpieczeństwo systemów komputerowych
      '1000-215bMNU', // metody numeryczne
      '1000-114bMOBa', // Matematyka obliczeniowa
      '1000-114bMOB*', // Matematyka obliczeniowa
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
  for (const c of codes) {
    const cGrades = grades.filter(
      ({ subject: { code } }) => code === c,
    )
    if (cGrades.length > 0) {
      gradesToCount.push(cGrades)
    }
  }

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
    undefined,
    sameCodeGradeAction,
  )

  return [{ avg: new Promise(res => res(avg)), label }]
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
    res.push({ avg: new Promise(res => res(avg)), label: `Średnia za ${pS.name} (${pS.stage})` })
  }
  return res
}

function handleYearlyAverage(
  grades: Grade[],
  avgCounter: AvgCounter,
): AvgData[] {
  const years = getYears(grades)

  const res = new Array<AvgData>()
  for (const year of years) {
    const avg = avgCounter.getAverage(grades, (grade) =>
      grade.period.includes(year),
    )
    res.push({ avg: new Promise(res => res(avg)), label: `Średnia za rok akademicki ${year}` })
  }
  return res
}

function handleMimErasmusAverage(grades: Grade[]): AvgData[] {
  const avgCounter = new MaxAverageCounter()

  const avg = avgCounter.getAverage(
    grades,
    ({ subject: { code } }) => code?.startsWith('1000-') ?? false,
  )

  return [{ avg: new Promise(res => res(avg)), label: `Średnia rankingowa na ERASMUS (MIM UW)` }]
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
): AvgData[] {
  const avg = avgCounter.getAverage(grades)
  return [{ avg: new Promise(res => res(avg)), label: 'Średnia' }]
}

function gpa4(grades: Grade[], _: AvgCounter, linkages: Linkage[], ectsInfo: Promise<ECTSForSubject[]>): AvgData[] {
  const programs = getPrograms(linkages)

  const res = new Array<AvgData>()
  for (const pName of programs) {
    const matchingLinkages = linkages.filter(
      ({ program, includeInProgram }) =>
        program.name === pName && includeInProgram,
    )
    const matchingCodes = matchingLinkages.map(({ subject: { code } }) => code)

    const avg = new GPA4AverageCounter().getAverageAsync(
      grades,
      ectsInfo,
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
