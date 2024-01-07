import { exampleModel } from '../lib/exampleModel'
import { useEncoderState } from '../lib/useEncoderState'
import { useModelState } from '../lib/useModelState'
import { useSelection } from '../lib/useSelection'
import { useSettings } from '../lib/useSettings'
import { themes, useTheme } from '../lib/useTheme'

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

// TODO: Add clear buttons for model and encoder
export function Menu() {
  return (
    <Menubar className="rounded-none border-x-0 border-t-0">
      <MenubarMenu>
        <MenubarTrigger>Model</MenubarTrigger>
        <MenubarContent>
          <LoadExampleModelMenuItem />
          <MenubarSeparator />
          <EditModelMenuItem />
          <MenubarSeparator />
          <ClearModelMenuItem />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Encoder</MenubarTrigger>
        <MenubarContent>
          <EditEncoderModelItem />
          <MenubarSeparator />
          <ClearEncoderMenuItem />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Model</MenubarSubTrigger>
            <MenubarSubContent>
              <FitGraphMenuItem />
            </MenubarSubContent>
          </MenubarSub>
          <ThemeSubMenu />
          <LayoutSubMenu />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

function LoadExampleModelMenuItem() {
  const setSerializedModel = useModelState.use.setSerializedModel()
  const setParameters = useModelState.use.setParameters()
  const setParser = useModelState.use.setParser()
  function loadExample() {
    setSerializedModel(exampleModel.serializedModel)
    setParameters(exampleModel.parameters)
    setParser(exampleModel.parser)
  }
  return <MenubarItem onClick={loadExample}>Load Example</MenubarItem>
}

function EditModelMenuItem() {
  const isEditingModel = useModelState.use.isEditing()
  const setIsEditingModel = useModelState.use.setIsEditing()
  const clearSelection = useSelection.use.clearSelection()
  const layout = useSettings.use.layout()
  return (
    <MenubarItem
      onClick={() => {
        clearSelection()
        setIsEditingModel(true)
      }}
      disabled={isEditingModel || layout !== 'compact'}
    >
      Edit
    </MenubarItem>
  )
}

function ClearModelMenuItem() {
  const serializedModel = useModelState.use.serializedModel()
  const parser = useModelState.use.parser()
  const clear = useModelState.use.clear()
  return (
    <MenubarItem
      onClick={clear}
      disabled={!serializedModel && parser === undefined}
    >
      Clear
    </MenubarItem>
  )
}

function ClearEncoderMenuItem() {
  const encoder = useEncoderState.use.encoder()
  const clear = useEncoderState.use.clear()
  return (
    <MenubarItem onClick={clear} disabled={encoder === undefined}>
      Clear
    </MenubarItem>
  )
}

function EditEncoderModelItem() {
  const isEditingEncoder = useEncoderState.use.isEditing()
  const setIsEditingEncoder = useEncoderState.use.setIsEditing()
  const layout = useSettings.use.layout()
  return (
    <MenubarItem
      onClick={() => {
        setIsEditingEncoder(true)
      }}
      disabled={isEditingEncoder || layout !== 'compact'}
    >
      Edit
    </MenubarItem>
  )
}

function FitGraphMenuItem() {
  const fitGraph = useModelState.use.fit()
  return (
    <MenubarItem disabled={fitGraph === undefined} onClick={fitGraph}>
      Fit
    </MenubarItem>
  )
}

function ThemeSubMenu() {
  const { theme, setTheme } = useTheme()
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
