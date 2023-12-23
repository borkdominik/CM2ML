import { loadExample } from '../lib/exampleModel'
import { useAppState } from '../lib/useAppState'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './ui/menubar'

export function Menu() {
  const { clearEncoder, clearModel, fitGraph, model, setModel } = useAppState()
  return (
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
        <MenubarTrigger>Encoder</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={clearEncoder}>Close</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Model</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem disabled={model === undefined} onClick={fitGraph}>
                Fit
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
