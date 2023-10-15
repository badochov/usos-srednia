import { Average } from './avgCalc'

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
}

export interface ECTSInfoGetter {
  getECTSInfo(): Promise<ECTSForSubject[]>
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
  handlesCurrentVersion(): boolean
  handle(): Promise<void>
}

export interface GradeRowParser {
  parseRow(
    row: HTMLTableRowElement,
    period: string,
    tableHandler: GradesTableHandler,
  ): Grade | null
}

export interface GradeTableParser {
  parseTable(
    tableHandler: GradesTableHandler,
    gradeRowParser: GradeRowParser,
  ): Grade[]
}

export interface GradesTableHandler {
  getPeriodGradesTables(): NodeListOf<HTMLTableSectionElement>
  getPeriodNames(): NodeListOf<HTMLElement>
  isSelected(row: HTMLTableRowElement): boolean
  addCheckboxes(callback: () => void): void
  removeOld(): void
  addRow(): HTMLTableRowElement
  formatAverageRow(
    row: HTMLTableRowElement,
    avg: Promise<Average>,
    label: string,
    color?: string,
  ): void
  INCLUDE_IN_AVERAGE_TEXT: string
}
