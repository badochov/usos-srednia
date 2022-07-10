import { Grade, GradePrimitive } from './grade'

export interface Average {
  get(): number
  isNaN(): boolean
  toString(): string
}

export type GradeFilter = (grade: Grade) => boolean

export interface AvgCounter {
  getAverage(grades: Grade[], gradesFilter?: GradeFilter): Average
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
  getAverage(grades: Grade[], gradesFilter?: GradeFilter): Average {
    if (gradesFilter !== undefined) {
      grades = grades.filter(gradesFilter)
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
  getAverage(grades: Grade[], gradesFilter?: GradeFilter): Average {
    if (gradesFilter !== undefined) {
      grades = grades.filter(gradesFilter)
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

export function avg(nums: number[]): number {
  const sum = nums.reduce((n, acc) => n + acc, 0)
  return sum / nums.length
}
