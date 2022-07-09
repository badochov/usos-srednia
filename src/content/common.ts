export interface Subject {
  name: string
  code: string | null
}

export interface Program {
  name: string | null
  stage: string | null
}

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

export function getCell(
  row: HTMLTableRowElement,
  cell: number,
): HTMLTableCellElement {
  return row.cells[cell] ?? throwMissingCellError(row)
}

function throwMissingCellError(row: HTMLTableRowElement): never {
  throw new Error('row missing cells: ' + row.outerHTML)
}
