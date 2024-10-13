import { GradesTableHandler } from '../types'
import {
  DefaultGradeTableParser as DefaultGradeTableParserv6_8_0,
} from '../v6.8.0/gradeParser'
export { DefaultGradeRowParser} from '../v6.8.0/gradeParser'

export class DefaultGradeTableParser extends DefaultGradeTableParserv6_8_0 {
  protected getPeriodName(
    table: HTMLElement,
    tableHandler: GradesTableHandler,
  ): string {
    let text = "";
    for (const attr of table.attributes) {
      if (attr.name === "section-title") {
        text = attr.value;
      }
    }
    const re = new RegExp(tableHandler.INCLUDE_IN_AVERAGE_TEXT, 'g')
    return text.replace(re, '').trim().replace(/ - .*/g, '')
  }
}
