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
import { useEncoderState } from './lib/useEncoderState'
import { useModelState } from './lib/useModelState'

export function App() {
  const isEditingEncoder = useEncoderState((state) => state.isEditing)
  const isEditingModel = useModelState((state) => state.isEditing)

  return (
    <div className="flex h-full flex-col">
      <Menu />
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
    </div>
  )
}
