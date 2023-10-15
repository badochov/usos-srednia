import { Average } from '../avgCalc'
import { GradesTableHandler } from '../types'
import { getCell } from '../utils'

export class DefaultGradesTableHandler implements GradesTableHandler {
  protected averageRowClassName = 'average-row'
  protected averageTbodyClassName = 'average-tbody'
  protected averageInputClassName = 'include-in-average-checkbox'
  INCLUDE_IN_AVERAGE_TEXT = 'W średniej'
  gradesTable: HTMLElement

  constructor() {
    this.gradesTable = this.getGradesTable()
  }

  protected getGradesTable(): HTMLElement {
    const table = document.querySelector('#layout-c22a > div > table.grey')
    if (table === null) {
      throw new Error('Grades table not found')
    }
    return <HTMLTableElement>table
  }

  getPeriodGradesTables(): NodeListOf<HTMLTableSectionElement> {
    return this.gradesTable.querySelectorAll('tbody:nth-child(even)')
  }

  getPeriodNames(): NodeListOf<HTMLElement> {
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
  }

  formatAverageRow(
    row: HTMLTableRowElement,
    avg: Promise<Average>,
    label: string,
    color?: string,
  ): void {
    const labelCell = row.insertCell()
    const avgCell = row.insertCell()
    labelCell.innerHTML = label
    avgCell.innerHTML = '<div class="lds-dual-ring"></div>'

    avg.
      then(a => avgCell.textContent = a.avgString()).
      catch(e => console.error(e))

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
