import { api as buerliApi } from '@buerli.io/core'
import { ApiHistory, ApiNoHistory } from '@buerli.io/headless'
import { BuerliGeometry, useBuerli } from '@buerli.io/react'
import { GizmoHelper, GizmoViewcube, GizmoViewport } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import { CanvasContainer, ExampleLayout, Spin } from '.'
import { storeApi, useStore } from '../store'
import { Code } from './Code'
import { Resizer, useResizeStore } from './Resizer'
import { Sidebar } from './Sidebar'
import AutoClear from './canvas/AutoClear'
import { Controls } from './canvas/Controls'
import { Fit, useFit } from './canvas/Fit'
import Lights from './canvas/Lights'

export const Main: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleIds = useStore(s => s.examples.objs)
  const activeExample = useStore(s => s.activeExample)
  const drawingId = useBuerli(state => state.drawing.active)
  const busy = useStore(s => s.busy)
  const [visible, setVisible] = React.useState<boolean>(true)

  const widthCodeStore = useResizeStore(500)
  const widthCode = `${widthCodeStore[0]}px`
  const rightResizer = `${widthCodeStore[0] + 50}px`

  React.useEffect(() => {
    document.title = 'buerli-examples'
  }, [])

  return activeExample ? (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', right: 65, top: 80 }}>
        <button
          onClick={e => {
            setVisible(!visible)
          }}
          style={{ cursor: 'pointer' }}>
          {visible ? 'Hide Code' : 'Show Code'}
        </button>
      </div>
      <ExampleLayout>
        <Sidebar examples={exampleIds} onChange={v => set({ activeExample: v })} active={activeExample} />
        <CanvasContainer>
          <Canvas shadows orthographic frameloop="demand" dpr={[1, 2]} camera={{ position: [0, 0, 100], fov: 90 }}>
            <Controls makeDefault staticMoving rotateSpeed={2} />
            <Lights drawingId={drawingId} />
            <Fit>
              <Part />
            </Fit>
            <AutoClear />
            <GizmoHelper renderPriority={2} alignment="top-right" margin={[80, 80]}>
              <group scale={0.8}>
                <group scale={2.25} position={[-30, -30, -30]} rotation={[0, 0, 0]}>
                  <GizmoViewport
                    disabled
                    axisScale={[0.8, 0.02, 0.02]}
                    axisHeadScale={0.45}
                    hideNegativeAxes
                    labelColor="black"
                  />
                </group>
                <GizmoViewcube
                  font="24px Inter var, Arial, sans-serif"
                  faces={['Right', 'Left', 'Back', 'Front', 'Top', 'Bottom']}
                />
              </group>
            </GizmoHelper>
          </Canvas>
          {busy && <Spin />}
        </CanvasContainer>
        {visible && (
          <div style={{ width: widthCode }}>
            <Resizer
              style={{ right: rightResizer, top: '120px' }}
              xStore={widthCodeStore}
              xRange={{ min: 500, max: 850 }}
              xDir="-"
            />
            <CodeWrapper />
          </div>
        )}
      </ExampleLayout>
    </div>
  ) : null
}

export default Main

const Part: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleId = useStore(s => s.activeExample)
  const drawingId = useBuerli(state => state.drawing.active)
  const { update, create, getScene, getBufferGeom, cad } = useStore(s => s.examples.objs[exampleId])
  const params = useStore(s => s.examples.objs[exampleId].params)
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])
  const [scene] = React.useState(() => new THREE.Scene())
  const headlessApi = React.useRef<ApiHistory | ApiNoHistory>()
  const productOrSolidIds = React.useRef<number | number[]>(0)
  const fit = useFit(f => f.fit)
  const setAPI = useStore(s => s.setAPI)

  const onSelect = React.useCallback(() => {
    fit()
    set({ busy: false })
  }, [fit, set])

  const onResume = React.useCallback(() => {
    set({ busy: true })
  }, [set])

  React.useEffect(() => {
    headlessApi.current = null
    setMeshes([])
    set({ busy: true })

    cad.init(async api => {
      setAPI(exampleId, api)
      headlessApi.current = api
      try {
        const p = storeApi.getState().examples.objs[storeApi.getState().activeExample].params
        productOrSolidIds.current = await create(api, p, { onSelect, onResume })
        if (getBufferGeom) {
          const tempMeshes = await getBufferGeom(productOrSolidIds.current, api)
          setMeshes(tempMeshes)
        } else if (getScene) {
          const createdScene = await getScene(productOrSolidIds.current, api)
          scene.copy(createdScene)
        }
      } catch (error) {
        setMeshes([])
        console.error(error)
      } finally {
        set({ busy: false })
        fit()
      }
    })
    return () => {
      // Remove inactive drawings
      const activeDrawing = buerliApi.getState().drawing.active
      const allDrawings = buerliApi.getState().drawing.ids
      allDrawings.forEach(drawing => {
        if (activeDrawing != drawing) {
          buerliApi.getState().api.removeDrawing(drawing)
        }
      })
      scene.children = []
      // cad.destroy()
    }
  }, [cad, create, exampleId, fit, getBufferGeom, getScene, onResume, onSelect, scene, set, setAPI])

  React.useEffect(() => {
    const run = async () => {
      if (headlessApi.current && update && params) {
        set({ busy: true })
        try {
          productOrSolidIds.current = await update(headlessApi.current, productOrSolidIds.current, params)
          if (getBufferGeom) {
            const tempMeshes = await getBufferGeom(productOrSolidIds.current, headlessApi.current)
            setMeshes(tempMeshes)
          } else if (getScene) {
            const updatedScene = await getScene(productOrSolidIds.current, headlessApi.current)
            if (updatedScene) {
              scene.clear()
              scene.copy(updatedScene)
            }
          }
        } catch (error) {
          setMeshes([])
          console.error(error)
        } finally {
          set({ busy: false })
        }
      }
    }
    run()
  }, [update, params, headlessApi, set, getBufferGeom, getScene, fit, scene])

  if (getBufferGeom && meshes) {
    return (
      <group>
        {meshes.map(m => (
          <mesh key={m.uuid} {...(m as any)} />
        ))}
      </group>
    )
  } else if (getScene && scene) {
    return (
      <group>
        <primitive object={scene} />
      </group>
    )
  } else {
    return <group>{drawingId && <BuerliGeometry selection />}</group>
  }
}

const CodeWrapper: React.FC = () => {
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  return <Code fileUrl={example.fileUrl}></Code>
}
