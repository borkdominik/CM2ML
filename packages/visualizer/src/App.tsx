import { Encoder } from './components/Encoder'
import { Menu } from './components/Menu'
import { Model } from './components/Model'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'

export function App() {
  return (
    <div className="flex h-full flex-col">
      <Menu />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50}>
          <Model />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <Encoder />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
