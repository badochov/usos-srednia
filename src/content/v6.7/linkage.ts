import { Linkage, Program, Subject } from '../types'
import { fetchInternalHTML, getCell, getTemplate } from '../utils'
import { cellToSubject } from './common'


export class LinkageGetter {
  protected tableSelector = 'table.cycle'

  async getLinkage(): Promise<Linkage[]> {
    const html = await this.getLinkageHTML()
    const template = getTemplate(html)
    const rows = this.getLinkageRows(template)
    return this.parseLinkages(rows)
  }

  protected parseLinkages(rows: HTMLTableRowElement[]): Linkage[] {
    return rows.map(row => this.parseLinkage(row))
  }

  protected parseLinkage(row: HTMLTableRowElement): Linkage {
    const subject = this.parseSubject(row)
    const program = this.parseProgram(row)
    const [includeInProgram, includeInStage] = this.parseIncludeIn(row)

    return { subject, program, includeInProgram, includeInStage }
  }

  protected getLinkageRows(template: HTMLTemplateElement): HTMLTableRowElement[] {
    const tables = this.getLinkageTables(template)
    return tables.flatMap(table => this.extractRowsFromTable(table))
  }

  protected extractRowsFromTable(table: HTMLTableElement): HTMLTableRowElement[] {
    const rows: HTMLTableRowElement[] = []
    let previousSubjectCell: HTMLTableCellElement | null = null
    for (const row of Array.from(table.rows)) {
      if (row.cells.length === 8) {
        if (row.firstElementChild?.nodeName === 'TH') {
          // Filter out header row.
          continue
        }
        previousSubjectCell = row.cells[1]
        rows.push(row)
      } else if (row.cells.length === 6) {
        // Other linkage for same subject
        const rowCopy = <HTMLTableRowElement>row.cloneNode(true)
        rowCopy.insertCell(0)
        const subjectCell = rowCopy.insertCell(1)
        if (previousSubjectCell !== null) {
          subjectCell.outerHTML = previousSubjectCell.outerHTML
        }
        rows.push(rowCopy)
      }
      // Filter out helper rows.
    }
    return rows
  }

  protected getLinkageTables(template: HTMLTemplateElement): HTMLTableElement[] {
    const cycles = <NodeListOf<HTMLTableElement>>(
      template.content.querySelectorAll(this.tableSelector)
    )
    return Array.from(cycles)
  }

  protected async getLinkageHTML(): Promise<string> {
    return fetchInternalHTML(
      'kontroler.php?_action=dla_stud/studia/podpiecia/lista',
    )
  }

  protected parseSubject(row: HTMLTableRowElement): Subject {
    const cell = getCell(row, 1)
    return cellToSubject(cell)
  }

  protected parseProgram(row: HTMLTableRowElement): Program {
    if (!this.isLinkedToAnyProgram(row)) {
      return { name: null, stage: null }
    }

    const programCell = getCell(row, 3)
    const stageCell = getCell(row, 4)

    const name = programCell.textContent?.trim() ?? null
    let stage = stageCell.textContent?.trim() ?? null

    if (stage === 'BRAK') {
      stage = null
    }

    return { name, stage }
  }

  protected parseIncludeIn(row: HTMLTableRowElement): [boolean, boolean] {
    if (!this.isLinkedToAnyProgram(row)) {
      return [false, false]
    }
    const cell = getCell(row, 5)
    const text = cell.textContent?.trim() ?? '/'
    const [inProgram, inStage] = text.split('/')

    return [inProgram.trim() === 'TAK', inStage.trim() === 'TAK']
  }

  protected isLinkedToAnyProgram(row: HTMLTableRowElement): boolean {
    return row.cells.length > 3
  }
}
