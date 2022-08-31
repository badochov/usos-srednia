import { Subject } from '../types'

export function cellToSubject(cell: HTMLTableCellElement): Subject {
  let code: string | null = null
  let name: string
  if (cell.childElementCount === 0) {
    const txt = cell.firstChild?.textContent?.trim() ?? ''
    const split = txt.split(' ')
    name = split[0]
    if (split.length === 2) {
      code = split[0].split(']')[0]
    }
  } else {
    name = cell.firstElementChild?.textContent?.trim() ?? ''
    code = cell.lastChild?.textContent?.trim() ?? null
    code = code?.substring(1, code.length - 1) ?? null // remove square brackets
  }
  return { name, code }
}
