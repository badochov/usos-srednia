import { Subject } from '../types'

export function cellToSubject(cell: HTMLTableCellElement): Subject {
  const code = cell.lastElementChild?.textContent?.trim() || null
  let name: string
  if (cell.childElementCount == 1) {
    name = cell.firstChild?.textContent?.trim() ?? ''
  } else {
    name = cell.firstElementChild?.textContent?.trim() ?? ''
  }
  return { name, code }
}
