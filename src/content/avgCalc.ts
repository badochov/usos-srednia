import { ECTSForSubject, Grade, GradePrimitive } from './types'
import { findECTSForGrade } from './utils'

export interface Average {
  avgString(): string
}

export type GradeFilter = (grade: Grade) => boolean

export interface AvgCounter {
  getAverage(
    grades: Grade[],
    gradesFilter?: GradeFilter,
    sameCodeGradeAction?: (grades: Grade[]) => Grade[],
  ): Average
}

class AbstractAverage implements Average {
  protected avg = 0

  avgString(): string {
    if(isNaN(this.avg)){
      return "-"
    }
    return this.avg.toFixed(2)
  }
}

class DefaultAverage extends AbstractAverage {
  constructor(grades: number[]) {
    super()
    this.avg = avg(grades)
  }
}

interface WeightedGrade {
  weight: number
  grade: number
}

class WeightedAverage extends AbstractAverage {
  constructor(weightedGrades: WeightedGrade[]) {
    super()
    this.avg =
      sum(weightedGrades.map(({ grade, weight }) => grade * weight)) /
      sum(weightedGrades.map(({ weight }) => weight))
  }
}

export class MeanAverageCounter {
  getAverage(
    grades: Grade[],
    gradesFilter?: GradeFilter,
    sameCodeGradeAction?: (grades: Grade[]) => Grade[],
  ): Average {
    if (gradesFilter !== undefined) {
      grades = grades.filter(gradesFilter)
    }

    if (sameCodeGradeAction !== undefined) {
      const grouppedByCode = groupByCode(grades)
      grades = grouppedByCode.flatMap((g) => sameCodeGradeAction(g))
    }
    const parsedGrades = grades.flatMap((g) => this.parseGrade(g))

    return new DefaultAverage(parsedGrades)
  }

  protected parseGrade(grade: Grade): number[] {
    return grade.grades.flatMap(this.parseGradePrimitive)
  }

  protected parseGradePrimitive(grade: GradePrimitive): number[] {
    if (grade.isDeansTwo) {
      return [2]
    }
    const grades: number[] = <number[]>(
      [grade.initialGrade, grade.finalGrade].filter((g) => g !== null)
    )
    if (grades.length === 0) {
      return []
    }
    return [avg(grades)]
  }
}

export class MaxAverageCounter {
  getAverage(
    grades: Grade[],
    gradesFilter?: GradeFilter,
    sameCodeGradeAction?: (grades: Grade[]) => Grade[],
  ): Average {
    if (gradesFilter !== undefined) {
      grades = grades.filter((g) => gradesFilter(g))
    }
    if (sameCodeGradeAction !== undefined) {
      const grouppedByCode = groupByCode(grades)
      grades = grouppedByCode.flatMap((g) => sameCodeGradeAction(g))
    }
    const parsedGrades = grades.flatMap((g) => this.parseGrade(g))

    return new DefaultAverage(parsedGrades)
  }

  protected parseGrade(grade: Grade): number[] {
    return grade.grades.flatMap(this.parseGradePrimitive)
  }

  protected parseGradePrimitive(grade: GradePrimitive): number[] {
    if (grade.isDeansTwo) {
      return [2]
    }
    const grades: number[] = <number[]>(
      [grade.initialGrade, grade.finalGrade].filter((g) => g !== null)
    )
    if (grades.length === 0) {
      return []
    }
    return [Math.max(...grades)]
  }
}

function groupByCode(grades: Grade[]): Grade[][] {
  const map = new Map<string, Grade[]>()
  for (const grade of grades) {
    if (grade.subject.code !== null) {
      const prev = map.get(grade.subject.code) ?? []
      prev.push(grade)
      map.set(grade.subject.code, prev)
    }
  }

  return Array.from(map.values())
}

export function avg(nums: number[]): number {
  return sum(nums) / nums.length
}

export function sum(nums: number[]): number {
  return nums.reduce((n, acc) => n + acc, 0)
}

export class GPA4AverageCounter {
  async getAverageAsync(
    grades: Grade[],
    ectsInfoPromise: Promise<ECTSForSubject[]>,
    gradesFilter?: GradeFilter,
    sameCodeGradeAction?: (grades: Grade[]) => Grade[],
  ): Promise<Average> {
    if (gradesFilter !== undefined) {
      grades = grades.filter(gradesFilter)
    }

    if (sameCodeGradeAction !== undefined) {
      const grouppedByCode = groupByCode(grades)
      grades = grouppedByCode.flatMap((g) => sameCodeGradeAction(g))
    }
    const ectsInfo = await ectsInfoPromise
    const parsedGrades = grades.flatMap((g) => this.parseGrade(g, ectsInfo))

    return new WeightedAverage(parsedGrades)
  }

  protected parseGrade(grade: Grade, ectsInfo: ECTSForSubject[]): WeightedGrade[] {
    const primGrades = grade.grades.flatMap(this.parseGradePrimitive)
    const gpaPoints = primGrades.map((g) => this.toGpaPoints(g))
    return gpaPoints.map((pts) => ({ grade: pts, weight: findECTSForGrade(ectsInfo, grade) ?? 0 }))
  }

  protected parseGradePrimitive(grade: GradePrimitive): number[] {
    if (grade.isDeansTwo) {
      return [2]
    }
    const grades: number[] = <number[]>(
      [grade.initialGrade, grade.finalGrade].filter((g) => g !== null)
    )
    if (grades.length === 0) {
      return []
    }
    return [avg(grades)]
  }

  protected toGpaPoints(grade: number): number {
    switch (Math.round(grade * 2)) {
      case 10:
        return 4
      case 9:
        return 3.3
      case 8:
        return 3
      case 7:
        return 2.3
      case 6:
        return 2
      case 5:
        return 1
      default:
        return 0
    }
  }
}
