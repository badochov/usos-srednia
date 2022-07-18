import { Average } from './avgCalc'
import { getCell } from './common'

export interface GradesTableHandler {
  getPeriodGradesTables(): NodeListOf<HTMLTableSectionElement>
  getPeriodNamesTables(): NodeListOf<HTMLTableSectionElement>
  isSelected(row: HTMLTableRowElement): boolean
  addCheckboxes(callback: () => void): void
  removeOld(): void
  addRow(): HTMLTableRowElement
  formatAverageRow(
    row: HTMLTableRowElement,
    avg: Average,
    label: string,
    color?: string,
  ): void
  INCLUDE_IN_AVERAGE_TEXT: string
  gradesTable: HTMLTableElement
}

export class DefaultGradesTableHandler {
  private averageRowClassName = 'average-row'
  private averageTbodyClassName = 'average-tbody'
  private averageInputClassName = 'include-in-average-checkbox'
  INCLUDE_IN_AVERAGE_TEXT = 'W średniej'
  gradesTable: HTMLTableElement

  constructor() {
    this.gradesTable = this.getGradesTable()
  }

  protected getGradesTable(): HTMLTableElement {
    const table = document.querySelector('#layout-c22a > div > table.grey')
    if (table === null) {
      throw new Error('Grades table not found')
    }
    return <HTMLTableElement>table
  }

  getPeriodGradesTables(): NodeListOf<HTMLTableSectionElement> {
    return this.gradesTable.querySelectorAll('tbody:nth-child(even)')
  }

  getPeriodNamesTables(): NodeListOf<HTMLTableSectionElement> {
    return this.gradesTable.querySelectorAll('tbody:nth-child(odd)')
  }

  isSelected(row: HTMLTableRowElement): boolean {
    const cell = getCell(row, 4)
    return (
      cell.querySelector(`input.${this.averageInputClassName}:checked`) === null
    )
  }

  addCheckboxes(callback: () => void): void {
    const gradeTables = this.getPeriodGradesTables()
    for (const tbody of Array.from(gradeTables)) {
      for (const row of Array.from(tbody.rows)) {
        const cell = row.insertCell()
        const checkbox = document.createElement('input')
        cell.appendChild(checkbox)
        cell.style.textAlign = 'center'
        cell.style.verticalAlign = 'middle'
        checkbox.type = 'checkbox'
        checkbox.checked = true
        checkbox.onclick = () => callback()
        checkbox.classList.add(this.averageInputClassName)
      }
    }

    const labelTables = this.getPeriodNamesTables()
    for (const table of Array.from(labelTables)) {
      for (const row of Array.from(table.rows)) {
        const cell = row.insertCell()
        const span = document.createElement('span')
        cell.appendChild(span)
        span.textContent = this.INCLUDE_IN_AVERAGE_TEXT
      }
    }
  }

  formatAverageRow(
    row: HTMLTableRowElement,
    avg: Average,
    label: string,
    color?: string,
  ): void {
    const labelCell = row.insertCell()
    const avgCell = row.insertCell()
    labelCell.innerHTML = label
    avgCell.textContent = avg.toString()

    row.style.fontWeight = 'bold'
    avgCell.style.backgroundColor = labelCell.style.backgroundColor =
      color ?? '#EDFFD3'
    avgCell.style.textAlign = 'right'

    labelCell.colSpan = 2

    row.classList.add(this.averageRowClassName)
  }

  addRow(): HTMLTableRowElement {
    const tbody = document.createElement('tbody')
    tbody.classList.add(this.averageTbodyClassName)
    const row = tbody.insertRow()
    this.gradesTable.appendChild(tbody)
    return row
  }

  removeOld(): void {
    const rows = this.gradesTable.querySelectorAll(
      `tr.${this.averageRowClassName}, tbody.${this.averageTbodyClassName}`,
    )
    for (const row of Array.from(rows)) {
      row.remove()
    }
  }
}
