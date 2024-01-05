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
import { UpdatePrompt } from './components/UpdatePrompt'
import { useEncoderState } from './lib/useEncoderState'
import { useModelState } from './lib/useModelState'
import { useSettings } from './lib/useSettings'

export function App() {
  const layout = useSettings.use.layout()

  return (
    <div className="flex h-full flex-col">
      <Menu />
      {layout === 'extended' ? <ExtendedLayout /> : <CompactLayout />}
      <Toaster />
      <UpdatePrompt />
    </div>
  )
}

function CompactLayout() {
  const isEditingEncoder = useEncoderState.use.isEditing()
  const isEditingModel = useModelState.use.isEditing()
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50}>
        {isEditingModel ? (
          <div className="h-full p-2">
            <ModelForm />
          </div>
        ) : (
          <Model />
        )}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        {isEditingEncoder ? (
          <div className="h-full p-2">
            <EncoderForm />
          </div>
        ) : (
          <Encoder />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function ExtendedLayout() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel>
        <div className="h-full p-2">
          <ModelForm />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Model />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel>
            <div className="h-full p-2">
              <EncoderForm />
            </div>
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
