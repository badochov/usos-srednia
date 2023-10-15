import { Handler } from "./types"
import { Usos6_7Handler } from "./v6.7/handler"
import { Usos6_8_0Handler } from "./v6.8.0/handler"
import { Usos6_8_1Handler } from "./v6.8.1/handler"

export type Version = [number, number, number]

const handlers: Handler[] = [new Usos6_8_1Handler(), new Usos6_8_0Handler(), new Usos6_7Handler()] // In order from newest to oldest

function getHandler(): Handler | undefined {
  return handlers.find(h => h.handlesCurrentVersion())
}

async function main() {
  let handler = getHandler()
  if (handler === undefined) {
    // Fallback
    handler = handlers[0]
    console.warn("Couldn't find a handler for current USOSweb version!\nUsing handler for a newest supported version as a fallback.\nIf the extension doesn't work, please create an issue here: https://github.com/badochov/usos-srednia/issues. ")
  }
  await handler.handle()
}

main()
