export interface Subject {
  name: string
  code: string | null
}

export interface Program {
  name: string | null
  stage: string | null
}

export interface GradePrimitive {
  finalGrade: number | null
  initialGrade: number | null
  isDeansTwo: boolean
  name: string | null
}

export interface Grade {
  grades: GradePrimitive[]
  subject: Subject
  programs: Program[]
  period: string
  ects?: number
}

export interface ECTSForSubject {
  subject: Subject
  ects: number
  cycle: string
}

export interface Linkage {
  subject: Subject
  program: Program
  includeInProgram: boolean
  includeInStage: boolean
}

export interface Handler {
  handlesVersion(version: string): boolean
  handle(): Promise<void>
}
