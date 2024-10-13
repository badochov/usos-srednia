import { DefaultGradesTableHandler as DefaultGradesTableHandlerv6_8_0 } from '../v6.8.0/gradeTable'

export class DefaultGradesTableHandler extends DefaultGradesTableHandlerv6_8_0 {
  getPeriodNames(): NodeListOf<HTMLElement> {
    return this.gradesTable.querySelectorAll('usos-frame-section')
  }
}
