import { Grade, GradePrimitive } from './grade'

export interface Average {
  get(): number
  isNaN(): boolean
  toString(): string
}

export type GradeFilter = (grade: Grade) => boolean

export interface AvgCounter {
  getAverage(
    grades: Grade[],
    gradesFilter?: GradeFilter,
    sameCodeGradeAction?: (grades: Grade[]) => Grade[],
  ): Average
}

class DefaultAverage {
  private avg: number

  constructor(grades: number[]) {
    this.avg = avg(grades)
  }

  get(): number {
    return this.avg
  }

  isNaN(): boolean {
    return isNaN(this.avg)
  }

  toString(): string {
    if (isNaN(this.avg)) {
      return '-'
    }
    return this.avg.toFixed(2)
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
    console.log(parsedGrades)

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
  console.log(grades)
  const map = new Map<string, Grade[]>()
  for (const grade of grades) {
    if (grade.subject.code !== null) {
      console.log(JSON.parse(JSON.stringify(map)))
      const prev = map.get(grade.subject.code) ?? []
      prev.push(grade)
      console.log(prev)
      map.set(grade.subject.code, prev)
    }
  }
  console.log(map)

  return Array.from(map.values())
}

export function avg(nums: number[]): number {
  const sum = nums.reduce((n, acc) => n + acc, 0)
  return sum / nums.length
}
