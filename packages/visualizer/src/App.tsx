import { CommandBar } from './components/CommandBar'
import { Encoder } from './components/encoder/Encoder'
import { EncoderForm } from './components/encoder/EncoderForm'
import { Menu } from './components/Menu'
import { Model } from './components/model/Model'
import { ModelForm } from './components/model/ModelForm'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'
import { Toaster } from './components/ui/sonner'
import { useSharedHashLoader } from './lib/sharing'
import { useEncoderState } from './lib/useEncoderState'
import { useModelState } from './lib/useModelState'
import { useSettings } from './lib/useSettings'
import { useUpdatePrompt } from './lib/useUpdatePrompt'

export function App() {
  useSharedHashLoader()
  useUpdatePrompt()

  const layout = useSettings.use.layout()

  return (
    <div className="flex h-full flex-col">
      <Menu />
      <CommandBar />
      {layout === 'extended' ? <ExtendedLayout /> : <CompactLayout />}
      <Toaster duration={5000} />
    </div>
  )
}

function CompactLayout() {
  const isEditingEncoder = useEncoderState.use.isEditing()
  const isEditingModel = useModelState.use.isEditing()
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50}>
        {isEditingModel
          ? (
              <ModelForm />
            )
          : (
              <Model />
            )}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        {isEditingEncoder
          ? (
              <EncoderForm />
            )
          : (
              <Encoder />
            )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function ExtendedLayout() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30}>
        <ModelForm />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Model />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30}>
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel>
            <EncoderForm />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <Encoder />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
