/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Param, Create } from '../../store'
import { setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  // Start creating your model here...
  // ...
  // ...

  return [0] // solid ids
}

export const getScene = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds)
  scene && colorize(solids)
  return scene
}

const colorize = (solids: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 67, 22)')
  setObjectColor(solids[0], customRed)
}

export const cad = new solid()

export default { create, getScene, paramsMap, cad }
