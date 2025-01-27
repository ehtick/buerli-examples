import { ApiHistory, ApiNoHistory, History, Solid } from '@buerli.io/headless'
import produce from 'immer'
import create, { StoreApi } from 'zustand'
import vanillaCreate from 'zustand/vanilla'

// eslint-disable-next-line no-shadow
export enum ParamType {
  Number = 0,
  Checkbox = 1,
  Enum = 2,
  Slider = 3,
  Dropdown = 4,
  Button = 5,
}
export type Param = {
  index: number
  name: string
  type: ParamType
  value: any
  step?: any
  values?: any[]
}
export type Create = (
  api: ApiHistory | ApiNoHistory,
  params?: { lastUpdatedParam: number; values: any[] },
  options?: any,
) => Promise<number | number[]>
export type Update = (
  api: ApiHistory | ApiNoHistory,
  productId: number | number[],
  params?: { lastUpdatedParam: number; values: any[] },
) => Promise<number | number[]>

const toc: { exampleId: string; label: string; file: string }[] = [
  // solid example
  { exampleId: 'Fish', label: 'Fish', file: 'solid/fish' },
  { exampleId: 'Heart', label: 'Heart', file: 'solid/heart' },
  { exampleId: 'Lego', label: 'Lego Configurator', file: 'solid/lego' },
  { exampleId: 'StepImport 1', label: 'Step Import 1', file: 'solid/import-step' },
  { exampleId: 'StepImport 2', label: 'Step Import 2', file: 'solid/import-step-2' },
  { exampleId: 'Whiffleball', label: 'Whiffleball', file: 'solid/whiffleball' },
  { exampleId: 'Profile', label: 'Profile', file: 'solid/Profile' },
  { exampleId: 'Hackathon', label: 'Hackathon', file: 'solid/hackathon' },
  { exampleId: 'Mechanical', label: 'Mechanical', file: 'solid/machine-part' },
  { exampleId: 'Polylines1', label: 'Polylines 1', file: 'solid/polyline1' },
  { exampleId: 'Polylines2', label: 'Polylines 2', file: 'solid/polyline2' },
  { exampleId: 'Smiley', label: 'Smiley', file: 'solid/smiley' },
  { exampleId: 'WheelRim', label: 'Wheel Rim', file: 'solid/wheelRim' },

  // history example
  { exampleId: 'CreatePart', label: 'Simple Part Creator', file: 'history/CreatePart' },
  { exampleId: 'Sketch', label: 'Simple Sketch', file: 'history/Sketch' },
  { exampleId: 'Sketch 2', label: 'Simple Sketch 2', file: 'history/Sketch2' },
  { exampleId: 'Twist', label: 'Twist Feature', file: 'history/Twist' },
  { exampleId: 'CreateAsm', label: 'LBracket Creator', file: 'history/CreateAsm' },
  {
    exampleId: 'Nut-Bolt_Assembly',
    label: 'Nut-Bolt Assembler',
    file: 'history/Nut-Bolt_Assembly',
  },
  {
    exampleId: 'L-Bracket_Assembly',
    label: 'LBracket Assembler',
    file: 'history/LBracket_Assembly',
  },
  { exampleId: 'As1_Assembly', label: 'As1 Assembler', file: 'history/As1_Assembly' },
  { exampleId: 'Gripper', label: 'Gripper Configurator', file: 'history/Gripper_Example' },
  { exampleId: 'FlangePart', label: 'Flange Creator', file: 'history/FlangePrt' },
  { exampleId: 'Flange', label: 'Flange Configurator', file: 'history/FlangeConfigurator' },
  { exampleId: 'FlangeAsm', label: 'Flange Assembler', file: 'history/FlangeAsm' },
  { exampleId: 'RollerAsm', label: 'FMS Roller Configurator', file: 'history/RollerAssembly' },
  { exampleId: 'Wireway', label: 'Wireway Configurator', file: 'history/WirewayAssembly' },
  { exampleId: 'Shadowbox', label: 'Shadowbox Configurator', file: 'history/Shadowbox' },
  { exampleId: 'Wall', label: 'Wall Configurator', file: 'history/SwissProperty' },
  { exampleId: 'RobotArm', label: 'Robot Configurator', file: 'history/Robot6Axis_FC' },
  { exampleId: 'MechanicalAssembly', label: 'Mechanical Simulation', file: 'history/MechanicalAssembly' },
  { exampleId: 'MechanicalAssembly2', label: 'Mechanical Simulation 2', file: 'history/MechanicalAssembly2' },
  { exampleId: 'MechanicalAssembly3', label: 'Mechanical Simulation 3', file: 'history/MechanicalAssembly3' },
  { exampleId: 'GantryRobot', label: 'Gantry Robot', file: 'history/GantryRobot' },
  { exampleId: 'CaseAssembly', label: 'Case Configurator', file: 'history/CaseAssembly' },
]

const storeApi = vanillaCreate<State>(set => ({
  activeExample: '',
  examples: { ids: [], objs: {} },
  set,
  setParam: (exampleId: string, paramIndex: number, paramValue: number | boolean | string) => {
    set(state =>
      produce(state, draft => {
        draft.examples.objs[exampleId].params!.values[paramIndex] = paramValue
        draft.examples.objs[exampleId].params!.lastUpdatedParam = paramIndex
      }),
    )
  },
  setAPI: (exampleId: string, api: ApiHistory | ApiNoHistory | null) => {
    set(state =>
      produce(state, draft => {
        if (!api) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete draft.examples.objs[exampleId].api
        } else {
          draft.examples.objs[exampleId].api = api
        }
      }),
    )
  },
}))

const useStore = create(storeApi)

export { storeApi, useStore }

const initExamples = async () => {
  const examples: Record<string, Example> = {}
  for (const t of toc) {
    // console.info(t.exampleId)
    const example = await import(`./models/${t.file}`)
    examples[t.exampleId] = {
      label: t.label,
      fileUrl: `/models/${t.file}.ts`,
      params: { lastUpdatedParam: -1, values: example.paramsMap.map((p: any) => p.value) },
      ...example,
    }
  }
  storeApi.getState().set(state => ({
    ...state,
    examples: { ids: Object.keys(examples), objs: examples },
    activeExample: toc[0].exampleId,
  }))
}
initExamples()

// *****************************************
// TYPES
// *****************************************
type State = Readonly<{
  activeExample: string
  examples: { ids: string[]; objs: Record<string, Example> }
  busy?: boolean
  set: StoreApi<State>['setState']
  setParam: (exampleId: string, paramIndex: number, paramValue: number | boolean | string) => void
  setAPI: (exampleId: string, api: ApiHistory | ApiNoHistory | null) => void
}>

export type Example = {
  label: string
  create: Create
  update?: Update
  getScene?: (productOrSolidId: number | number[], api: ApiHistory | ApiNoHistory) => any
  getBufferGeom?: (productOrSolidId: number | number[], api: ApiHistory | ApiNoHistory) => any
  fileUrl?: string
  params?: { lastUpdatedParam: number; values: any[] }
  paramsMap: Param[]
  cad: History | Solid
  api: ApiHistory | ApiNoHistory | null
}
