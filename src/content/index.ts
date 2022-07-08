const includeInAverageText = 'W średniej'
const averageRowClassName = 'average-row'
const averageTbodyClassName = 'average-tbody'
const averageInputClassName = 'include-in-average-checkbox'

function main() {
  const gradesTable = getGradesTable()
  if (gradesTable === null) {
    return
  }
  addCheckboxes(gradesTable)
  handleAverages(gradesTable)
}

function handleAverages(gradesTable: HTMLTableElement) {
  removeOld(gradesTable)
  const periodTables = getPeriodTables(gradesTable)
  periodTables.forEach(handlePeriod)
  handleGlobalAverage(periodTables.values(), gradesTable)
  handleYearlyAverage(periodTables, gradesTable)
}

function removeOld(table: HTMLTableElement) {
  const rows = table.querySelectorAll(
    `tr.${averageRowClassName}, tbody.${averageTbodyClassName}`,
  )
  for (const row of Array.from(rows)) {
    row.remove()
  }
}

function addCheckboxes(table: HTMLTableElement) {
  const gradeTables = getPeriodGradesTables(table)
  for (const tbody of Array.from(gradeTables)) {
    for (const row of Array.from(tbody.rows)) {
      const cell = row.insertCell()
      const checkbox = document.createElement('input')
      cell.appendChild(checkbox)
      cell.style.textAlign = 'center'
      cell.style.verticalAlign = 'middle'
      checkbox.type = 'checkbox'
      checkbox.checked = true
      checkbox.onclick = () => handleAverages(table)
      checkbox.classList.add(averageInputClassName)
    }
  }

  const labelTables = getPeriodNamesTables(table)
  for (const table of Array.from(labelTables)) {
    for (const row of Array.from(table.rows)) {
      const cell = row.insertCell()
      const span = document.createElement('span')
      cell.appendChild(span)
      span.textContent = includeInAverageText
    }
  }
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

  row.classList.add(averageRowClassName)
}

function formatAverage(avg: number): string {
  if (isNaN(avg)) {
    return '-'
  }
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
  return [...getNormalGrades(table), ...getDeansTwos(table)]
}

function getNormalGrades(table: HTMLTableSectionElement): number[] {
  const cells = getGradesCells(table)
  return Array.from(cells).flatMap(extractGradesFromCell)
}

function getDeansTwos(table: HTMLTableSectionElement): number[] {
  const cells = getStageCells(table)
  return Array.from(cells).flatMap(extractDeansTwos)
}

function extractDeansTwos(cell: HTMLTableCellElement): number[] {
  const text = cell.textContent ?? ''
  if (isDeansTwoText(text)) {
    return [2]
  }
  return []
}

function isDeansTwoText(text: string): boolean {
  return text.includes('otrzymujesz dwóję regulaminową')
}

function extractGradesFromCell(cell: HTMLTableCellElement): number[] {
  const text = cell.textContent ?? ''
  const normalized = text.replaceAll(/,/g, '.')
  const improvedGradesRegex = /(\(\d(?:\.\d)?\)\s*)(\d(?:\.\d))/g
  const improvedGrades = normalized.matchAll(improvedGradesRegex) ?? []
  const withoutImprovedGrades = normalized.replace(improvedGradesRegex, '')
  const grades = withoutImprovedGrades.match(/\d+(\.\d+)?/g) ?? []
  const floats = []
  for (const [_, initial, improvedTo] of improvedGrades) {
    const initalTrimmed = initial.trim()
    const initialGrade = initalTrimmed.substring(1, initalTrimmed.length - 1)
    const grades = [initialGrade, improvedTo].map(parseFloat)
    floats.push(calcAverage(grades))
  }
  for (const grade of grades) {
    floats.push(parseFloat(grade))
  }
  return floats
}

function getGradesCells(
  table: HTMLTableSectionElement,
): HTMLTableCellElement[] {
  const checkboxes = table.querySelectorAll(
    `tr * input.${averageInputClassName}:checked`,
  )
  const res: HTMLTableCellElement[] = []
  for (const checkbox of Array.from(checkboxes)) {
    const row = <HTMLTableRowElement>checkbox.parentElement?.parentElement
    const cell = row.cells[2]
    res.push(cell)
  }
  return res
}

function getStageCells(table: HTMLTableSectionElement): HTMLTableCellElement[] {
  const checkboxes = table.querySelectorAll(
    `tr * input.${averageInputClassName}:checked`,
  )
  const res: HTMLTableCellElement[] = []
  for (const checkbox of Array.from(checkboxes)) {
    const row = <HTMLTableRowElement>checkbox.parentElement?.parentElement
    const cell = row.cells[1]
    res.push(cell)
  }
  return res
}

function addRowToGradesTable(
  gradesTable: HTMLTableElement,
): HTMLTableRowElement {
  const tbody = document.createElement('tbody')
  tbody.classList.add(averageTbodyClassName)
  const row = tbody.insertRow()
  gradesTable.appendChild(tbody)
  return row
}

function getPeriodTables(
  gradesTable: HTMLTableElement,
): Map<string, HTMLTableSectionElement> {
  const periodNamesTables = getPeriodNamesTables(gradesTable)
  const names = Array.from(periodNamesTables).map(getPeriodName)
  const periodGradesTables = getPeriodGradesTables(gradesTable)
  const ret = new Map<string, HTMLTableSectionElement>()
  for (const i in names) {
    ret.set(names[i], periodGradesTables[i])
  }
  return ret
}

function getPeriodGradesTables(
  gradesTable: HTMLTableElement,
): NodeListOf<HTMLTableSectionElement> {
  return gradesTable.querySelectorAll('tbody:nth-child(even)')
}

function getPeriodNamesTables(
  gradesTable: HTMLTableElement,
): NodeListOf<HTMLTableSectionElement> {
  return gradesTable.querySelectorAll('tbody:nth-child(odd)')
}

function getPeriodName(table: HTMLTableSectionElement): string {
  const text = table.textContent ?? ''
  const re = new RegExp(includeInAverageText, 'g')
  return text.replace(re, '').trim().replace(/ - .*/g, '')
}

function getGradesTable(): HTMLTableElement | null {
  return document.querySelector('#layout-c22a > div > table.grey')
}

main()
