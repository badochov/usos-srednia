import { Handler } from './types'
import { Usos6_7Handler } from './v6.7/handler'
import { Usos6_8_0Handler } from './v6.8.0/handler'
import { Usos6_8_1Handler } from './v6.8.1/handler'

const handlers: Handler[] = [new Usos6_7Handler(), new Usos6_8_0Handler(), new Usos6_8_1Handler()]

async function main() {
  const version = getUsosVersion()
  const handler = getHandlerForUsosVersion(version, handlers)
  if (handler === null) {
    return
  }
  await handler.handle()
}

function getUsosVersion(): string {
  const version = document.body.textContent?.match(/(?<=USOSweb )\S+/)?.at(0)
  if (version === undefined) {
    throw new Error("Couldn't determine USOSweb version")
  }
  return version
}

function getHandlerForUsosVersion(
  version: string,
  handlers: Handler[],
): Handler {
  for (const handler of handlers) {
    if (handler.handlesVersion(version)) {
      return handler
    }
  }
  throw new Error(`No handler for USOSweb version ${version}`)
}

main()
