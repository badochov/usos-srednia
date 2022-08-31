import { Program, Subject } from './types'

export async function fetchInternalHTML(url: string): Promise<string> {
  const origin = window.location.origin
  const response = await fetch(`${origin}/${url}`)
  return response.text()
}

export function programsEqual(program: Program, program2: Program): boolean {
  return program.name === program2.name && program.stage === program2.stage
}

export function subjectsEqual(subject: Subject, subject2: Subject): boolean {
  return subject.name === subject2.name && subject.code === subject2.code
}
