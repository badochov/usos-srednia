import { Usos6_8_1Handler } from '../v6.8.1/handler'

export class Usos7_0_0Handler extends Usos6_8_1Handler {
  handlesVersion(version: string): boolean {
    return version.startsWith('7.0.0')
  }
}
