import { GitHubLogoIcon } from '@radix-ui/react-icons'

import type { PreparedExample } from '../lib/exampleModel'
import { exampleModels } from '../lib/exampleModel'
import { useShare } from '../lib/sharing'
import { useEncoderState } from '../lib/useEncoderState'
import { useModelState } from '../lib/useModelState'
import { useSelection } from '../lib/useSelection'
import { useSettings } from '../lib/useSettings'
import { themes, useTheme } from '../lib/useTheme'

import type { ParameterValues } from './Parameters'
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
  return (
    <Menubar className="rounded-none border-x-0 border-t-0">
      <ModelMenu />
      <EncoderMenu />
      <ViewMenu />
      <HelpMenu />
      <div className="flex-1" />
      <img src="/logo.svg" alt="logo" className="hidden size-8 dark:invert sm:block" />
    </Menubar>
  )
}

function ModelMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger>Model</MenubarTrigger>
      <MenubarContent>
        <ShareMenuItem />
        <MenubarSeparator />
        <ExamplesSubMenu />
        <MenubarSeparator />
        <EditModelMenuItem />
        <MenubarSeparator />
        <ClearModelMenuItem />
      </MenubarContent>
    </MenubarMenu>
  )
}

function ExamplesSubMenu() {
  return (
    <MenubarSub>
      <MenubarSubTrigger>Examples</MenubarSubTrigger>
      <MenubarSubContent>
        {exampleModels.map(([language, models]) => <ExampleLanguageSubMenu key={language} language={language} models={models} />)}
      </MenubarSubContent>
    </MenubarSub>
  )
}

function ExampleLanguageSubMenu({ language, models }: { language: string, models: PreparedExample[] }) {
  return (
    <MenubarSub>
      <MenubarSubTrigger>{language}</MenubarSubTrigger>
      <MenubarSubContent>
        {models.map((exampleModel) => <ExampleModelMenuItem key={exampleModel.name} exampleModel={exampleModel} />)}
      </MenubarSubContent>
    </MenubarSub>
  )
}

function ExampleModelMenuItem({ exampleModel }: { exampleModel: PreparedExample }) {
  const { name, serializedModel, parser, parameters } = exampleModel
  const clearSelection = useSelection.use.clearSelection()
  const setSerializedModel = useModelState.use.setSerializedModel()
  const setParameters = useModelState.use.setParameters()
  const setParser = useModelState.use.setParser()
  function loadExample() {
    setSerializedModel(serializedModel)
    setParser(parser)
    setParameters(parameters)
    clearSelection()
  }
  return <MenubarItem onClick={loadExample}>{name}</MenubarItem>
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

function EncoderMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger>Encoder</MenubarTrigger>
      <MenubarContent>
        <EditEncoderModelItem />
        <MenubarSeparator />
        <ClearEncoderMenuItem />
      </MenubarContent>
    </MenubarMenu>
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

function ViewMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent>
        <ModelViewSubMenu />
        <ThemeSubMenu />
        <LayoutSubMenu />
      </MenubarContent>
    </MenubarMenu>
  )
}

function ModelViewSubMenu() {
  const irView = useSettings.use.irView()
  const setIRView = useSettings.use.setIRView()

  return (
    <MenubarSub>
      <MenubarSubTrigger>Model</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem
          disabled={irView === 'graph'}
          onClick={() => setIRView('graph')}
        >
          <span>Graph</span>
        </MenubarItem>
        <MenubarItem
          disabled={irView === 'tree'}
          onClick={() => setIRView('tree')}
        >
          <span>Tree</span>
        </MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}

function ThemeSubMenu() {
  const theme = useTheme.use.theme()
  const setTheme = useTheme.use.setTheme()
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

function HelpMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger>Help</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          <a
            href={__SOURCE_URL}
            rel="noopener"
            className="flex w-full items-center gap-2"
          >
            <span>Source Code</span>
            <GitHubLogoIcon className="text-foreground" />
          </a>
        </MenubarItem>
        <MenubarItem disabled>
          Press
          {' '}
          <kbd className="pointer-events-none mx-1.5 inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>
            J
          </kbd>
          {' '}
          to use the command bar
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}

export interface ShareData {
  serializedModel: string
  parserName: string | undefined
  parserParameters: ParameterValues
  encoderName: string | undefined
  encoderParameters: ParameterValues

}

function ShareMenuItem() {
  const { share } = useShare()

  return (
    <MenubarItem onClick={share}>Share</MenubarItem>
  )
}
