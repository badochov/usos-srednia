import { ECTSForSubject, Subject } from '../types'
import { fetchInternalHTML, getCell, getTemplate } from '../utils'

export class ECTSInfoGetter {
  constructor(private cellToSubject: (cell: HTMLTableCellElement) => Subject) { }

  async getECTSInfo(): Promise<ECTSForSubject[]> {
    const html = await fetchInternalHTML(
      'kontroler.php?_action=dla_stud/studia/polon',
    )
    const template = getTemplate(html)
    const rows = this.getECTSInfoRows(template)
    return this.parseRows(rows)
  }

  private getECTSInfoRows(template: HTMLTemplateElement): HTMLTableRowElement[] {
    const ectsTable = this.getECTSTable(template)
    if (ectsTable === null) {
      console.error("Couldn't find ECTS table")
      return []
    }
    return Array.from(ectsTable.rows).filter((row, i) => {
      if (i === 0) {
        return false // Remove header
      }
      return !row.classList.contains('headnote') // Remove info about linkage
    })
  }

  private getECTSTable(template: HTMLTemplateElement): HTMLTableElement | null {
    return <HTMLTableElement | null>(
      template.content.querySelector('#p645138 > table:nth-child(4)')
    )
  }

  private parseRows(rows: HTMLTableRowElement[]): ECTSForSubject[] {
    return rows.map(row=>this.parseRow(row))
  }

  private parseRow(row: HTMLTableRowElement): ECTSForSubject {
    return {
      subject: this.parseSubject(row),
      ects: this.parseECTS(row),
      cycle: this.parseCycle(row),
    }
  }

  private parseSubject(row: HTMLTableRowElement): Subject {
    const subjectCell = getCell(row, 0)
    return this.cellToSubject(subjectCell)
  }

  private parseECTS(row: HTMLTableRowElement): number {
    const text = getCell(row, 2).textContent
    if (text === null) {
      throw new Error("Couldn't parse ECTS cell text")
    }
    return parseFloat(text)
  }

  private parseCycle(row: HTMLTableRowElement): string {
    const text = getCell(row, 1).textContent
    if (text === null) {
      throw new Error("Couldn't parse cycle cell text")
    }
    return text.trim()
  }
}
