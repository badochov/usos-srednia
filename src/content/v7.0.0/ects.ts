import { ECTSForSubject, ECTSInfoGetter, Subject } from '../types'
import { fetchInternalHTML, getCell, getTemplate } from '../utils'

// TODO backport to older versions
export class DefaultECTSInfoGetter implements ECTSInfoGetter {
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
    return Array.from(this.getECTSTable(template)).
      map(table => Array.from(table.rows)).
      map(rows => rows.filter((row, i) => {
        return i !== 0 // Remove header
          && !row.classList.contains('headnote') // Remove info about linkage
      })).
      flat()
  }

  private getECTSTable(template: HTMLTemplateElement): NodeListOf<HTMLTableElement> {
    return template.content.querySelectorAll<HTMLTableElement>('.wrtext > div > table:not(:nth-child(2), .rozliczenie)')
  }

  private parseRows(rows: HTMLTableRowElement[]): ECTSForSubject[] {
    return rows.map(row => this.parseRow(row))
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
