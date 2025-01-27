/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiNoHistory, Solid } from '@buerli.io/headless'
import { Param, Create } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  // Start creating your model here...
  // ...
  // ...

  return [0] // solid ids
}

export const cad = new Solid()

export default { create, paramsMap, cad }
