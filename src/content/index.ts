import { Handler } from "./types"
import { Usos6_7Handler } from "./v6.7/handler"
import { Usos6_8_0Handler } from "./v6.8.0/handler"
import { Usos6_8_1Handler } from "./v6.8.1/handler"
import { Usos7_0_0Handler } from "./v7.0.0/handler"

export type Version = [number, number, number]


// TODO add USOS 6.6.0 handler, as it's used on AGH.
// TODO add support for english version of USOS, note use HTML lang
// TODO english version URL is not recognised https://usosweb.mimuw.edu.pl/kontroler.php?_action=dla_stud%2Fstudia%2Foceny%2Findex&lang=en
// TODO add support for matching cycles to ECTS value
const handlers: Handler[] = [new Usos7_0_0Handler(), new Usos6_8_1Handler(), new Usos6_8_0Handler(), new Usos6_7Handler()] // In order from newest to oldest

function getHandler(): Handler | undefined {
  return handlers.find(h => h.handlesCurrentVersion())
}

async function main() {
  let handler = getHandler()
  if (handler === undefined) {
    // Fallback
    handler = handlers[0]
    console.warn("Couldn't find a handler for current USOSweb version!\nUsing handler for a newest supported version as a fallback.\nIf the extension doesn't work, please create an issue here: https://github.com/badochov/usos-srednia/issues.")
  }
  await handler.handle()
}

main()
