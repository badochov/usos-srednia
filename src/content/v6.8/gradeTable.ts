import { Average } from '../avgCalc'
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
}

export class DefaultGradesTableHandler {
  private averageRowClassName = 'average-row'
  private averageTbodyClassName = 'average-tbody'
  private averageInputClassName = 'include-in-average-checkbox'
  INCLUDE_IN_AVERAGE_TEXT = 'W średniej'
  gradesTable: HTMLElement

  private averagesTable: HTMLTableElement | null = null

  constructor() {
    this.gradesTable = this.getGradesTable()
  }

  protected getGradesTable(): HTMLElement {
    const table = document.getElementById('oceny')
    if (table === null) {
      throw new Error('Grades table not found')
    }
    return table
  }

  getPeriodGradesTables(): NodeListOf<HTMLTableSectionElement> {
    return this.gradesTable.querySelectorAll('tbody')
  }

  getPeriodNamesTables(): NodeListOf<HTMLTableSectionElement> {
    return this.gradesTable.querySelectorAll('div.ec-header')
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

  private ensureAveragesTableExists() {
    if (this.averagesTable !== null) {
      return
    }
    this.averagesTable = document.createElement('table')
    this.averagesTable.classList.add('fullwidth', 'grey')
    this.gradesTable.appendChild(this.averagesTable)
  }

  addRow(): HTMLTableRowElement {
    this.ensureAveragesTableExists()

    const tbody = document.createElement('tbody')
    tbody.classList.add(this.averageTbodyClassName)
    const row = tbody.insertRow()
    this.averagesTable?.appendChild(tbody)
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
