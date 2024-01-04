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
import { useSettings } from './lib/useSettings'

export function App() {
  const isEditingEncoder = useEncoderState((state) => state.isEditing)
  const isEditingModel = useModelState((state) => state.isEditing)
  const alwaysShowEditors = useSettings((state) => state.alwaysShowEditors)

  return (
    <div className="flex h-full flex-col">
      <Menu />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={alwaysShowEditors ? 25 : 50}
          id="model-editor"
          order={0}
        >
          {isEditingModel || alwaysShowEditors ? (
            <div className="h-full p-2">
              <ModelForm />
            </div>
          ) : (
            <Model />
          )}
        </ResizablePanel>
        {alwaysShowEditors ? (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel id="model-encoder" order={1}>
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel>
                  <Model />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                  <Encoder />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        ) : (
          <ResizableHandle withHandle />
        )}
        <ResizablePanel id="encoder-editor" order={alwaysShowEditors ? 2 : 1}>
          {isEditingEncoder || alwaysShowEditors ? (
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
