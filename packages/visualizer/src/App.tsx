import { EncoderForm } from './components/EncoderForm'
import { Encoding } from './components/encodings/Encoding'
import { Menu } from './components/Menu'
import { Model } from './components/Model'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'
import { useAppState } from './lib/useAppState'

export function App() {
  const { encoder, model } = useAppState()
  // TODO: Make clear buttons red
  // TODO: Clear button for encoder section
  return (
    <div className="flex h-full flex-col">
      <Menu />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50}>
          <Model />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          {model && encoder ? (
            <Encoding model={model} encoder={encoder} />
          ) : null}
          {!encoder ? (
            <div className="p-2">
              <EncoderForm canSubmit={model !== undefined} />
            </div>
          ) : null}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
