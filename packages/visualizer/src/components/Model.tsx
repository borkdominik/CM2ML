import type { GraphModel } from '@cm2ml/ir'
import { MenubarSeparator } from '@radix-ui/react-menubar'
import { useRef } from 'react'

import { loadExample } from '../lib/exampleModel'

import type { IRGraphRef } from './IRGraph'
import { IRGraph } from './IRGraph'
import { ModelForm } from './ModelForm'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from './ui/menubar'

export interface Props {
  model: GraphModel | undefined
  setModel: (model: GraphModel | undefined) => void
}

export function Model({ model, setModel }: Props) {
  const clearModel = () => setModel(undefined)
  const graphRef = useRef<IRGraphRef>(null)
  const fit = () => graphRef.current?.fit?.()
  return (
    <div className="flex h-full flex-col">
      <div className="">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Model</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setModel(loadExample())}>
                Load Example
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={clearModel}>Close</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled={model === undefined} onClick={fit}>
                Fit
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      {model ? (
        <IRGraph model={model} ref={graphRef} />
      ) : (
        <div className="p-2">
          <ModelForm setModel={setModel} />
        </div>
      )}
    </div>
  )
}
