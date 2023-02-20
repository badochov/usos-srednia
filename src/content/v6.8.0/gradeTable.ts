import { DefaultGradesTableHandler as DefaultGradesTableHandlerv6_7 } from '../v6.7/gradeTable'

export class DefaultGradesTableHandler extends DefaultGradesTableHandlerv6_7 {
  private averagesTable: HTMLTableElement | null = null

  constructor() {
    super()
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

  getPeriodNames(): NodeListOf<HTMLElement> {
    return this.gradesTable.querySelectorAll('div.ec-header')
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
}
