import { useEffect, useState } from 'react'

import { exampleModel } from '../lib/exampleModel'
import { useEncoderState } from '../lib/useEncoderState'
import { useModelState } from '../lib/useModelState'
import { useSelection } from '../lib/useSelection'
import { useSettings } from '../lib/useSettings'

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
  const fitGraph = useModelState.use.fit()
  const setFitGraph = useModelState.use.setFit()
  const setParameters = useModelState.use.setParameters()
  const setParser = useModelState.use.setParser()
  const setSerializedModel = useModelState.use.setSerializedModel()
  const isEditingModel = useModelState.use.isEditing()
  const setIsEditingModel = useModelState.use.setIsEditing()

  const isEditingEncoder = useEncoderState.use.isEditing()
  const setIsEditingEncoder = useEncoderState.use.setIsEditing()

  const clearSelection = useSelection.use.clearSelection()
  const layout = useSettings.use.layout()

  function loadExample() {
    setSerializedModel(exampleModel.serializedModel)
    setParameters(exampleModel.parameters)
    setParser(exampleModel.parser)
  }

  return (
    <Menubar className="rounded-none">
      <MenubarMenu>
        <MenubarTrigger>Model</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={loadExample}>Load Example</MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            onClick={() => {
              clearSelection()
              setIsEditingModel(true)
              setFitGraph(undefined)
            }}
            disabled={isEditingModel || layout !== 'compact'}
          >
            Close
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Encoder</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() => {
              setIsEditingEncoder(true)
            }}
            disabled={isEditingEncoder || layout !== 'compact'}
          >
            Close
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Model</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem disabled={fitGraph === undefined} onClick={fitGraph}>
                Fit
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <ThemeSubMenu />
          <LayoutSubMenu />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const themes = ['light', 'dark'] as const

type Theme = (typeof themes)[number]

function ThemeSubMenu() {
  const body = document.getElementsByTagName('body')[0]
  const [theme, setTheme] = useState<Theme>(() =>
    body?.classList.contains('dark') ? 'dark' : 'light',
  )
  useEffect(() => {
    if (theme === 'light') {
      body?.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      body?.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }, [theme])
  return (
    <MenubarSub>
      <MenubarSubTrigger>Theme</MenubarSubTrigger>
      <MenubarSubContent>
        {themes.map((th) => (
          <MenubarItem
            disabled={th === theme}
            key={th}
            onClick={() => setTheme(th)}
          >
            <span className="capitalize">{th}</span>
          </MenubarItem>
        ))}
      </MenubarSubContent>
    </MenubarSub>
  )
}

function LayoutSubMenu() {
  const layout = useSettings.use.layout()
  const setLayout = useSettings.use.setLayout()

  const model = useModelState.use.model()
  const setIsEditingModel = useModelState.use.setIsEditing()

  const encoder = useEncoderState.use.encoder()
  const setIsEditingEncoder = useEncoderState.use.setIsEditing()

  return (
    <MenubarSub>
      <MenubarSubTrigger>Layout</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem
          disabled={layout === 'compact'}
          onClick={() => {
            setIsEditingModel(model === undefined)
            setIsEditingEncoder(encoder === undefined)
            setLayout('compact')
          }}
        >
          <span>Compact</span>
        </MenubarItem>
        <MenubarItem
          disabled={layout === 'extended'}
          onClick={() => {
            setIsEditingModel(true)
            setIsEditingEncoder(true)
            setLayout('extended')
          }}
        >
          <span>Extended</span>
        </MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}
