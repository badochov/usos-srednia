import { Subject } from '../types'

export function cellToSubject(cell: HTMLTableCellElement): Subject {
  switch (cell.childElementCount) {
    case 0: {
      const txt = cell.firstChild?.textContent?.trim() ?? ''
      const split = txt.split(' ')
      const name = split[0]
      let code: string | null = null
      if (split.length === 2) {
        // FIXME I'm preetty sure it's a bug but I don't have any way of testing it.
        code = split[0].split(']')[0]
      }
      return { name, code }
    }
    case 1: {
      const name = cell.firstElementChild?.textContent?.trim() ?? ''
      const codeHelper = cell.lastChild?.textContent?.trim()
      const code = codeHelper?.substring(1, codeHelper.length - 1) ?? null // remove square brackets

      return { name, code }
    }
    case 2: {
      const name = cell.firstElementChild?.textContent?.trim() ?? ''
      const codeHelper = cell.lastElementChild?.textContent?.trim()
      const code = codeHelper?.substring(1, codeHelper.length - 1) ?? null // remove square brackets

      return { name, code }
    }
    default: {
      throw new Error("unexpected cell")
    }
  }
}
