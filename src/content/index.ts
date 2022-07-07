function main() {
  const gradesTable = getGradesTable()
  if (gradesTable === null) {
    return
  }
  const periodTables = getPeriodTables(gradesTable)
  periodTables.forEach(handlePeriod)
  handleGlobalAverage(periodTables.values(), gradesTable)
  handleYearlyAverage(periodTables, gradesTable)
}

function handleYearlyAverage(
  periodTables: Map<string, HTMLTableSectionElement>,
  gradesTable: HTMLTableElement,
) {
  const groupped = groupPeriodTableByYear(periodTables)

  for (const [year, tables] of groupped) {
    const grades = getGradesFromIterable(tables)
    const avg = calcAverage(grades)
    appendYearRow(year, avg, gradesTable)
  }
}

function appendYearRow(
  year: string,
  avg: number,
  gradesTable: HTMLTableElement,
) {
  const row = addRowToGradesTable(gradesTable)
  formatAverageRow(row, avg, `Średnia za rok akademicki ${year}`)
}

function groupPeriodTableByYear(
  periodTables: Map<string, HTMLTableSectionElement>,
): Map<string, HTMLTableSectionElement[]> {
  const yearToTables = new Map<string, HTMLTableSectionElement[]>()

  for (const [name, tbody] of periodTables) {
    const year = getYear(name)

    const prev = yearToTables.get(year) ?? []
    prev.push(tbody)
    yearToTables.set(year, prev)
  }

  return yearToTables
}

function getYear(periodName: string): string {
  return <string>periodName.split(' ').at(-1)
}

function handleGlobalAverage(
  tables: IterableIterator<HTMLTableSectionElement>,
  gradesTable: HTMLTableElement,
) {
  const globalAverage = calcGlobalAverage(tables)

  const row = addRowToGradesTable(gradesTable)

  formatAverageRow(row, globalAverage)
}

function handlePeriod(table: HTMLTableSectionElement) {
  const avg = getAverage(table)
  const row = table.insertRow()
  formatAverageRow(row, avg)
}

function formatAverageRow(
  row: HTMLTableRowElement,
  avg: number,
  label = 'Średnia',
) {
  const labelCell = row.insertCell()
  const avgCell = row.insertCell()
  labelCell.textContent = label
  avgCell.textContent = formatAverage(avg)

  row.style.fontWeight = 'bold'
  avgCell.style.backgroundColor = labelCell.style.backgroundColor = '#EDFFD3'
  avgCell.style.textAlign = 'right'

  labelCell.colSpan = 2
}

function formatAverage(avg: number): string {
  return avg.toFixed(2)
}

function getGradesFromIterable(
  tables: Iterable<HTMLTableSectionElement>,
): number[] {
  const res: number[] = []
  for (const table of tables) {
    const grades = getGrades(table)
    res.push(...grades)
  }
  return res
}

function calcGlobalAverage(
  tables: IterableIterator<HTMLTableSectionElement>,
): number {
  const grades = getGradesFromIterable(tables)
  return calcAverage(grades)
}

function getAverage(table: HTMLTableSectionElement): number {
  const grades = getGrades(table)
  return calcAverage(grades)
}

function calcAverage(grades: number[]): number {
  const nonNan = grades.filter((g) => !isNaN(g))
  return avg(nonNan)
}

function avg(nums: number[]): number {
  const sum = nums.reduce((n, acc) => n + acc, 0)
  return sum / nums.length
}

function getGrades(table: HTMLTableSectionElement): number[] {
  const cells = getGradesCells(table)
  return Array.from(cells).map(gradeCellToNumber)
}

function gradeCellToNumber(cell: HTMLTableCellElement): number {
  const text = cell.textContent ?? ''
  const numsOnly = text.replace(/[^\d.,]/g, '')
  const normalized = numsOnly.replace(',', '.')
  return parseFloat(normalized)
}

function getGradesCells(
  table: HTMLTableSectionElement,
): NodeListOf<HTMLTableCellElement> {
  return table.querySelectorAll('tr td:nth-child(3)')
}

function addRowToGradesTable(
  gradesTable: HTMLTableElement,
): HTMLTableRowElement {
  const tbody = document.createElement('tbody')
  const row = tbody.insertRow()
  gradesTable.appendChild(tbody)
  return row
}

function getPeriodTables(
  gradesTable: HTMLTableElement,
): Map<string, HTMLTableSectionElement> {
  const periodNamesTables = <NodeListOf<HTMLTableSectionElement>>(
    gradesTable.querySelectorAll('tbody:nth-child(odd)')
  )
  const names = Array.from(periodNamesTables).map(getPeriodName)
  const periodGradesTables = <NodeListOf<HTMLTableSectionElement>>(
    gradesTable.querySelectorAll('tbody:nth-child(even)')
  )
  const ret = new Map<string, HTMLTableSectionElement>()
  for (const i in names) {
    ret.set(names[i], periodGradesTables[i])
  }
  return ret
}

function getPeriodName(table: HTMLTableSectionElement): string {
  const text = table.textContent ?? ''
  return text.trim().replace(/ - .*/g, '')
}

function getGradesTable(): HTMLTableElement | null {
  return document.querySelector('#layout-c22a > div > table.grey')
}

main()
